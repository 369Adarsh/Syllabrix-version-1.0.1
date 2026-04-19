'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity, AlertTriangle, Database, Zap, RefreshCw, Trash2,
  ChevronDown, ChevronRight, Loader2, Cpu, HardDrive, Clock,
  CheckCircle, XCircle, Info, AlertCircle, Terminal, BarChart3,
  Wifi, WifiOff, Circle,
} from 'lucide-react';
import { adminAPI } from '@/lib/api/admin.api';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

// ── Helpers ──────────────────────────────────────────────────────────────────

function statusColor(code) {
  if (!code) return 'text-white/30';
  if (code >= 500) return 'text-red-400';
  if (code >= 400) return 'text-orange-400';
  if (code >= 300) return 'text-cyan-400';
  return 'text-emerald-400';
}

function statusBg(code) {
  if (!code) return 'bg-white/5';
  if (code >= 500) return 'bg-red-500/10 border-red-500/20';
  if (code >= 400) return 'bg-orange-500/10 border-orange-500/20';
  if (code >= 300) return 'bg-cyan-500/10 border-cyan-500/20';
  return 'bg-emerald-500/10 border-emerald-500/20';
}

function methodColor(m) {
  const map = { GET: 'text-blue-400', POST: 'text-violet-400', PUT: 'text-yellow-400', PATCH: 'text-amber-400', DELETE: 'text-red-400' };
  return map[m] || 'text-white/50';
}

function durationColor(ms) {
  if (ms >= 1000) return 'text-red-400';
  if (ms >= 500)  return 'text-orange-400';
  if (ms >= 150)  return 'text-yellow-400';
  return 'text-emerald-400';
}

function relTime(ts) {
  if (!ts) return '—';
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 5000)   return 'just now';
  if (diff < 60000)  return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000)return `${Math.floor(diff / 60000)}m ago`;
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function VitalCard({ icon: Icon, label, value, sub, color = 'violet', warn = false }) {
  const c = warn ? 'red' : color;
  const colors = {
    violet:  'from-violet-500/20 to-purple-600/10 border-violet-500/20 text-violet-400',
    emerald: 'from-emerald-500/20 to-green-600/10 border-emerald-500/20 text-emerald-400',
    blue:    'from-blue-500/20 to-cyan-600/10 border-blue-500/20 text-blue-400',
    amber:   'from-amber-500/20 to-yellow-600/10 border-amber-500/20 text-amber-400',
    red:     'from-red-500/20 to-rose-600/10 border-red-500/20 text-red-400',
  };
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-4 ${colors[c]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="opacity-70" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</span>
      </div>
      <p className="text-white font-bold text-xl leading-none">{value}</p>
      {sub && <p className="text-white/30 text-[10px] mt-1">{sub}</p>}
    </div>
  );
}

function ExpandableRow({ entry, defaultExpanded = false }) {
  const [open, setOpen] = useState(defaultExpanded);
  const hasBody = entry.body && Object.keys(entry.body).length > 0;
  const hasError = entry.error_msg;

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${statusBg(entry.status)}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.02] transition-colors"
      >
        {/* Method */}
        <span className={`text-[10px] font-black w-12 shrink-0 ${methodColor(entry.method)}`}>
          {entry.method}
        </span>

        {/* Status */}
        <span className={`text-[11px] font-black w-10 shrink-0 ${statusColor(entry.status)}`}>
          {entry.status}
        </span>

        {/* Duration */}
        <span className={`text-[10px] font-mono w-16 shrink-0 ${durationColor(entry.duration_ms)}`}>
          {entry.duration_ms}ms
        </span>

        {/* Path */}
        <span className="text-white/70 text-[11px] font-mono flex-1 truncate">{entry.path}</span>

        {/* User */}
        {entry.username && (
          <span className="text-[9px] text-white/30 shrink-0 hidden md:block">{entry.username}</span>
        )}

        {/* Time */}
        <span className="text-[9px] text-white/25 shrink-0">{relTime(entry.ts)}</span>

        {/* Expand */}
        <ChevronDown size={12} className={`text-white/20 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-0 space-y-2 border-t border-white/[0.05]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                <Detail label="IP"       value={entry.ip} />
                <Detail label="User ID"  value={entry.user_id || '—'} />
                <Detail label="Time"     value={entry.ts ? new Date(entry.ts).toLocaleTimeString('en-IN', { hour12: false }) : '—'} />
                <Detail label="UA"       value={(entry.ua || '—').slice(0, 60)} />
              </div>

              {hasError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 mt-2">
                  <p className="text-[9px] font-black text-red-400 uppercase tracking-wider mb-1">Error</p>
                  <p className="text-red-300 text-xs font-mono leading-relaxed">{entry.error_msg}</p>
                  {entry.error_stack && (
                    <pre className="text-red-400/60 text-[9px] font-mono mt-1.5 leading-relaxed whitespace-pre-wrap">{entry.error_stack}</pre>
                  )}
                </div>
              )}

              {hasBody && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-2.5 mt-2">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-wider mb-1">Request Body</p>
                  <pre className="text-white/60 text-[10px] font-mono leading-relaxed whitespace-pre-wrap overflow-auto max-h-32">
                    {JSON.stringify(entry.body, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[9px] text-white/25 font-black uppercase tracking-wider">{label}</p>
      <p className="text-white/60 text-[10px] font-mono truncate">{value}</p>
    </div>
  );
}

function SlowQueryRow({ q }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-lg overflow-hidden ${q.duration_ms >= 500 ? 'bg-red-500/5 border-red-500/15' : 'bg-orange-500/5 border-orange-500/15'}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <Database size={12} className={q.duration_ms >= 500 ? 'text-red-400 shrink-0' : 'text-orange-400 shrink-0'} />
        <span className={`text-[10px] font-black w-16 shrink-0 ${durationColor(q.duration_ms)}`}>{q.duration_ms}ms</span>
        <span className="text-[9px] font-bold text-violet-400/80 w-16 shrink-0">[{q.pool_name}]</span>
        <span className="text-white/60 text-[11px] font-mono flex-1 truncate">{q.sql}</span>
        <span className="text-[9px] text-white/25 shrink-0">{relTime(q.ts)}</span>
        <ChevronDown size={12} className={`text-white/20 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
            <div className="px-4 pb-3 pt-1 border-t border-white/[0.05]">
              <pre className="text-white/60 text-[10px] font-mono leading-relaxed whitespace-pre-wrap bg-white/[0.02] rounded-lg p-3">
                {q.sql}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'trace',        label: 'Live Trace',    icon: Activity },
  { key: 'errors',       label: 'Error Log',     icon: AlertTriangle },
  { key: 'slow_queries', label: 'Slow Queries',  icon: Database },
  { key: 'route_stats',  label: 'Route Stats',   icon: BarChart3 },
];

const METHOD_FILTERS = ['ALL', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const STATUS_FILTERS = [
  { label: 'All', min: null, max: null },
  { label: '2xx', min: 200, max: 299 },
  { label: '4xx', min: 400, max: 499 },
  { label: '5xx', min: 500, max: 599 },
];

export default function SyllaTracePage() {
  const [tab, setTab]           = useState('trace');
  const [health, setHealth]     = useState(null);
  const [trace, setTrace]       = useState([]);
  const [errors, setErrors]     = useState([]);
  const [processErrors, setProcessErrors] = useState([]);
  const [slowQ, setSlowQ]       = useState([]);
  const [routeStats, setRouteStats] = useState({ slowest: [], most_errored: [] });
  const [loading, setLoading]   = useState(false);
  const [liveErrors, setLiveErrors] = useState([]); // socket-pushed errors
  const [isLive, setIsLive]     = useState(false);

  // Filters
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS[0]);
  const [routeSearch,  setRouteSearch]  = useState('');

  const socketRef   = useRef(null);
  const liveErrorsRef = useRef([]);

  // ── Fetch functions ──────────────────────────────────────────────────────
  const fetchHealth = useCallback(async () => {
    try {
      const r = await adminAPI.debugHealth();
      setHealth(r.data);
    } catch (e) {
      toast.error('Health fetch failed: ' + (e.response?.data?.error || e.message));
    }
  }, []);

  const fetchTrace = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (methodFilter !== 'ALL') params.method = methodFilter;
      if (statusFilter.min) { params.status_min = statusFilter.min; params.status_max = statusFilter.max; }
      if (routeSearch) params.route = routeSearch;
      const r = await adminAPI.debugTrace(params);
      setTrace(r.data.entries || []);
    } catch (e) { toast.error('Trace fetch failed'); }
    finally { setLoading(false); }
  }, [methodFilter, statusFilter, routeSearch]);

  const fetchErrors = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminAPI.debugErrors();
      setErrors(r.data.errors || []);
      setProcessErrors(r.data.process_errors || []);
    } catch { toast.error('Error log fetch failed'); }
    finally { setLoading(false); }
  }, []);

  const fetchSlowQ = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminAPI.debugSlowQueries();
      setSlowQ(r.data.queries || []);
    } catch { toast.error('Slow query fetch failed'); }
    finally { setLoading(false); }
  }, []);

  const fetchRouteStats = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminAPI.debugRouteStats();
      setRouteStats(r.data);
    } catch { toast.error('Route stats fetch failed'); }
    finally { setLoading(false); }
  }, []);

  const handleClear = async () => {
    if (!confirm('Clear all trace buffers? This cannot be undone.')) return;
    try {
      await adminAPI.debugClear();
      setTrace([]); setErrors([]); setSlowQ([]); setLiveErrors([]);
      setHealth(prev => prev ? { ...prev, buffer_stats: { trace: 0, errors: 0, slow_queries: 0, process_errors: 0 } } : prev);
      toast.success('All trace buffers cleared');
    } catch { toast.error('Clear failed'); }
  };

  // ── Load on tab switch ───────────────────────────────────────────────────
  useEffect(() => { fetchHealth(); }, []);

  useEffect(() => {
    if (tab === 'trace')        fetchTrace();
    if (tab === 'errors')       fetchErrors();
    if (tab === 'slow_queries') fetchSlowQ();
    if (tab === 'route_stats')  fetchRouteStats();
  }, [tab]);

  // Re-fetch trace when filters change
  useEffect(() => { if (tab === 'trace') fetchTrace(); }, [methodFilter, statusFilter, routeSearch]);

  // Health auto-refresh every 15s
  useEffect(() => {
    const id = setInterval(fetchHealth, 15_000);
    return () => clearInterval(id);
  }, [fetchHealth]);

  // ── Socket: live error feed ──────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('syllabrix_token');
    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: { token },
    });
    socketRef.current = socket;

    socket.on('connect', ()    => setIsLive(true));
    socket.on('disconnect', () => setIsLive(false));

    socket.on('admin:trace_error', (entry) => {
      liveErrorsRef.current = [entry, ...liveErrorsRef.current].slice(0, 50);
      setLiveErrors([...liveErrorsRef.current]);

      if (entry.status >= 500) {
        toast.error(`500 on ${entry.method} ${entry.path}`, {
          description: entry.error_msg || 'Server error',
          duration: 8000,
        });
      }
    });

    return () => socket.disconnect();
  }, []);

  // ── Derived stats for vitals ──────────────────────────────────────────────
  const heapWarn = health?.memory?.heap_pct > 80;

  // ── Filtered trace for live errors badge ─────────────────────────────────
  const totalLive = liveErrors.length;

  return (
    <div className="space-y-5">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-600/20 border border-violet-500/30 flex items-center justify-center">
            <Terminal size={18} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">SyllaTrace</h2>
            <p className="text-white/30 text-[10px] uppercase font-black tracking-widest">IT Diagnostic Console</p>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${isLive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-white/30'}`}>
            {isLive ? <Wifi size={9} /> : <WifiOff size={9} />}
            {isLive ? 'Socket Live' : 'Socket Offline'}
          </div>
          {totalLive > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest animate-pulse">
              <Circle size={7} className="fill-red-400" />
              {totalLive} live error{totalLive > 1 ? 's' : ''}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchHealth();
              if (tab === 'trace')        fetchTrace();
              if (tab === 'errors')       fetchErrors();
              if (tab === 'slow_queries') fetchSlowQ();
              if (tab === 'route_stats')  fetchRouteStats();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/50 text-xs font-semibold hover:bg-white/[0.08] hover:text-white transition-all"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all"
          >
            <Trash2 size={13} />
            Clear Buffers
          </button>
        </div>
      </div>

      {/* ── System Vitals ── */}
      {health ? (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
          <VitalCard icon={Clock}     label="Uptime"      value={health.uptime_human}         sub={`PID ${health.pid}`}                  color="emerald" />
          <VitalCard icon={Cpu}       label="Heap Used"   value={`${health.memory.heap_used_mb} MB`}   sub={`${health.memory.heap_pct}% of ${health.memory.heap_total_mb} MB`} color="violet" warn={heapWarn} />
          <VitalCard icon={HardDrive} label="RSS Memory"  value={`${health.memory.rss_mb} MB`}  sub={`Node ${health.node_version}`}       color="blue" />
          <VitalCard icon={Activity}  label="Requests"    value={health.buffer_stats?.trace || 0}       sub="in trace buffer"                      color="violet" />
          <VitalCard icon={AlertTriangle} label="Errors"  value={health.buffer_stats?.errors || 0}      sub="4xx/5xx logged"                       color="amber" warn={(health.buffer_stats?.errors || 0) > 10} />
          <VitalCard icon={Database}  label="Slow Queries" value={health.buffer_stats?.slow_queries || 0} sub={`>${health.slow_threshold_ms}ms threshold`} color="amber" warn={(health.buffer_stats?.slow_queries || 0) > 5} />
        </div>
      ) : (
        <div className="h-20 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
          <Loader2 size={18} className="animate-spin text-violet-500 mr-2" />
          <span className="text-white/30 text-sm">Loading system health…</span>
        </div>
      )}

      {/* ── Live Error Feed (socket-pushed) ── */}
      <AnimatePresence>
        {liveErrors.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-xl border border-red-500/20 bg-red-500/5 overflow-hidden"
          >
            <div className="px-4 py-2.5 border-b border-red-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Circle size={8} className="fill-red-400 text-red-400 animate-pulse" />
                <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">Live Error Feed</span>
                <span className="text-red-400/50 text-[9px]">{liveErrors.length} events this session</span>
              </div>
              <button onClick={() => { setLiveErrors([]); liveErrorsRef.current = []; }} className="text-white/20 hover:text-white/50 text-[10px] transition-colors">clear</button>
            </div>
            <div className="max-h-40 overflow-y-auto p-2 space-y-1">
              {liveErrors.map((e, i) => (
                <div key={i} className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-[10px] ${statusBg(e.status)}`}>
                  <span className={`font-black w-8 shrink-0 ${statusColor(e.status)}`}>{e.status}</span>
                  <span className={`font-black w-12 shrink-0 ${methodColor(e.method)}`}>{e.method}</span>
                  <span className="text-white/60 font-mono flex-1 truncate">{e.path}</span>
                  {e.error_msg && <span className="text-white/40 truncate max-w-[200px]">{e.error_msg}</span>}
                  <span className="text-white/20 shrink-0">{relTime(e.ts)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.05] rounded-xl p-1">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold transition-all flex-1 justify-center ${
              tab === t.key
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
            }`}
          >
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

          {/* LIVE TRACE */}
          {tab === 'trace' && (
            <div className="space-y-3">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Method */}
                <div className="flex items-center gap-1">
                  {METHOD_FILTERS.map(m => (
                    <button
                      key={m}
                      onClick={() => setMethodFilter(m)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border transition-all ${
                        methodFilter === m
                          ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                          : 'bg-white/[0.03] text-white/30 border-white/[0.05] hover:text-white/60'
                      }`}
                    >{m}</button>
                  ))}
                </div>
                {/* Status */}
                <div className="flex items-center gap-1">
                  {STATUS_FILTERS.map(s => (
                    <button
                      key={s.label}
                      onClick={() => setStatusFilter(s)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border transition-all ${
                        statusFilter.label === s.label
                          ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                          : 'bg-white/[0.03] text-white/30 border-white/[0.05] hover:text-white/60'
                      }`}
                    >{s.label}</button>
                  ))}
                </div>
                {/* Route search */}
                <input
                  type="text"
                  placeholder="Filter route… e.g. /users"
                  value={routeSearch}
                  onChange={e => setRouteSearch(e.target.value)}
                  className="bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-1.5 text-[11px] text-white/70 placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all w-48"
                />
                <span className="text-white/20 text-[10px] ml-auto">{trace.length} entries</span>
              </div>

              {/* Table header */}
              <div className="flex items-center gap-3 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-white/20">
                <span className="w-12 shrink-0">Method</span>
                <span className="w-10 shrink-0">Status</span>
                <span className="w-16 shrink-0">Time</span>
                <span className="flex-1">Route</span>
                <span className="w-20 hidden md:block">User</span>
                <span className="w-16 text-right">When</span>
                <span className="w-4" />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12 gap-2 text-white/30 text-sm">
                  <Loader2 size={16} className="animate-spin" /> Loading trace…
                </div>
              ) : trace.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 opacity-25 text-center gap-2">
                  <Activity size={32} />
                  <p className="text-sm">No requests traced yet.</p>
                  <p className="text-xs">Make some API calls and they will appear here.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {trace.map(e => <ExpandableRow key={e.id} entry={e} />)}
                </div>
              )}
            </div>
          )}

          {/* ERROR LOG */}
          {tab === 'errors' && (
            <div className="space-y-4">
              {/* Process-level errors */}
              {processErrors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Process Errors (unhandled rejections / uncaught exceptions)</p>
                  {processErrors.map((e, i) => (
                    <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} className="text-red-400 shrink-0" />
                          <span className="text-red-400 text-[10px] font-black uppercase tracking-wider">{e.type}</span>
                        </div>
                        <span className="text-white/25 text-[9px]">{relTime(e.ts)}</span>
                      </div>
                      <p className="text-white/80 text-xs font-mono mb-2">{e.message}</p>
                      {e.stack && (
                        <pre className="text-white/40 text-[9px] font-mono leading-relaxed whitespace-pre-wrap bg-white/[0.02] rounded-lg p-2 max-h-40 overflow-auto">
                          {e.stack}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* HTTP Errors */}
              <div className="space-y-2">
                {errors.length > 0 && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">HTTP Errors (4xx / 5xx)</p>
                )}
                {loading ? (
                  <div className="flex items-center justify-center py-12 gap-2 text-white/30 text-sm">
                    <Loader2 size={16} className="animate-spin" /> Loading errors…
                  </div>
                ) : errors.length === 0 && processErrors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-25 text-center">
                    <CheckCircle size={36} />
                    <p className="text-sm font-bold">No errors logged</p>
                    <p className="text-xs">All systems operating normally.</p>
                  </div>
                ) : (
                  errors.map(e => <ExpandableRow key={e.id} entry={e} defaultExpanded={e.status >= 500} />)
                )}
              </div>
            </div>
          )}

          {/* SLOW QUERIES */}
          {tab === 'slow_queries' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-white/30">
                  Queries taking longer than <span className="text-orange-400 font-bold">150ms</span> are flagged here.
                </p>
                <span className="text-white/20 text-[10px]">{slowQ.length} entries</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12 gap-2 text-white/30 text-sm">
                  <Loader2 size={16} className="animate-spin" /> Loading queries…
                </div>
              ) : slowQ.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-25 text-center">
                  <Database size={36} />
                  <p className="text-sm font-bold">No slow queries</p>
                  <p className="text-xs">All database queries are within threshold.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {slowQ.map((q, i) => <SlowQueryRow key={i} q={q} />)}
                </div>
              )}
            </div>
          )}

          {/* ROUTE STATS */}
          {tab === 'route_stats' && (
            <div className="grid md:grid-cols-2 gap-5">
              {/* Slowest routes */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-3">Slowest Routes (avg)</p>
                {loading ? (
                  <div className="flex items-center gap-2 text-white/30 text-sm py-8">
                    <Loader2 size={14} className="animate-spin" /> Loading…
                  </div>
                ) : routeStats.slowest?.length === 0 ? (
                  <p className="text-white/20 text-sm py-8">No data yet. Make some API calls.</p>
                ) : (
                  <div className="space-y-1.5">
                    {routeStats.slowest?.map((r, i) => (
                      <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2.5 flex items-center gap-3">
                        <span className="text-white/20 font-black text-[10px] w-5 shrink-0">#{i + 1}</span>
                        <span className="text-white/60 text-[10px] font-mono flex-1 truncate">{r.route}</span>
                        <div className="text-right shrink-0">
                          <p className={`text-[11px] font-black ${durationColor(r.avg_ms)}`}>{r.avg_ms}ms avg</p>
                          <p className="text-white/20 text-[9px]">{r.count} calls · max {r.max_ms}ms</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Most errored routes */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-3">Most Errored Routes</p>
                {loading ? (
                  <div className="flex items-center gap-2 text-white/30 text-sm py-8">
                    <Loader2 size={14} className="animate-spin" /> Loading…
                  </div>
                ) : routeStats.most_errored?.length === 0 ? (
                  <div className="flex flex-col items-center py-8 gap-2 opacity-25 text-center">
                    <CheckCircle size={28} />
                    <p className="text-sm">No errored routes. Good.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {routeStats.most_errored?.map((r, i) => (
                      <div key={i} className="bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-2.5 flex items-center gap-3">
                        <span className="text-red-400/40 font-black text-[10px] w-5 shrink-0">#{i + 1}</span>
                        <span className="text-white/60 text-[10px] font-mono flex-1 truncate">{r.route}</span>
                        <div className="text-right shrink-0">
                          <p className="text-[11px] font-black text-red-400">{r.errors} errors</p>
                          <p className="text-white/20 text-[9px]">{r.count} total calls</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
