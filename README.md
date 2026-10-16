# 🖥️ Daily Expense Tracker (Windows XP Theme)

แอปพลิเคชันบันทึกรายจ่ายประจำวันยุคดิจิทัลในธีมย้อนยุค **Windows XP Luna Theme** พัฒนาขึ้นในรูปแบบ Full-Stack Web Application ที่เน้นความเรียบง่าย ประสิทธิภาพสูง และความแม่นยำในการจัดการข้อมูลการเงินส่วนบุคคล

![Windows XP Expense Tracker](https://raw.githubusercontent.com/placeholder/demo.png)

---

## 🌟 จุดเด่นและฟีเจอร์หลัก (Features)

* **🎨 ย้อนยุคด้วย Windows XP Luna Design System:**
    * หน้าจอบูตระบบ (Boot Screen) พร้อมหลอดโหลดสีเขียวแนว Windows XP
    * ปุ่มกด, ตาราง, และสีสันการ์ดอ้างอิงสไตล์วินโดวส์ยุค 2000s
    * ตารางสลับสีแถว (Zebra Striping) อ่านง่าย พร้อม Badge หมวดหมู่สีน้ำเงิน
* **🔐 ระบบสมาชิกและการยืนยันตัวตน (Authentication):**
    * สมัครสมาชิก และเข้าสู่ระบบปลอดภัยด้วยการเข้ารหัส JWT (JSON Web Token)
    * ป้องกันข้อมูลรายจ่ายแยกตามบัญชีผู้ใช้แต่ละคนอย่างเป็นอิสระ
* **📊 จัดการรายการรายจ่ายเต็มรูปแบบ (CRUD Operations):**
    * **เพิ่มรายการ:** บันทึกยอดเงิน หมวดหมู่ หมายเหตุ และวันที่
    * **ดึงและแสดงผล:** เรียกร้องข้อมูลเรียงลำดับจากรายการล่าสุดขึ้นก่อน
    * **ค้นหาและกรองข้อมูล:** ค้นหาตามคำในหมายเหตุ, กรองตามหมวดหมู่ หรือช่วงเวลา (วันนี้ / สัปดาห์นี้ / เดือนนี้) พร้อมปุ่มล้างตัวกรอง
    * **แก้ไขและลบ:** แก้ไขข้อมูลย้อนหลัง และมีระบบแจ้งเตือนยืนยัน (Confirm Alert) ก่อนลบ
* **📈 สรุปผลและสถิติการเงิน (Analytics):**
    * สรุปยอดรวมทั้งหมด และจำนวนรายการรวม
    * สรุปยอดแยกตามหมวดหมู่ เรียงลำดับจากหมวดที่ใช้จ่ายมากที่สุดไปน้อยที่สุด พร้อมคำนวณสัดส่วนเปอร์เซ็นต์ (%)

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### Frontend
* **Core:** React 18, JavaScript (ES6+)
* **Build Tool:** Vite
* **Styling:** Custom Pure CSS3 (Windows XP Aesthetic, Grid & Flexbox)
* **Deployment:** Vercel

### Backend
* **Runtime Environment:** Node.js
* **Framework:** Express.js
* **Security & Auth:** JSON Web Token (JWT), Cors
* **Validation:** Express-Validator
* **Deployment:** Render

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
daily-expense-tracker/
├── client/                   # Frontend React (Vite)
│   ├── src/
│   │   ├── api.js           # API Client & Session Management
│   │   ├── App.jsx          # Main App Component & Boot Loader
│   │   ├── AuthPage.jsx     # Login & Register Screen
│   │   ├── ExpenseForm.jsx  # Create & Edit Expense Form
│   │   ├── ExpensePage.jsx # Main Dashboard & Analytics
│   │   ├── main.jsx        # Entry Point
│   │   └── styles.css       # Windows XP CSS Styling
│   └── package.json
│
├── server/                   # Backend Node.js (Express)
│   ├── index.js             # Express Server & API Routes
│   └── package.json
│
└── README.md                 # Project Documentation
```

---

## 🔌 ภาพรวมระบบ API (API Endpoints Overview)

### Auth Endpoints
| Method | Endpoint | Description | Public / Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/v1/auth/register` | สมัครสมาชิกผู้ใช้ใหม่ | Public |
| `POST` | `/v1/auth/login` | เข้าสู่ระบบ และรับ JWT Token | Public |

### Expenses Endpoints (Requires Bearer Token)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/v1/expenses` | ดึงรายการรายจ่ายทั้งหมด (รองรับ `search`, `category`, `period`) |
| `POST` | `/v1/expenses` | สร้างรายการรายจ่ายใหม่ |
| `PUT` | `/v1/expenses/:id` | แก้ไขรายการรายจ่ายตาม ID |
| `DELETE` | `/v1/expenses/:id` | ลบรายการรายจ่ายตาม ID |

---

## 💻 การติดตั้งและเริ่มต้นใช้งาน (Local Setup)

### ข้อกำหนดเบื้องต้น (Prerequisites)
* Node.js (v18.x ขึ้นไป)
* npm หรือ yarn

### 1. ดาวน์โหลดโปรเจกต์ (Clone Repository)
```bash
git clone https://github.com/your-username/daily-expense-tracker.git
cd daily-expense-tracker
```

### 2. ตั้งค่าและรัน Backend Server
```bash
cd server
npm install
npm start
```
> Backend จะเริ่มทำงานที่ `http://localhost:5000`

### 3. ตั้งค่าและรัน Frontend Client
เปิด Terminal อีกหน้าต่างหนึ่ง:
```bash
cd client
npm install
npm run dev
```
> Frontend จะเริ่มทำงานที่ `http://localhost:5173`

---

## 📄 ใบอนุญาต (License)

โปรเจกต์นี้จัดทำขึ้นเพื่อการศึกษาและการใช้งานส่วนบุคคลภายใต้สิทธิ์ [MIT License](LICENSE)