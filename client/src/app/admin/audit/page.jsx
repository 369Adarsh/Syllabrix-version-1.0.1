'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Shield, Clock, Target, Search, Filter,
  ChevronLeft, ChevronRight, RefreshCw,
  FileText, AlertTriangle, CheckCircle, Terminal,
  Database, UserX, UserCheck, MailCheck, X,
} from 'lucide-react';
import { adminAPI } from '@/lib/api/admin.api';
import { toast } from 'sonner';

const ACTION_CONFIG = {
  user_ban:              { label: 'User Banned',      color: 'bg-red-100 text-red-700 border-red-200',         icon: UserX },
  user_unban:            { label: 'User Unbanned',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: UserCheck },
  report_dismissed:      { label: 'Report Dismissed', color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: CheckCircle },
  report_action_taken:   { label: 'Action Taken',     color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertTriangle },
  report_resolved:       { label: 'Report Resolved',  color: 'bg-teal-100 text-teal-700 border-teal-200',       icon: CheckCircle },
  manual_email_verify:   { label: 'Email Verified',   color: 'bg-cyan-100 text-cyan-700 border-cyan-200',       icon: MailCheck },
  database_edit:         { label: 'DB Record Edited', color: 'bg-violet-100 text-violet-700 border-violet-200', icon: Database },
  raw_sql_execution:     { label: 'Raw SQL Executed', color: 'bg-rose-100 text-rose-700 border-rose-200',       icon: Terminal },
  ticket_replied:        { label: 'Ticket Reply',     color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: FileText },
  ticket_status_updated: { label: 'Ticket Updated',   color: 'bg-purple-100 text-purple-700 border-purple-200', icon: FileText },
};

const DEFAULT_ACTION = { label: null, color: 'bg-gray-100 text-gray-500 border-gray-200', icon: Shield };

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

function timeAgo(dateString) {
  if (!dateString) return '—';
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
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
  if (typeof newValue === 'object') {
    if (newValue.reason) return newValue.reason;
    if (newValue.note) return newValue.note;
    if (newValue.sql) return newValue.sql.slice(0, 120) + (newValue.sql.length > 120 ? '…' : '');
    if (newValue.raw) return newValue.raw;
    const keys = Object.keys(newValue);
    if (keys.length > 0) return `${keys[0]}: ${String(newValue[keys[0]]).slice(0, 80)}`;
  }
  return String(newValue).slice(0, 100);
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 30 };
      if (search) params.search = search;
      if (actionFilter) params.action_type = actionFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await adminAPI.getAuditLogs(params);
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
      setPage(p);
    } catch (e) {
      toast.error('Failed to load audit logs: ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, dateFrom, dateTo]);

  useEffect(() => { fetchLogs(1); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchLogs(1); };
  const clearFilters = () => { setSearch(''); setActionFilter(''); setDateFrom(''); setDateTo(''); };
  const hasActiveFilters = search || actionFilter || dateFrom || dateTo;

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-indigo-200 bg-indigo-50">
        <Shield size={15} className="text-indigo-600 shrink-0" />
        <div>
          <p className="text-indigo-700 text-xs font-bold">All administrative actions are permanently recorded and cannot be deleted.</p>
          <p className="text-indigo-400 text-[10px] mt-0.5">This trail is your platform's legal accountability record.</p>
        </div>
        <div className="ml-auto flex items-center gap-3 shrink-0">
          <span className="text-gray-400 text-[10px] font-mono">{total.toLocaleString()} entries</span>
          <button
            onClick={() => fetchLogs(page)}
            className="p-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-400 hover:text-indigo-600 transition-all"
            title="Refresh"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by admin name or username…"
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
            />
          </div>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:border-indigo-400 appearance-none cursor-pointer shadow-sm"
          >
            {ACTION_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            type="button"
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all shadow-sm ${
              showFilters || dateFrom || dateTo
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700'
            }`}
          >
            <Filter size={13} /> Dates
          </button>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 border border-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm"
          >
            Apply
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => { clearFilters(); setTimeout(() => fetchLogs(1), 0); }}
              className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all"
              title="Clear all filters"
            >
              <X size={13} />
            </button>
          )}
        </form>

        {showFilters && (
          <div className="flex items-center gap-3 px-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">From</span>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-400 transition-all" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">To</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-400 transition-all" />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Admin', 'Action', 'Target', 'Detail', 'Time'].map(h => (
                  <th key={h} className="text-left text-gray-400 text-[10px] font-black uppercase tracking-widest px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5].map(j => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 bg-gray-100 rounded-lg animate-pulse" style={{ width: `${60 + j * 10}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-300">
                      <FileText size={32} />
                      <p className="text-sm font-bold text-gray-400">No audit logs found</p>
                      {hasActiveFilters && <p className="text-xs text-gray-400">Try adjusting your filters</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map(log => {
                  const cfg = ACTION_CONFIG[log.action_type] || DEFAULT_ACTION;
                  const Icon = cfg.icon;
                  const label = cfg.label || log.action_type?.replace(/_/g, ' ') || '—';
                  const detail = extractDetail(log.new_value);

                  return (
                    <tr key={log.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                            {(log.admin_full_name || log.admin_name || 'S')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-gray-700 font-medium text-xs leading-tight">
                              {log.admin_full_name || log.admin_name || 'System'}
                            </p>
                            {log.admin_name && log.admin_full_name && (
                              <p className="text-gray-400 text-[10px]">@{log.admin_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider whitespace-nowrap ${cfg.color}`}>
                          <Icon size={10} /> {label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <Target size={11} className="text-gray-300 shrink-0" />
                          <span className="font-medium">{log.target_type}</span>
                          <span className="text-gray-300 font-mono text-[10px]">#{log.target_id}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 max-w-[220px]">
                        {detail ? (
                          <p className="text-gray-400 text-xs truncate" title={detail}>{detail}</p>
                        ) : (
                          <span className="text-gray-200 text-xs italic">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs whitespace-nowrap" title={fullDate(log.created_at)}>
                          <Clock size={11} className="shrink-0" />
                          {timeAgo(log.created_at)}
                        </div>
                        <p className="text-gray-300 text-[9px] mt-0.5 hidden group-hover:block">
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

        {!loading && totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <p className="text-gray-400 text-xs">
              Page <span className="text-gray-700 font-bold">{page}</span> of <span className="text-gray-700 font-bold">{totalPages}</span>
              <span className="ml-2">· {total.toLocaleString()} total entries</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fetchLogs(page - 1)} disabled={page <= 1 || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 text-xs font-bold hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={13} /> Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button key={p} onClick={() => fetchLogs(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                      p === page
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-300'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => fetchLogs(page + 1)} disabled={page >= totalPages || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 text-xs font-bold hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 transition-all"
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
