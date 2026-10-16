import React, { useState } from 'react';
import { api, setSession } from './api.js';

export default function AuthPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.username.trim() || !form.password) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }
    setLoading(true);
    try {
      let res;
      if (isRegister) {
        res = await api.register(form.username, form.password);
      } else {
        res = await api.login(form.username, form.password);
      }
      setSession(res.token, res.user);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Daily Expense Tracker</h1>
            <p>{isRegister ? 'สร้างบัญชีผู้ใช้ใหม่' : 'เข้าสู่ระบบเพื่อจัดการรายจ่ายของคุณ'}</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="username">ชื่อผู้ใช้</label>
              <input
                  id="username"
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="กรอกชื่อผู้ใช้"
                  autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">รหัสผ่าน</label>
              <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="กรอกรหัสผ่าน"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'กำลังดำเนินการ...' : isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="auth-footer">
            {isRegister ? (
                <p>
                  มีบัญชีอยู่แล้ว?{' '}
                  <button type="button" className="btn-link" onClick={() => { setIsRegister(false); setError(''); }}>
                    เข้าสู่ระบบ
                  </button>
                </p>
            ) : (
                <p>
                  ยังไม่มีบัญชี?{' '}
                  <button type="button" className="btn-link" onClick={() => { setIsRegister(true); setError(''); }}>
                    สมัครสมาชิก
                  </button>
                </p>
            )}
          </div>
        </div>
      </div>
  );
}