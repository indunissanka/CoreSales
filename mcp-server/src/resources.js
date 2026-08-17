// Data-driven map of CoreSales REST endpoints -> MCP tools.
// `ops` generates standard CRUD tools (list/get/create/update/delete) against `base` and `base/:id`.
// `extra` lists one-off endpoints that don't fit the CRUD shape, registered through the same
// generic loop in registerTools.js (path may be a string or a function of the path params).

const resources = [
  { name: 'contacts', base: '/api/contacts', ops: ['list', 'get', 'create', 'update', 'delete'], extra: [
    { name: 'contacts_add_comm', method: 'post', path: (id) => `/api/contacts/${id}/comm`, params: ['id'], hasBody: true },
    { name: 'contacts_delete_comm', method: 'delete', path: (id, logId) => `/api/contacts/${id}/comm/${logId}`, params: ['id', 'logId'] }
  ] },

  { name: 'products', base: '/api/products', ops: ['list', 'get', 'create', 'update', 'delete'] },

  { name: 'orders', base: '/api/orders', ops: ['list', 'get', 'create', 'update', 'delete'], extra: [
    { name: 'orders_line_items', method: 'get', path: '/api/orders/line-items' },
    { name: 'orders_next_number', method: 'get', path: '/api/orders/next-number' },
    { name: 'orders_next_quotation_number', method: 'get', path: '/api/orders/next-quotation-number' },
    { name: 'orders_duplicate', method: 'post', path: (id) => `/api/orders/${id}/duplicate`, params: ['id'] }
  ] },

  { name: 'pi', base: '/api/pi', ops: ['list', 'get', 'create', 'update'] },

  { name: 'lc', base: '/api/lc', ops: ['list', 'get', 'create', 'update'], extra: [
    { name: 'lc_alerts', method: 'get', path: '/api/lc/alerts' }
  ] },

  { name: 'forecasts', base: '/api/forecasts', ops: ['list', 'get', 'create', 'update', 'delete'], extra: [
    { name: 'forecasts_summary', method: 'get', path: '/api/forecasts/summary' }
  ] },

  { name: 'marketing', base: '/api/marketing', ops: ['list', 'get', 'create', 'update', 'delete'] },
  { name: 'meetings', base: '/api/meetings', ops: ['list', 'get', 'create', 'update', 'delete'] },
  { name: 'notes', base: '/api/notes', ops: ['list', 'get', 'create', 'update', 'delete'] },
  { name: 'reports', base: '/api/reports', ops: ['list', 'get', 'create', 'update', 'delete'] },
  { name: 'samples', base: '/api/samples', ops: ['list', 'get', 'create', 'update', 'delete'] },
  { name: 'todos', base: '/api/todos', ops: ['list', 'get', 'create', 'update', 'delete'] },

  { name: 'dashboard', ops: [], extra: [
    { name: 'dashboard_get', method: 'get', path: '/api/dashboard' }
  ] },

  { name: 'search', ops: [], extra: [
    { name: 'search_global', method: 'get', path: '/api/search', query: ['q'] }
  ] },

  { name: 'currency', ops: [], extra: [
    { name: 'currency_rates', method: 'get', path: '/api/currency/rates' },
    { name: 'currency_convert', method: 'post', path: '/api/currency/convert', hasBody: true }
  ] },

  { name: 'pricing', ops: [], extra: [
    { name: 'pricing_list', method: 'get', path: '/api/pricing' },
    { name: 'pricing_csv', method: 'get', path: '/api/pricing/csv' }
  ] },

  { name: 'settings', ops: [], extra: [
    { name: 'settings_public', method: 'get', path: '/api/settings/public' },
    { name: 'settings_contact_roles', method: 'get', path: '/api/settings/contact-roles' },
    { name: 'settings_get', method: 'get', path: '/api/settings' },
    { name: 'settings_update', method: 'put', path: '/api/settings', hasBody: true }
  ] },

  { name: 'backup', ops: [], extra: [
    { name: 'backup_export', method: 'get', path: '/api/backup/export' },
    { name: 'backup_import', method: 'post', path: '/api/backup/import', hasBody: true }
  ] },

  { name: 'admin', ops: [], extra: [
    { name: 'admin_system_get', method: 'get', path: '/api/admin/system' },
    { name: 'admin_system_update', method: 'put', path: '/api/admin/system', hasBody: true },
    { name: 'admin_users_list', method: 'get', path: '/api/admin/users' },
    { name: 'admin_users_create', method: 'post', path: '/api/admin/users', hasBody: true },
    { name: 'admin_users_update', method: 'put', path: (id) => `/api/admin/users/${id}`, params: ['id'], hasBody: true },
    { name: 'admin_users_delete', method: 'delete', path: (id) => `/api/admin/users/${id}`, params: ['id'] },
    { name: 'admin_apikeys_list', method: 'get', path: '/api/admin/api-keys' },
    { name: 'admin_apikeys_create', method: 'post', path: '/api/admin/api-keys', hasBody: true },
    { name: 'admin_apikeys_delete', method: 'delete', path: (id) => `/api/admin/api-keys/${id}`, params: ['id'] }
  ] }
];

module.exports = resources;
