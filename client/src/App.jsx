import React, { useState } from 'react';
import { getToken, getUser, setSession, clearSession } from './api.js';
import AuthPage from './AuthPage.jsx';
import ExpensePage from './ExpensePage.jsx';

export default function App() {
  const [user, setUser] = useState(getToken() ? getUser() : null);

  function handleLogin(token, u) {
    setSession(token, u);
    setUser(u);
  }
  function handleLogout() {
    clearSession();
    setUser(null);
  }

  return user ? <ExpensePage user={user} onLogout={handleLogout} /> : <AuthPage onLogin={handleLogin} />;
}
