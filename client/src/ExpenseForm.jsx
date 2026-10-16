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
      <form className="card" onSubmit={submit} noValidate>
        <h2>{editing ? 'แก้ไขรายการ' : 'เพิ่มรายจ่าย'}</h2>

        <div className="grid">
          <label>
            จำนวนเงิน (บาท)
            <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            {errors.amount && <span className="error">{errors.amount}</span>}
          </label>

          <label>
            หมวดหมู่
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">-- เลือก --</option>
              {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            {errors.category && <span className="error">{errors.category}</span>}
          </label>

          <label>
            วันที่
            <input
                type="date"
                max={today()}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            {errors.date && <span className="error">{errors.date}</span>}
          </label>
        </div>

        <label>
          หมายเหตุ <span className="muted">({form.note.length}/{NOTE_MAX})</span>
          <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="เช่น กาแฟ, ค่ารถไฟฟ้า" />
          {errors.note && <span className="error">{errors.note}</span>}
        </label>

        {message && <div className="alert">{message}</div>}

        <div className="row" style={{ marginTop: '12px' }}>
          <button className="btn primary" disabled={saving}>{saving ? 'กำลังบันทึก...' : editing ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ'}</button>
          {editing && <button type="button" className="btn" onClick={onCancel}>ยกเลิก</button>}
        </div>
      </form>
  );
}