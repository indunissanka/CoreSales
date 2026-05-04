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
  // Auth
  login:         (body)    => apiFetch('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  register:      (body)    => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  getMe:            ()        => apiFetch('/auth/me'),
  changePassword:   (body)    => apiFetch('/auth/change-password', { method: 'PUT', body: JSON.stringify(body) }),

  // Reports (existing)
  getReports:    ()        => apiFetch('/reports'),
  getReport:     (id)      => apiFetch(`/reports/${id}`),
  createReport:  (body)    => apiFetch('/reports',       { method: 'POST',   body: JSON.stringify(body) }),
  updateReport:  (id,body) => apiFetch(`/reports/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
  deleteReport:  (id)      => apiFetch(`/reports/${id}`, { method: 'DELETE' }),

  // Contacts
  getContacts:      (params)    => apiFetch('/contacts' + toQS(params)),
  getContact:       (id)        => apiFetch(`/contacts/${id}`),
  createContact:    (body)      => apiFetch('/contacts',       { method: 'POST',   body: JSON.stringify(body) }),
  updateContact:    (id,body)   => apiFetch(`/contacts/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
  deleteContact:    (id)        => apiFetch(`/contacts/${id}`, { method: 'DELETE' }),
  addCommLog:       (id,body)   => apiFetch(`/contacts/${id}/comm`,          { method: 'POST',   body: JSON.stringify(body) }),
  deleteCommLog:    (id,logId)  => apiFetch(`/contacts/${id}/comm/${logId}`, { method: 'DELETE' }),

  // Products
  getProducts:      (params)    => apiFetch('/products' + toQS(params)),
  getProduct:       (id)        => apiFetch(`/products/${id}`),
  createProduct:    (body)      => apiFetch('/products',       { method: 'POST',   body: JSON.stringify(body) }),
  updateProduct:    (id,body)   => apiFetch(`/products/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
  deleteProduct:    (id)        => apiFetch(`/products/${id}`, { method: 'DELETE' }),

  // Orders
  getLineItems:     (params)    => apiFetch('/orders/line-items' + toQS(params)),
  getNextOrderNo:        ()          => apiFetch('/orders/next-number'),
  getNextQuotationNo:    ()          => apiFetch('/orders/next-quotation-number'),
  getOrders:        (params)    => apiFetch('/orders' + toQS(params)),
  getOrder:         (id)        => apiFetch(`/orders/${id}`),
  createOrder:      (body)      => apiFetch('/orders',       { method: 'POST',   body: JSON.stringify(body) }),
  updateOrder:      (id,body)   => apiFetch(`/orders/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),

  // Proforma Invoices
  getPIs:           ()          => apiFetch('/pi'),
  getPI:            (id)        => apiFetch(`/pi/${id}`),
  generatePI:       (body)      => apiFetch('/pi',       { method: 'POST', body: JSON.stringify(body) }),
  updatePI:         (id,body)   => apiFetch(`/pi/${id}`, { method: 'PUT',  body: JSON.stringify(body) }),

  // Letters of Credit
  getLCAlerts:      ()          => apiFetch('/lc/alerts'),
  getLCs:           (params)    => apiFetch('/lc' + toQS(params)),
  getLC:            (id)        => apiFetch(`/lc/${id}`),
  createLC:         (body)      => apiFetch('/lc',       { method: 'POST', body: JSON.stringify(body) }),
  updateLC:         (id,body)   => apiFetch(`/lc/${id}`, { method: 'PUT',  body: JSON.stringify(body) }),

  // Forecasts
  getForecasts:     (params)    => apiFetch('/forecasts' + toQS(params)),
  createForecast:   (body)      => apiFetch('/forecasts',       { method: 'POST',   body: JSON.stringify(body) }),
  updateForecast:   (id,body)   => apiFetch(`/forecasts/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
  deleteForecast:   (id)        => apiFetch(`/forecasts/${id}`, { method: 'DELETE' }),

  // Currency
  getCurrencyRates: ()          => apiFetch('/currency/rates'),
  convertCurrency:  (body)      => apiFetch('/currency/convert', { method: 'POST', body: JSON.stringify(body) }),

  // Samples
  getSamples:       (params)    => apiFetch('/samples' + toQS(params)),
  getSample:        (id)        => apiFetch(`/samples/${id}`),
  createSample:     (body)      => apiFetch('/samples',       { method: 'POST',   body: JSON.stringify(body) }),
  updateSample:     (id, body)  => apiFetch(`/samples/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
  deleteSample:     (id)        => apiFetch(`/samples/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings:      ()       => apiFetch('/settings'),
  saveSettings:     (body)   => apiFetch('/settings', { method: 'PUT', body: JSON.stringify(body) }),

  // Notes
  getNotes:         ()        => apiFetch('/notes'),
  createNote:       (body)    => apiFetch('/notes',       { method: 'POST',   body: JSON.stringify(body) }),
  updateNote:       (id,body) => apiFetch(`/notes/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
  deleteNote:       (id)      => apiFetch(`/notes/${id}`, { method: 'DELETE' }),

  // To-Do Lists
  getTodos:         ()        => apiFetch('/todos'),
  createTodo:       (body)    => apiFetch('/todos',       { method: 'POST',   body: JSON.stringify(body) }),
  updateTodo:       (id,body) => apiFetch(`/todos/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
  deleteTodo:       (id)      => apiFetch(`/todos/${id}`, { method: 'DELETE' }),

  // Backup
  restoreBackup:    (body)   => apiFetch('/backup/import', { method: 'POST', body: JSON.stringify(body) }),

  // Admin
  getAdminSystem:   ()          => apiFetch('/admin/system'),
  setAdminSystem:   (body)      => apiFetch('/admin/system',       { method: 'PUT',    body: JSON.stringify(body) }),
  getAdminUsers:    ()          => apiFetch('/admin/users'),
  createAdminUser:  (body)      => apiFetch('/admin/users',        { method: 'POST',   body: JSON.stringify(body) }),
  updateAdminUser:  (id, body)  => apiFetch(`/admin/users/${id}`,  { method: 'PUT',    body: JSON.stringify(body) }),
  deleteAdminUser:  (id)        => apiFetch(`/admin/users/${id}`,  { method: 'DELETE' }),

  // Meetings
  getMeetings:      (params)    => apiFetch('/meetings' + toQS(params)),
  getMeeting:       (id)        => apiFetch(`/meetings/${id}`),
  createMeeting:    (body)      => apiFetch('/meetings',       { method: 'POST',   body: JSON.stringify(body) }),
  updateMeeting:    (id,body)   => apiFetch(`/meetings/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
  deleteMeeting:    (id)        => apiFetch(`/meetings/${id}`, { method: 'DELETE' }),
};

// Apply company branding to topbar on every page
(function applyBranding() {
  function render(s) {
    const el = document.querySelector('.brand');
    if (!el || !s) return;
    const name = s.companyName || 'CoreSales CRM';
    if (s.logoBase64) {
      el.innerHTML = `<img src="${s.logoBase64}" alt="${name}" style="height:28px;max-width:140px;object-fit:contain;vertical-align:middle;margin-right:8px;">${name}`;
    } else {
      el.textContent = name;
    }
    document.title = document.title.replace(/^.*?—/, name + ' —').replace(/^CoreSales CRM$/, name);
  }

  // Apply cached value immediately (no flash)
  try {
    const cached = localStorage.getItem('companySettings');
    if (cached) render(JSON.parse(cached));
  } catch (_) {}

  // Refresh from API after login token is available
  document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/settings', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const s = await res.json();
      const cache = { companyName: s.companyName, companySlogan: s.companySlogan, logoBase64: s.logoBase64, sellerAddress: s.sellerAddress, bankDetails: s.bankDetails };
      localStorage.setItem('companySettings', JSON.stringify(cache));
      render(cache);
    } catch (_) {}
  });
})();

function toQS(params) {
  if (!params || !Object.keys(params).length) return '';
  const p = Object.entries(params).filter(([,v]) => v !== undefined && v !== null && v !== '');
  return p.length ? '?' + p.map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&') : '';
}
