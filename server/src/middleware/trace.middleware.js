// SyllaTrace — in-memory diagnostic tracer
// Captures every API request into circular buffers for the IT debug console.

const TRACE_LIMIT = 1000;
const ERROR_LIMIT  = 300;
const SLOW_LIMIT   = 200;

const SLOW_QUERY_THRESHOLD_MS = 150;

// Keys whose values are always redacted from logged request bodies
const REDACT_KEYS = new Set([
  'password', 'new_password', 'confirm_password',
  'token', 'secret', 'api_key', 'authorization',
  'credit_card', 'cvv', 'card_number',
]);

class CircularBuffer {
  constructor(limit) {
    this._limit = limit;
    this._buf   = [];
  }
  push(item) {
    this._buf.unshift(item);
    if (this._buf.length > this._limit) this._buf.pop();
  }
  all()   { return [...this._buf]; }
  clear() { this._buf = []; }
  get size() { return this._buf.length; }
}

const traceBuffer     = new CircularBuffer(TRACE_LIMIT);
const errorBuffer     = new CircularBuffer(ERROR_LIMIT);
const slowQueryBuffer = new CircularBuffer(SLOW_LIMIT);

// Process-level error captures (unhandled rejections, uncaught exceptions)
const processErrorBuffer = new CircularBuffer(100);

let _traceCounter = 0;

function sanitizeBody(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = REDACT_KEYS.has(k.toLowerCase()) ? '[REDACTED]' : v;
  }
  return out;
}

function makeId() {
  _traceCounter++;
  return `tr-${_traceCounter}-${Math.random().toString(36).slice(2, 6)}`;
}

// ── Express middleware ──────────────────────────────────────────────────────
const traceMiddleware = (req, res, next) => {
  const start = Date.now();
  const id    = makeId();

  res.on('finish', () => {
    const duration_ms = Date.now() - start;
    const status      = res.statusCode;

    // Skip health check and the debug endpoints themselves (no noise)
    if (req.originalUrl === '/api/health') return;
    if (req.originalUrl.startsWith('/api/admin/debug')) return;

    const entry = {
      id,
      ts:          new Date().toISOString(),
      method:      req.method,
      path:        req.originalUrl,
      status,
      duration_ms,
      user_id:     req.user?.id    || req.adminUser?.id    || null,
      username:    req.user?.username || req.adminUser?.username || null,
      ip:          (req.headers['x-forwarded-for'] || req.ip || 'unknown').split(',')[0].trim(),
      ua:          (req.headers['user-agent'] || '').slice(0, 120),
      body_size:   req.headers['content-length'] ? Number(req.headers['content-length']) : null,
      body:        (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0)
                     ? sanitizeBody(req.body)
                     : undefined,
      error_msg:   res.locals.traceError || null,
    };

    traceBuffer.push(entry);

    if (status >= 400) {
      errorBuffer.push(entry);
      // Emit to admin room via socket for real-time feed (non-blocking)
      try {
        const { emitToAdmins } = require('../socket/index');
        emitToAdmins('admin:trace_error', entry);
      } catch (_) {}
    }
  });

  next();
};

// ── DB slow query recorder ─────────────────────────────────────────────────
const recordSlowQuery = (sql, duration_ms, pool_name = 'social') => {
  slowQueryBuffer.push({
    ts:          new Date().toISOString(),
    sql:         typeof sql === 'string' ? sql.replace(/\s+/g, ' ').trim().slice(0, 600) : String(sql),
    duration_ms,
    pool_name,
    slow:        duration_ms >= SLOW_QUERY_THRESHOLD_MS,
  });
};

// ── Process-level error capture ────────────────────────────────────────────
const recordProcessError = (type, err) => {
  const entry = {
    ts:      new Date().toISOString(),
    type,
    message: err?.message || String(err),
    stack:   err?.stack   || null,
  };
  processErrorBuffer.push(entry);
  try {
    const { emitToAdmins } = require('../socket/index');
    emitToAdmins('admin:trace_error', { ...entry, status: 500, method: 'PROCESS', path: type });
  } catch (_) {}
};

// ── Accessor helpers ───────────────────────────────────────────────────────
const getTrace        = () => traceBuffer.all();
const getErrors       = () => errorBuffer.all();
const getSlowQueries  = () => slowQueryBuffer.all();
const getProcessErrors= () => processErrorBuffer.all();

const getRouteStats   = () => {
  const map = {};
  for (const e of traceBuffer.all()) {
    // Normalise dynamic segments (/users/123 → /users/:id)
    const norm = e.path.replace(/\/\d+/g, '/:id').split('?')[0];
    const key  = `${e.method} ${norm}`;
    if (!map[key]) map[key] = { route: key, count: 0, errors: 0, total_ms: 0, max_ms: 0 };
    map[key].count++;
    map[key].total_ms += e.duration_ms;
    if (e.duration_ms > map[key].max_ms) map[key].max_ms = e.duration_ms;
    if (e.status >= 400) map[key].errors++;
  }
  return Object.values(map)
    .map(r => ({ ...r, avg_ms: Math.round(r.total_ms / r.count) }))
    .sort((a, b) => b.avg_ms - a.avg_ms);
};

const getBufferStats  = () => ({
  trace:         traceBuffer.size,
  errors:        errorBuffer.size,
  slow_queries:  slowQueryBuffer.size,
  process_errors:processErrorBuffer.size,
});

const clearAll = () => {
  traceBuffer.clear();
  errorBuffer.clear();
  slowQueryBuffer.clear();
  processErrorBuffer.clear();
};

module.exports = {
  traceMiddleware,
  recordSlowQuery,
  recordProcessError,
  getTrace,
  getErrors,
  getSlowQueries,
  getProcessErrors,
  getRouteStats,
  getBufferStats,
  clearAll,
  SLOW_QUERY_THRESHOLD_MS,
};
