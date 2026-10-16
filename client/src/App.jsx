import React, { useState } from 'react';
import AuthPage from './AuthPage.jsx';
import ExpensePage from './ExpensePage.jsx';
import { clearSession, getUser } from './api.js';

export default function App() {
  const [user, setUser] = useState(getUser());

  function handleLogout() {
    clearSession();
    setUser(null);
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