import React, { useCallback, useEffect, useState } from 'react';
import { api, CATEGORIES } from './api.js';
import ExpenseForm from './ExpenseForm.jsx';

const PERIODS = { '': 'ทั้งหมด', today: 'วันนี้', week: 'สัปดาห์นี้', month: 'เดือนนี้' };
const baht = (n) => n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ExpensePage({ user, onLogout }) {
  const [data, setData] = useState({ items: [], total: 0, count: 0, byCategory: {} });
  const [filters, setFilters] = useState({ search: '', category: '', period: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError('');
      setData(await api.listExpenses(filters));
    } catch (err) {
      if (err.status === 401) return onLogout(); // token หมดอายุ → กลับหน้า login
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, onLogout]);

  // debounce 300ms เพื่อไม่ยิง API ทุกครั้งที่พิมพ์
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function handleSubmit(form) {
    if (editing) {
      await api.updateExpense(editing.id, form);
      setEditing(null);
    } else {
      await api.createExpense(form);
    }
    await load();
  }

  async function handleDelete(item) {
    if (!window.confirm(`ลบรายการ "${item.note || CATEGORIES[item.category]}" จำนวน ${baht(item.amount)} บาท ?`)) return;
    try {
      await api.deleteExpense(item.id);
      if (editing?.id === item.id) setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <header className="topbar">
        <h1>💸 Daily Expense Tracker</h1>
        <div className="row">
          <span className="muted">👤 {user.username}</span>
          <button className="btn" onClick={onLogout}>ออกจากระบบ</button>
        </div>
      </header>

      <ExpenseForm editing={editing} onSubmit={handleSubmit} onCancel={() => setEditing(null)} />

      <section className="card">
        <h2>🔍 ค้นหาและกรอง</h2>
        <div className="grid">
          <label>
            ค้นหาในหมายเหตุ
            <input
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="เช่น กาแฟ"
            />
          </label>
          <label>
            หมวดหมู่
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              <option value="">ทั้งหมด</option>
              {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label>
            ช่วงเวลา
            <select value={filters.period} onChange={(e) => setFilters({ ...filters, period: e.target.value })}>
              {Object.entries(PERIODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="summary">
        <div className="stat">
          <span className="muted">ยอดรวม</span>
          <strong>{baht(data.total)} ฿</strong>
        </div>
        <div className="stat">
          <span className="muted">จำนวนรายการ</span>
          <strong>{data.count}</strong>
        </div>
        {Object.entries(data.byCategory).map(([k, v]) => (
          <div className="stat" key={k}>
            <span className="muted">{CATEGORIES[k]}</span>
            <strong>{baht(v)}</strong>
          </div>
        ))}
      </section>

      {error && <div className="alert">{error}</div>}

      <section className="card">
        <h2>📋 รายการรายจ่าย</h2>
        {loading ? (
          <p className="muted">กำลังโหลด...</p>
        ) : data.items.length === 0 ? (
          <p className="muted">ไม่พบรายการ</p>
        ) : (
          <table>
            <thead>
              <tr><th>วันที่</th><th>หมวดหมู่</th><th>หมายเหตุ</th><th className="num">จำนวน (฿)</th><th></th></tr>
            </thead>
            <tbody>
              {data.items.map((it) => (
                <tr key={it.id}>
                  <td>{it.date}</td>
                  <td><span className="tag">{CATEGORIES[it.category]}</span></td>
                  <td>{it.note || <span className="muted">-</span>}</td>
                  <td className="num">{baht(it.amount)}</td>
                  <td className="actions">
                    <button className="btn small" onClick={() => { setEditing(it); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>แก้ไข</button>
                    <button className="btn small danger" onClick={() => handleDelete(it)}>ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
