import React, { useCallback, useEffect, useRef, useState } from 'react';
import { api, CATEGORIES } from './api.js';
import ExpenseForm from './ExpenseForm.jsx';

const PERIODS = { '': 'ทั้งหมด', today: 'วันนี้', week: 'สัปดาห์นี้', month: 'เดือนนี้' };

const baht = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ฟอร์แมตวันที่แบบไทย เช่น 16 ต.ค. 69
function formatDateThai(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
}

export default function ExpensePage({ user, onLogout }) {
  const [data, setData] = useState({ items: [], total: 0, count: 0, byCategory: {} });
  const [filters, setFilters] = useState({ search: '', category: '', period: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  const toastTimer = useRef(null);
  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3000);
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // กันผลลัพธ์เก่าที่ตอบกลับช้ากว่า มาทับผลลัพธ์ใหม่ (เช่น พิมพ์ค้นหาเร็ว ๆ)
  const reqId = useRef(0);
  const load = useCallback(async () => {
    const id = ++reqId.current;
    try {
      setError('');
      const res = await api.listExpenses(filters);
      if (id === reqId.current) setData(res);
    } catch (err) {
      if (id !== reqId.current) return;
      if (err.status === 401) return onLogout();
      setError(err.message);
    } finally {
      if (id === reqId.current) setLoading(false);
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
      showToast('บันทึกการแก้ไขเรียบร้อยแล้ว');
    } else {
      await api.createExpense(form);
      showToast('เพิ่มรายการเรียบร้อยแล้ว');
    }
    await load();
  }

  async function handleDelete(item) {
    const label = item.note || CATEGORIES[item.category];
    if (!window.confirm(`คุณต้องการลบรายการ "${label}" จำนวน ${baht(item.amount)} บาท ใช่หรือไม่?`)) return;
    try {
      await api.deleteExpense(item.id);
      if (editing?.id === item.id) setEditing(null);
      showToast('ลบรายการเรียบร้อยแล้ว');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleResetFilters() {
    setFilters({ search: '', category: '', period: '' });
  }

  // ข้อ 4: เรียงรายการใหม่ล่าสุดขึ้นก่อน (เรียงตามวันที่ Descending และ ID Descending)
  const sortedItems = [...data.items].sort((a, b) => {
    const dateComp = b.date.localeCompare(a.date);
    if (dateComp !== 0) return dateComp;
    return (b.id || 0) - (a.id || 0);
  });

  // ข้อ 1: เรียงหมวดหมู่ตามยอดเงินจากมากไปน้อย
  const sortedCategories = Object.entries(data.byCategory).sort((a, b) => b[1] - a[1]);

  const isFiltered = filters.search || filters.category || filters.period;

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

          {toast && <div className="toast-notification" role="status">{toast}</div>}

          <div className="layout">
            <div className="side-col">
              <ExpenseForm editing={editing} onSubmit={handleSubmit} onCancel={() => setEditing(null)} />

              {/* ข้อ 3: การ์ดค้นหาและกรอง + ปุ่มล้างตัวกรอง */}
              <section className="card">
                <div className="card-title">
                  <h2>ค้นหาและกรอง</h2>
                </div>
                <div className="card-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="filter-search">ค้นหาในหมายเหตุ</label>
                      <input
                          id="filter-search"
                          value={filters.search}
                          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                          placeholder="เช่น กาแฟ"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="filter-category">หมวดหมู่</label>
                      <select id="filter-category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                        <option value="">ทั้งหมด</option>
                        {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="filter-period">ช่วงเวลา</label>
                      <select id="filter-period" value={filters.period} onChange={(e) => setFilters({ ...filters, period: e.target.value })}>
                        {Object.entries(PERIODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                  {isFiltered && (
                      <div className="filter-actions">
                        <button type="button" className="btn btn-sm" onClick={handleResetFilters}>
                          ล้างตัวกรอง
                        </button>
                      </div>
                  )}
                </div>
              </section>

            </div>
            <div className="main-col">
              {/* ข้อ 1 & 2: แยกการ์ดสรุปเป็นสองกลุ่ม + สัดส่วน % + ลบคำว่า "รวมหมวด" */}
              <section className="card">
                <div className="card-title">
                  <h2>สรุปยอดเงิน</h2>
                </div>
                <div className="card-body">
                  <div className="summary-main">
                    <div className="summary-card main-stat">
                      <span className="label">ยอดรวมทั้งหมด</span>
                      <span className="value primary-value">{baht(data.total)} ฿</span>
                    </div>
                    <div className="summary-card main-stat">
                      <span className="label">จำนวนรายการ</span>
                      <span className="value">{data.count} รายการ</span>
                    </div>
                  </div>

                  {sortedCategories.length > 0 && (
                      <div className="summary-section">
                        <h3 className="section-subheading">แยกตามหมวดหมู่</h3>
                        <div className="summary-cats">
                          {sortedCategories.map(([k, v]) => {
                            const percent = data.total > 0 ? ((v / data.total) * 100).toFixed(0) : 0;
                            return (
                                <div className="summary-card" key={k}>
                                  <span className="label">{CATEGORIES[k]}</span>
                                  <span className="value">{baht(v)} ฿</span>
                                  <span className="percent-tag">{percent}%</span>
                                  <div className="cat-bar"><div className="cat-bar-fill" style={{ width: `${percent}%` }} /></div>
                                </div>
                            );
                          })}
                        </div>
                      </div>
                  )}
                </div>
              </section>

              {error && <div className="alert">{error}</div>}

              {/* ข้อ 4, 5, 6, 7 & 8: ตารางรายการเรียงตามวันที่ล่าสุด, ฟอร์แมตวันที่ไทย, แสดง "-" เมื่อหมายเหตุว่าง */}
              <section className="card">
                <div className="card-title">
                  <h2>รายการรายจ่าย</h2>
                </div>
                <div className="table-container" style={{ paddingTop: '16px' }}>
                  {loading ? (
                      <div className="loading-box">
                        <p className="muted">กำลังโหลดข้อมูลรายการ...</p>
                        <div className="xp-progress-bar" style={{ maxWidth: '250px' }}>
                          <div className="xp-progress-fill"></div>
                        </div>
                      </div>
                  ) : sortedItems.length === 0 ? (
                      <p className="muted empty-state-msg">ยังไม่มีรายการรายจ่าย</p>
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
                        {sortedItems.map((it) => (
                            <tr key={it.id} className={editing?.id === it.id ? 'editing-row' : undefined}>
                              <td>{formatDateThai(it.date)}</td>
                              <td><span className="badge">{CATEGORIES[it.category]}</span></td>
                              <td>{it.note ? it.note : <span className="muted">-</span>}</td>
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
        </div>
      </div>
  );
}