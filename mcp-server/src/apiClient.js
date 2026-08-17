const BASE_URL = process.env.CORESALES_API_BASE_URL || 'http://backend:3000';
const API_KEY = process.env.CORESALES_API_KEY;

async function request(method, path, { query, body } = {}) {
  const url = new URL(BASE_URL + path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url, {
    method,
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message = (data && data.error) || res.statusText || `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}

module.exports = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, opts) => request('POST', path, opts),
  put: (path, opts) => request('PUT', path, opts),
  delete: (path, opts) => request('DELETE', path, opts)
};
