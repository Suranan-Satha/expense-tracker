// expenses.js — CRUD + Search + Filter
// ทุก query ผูกกับ user_id ของผู้ที่ล็อกอิน จึงเห็น/แก้/ลบได้เฉพาะข้อมูลของตนเอง
const express = require('express');
const db = require('./db');
const { CATEGORIES, validateExpense } = require('./validate');

const router = express.Router();

function pad(n) { return String(n).padStart(2, '0'); }
function fmt(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

// แปลง period (today | week | month) เป็นช่วงวันที่
function periodRange(period) {
  const now = new Date();
  if (period === 'today') return [fmt(now), fmt(now)];
  if (period === 'week') {
    const start = new Date(now);
    const diff = (now.getDay() + 6) % 7; // เริ่มสัปดาห์วันจันทร์
    start.setDate(now.getDate() - diff);
    return [fmt(start), fmt(now)];
  }
  if (period === 'month') {
    return [`${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`, fmt(now)];
  }
  return [null, null];
}

// GET /api/v1/expenses?search=&category=&period=&from=&to=
router.get('/', (req, res) => {
  const { search, category, period, from, to } = req.query;
  const where = ['user_id = ?'];
  const params = [req.user.id];

  if (category) {
    if (!CATEGORIES.includes(category)) return res.status(400).json({ message: 'หมวดหมู่ไม่ถูกต้อง' });
    where.push('category = ?');
    params.push(category);
  }
  if (search && String(search).trim()) {
    // escape ตัวอักษรพิเศษของ LIKE เพื่อให้ค้นหาตรงตัว
    const term = String(search).trim().replace(/[\\%_]/g, (c) => '\\' + c);
    where.push("note LIKE ? ESCAPE '\\'");
    params.push(`%${term}%`);
  }

  let [start, end] = periodRange(period);
  if (!start && from) start = from;
  if (!end && to) end = to;
  if (start) { where.push('date >= ?'); params.push(start); }
  if (end) { where.push('date <= ?'); params.push(end); }

  const sql = `SELECT id, amount, category, date, note FROM expenses
               WHERE ${where.join(' AND ')} ORDER BY date DESC, id DESC`;
  const items = db.prepare(sql).all(...params);
  const total = Math.round(items.reduce((s, e) => s + e.amount, 0) * 100) / 100;

  // สรุปยอดตามหมวดหมู่ (จากรายการที่กรองแล้ว)
  const byCategory = {};
  for (const e of items) byCategory[e.category] = Math.round(((byCategory[e.category] || 0) + e.amount) * 100) / 100;

  res.json({ items, total, count: items.length, byCategory });
});

// POST /api/v1/expenses
router.post('/', (req, res) => {
  const { errors, value } = validateExpense(req.body || {});
  if (Object.keys(errors).length) return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง', errors });

  const info = db
    .prepare('INSERT INTO expenses (user_id, amount, category, date, note) VALUES (?, ?, ?, ?, ?)')
    .run(req.user.id, value.amount, value.category, value.date, value.note);
  res.status(201).json({ id: info.lastInsertRowid, ...value });
});

// PUT /api/v1/expenses/:id
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ message: 'id ไม่ถูกต้อง' });

  const { errors, value } = validateExpense(req.body || {});
  if (Object.keys(errors).length) return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง', errors });

  const info = db
    .prepare('UPDATE expenses SET amount = ?, category = ?, date = ?, note = ? WHERE id = ? AND user_id = ?')
    .run(value.amount, value.category, value.date, value.note, id, req.user.id);
  // ถ้าไม่มีแถวถูกแก้ = ไม่มีรายการนี้ หรือไม่ใช่ของผู้ใช้คนนี้ → ตอบ 404 เหมือนกัน
  if (info.changes === 0) return res.status(404).json({ message: 'ไม่พบรายการ' });
  res.json({ id, ...value });
});

// DELETE /api/v1/expenses/:id
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ message: 'id ไม่ถูกต้อง' });

  const info = db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').run(id, req.user.id);
  if (info.changes === 0) return res.status(404).json({ message: 'ไม่พบรายการ' });
  res.status(204).end();
});

module.exports = router;
