const API_BASE = '/api';

function getToken() { return localStorage.getItem('token'); }

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const api = {
  login:         (body)    => apiFetch('/auth/login',      { method: 'POST', body: JSON.stringify(body) }),
  register:      (body)    => apiFetch('/auth/register',   { method: 'POST', body: JSON.stringify(body) }),
  getReports:    ()        => apiFetch('/reports'),
  getReport:     (id)      => apiFetch(`/reports/${id}`),
  createReport:  (body)    => apiFetch('/reports',         { method: 'POST', body: JSON.stringify(body) }),
  updateReport:  (id,body) => apiFetch(`/reports/${id}`,   { method: 'PUT',  body: JSON.stringify(body) }),
  deleteReport:  (id)      => apiFetch(`/reports/${id}`,   { method: 'DELETE' }),
};
