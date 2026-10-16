// validate.js — ตรวจสอบข้อมูล (Server-side Validation)
// คืนค่า { errors, value } ถ้า errors ว่าง = ผ่าน

const CATEGORIES = ['food', 'transport', 'entertainment', 'shopping', 'bills', 'other'];
const NOTE_MAX = 250;

function todayString() {
  // วันที่ปัจจุบันตามเวลาท้องถิ่นของเซิร์ฟเวอร์ รูปแบบ YYYY-MM-DD
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function isRealDate(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === str;
}

function validateExpense(body) {
  const errors = {};
  const value = {};

  // Amount: ต้องเป็นตัวเลขและมากกว่า 0
  const amount = typeof body.amount === 'string' ? Number(body.amount) : body.amount;
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    errors.amount = 'จำนวนเงินต้องเป็นตัวเลข';
  } else if (amount <= 0) {
    errors.amount = 'จำนวนเงินต้องมากกว่า 0';
  } else {
    value.amount = Math.round(amount * 100) / 100;
  }

  // Category: ต้องเลือกจากรายการที่กำหนด
  if (!body.category || !CATEGORIES.includes(body.category)) {
    errors.category = `หมวดหมู่ต้องเป็นหนึ่งใน: ${CATEGORIES.join(', ')}`;
  } else {
    value.category = body.category;
  }

  // Date: รูปแบบถูกต้อง และห้ามเป็นวันในอนาคต
  if (typeof body.date !== 'string' || !isRealDate(body.date)) {
    errors.date = 'วันที่ต้องอยู่ในรูปแบบ YYYY-MM-DD และเป็นวันที่ที่มีจริง';
  } else if (body.date > todayString()) {
    errors.date = 'ห้ามใส่วันที่ในอนาคต';
  } else {
    value.date = body.date;
  }

  // Note: ไม่บังคับ แต่ยาวไม่เกิน 250 ตัวอักษร
  const note = body.note == null ? '' : body.note;
  if (typeof note !== 'string') {
    errors.note = 'หมายเหตุต้องเป็นข้อความ';
  } else if (note.length > NOTE_MAX) {
    errors.note = `หมายเหตุต้องไม่เกิน ${NOTE_MAX} ตัวอักษร`;
  } else {
    value.note = note.trim();
  }

  return { errors, value };
}

function validateCredentials(body) {
  const errors = {};
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!/^[A-Za-z0-9_]{3,30}$/.test(username)) {
    errors.username = 'ชื่อผู้ใช้ต้องเป็น a-z, 0-9 หรือ _ ยาว 3-30 ตัวอักษร';
  }
  if (password.length < 6 || password.length > 72) {
    errors.password = 'รหัสผ่านต้องยาว 6-72 ตัวอักษร';
  }
  return { errors, value: { username, password } };
}

module.exports = { CATEGORIES, NOTE_MAX, todayString, validateExpense, validateCredentials };
