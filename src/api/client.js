function defaultApiUrl() {
  if (typeof window === 'undefined') return 'http://127.0.0.1:8000';

  const { protocol, hostname } = window.location;
  const apiHost = hostname === 'localhost' ? '127.0.0.1' : hostname;
  return `${protocol}//${apiHost}:8000`;
}

const API_URL = process.env.REACT_APP_API_URL || defaultApiUrl();

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) throw new Error(data?.detail || data?.message || `HTTP ${res.status}`);
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, b) => request(p, { method: 'POST', body: JSON.stringify(b || {}) }),
  put: (p, b) => request(p, { method: 'PUT', body: JSON.stringify(b || {}) }),
  del: (p) => request(p, { method: 'DELETE' }),
};
