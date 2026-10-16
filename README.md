# 💸 Daily Expense Tracker

ระบบบันทึกรายจ่ายประจำวัน — Express + SQLite (backend) และ React + Vite (frontend)

## ตอบโจทย์ทั้ง 5 ข้อ

| ข้อกำหนด | อยู่ที่ไหน |
|---|---|
| 1. CRUD | `server/src/expenses.js` (POST / GET / PUT / DELETE) |
| 2. Data Validation | Server: `server/src/validate.js` · Client: `client/src/ExpenseForm.jsx`, `AuthPage.jsx` |
| 3. Authentication & Authorization | `server/src/auth.js` (JWT + bcrypt) · ทุก query ผูกกับ `user_id` |
| 4. Search + Filter | `GET /api/v1/expenses?search=&category=&period=` |
| 5. API Services (RESTful) | ดูตาราง API ด้านล่าง |

## วิธีรัน

ต้องมี Node.js 18 ขึ้นไป เปิด 2 เทอร์มินัล

```bash
# เทอร์มินัล 1 — Backend (พอร์ต 4000)
cd server
npm install
npm start

# เทอร์มินัล 2 — Frontend (พอร์ต 5173)
cd client
npm install
npm run dev
```

เปิดเบราว์เซอร์ที่ http://localhost:5173 แล้วสมัครสมาชิกได้เลย

ทดสอบ API อัตโนมัติ (28 กรณี): `cd server && bash test.sh`

ตั้งค่าเพิ่มเติม (ไม่บังคับ): `PORT`, `JWT_SECRET`, `DB_FILE` — **ก่อนใช้งานจริงควรตั้ง `JWT_SECRET` เอง**

## โครงสร้างฐานข้อมูล (2 ตาราง)

- `users` — id, username (unique), password_hash, created_at
- `expenses` — id, user_id (FK → users), amount (> 0), category, date, note, created_at

## API

ทุก endpoint ของ `/expenses` ต้องส่ง header `Authorization: Bearer <token>`

| Method | Path | หน้าที่ |
|---|---|---|
| POST | `/api/v1/auth/register` | สมัครสมาชิก → ได้ token |
| POST | `/api/v1/auth/login` | เข้าสู่ระบบ → ได้ token |
| GET | `/api/v1/expenses` | ดึงรายการ + ยอดรวม + สรุปตามหมวด |
| POST | `/api/v1/expenses` | เพิ่มรายการ |
| PUT | `/api/v1/expenses/:id` | แก้ไขรายการ |
| DELETE | `/api/v1/expenses/:id` | ลบรายการ |
| GET | `/api/v1/categories` | รายการหมวดหมู่ที่ใช้ได้ |

Query params ของ `GET /expenses`:

- `search` — ค้นหาข้อความใน note (เช่น `?search=กาแฟ`)
- `category` — `food | transport | entertainment | shopping | bills | other`
- `period` — `today | week | month` (สัปดาห์เริ่มวันจันทร์)
- `from`, `to` — ช่วงวันที่เอง `YYYY-MM-DD` (ใช้เมื่อไม่ระบุ `period`)

รวมกันได้ เช่น `?category=food&search=coffee&period=month`

## กฎ Validation

- `amount` — ตัวเลข และมากกว่า 0
- `category` — ต้องเป็นหนึ่งในหมวดที่กำหนด ห้ามว่าง
- `date` — รูปแบบ `YYYY-MM-DD` เป็นวันที่จริง และห้ามอยู่ในอนาคต
- `note` — ไม่บังคับ ยาวไม่เกิน 250 ตัวอักษร

## จุดที่ใช้พรีเซนต์ได้

1. **Data isolation** — `UPDATE/DELETE ... WHERE id = ? AND user_id = ?` ผู้ใช้คนอื่นจะได้ 404 (ไม่เปิดเผยว่ามีรายการนั้นอยู่)
2. **Validation 2 ชั้น** — client ตรวจเพื่อ UX, server ตรวจซ้ำเพื่อความปลอดภัย
3. **ปลอดภัยพื้นฐาน** — รหัสผ่านเก็บเป็น bcrypt hash, SQL ใช้ prepared statement ทั้งหมด, ค้นหาแบบ escape ตัวอักษร `%` `_`
