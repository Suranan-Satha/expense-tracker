import React, { useEffect, useState } from 'react';
import AuthPage from './AuthPage.jsx';
import ExpensePage from './ExpensePage.jsx';
import { clearSession, getUser } from './api.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // ดีเลย์เปิดหน้าเว็บ 800ms เพื่อแสดงหน้าจอบูตสไตล์ Windows XP
    const timer = setTimeout(() => {
      setUser(getUser());
      setInitializing(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  function handleLogout() {
    clearSession();
    setUser(null);
  }

  if (initializing) {
    return (
        <div className="boot-screen">
          <div className="boot-card">
            <div className="auth-header">
              <h1>Daily Expense Tracker</h1>
            </div>
            <div className="loading-box">
              <p className="muted" style={{ fontWeight: 'bold' }}>
                กำลังเริ่มต้นระบบ Windows XP...
              </p>
              <div className="xp-progress-bar">
                <div className="xp-progress-fill"></div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  if (!user) {
    return (
        <AuthPage
            onLoginSuccess={(u) => setUser(u)}
            onLogin={(u) => setUser(u)}
            setUser={setUser}
        />
    );
  }

  return <ExpensePage user={user} onLogout={handleLogout} />;
}