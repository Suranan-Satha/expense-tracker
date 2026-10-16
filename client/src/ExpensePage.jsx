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
      <div className="main-wrapper">
        <div className="container">
          <header className="topbar">
            <h1>Daily Expense Tracker</h1>
            <div className="user-info">
              <span>ผู้ใช้งาน: <strong>{user?.username}</strong></span>
              <button className="btn btn-sm" onClick={onLogout}>ออกจากระบบ</button>
            </div>
          </header>

          <ExpenseForm editing={editing} onSubmit={handleSubmit} onCancel={() => setEditing(null)} />

          <section className="card">
            <div className="card-title">
              <h2>ค้นหาและกรอง</h2>
            </div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>ค้นหาในหมายเหตุ</label>
                  <input
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      placeholder="เช่น กาแฟ"
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
          </section>

          <section className="card">
            <div className="card-title">
              <h2>สรุปยอดเงิน</h2>
            </div>
            <div className="summary-grid">
              <div className="summary-card">
                <span className="label">ยอดรวมทั้งหมด</span>
                <span className="value">{baht(data.total)} ฿</span>
              </div>
              <div className="summary-card">
                <span className="label">จำนวนรายการ</span>
                <span className="value">{data.count}</span>
              </div>
              {Object.entries(data.byCategory).map(([k, v]) => (
                  <div className="summary-card" key={k}>
                    <span className="label">รวมหมวด{CATEGORIES[k]}</span>
                    <span className="value">{baht(v)} ฿</span>
                  </div>
              ))}
            </div>
          </section>

          {error && <div className="alert">{error}</div>}

          <section className="card">
            <div className="card-title">
              <h2>รายการรายจ่าย</h2>
            </div>
            <div className="table-container" style={{ paddingTop: '16px' }}>
              {loading ? (
                  <p className="muted">กำลังโหลด...</p>
              ) : data.items.length === 0 ? (
                  <p className="muted">ไม่พบรายการ</p>
              ) : (
                  <table>
                    <thead>
                    <tr>
                      <th>วันที่</th>
                      <th>หมวดหมู่</th>
                      <th>หมายเหตุ</th>
                      <th className="num">จำนวน (฿)</th>
                      <th style={{ textAlign: 'right' }}>จัดการ</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.items.map((it) => (
                        <tr key={it.id}>
                          <td>{it.date}</td>
                          <td><span className="badge">{CATEGORIES[it.category]}</span></td>
                          <td>{it.note || <span className="muted">-</span>}</td>
                          <td className="num">{baht(it.amount)}</td>
                          <td className="actions">
                            <div className="action-btns">
                              <button className="btn btn-sm" onClick={() => { setEditing(it); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                                แก้ไข
                              </button>
                              <button className="btn btn-sm btn-delete" onClick={() => handleDelete(it)}>
                                ลบ
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
              )}
            </div>
          </section>
        </div>
      </div>
  );
}