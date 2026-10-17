import React, { useState } from 'react';
import { api, setSession } from './api.js';

export default function AuthPage({ onLoginSuccess, onLogin, setUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.username.trim() || !form.password) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    setLoading(true);
    let userData = null;

    try {
      let res;
      if (isRegister) {
        res = await api.register(form.username, form.password);
      } else {
        res = await api.login(form.username, form.password);
      }
      setSession(res.token, res.user);
      userData = res.user;
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
      setLoading(false);
      return;
    }

    setLoading(false);

    // ย้ายการเปลี่ยนหน้าออกมาด้านนอก try/catch
    const handleLogin = onLoginSuccess || onLogin || setUser;
    if (typeof handleLogin === 'function') {
      handleLogin(userData);
    } else {
      window.location.reload();
    }
  }

  return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Daily Expense Tracker</h1>
          </div>
          <div className="auth-body">
            <p className="muted" style={{ marginBottom: '14px', fontSize: '13px' }}>
              {isRegister ? 'สร้างบัญชีผู้ใช้ใหม่' : 'เข้าสู่ระบบเพื่อจัดการรายจ่ายของคุณ'}
            </p>

            {isRegister && (
                <p className="muted" style={{ fontSize: '12px', marginBottom: '10px' }}>
                  ชื่อผู้ใช้ใช้ a-z, 0-9 หรือ _ (3-30 ตัว) · รหัสผ่านอย่างน้อย 6 ตัว
                </p>
            )}
            {error && <div className="alert" style={{ margin: '0 0 14px 0' }}>{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="username">ชื่อผู้ใช้</label>
                <input
                    id="username"
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    autoFocus
                    autoComplete="username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">รหัสผ่าน</label>
                <div className="pw-wrap">
                  <input
                      id="password"
                      type={showPw ? 'text' : 'password'}
                      autoComplete={isRegister ? 'new-password' : 'current-password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                    {showPw ? 'ซ่อน' : 'แสดง'}
                  </button>
                </div>
              </div>

              <div className="login-actions">
                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? 'กำลังดำเนินการ...' : isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
                </button>
                <button
                    type="button"
                    className="login-toggle-btn"
                    onClick={() => { setIsRegister(!isRegister); setError(''); }}
                >
                  {isRegister ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
}