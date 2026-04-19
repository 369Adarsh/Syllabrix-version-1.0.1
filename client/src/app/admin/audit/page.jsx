'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Shield, Clock, Target, Search, Filter,
  ChevronLeft, ChevronRight, RefreshCw, Loader2,
  FileText, AlertTriangle, CheckCircle, Terminal,
  Database, UserX, UserCheck, MailCheck, X,
} from 'lucide-react';
import { adminAPI } from '@/lib/api/admin.api';
import { toast } from 'sonner';

// ── Action type config ────────────────────────────────────────────────────────
const ACTION_CONFIG = {
  user_ban:              { label: 'User Banned',          color: 'bg-red-500/15 text-red-400 border-red-500/25',       icon: UserX },
  user_unban:            { label: 'User Unbanned',        color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', icon: UserCheck },
  report_dismissed:      { label: 'Report Dismissed',     color: 'bg-blue-500/15 text-blue-400 border-blue-500/25',    icon: CheckCircle },
  report_action_taken:   { label: 'Action Taken',         color: 'bg-orange-500/15 text-orange-400 border-orange-500/25', icon: AlertTriangle },
  report_resolved:       { label: 'Report Resolved',      color: 'bg-teal-500/15 text-teal-400 border-teal-500/25',    icon: CheckCircle },
  manual_email_verify:   { label: 'Email Verified',       color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',    icon: MailCheck },
  database_edit:         { label: 'DB Record Edited',     color: 'bg-violet-500/15 text-violet-400 border-violet-500/25', icon: Database },
  raw_sql_execution:     { label: 'Raw SQL Executed',     color: 'bg-rose-500/15 text-rose-400 border-rose-500/25',    icon: Terminal },
  ticket_replied:        { label: 'Ticket Reply',         color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25', icon: FileText },
  ticket_status_updated: { label: 'Ticket Updated',       color: 'bg-purple-500/15 text-purple-400 border-purple-500/25', icon: FileText },
};

const DEFAULT_ACTION = { label: null, color: 'bg-white/10 text-white/40 border-white/10', icon: Shield };

const ACTION_TYPE_OPTIONS = [
  { value: '',                    label: 'All Actions' },
  { value: 'user_ban',            label: 'User Banned' },
  { value: 'user_unban',          label: 'User Unbanned' },
  { value: 'report_dismissed',    label: 'Report Dismissed' },
  { value: 'report_action_taken', label: 'Action Taken' },
  { value: 'report_resolved',     label: 'Report Resolved' },
  { value: 'manual_email_verify', label: 'Email Verified' },
  { value: 'database_edit',       label: 'DB Edit' },
  { value: 'raw_sql_execution',   label: 'Raw SQL' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateString) {
  if (!dateString) return '—';
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fullDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function extractDetail(newValue) {
  if (!newValue) return null;
  // newValue is already safely parsed by the backend
  if (typeof newValue === 'object') {
    if (newValue.reason) return newValue.reason;
    if (newValue.note)   return newValue.note;
    if (newValue.sql)    return newValue.sql.slice(0, 120) + (newValue.sql.length > 120 ? '…' : '');
    if (newValue.raw)    return newValue.raw;
    const keys = Object.keys(newValue);
    if (keys.length > 0) return `${keys[0]}: ${String(newValue[keys[0]]).slice(0, 80)}`;
  }
  return String(newValue).slice(0, 100);
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminAuditPage() {
  const [logs, setLogs]           = useState([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);

  // Filters
  const [search, setSearch]           = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 30 };
      if (search)       params.search      = search;
      if (actionFilter) params.action_type = actionFilter;
      if (dateFrom)     params.date_from   = dateFrom;
      if (dateTo)       params.date_to     = dateTo;

      const res = await adminAPI.getAuditLogs(params);
      const data = res.data;

      setLogs(data.logs        || []);
      setTotal(data.total      || 0);
      setTotalPages(data.totalPages || 1);
      setPage(p);
    } catch (e) {
      toast.error('Failed to load audit logs: ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, dateFrom, dateTo]);

  useEffect(() => { fetchLogs(1); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchLogs(1); };

  const clearFilters = () => {
    setSearch(''); setActionFilter(''); setDateFrom(''); setDateTo('');
    // fetchLogs will re-run once state settles via the applyFilters button
  };

  const hasActiveFilters = search || actionFilter || dateFrom || dateTo;

  return (
    <div className="space-y-5">
      {/* ── Info banner ── */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-violet-500/20 bg-violet-500/[0.05]">
        <Shield size={15} className="text-violet-400 shrink-0" />
        <div>
          <p className="text-violet-300 text-xs font-bold">All administrative actions are permanently recorded and cannot be deleted.</p>
          <p className="text-violet-400/50 text-[10px] mt-0.5">This trail is your platform's legal accountability record.</p>
        </div>
        <div className="ml-auto flex items-center gap-3 shrink-0">
          <span className="text-white/25 text-[10px] font-mono">{total.toLocaleString()} entries</span>
          <button
            onClick={() => fetchLogs(page)}
            className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/40 hover:text-violet-400 hover:border-violet-500/30 transition-all"
            title="Refresh"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by admin name or username…"
              className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.07] rounded-xl text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>

          {/* Action type filter */}
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-white/60 focus:outline-none focus:border-violet-500/50 transition-all appearance-none cursor-pointer"
          >
            {ACTION_TYPE_OPTIONS.map(o => (
              <option key={o.value} value={o.value} className="bg-[#1a1a2e]">{o.label}</option>
            ))}
          </select>

          {/* Date filter toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              showFilters || dateFrom || dateTo
                ? 'bg-violet-500/20 border-violet-500/30 text-violet-300'
                : 'bg-white/[0.04] border-white/[0.07] text-white/40 hover:text-white/70'
            }`}
          >
            <Filter size={13} />
            Dates
          </button>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm font-bold hover:bg-violet-500/30 transition-all"
          >
            Apply
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => { clearFilters(); setTimeout(() => fetchLogs(1), 0); }}
              className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
              title="Clear all filters"
            >
              <X size={13} />
            </button>
          )}
        </form>

        {/* Date range row */}
        {showFilters && (
          <div className="flex items-center gap-3 px-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/25">From</span>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 text-sm text-white/60 focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/25">To</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 text-sm text-white/60 focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] bg-white/[0.01]">
                {['Admin', 'Action', 'Target', 'Detail', 'Time'].map(h => (
                  <th key={h} className="text-left text-white/30 text-[10px] font-black uppercase tracking-widest px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5].map(j => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 bg-white/[0.04] rounded-lg animate-pulse" style={{ width: `${60 + j * 10}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-25">
                      <FileText size={32} />
                      <p className="text-sm font-bold">No audit logs found</p>
                      {hasActiveFilters && <p className="text-xs">Try adjusting your filters</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map(log => {
                  const cfg    = ACTION_CONFIG[log.action_type] || DEFAULT_ACTION;
                  const Icon   = cfg.icon;
                  const label  = cfg.label || log.action_type?.replace(/_/g, ' ') || '—';
                  const detail = extractDetail(log.new_value);

                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Admin */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/40 to-purple-600/30 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                            {(log.admin_full_name || log.admin_name || 'S')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white/75 font-medium text-xs leading-tight">
                              {log.admin_full_name || log.admin_name || 'System'}
                            </p>
                            {log.admin_name && log.admin_full_name && (
                              <p className="text-white/30 text-[10px]">@{log.admin_name}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Action badge */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider whitespace-nowrap ${cfg.color}`}>
                          <Icon size={10} />
                          {label}
                        </span>
                      </td>

                      {/* Target */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-white/45 text-xs">
                          <Target size={11} className="text-white/20 shrink-0" />
                          <span className="font-medium">{log.target_type}</span>
                          <span className="text-white/25 font-mono text-[10px]">#{log.target_id}</span>
                        </div>
                      </td>

                      {/* Detail */}
                      <td className="px-5 py-3.5 max-w-[220px]">
                        {detail ? (
                          <p className="text-white/40 text-xs truncate" title={detail}>{detail}</p>
                        ) : (
                          <span className="text-white/15 text-xs italic">—</span>
                        )}
                      </td>

                      {/* Time */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-white/30 text-xs whitespace-nowrap" title={fullDate(log.created_at)}>
                          <Clock size={11} className="shrink-0" />
                          {timeAgo(log.created_at)}
                        </div>
                        <p className="text-white/15 text-[9px] mt-0.5 hidden group-hover:block">
                          {fullDate(log.created_at)}
                        </p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
            <p className="text-white/25 text-xs">
              Page <span className="text-white/50 font-bold">{page}</span> of <span className="text-white/50 font-bold">{totalPages}</span>
              <span className="ml-2">· {total.toLocaleString()} total entries</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fetchLogs(page - 1)}
                disabled={page <= 1 || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/40 text-xs font-bold hover:bg-white/[0.07] hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={13} /> Prev
              </button>

              {/* Page number buttons */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => fetchLogs(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      p === page
                        ? 'bg-violet-500/25 border border-violet-500/40 text-violet-300'
                        : 'bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-white/60 hover:bg-white/[0.06]'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => fetchLogs(page + 1)}
                disabled={page >= totalPages || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/40 text-xs font-bold hover:bg-white/[0.07] hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
