// index.js — จุดเริ่มต้นของเซิร์ฟเวอร์
// ใช้เวลาไทยเป็นค่าเริ่มต้น ไม่งั้นเซิร์ฟเวอร์ (UTC) จะมองว่า "วันนี้" ของตี 0-7 โมงยังเป็นเมื่อวาน
process.env.TZ = process.env.TZ || 'Asia/Bangkok';

const express = require('express');
const cors = require('cors');
const { router: authRouter, requireAuth } = require('./auth');
const expensesRouter = require('./expenses');
const { CATEGORIES } = require('./validate');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (req, res) => res.json({ ok: true }));
app.get('/api/v1/categories', (req, res) => res.json(CATEGORIES));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/expenses', requireAuth, expensesRouter);

// JSON ที่ parse ไม่ได้ และ error อื่น ๆ
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'JSON ไม่ถูกต้อง' });
  console.error(err);
  res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
});

const PORT = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}

module.exports = app;