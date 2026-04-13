import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT on every outgoing request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * @param {string} email
 * @param {string} password
 * @returns {{ token, userId, email, firstName, lastName, type }}
 */
export async function login(email, password) {
  const res = await client.post('/api/auth/login', { email, password });
  return res.data;
}

/**
 * POST /api/auth/register
 */
export async function register(email, password, firstName, lastName) {
  const res = await client.post('/api/auth/register', { email, password, firstName, lastName });
  return res.data;
}

// ── Documents ─────────────────────────────────────────────────────────────────

/**
 * GET /api/documents/{id} for IDs 1–30  — the /api/documents list endpoint
 * returns 403, so we enumerate individual docs and filter by the logged-in user.
 */
export async function getMyDocuments() {
  const me = JSON.parse(localStorage.getItem('current_user') || '{}');
  const myId = me.userId;
  const docs = [];
  const promises = Array.from({ length: 30 }, (_, i) =>
    client.get(`/api/documents/${i + 1}`)
      .then(r => docs.push(r.data))
      .catch(() => {})
  );
  await Promise.all(promises);
  // Sort by id and optionally filter to current user's docs
  docs.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  if (myId) {
    const mine = docs.filter(d => {
      const ownerId = d.owner?.id ?? d.ownerId;
      return ownerId === myId;
    });
    return mine; // Return only the user's documents (even if empty)
  }
  return docs;
}

/**
 * GET /api/documents/:id  — VULNERABLE: no ownership check
 * Any authenticated user can access any document by guessing the ID.
 * @param {number|string} id
 */
export async function getDocumentById(id) {
  const res = await client.get(`/api/documents/${id}`);
  return res.data;
}

/**
 * POST /api/documents/create — create a new document
 * @param {string} title
 * @param {string} content
 */
export async function createDocument(title, content) {
  const res = await client.post('/api/documents/create', { title, content });
  return res.data;
}

/**
 * GET /api/users/me  — current user profile
 */
export async function getMe() {
  const res = await client.get('/api/users/me');
  return res.data;
}

/**
 * GET /api/users  — list all users (admin only)
 */
export async function getAllUsers() {
  const res = await client.get('/api/users');
  return res.data;
}

// ── Attack helper ─────────────────────────────────────────────────────────────

/**
 * Brute-force enumerate document IDs [startId … endId] from a separate
 * authenticated session (attacker's JWT).  Yields results one by one via
 * an async generator so callers can stream progress to the UI.
 *
 * @param {string} attackerToken — JWT of the attacker account
 * @param {number} startId
 * @param {number} endId
 * @param {number} delayMs  — artificial delay between requests (ms) for demo visibility
 */
export async function* bruteForceDocuments(attackerToken, startId, endId, delayMs = 250, isVulnerable = true) {
  for (let id = startId; id <= endId; id++) {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    const t0 = Date.now();
    try {
      const endpoint = isVulnerable 
        ? `${BASE_URL}/api/documents/${id}`
        : `${BASE_URL}/api/secure/documents/${id}`;
        
      const res = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${attackerToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 8000,
      });
      const elapsed = Date.now() - t0;
      yield { id, status: 'hit', data: res.data, elapsed };
    } catch (err) {
      const status = err?.response?.status ?? 0;
      const elapsed = Date.now() - t0;
      yield { id, status: status === 404 ? 'miss' : status === 403 ? 'forbidden' : 'error', elapsed };
    }
    if (delayMs > 0) await delay(delayMs);
  }
}

// ── Mitigated endpoints (Phase 3) ─────────────────────────────────────────────

/**
 * GET /api/secure/documents/:id — same endpoint but backend now enforces
 * ownership checks and uses UUIDs (mitigated phase).
 */
export async function getSecureDocumentById(id) {
  const res = await client.get(`/api/secure/documents/${id}`);
  return res.data;
}

export default client;
