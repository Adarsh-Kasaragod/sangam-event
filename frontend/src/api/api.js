// frontend/src/api/api.js
// Centralised fetch wrapper for all API calls.
// Base URL: VITE_API_URL env var in production, /api proxy in dev (via vite.config.js).
// Admin calls automatically attach the Bearer token from localStorage.

const BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '') // strip trailing slash
  : '/api'; // dev proxy

/**
 * Internal fetch helper.
 * @param {string} endpoint - e.g. '/events.php' or '/events.php?id=1'
 * @param {RequestInit} options - fetch options
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('admin_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  // Try to parse JSON even on error responses (PHP always returns JSON)
  let data;
  try {
    data = await res.json();
  } catch {
    data = { error: `HTTP ${res.status}: ${res.statusText}` };
  }

  if (!res.ok) {
    // Throw an Error with the server's message so callers can display it
    const err = new Error(data?.error || `Request failed with status ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// ── Public API ──────────────────────────────────────────────────────────────

/** Fetch all events with computed status */
export const getEvents = () => request('/events.php');

/** Fetch a single event by ID */
export const getEvent = (id) => request(`/events.php?id=${id}`);

/** Register a student for an event */
export const registerForEvent = (payload) =>
  request('/register.php', { method: 'POST', body: JSON.stringify(payload) });

// ── Admin API ───────────────────────────────────────────────────────────────

/** Admin login — returns { token, admin } */
export const adminLogin = (email, password) =>
  request('/login.php', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

/** Dashboard stats */
export const getStats = () => request('/stats.php');

/** Create a new event */
export const createEvent = (payload) =>
  request('/events.php', { method: 'POST', body: JSON.stringify(payload) });

/** Update an existing event */
export const updateEvent = (id, payload) =>
  request(`/events.php?id=${id}`, { method: 'PUT', body: JSON.stringify(payload) });

/** Delete an event */
export const deleteEvent = (id) =>
  request(`/events.php?id=${id}`, { method: 'DELETE' });

/** Get registrations for an event, with optional search */
export const getRegistrations = (eventId, search = '') =>
  request(`/registrations.php?event_id=${eventId}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
