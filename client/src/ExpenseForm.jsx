import React, { useEffect, useState } from 'react';
import { CATEGORIES } from './api.js';

const NOTE_MAX = 250;

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const emptyForm = () => ({ amount: '', category: '', date: today(), note: '' });

export default function ExpenseForm({ editing, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setErrors({});
    setMessage('');
    setForm(editing ? { amount: String(editing.amount), category: editing.category, date: editing.date, note: editing.note } : emptyForm());
  }, [editing]);

  function validate() {
    const e = {};
    const amount = Number(form.amount);
    if (form.amount === '' || !Number.isFinite(amount)) e.amount = 'จำนวนเงินต้องเป็นตัวเลข';
    else if (amount <= 0) e.amount = 'จำนวนเงินต้องมากกว่า 0';
    if (!form.category) e.category = 'กรุณาเลือกหมวดหมู่';
    if (!form.date) e.date = 'กรุณาเลือกวันที่';
    else if (form.date > today()) e.date = 'ห้ามใส่วันที่ในอนาคต';
    if (form.note.length > NOTE_MAX) e.note = `ไม่เกิน ${NOTE_MAX} ตัวอักษร`;
    return e;
  }

  async function submit(ev) {
    ev.preventDefault();
    setMessage('');
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await onSubmit({ ...form, amount: Number(form.amount) });
      if (!editing) setForm(emptyForm());
    } catch (err) {
      setErrors(err.fields || {});
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
      <div className="card">
        <div className="card-header">
          <h2>{editing ? 'แก้ไขรายการ' : 'เพิ่มรายการรายจ่าย'}</h2>
        </div>
        <form onSubmit={submit} className="card-body" noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="amount">จำนวนเงิน (บาท)</label>
              <input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className={errors.amount ? 'input-error' : ''}
              />
              {errors.amount && <span className="field-error">{errors.amount}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">หมวดหมู่</label>
              <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={errors.category ? 'input-error' : ''}
              >
                <option value="">-- เลือกหมวดหมู่ --</option>
                {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              {errors.category && <span className="field-error">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="date">วันที่</label>
              <input
                  id="date"
                  type="date"
                  max={today()}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={errors.date ? 'input-error' : ''}
              />
              {errors.date && <span className="field-error">{errors.date}</span>}
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="note">หมายเหตุ</label>
              <span className="char-count">{form.note.length}/{NOTE_MAX}</span>
            </div>
            <input
                id="note"
                type="text"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="เช่น ค่าอาหารกลางวัน, ค่าเดินทาง"
                className={errors.note ? 'input-error' : ''}
            />
            {errors.note && <span className="field-error">{errors.note}</span>}
          </div>

          {message && <div className="alert alert-error">{message}</div>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'กำลังบันทึก...' : editing ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ'}
            </button>
            {editing && (
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                  ยกเลิก
                </button>
            )}
          </div>
        </form>
      </div>
  );
}