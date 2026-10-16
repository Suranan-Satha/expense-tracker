// auth.js — Register / Login ด้วย JWT + middleware ตรวจ token
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { validateCredentials } = require('./validate');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES = '7d';

const router = express.Router();

function signToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// POST /api/v1/auth/register
router.post('/register', (req, res) => {
  const { errors, value } = validateCredentials(req.body || {});
  if (Object.keys(errors).length) return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง', errors });

  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(value.username);
  if (exists) return res.status(409).json({ message: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว' });

  const hash = bcrypt.hashSync(value.password, 10);
  const info = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(value.username, hash);
  const user = { id: info.lastInsertRowid, username: value.username };
  res.status(201).json({ token: signToken(user), user });
});

// POST /api/v1/auth/login
router.post('/login', (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  const row = db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username);
  // ใช้ข้อความเดียวกันทั้งกรณีไม่พบผู้ใช้และรหัสผิด เพื่อไม่เปิดเผยว่ามีผู้ใช้นี้หรือไม่
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  }
  const user = { id: row.id, username: row.username };
  res.json({ token: signToken(user), user });
});

// Middleware: ตรวจ Authorization: Bearer <token> แล้วใส่ req.user
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ message: 'ต้องเข้าสู่ระบบก่อน' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch {
    res.status(401).json({ message: 'โทเคนไม่ถูกต้องหรือหมดอายุ' });
  }
}

module.exports = { router, requireAuth };
