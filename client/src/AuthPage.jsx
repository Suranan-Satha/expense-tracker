import React, { useState } from 'react';
import { api } from './api.js';

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Client-side validation (เซิร์ฟเวอร์ตรวจซ้ำอีกครั้งเสมอ)
  function validate() {
    const e = {};
    if (!/^[A-Za-z0-9_]{3,30}$/.test(form.username)) e.username = 'a-z, 0-9 หรือ _ ยาว 3-30 ตัวอักษร';
    if (form.password.length < 6) e.password = 'รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร';
    return e;
  }

  async function submit(ev) {
    ev.preventDefault();
    setMessage('');
    const e = mode === 'register' ? validate() : {};
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const fn = mode === 'login' ? api.login : api.register;
      const { token, user } = await fn(form.username.trim(), form.password);
      onLogin(token, user);
    } catch (err) {
      setErrors(err.fields || {});
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1>💸 Daily Expense Tracker</h1>
        <p className="muted">{mode === 'login' ? 'เข้าสู่ระบบเพื่อจัดการรายจ่ายของคุณ' : 'สร้างบัญชีใหม่'}</p>

        <label>
          ชื่อผู้ใช้
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            autoComplete="username"
          />
          {errors.username && <span className="error">{errors.username}</span>}
        </label>

        <label>
          รหัสผ่าน
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </label>

        {message && <div className="alert">{message}</div>}

        <button className="btn primary" disabled={loading}>
          {loading ? 'กำลังดำเนินการ...' : mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
        </button>

        <button
          type="button"
          className="link"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); setMessage(''); }}
        >
          {mode === 'login' ? 'ยังไม่มีบัญชี? สมัครสมาชิก' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  );
}
