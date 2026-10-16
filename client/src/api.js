// api.js — ฟังก์ชันเรียก REST API ทั้งหมดรวมไว้ที่เดียว
const BASE = '/api/v1';

export const CATEGORIES = {
  food: 'อาหาร',
  transport: 'เดินทาง',
  entertainment: 'บันเทิง',
  shopping: 'ช้อปปิ้ง',
  bills: 'ค่าบริการ/บิล',
  other: 'อื่น ๆ',
};

export function getToken() {
  return localStorage.getItem('token');
}
export function setSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}
export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
export function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'เกิดข้อผิดพลาด');
    err.status = res.status;
    err.fields = data.errors || {};
    throw err;
  }
  return data;
}

export const api = {
  register: (username, password) => request('/auth/register', { method: 'POST', body: { username, password } }),
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  listExpenses: (filters) => {
    const q = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && q.set(k, v));
    return request('/expenses' + (q.toString() ? `?${q}` : ''));
  },
  createExpense: (data) => request('/expenses', { method: 'POST', body: data }),
  updateExpense: (id, data) => request(`/expenses/${id}`, { method: 'PUT', body: data }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
};
