// SyllaTrace Diagnostics Controller
// Serves all IT debug console endpoints — super admin only.

const {
  getTrace,
  getErrors,
  getSlowQueries,
  getProcessErrors,
  getRouteStats,
  getBufferStats,
  clearAll,
  SLOW_QUERY_THRESHOLD_MS,
} = require('../../middleware/trace.middleware');

const os = require('os');

// GET /api/admin/debug/health
const getHealth = (req, res) => {
  const mem    = process.memoryUsage();
  const uptime = process.uptime();

  res.json({
    uptime_seconds:  Math.floor(uptime),
    uptime_human:    formatUptime(uptime),
    pid:             process.pid,
    node_version:    process.version,
    platform:        process.platform,
    arch:            process.arch,
    memory: {
      heap_used_mb:  toMB(mem.heapUsed),
      heap_total_mb: toMB(mem.heapTotal),
      rss_mb:        toMB(mem.rss),
      external_mb:   toMB(mem.external),
      heap_pct:      Math.round((mem.heapUsed / mem.heapTotal) * 100),
    },
    os: {
      load_avg_1m:   os.loadavg()[0].toFixed(2),
      free_mem_mb:   toMB(os.freemem()),
      total_mem_mb:  toMB(os.totalmem()),
    },
    buffer_stats:    getBufferStats(),
    slow_threshold_ms: SLOW_QUERY_THRESHOLD_MS,
    ts:              new Date().toISOString(),
  });
};

// GET /api/admin/debug/trace
const getTraceLog = (req, res) => {
  let entries = getTrace();

  const { method, status_min, status_max, route, limit = 200, errors_only } = req.query;

  if (errors_only === 'true') entries = entries.filter(e => e.status >= 400);
  if (method)     entries = entries.filter(e => e.method === method.toUpperCase());
  if (status_min) entries = entries.filter(e => e.status >= Number(status_min));
  if (status_max) entries = entries.filter(e => e.status <= Number(status_max));
  if (route)      entries = entries.filter(e => e.path.toLowerCase().includes(route.toLowerCase()));

  res.json({ entries: entries.slice(0, Number(limit)), total: entries.length });
};

// GET /api/admin/debug/errors
const getErrorLog = (req, res) => {
  const entries = getErrors();
  const process_errs = getProcessErrors();
  res.json({ errors: entries, process_errors: process_errs, total: entries.length + process_errs.length });
};

// GET /api/admin/debug/slow-queries
const getSlowQueryLog = (req, res) => {
  const entries = getSlowQueries();
  res.json({ queries: entries, total: entries.length, threshold_ms: SLOW_QUERY_THRESHOLD_MS });
};

// GET /api/admin/debug/route-stats
const getRouteStatsHandler = (req, res) => {
  const stats = getRouteStats();
  const slowest = [...stats].sort((a, b) => b.avg_ms - a.avg_ms).slice(0, 15);
  const most_errored = [...stats].sort((a, b) => b.errors - a.errors).filter(r => r.errors > 0).slice(0, 15);
  res.json({ all: stats, slowest, most_errored });
};

// DELETE /api/admin/debug/clear
const clearBuffers = (req, res) => {
  clearAll();
  res.json({ message: 'All trace buffers cleared.' });
};

// ── helpers ──────────────────────────────────────────────────────────────────
function toMB(bytes) { return Math.round(bytes / 1024 / 1024); }

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

module.exports = { getHealth, getTraceLog, getErrorLog, getSlowQueryLog, getRouteStatsHandler, clearBuffers };
