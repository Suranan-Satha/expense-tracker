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
      if (err.status === 401) return onLogout();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, onLogout]);

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
    if (!window.confirm(`คุณต้องการลบรายการ "${item.note || CATEGORIES[item.category]}" จำนวน ${baht(item.amount)} บาท ใช่หรือไม่?`)) return;
    try {
      await api.deleteExpense(item.id);
      if (editing?.id === item.id) setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
      <div className="layout-container">
        <header className="navbar">
          <div className="navbar-brand">
            <h1>Daily Expense Tracker</h1>
          </div>
          <div className="navbar-user">
            <span className="user-name">ผู้ใช้: <strong>{user?.username}</strong></span>
            <button className="btn btn-outline btn-sm" onClick={onLogout}>
              ออกจากระบบ
            </button>
          </div>
        </header>

        <main className="main-content">
          <ExpenseForm editing={editing} onSubmit={handleSubmit} onCancel={() => setEditing(null)} />

          <div className="card">
            <div className="card-header">
              <h2>ค้นหาและกรองรายการ</h2>
            </div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>ค้นหาในหมายเหตุ</label>
                  <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      placeholder="พิมพ์คำค้นหา..."
                  />
                </div>
                <div className="form-group">
                  <label>หมวดหมู่</label>
                  <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                    <option value="">ทั้งหมด</option>
                    {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>ช่วงเวลา</label>
                  <select value={filters.period} onChange={(e) => setFilters({ ...filters, period: e.target.value })}>
                    {Object.entries(PERIODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <section className="stats-grid">
            <div className="stat-card stat-primary">
              <span className="stat-label">ยอดรวมทั้งหมด</span>
              <strong className="stat-value">{baht(data.total)} ฿</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">จำนวนรายการ</span>
              <strong className="stat-value">{data.count} รายการ</strong>
            </div>
            {Object.entries(data.byCategory).map(([k, v]) => (
                <div className="stat-card" key={k}>
                  <span className="stat-label">{CATEGORIES[k]}</span>
                  <strong className="stat-value">{baht(v)} ฿</strong>
                </div>
            ))}
          </section>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="card">
            <div className="card-header">
              <h2>รายการรายจ่าย</h2>
            </div>
            <div className="card-body p-0">
              {loading ? (
                  <div className="state-message">กำลังโหลดข้อมูล...</div>
              ) : data.items.length === 0 ? (
                  <div className="state-message">ไม่พบรายการรายจ่าย</div>
              ) : (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                      <tr>
                        <th>วันที่</th>
                        <th>หมวดหมู่</th>
                        <th>หมายเหตุ</th>
                        <th className="text-right">จำนวนเงิน</th>
                        <th className="text-center">จัดการ</th>
                      </tr>
                      </thead>
                      <tbody>
                      {data.items.map((it) => (
                          <tr key={it.id}>
                            <td>{it.date}</td>
                            <td><span className="badge">{CATEGORIES[it.category]}</span></td>
                            <td>{it.note || <span className="text-muted">-</span>}</td>
                            <td className="text-right font-bold">{baht(it.amount)} ฿</td>
                            <td className="text-center">
                              <div className="action-buttons">
                                <button className="btn btn-xs btn-outline" onClick={() => { setEditing(it); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                                  แก้ไข
                                </button>
                                <button className="btn btn-xs btn-danger" onClick={() => handleDelete(it)}>
                                  ลบ
                                </button>
                              </div>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
              )}
            </div>
          </div>
        </main>
      </div>
  );
}