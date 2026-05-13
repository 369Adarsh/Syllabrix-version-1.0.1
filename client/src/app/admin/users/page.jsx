'use client';
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/lib/api/admin.api';
import UserActivityPanel from '@/components/admin/UserActivityPanel';
import { Search, Ban, CheckCircle, ShieldCheck, ChevronLeft, ChevronRight, Activity, MailCheck, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const USER_TYPES = ['all', 'student', 'teacher', 'institute', 'parent', 'professional_learner', 'organization', 'hr_professional'];
const STATUS_OPTIONS = ['all', 'active', 'banned'];

const TYPE_COLORS = {
  student:              'bg-blue-100 text-blue-700 border-blue-200',
  teacher:              'bg-emerald-100 text-emerald-700 border-emerald-200',
  institute:            'bg-amber-100 text-amber-700 border-amber-200',
  parent:               'bg-pink-100 text-pink-700 border-pink-200',
  professional_learner: 'bg-violet-100 text-violet-700 border-violet-200',
  organization:         'bg-cyan-100 text-cyan-700 border-cyan-200',
  hr_professional:      'bg-teal-100 text-teal-700 border-teal-200',
  syllabrix_admin:      'bg-rose-100 text-rose-700 border-rose-200',
};

const formatUserId = (u) => {
  if (u?.syllabrix_id) return u.syllabrix_id;
  if (!u || !u.id) return 'UNKNOWN';
  const pMap = { professional_learner: 'P', student: 'S', teacher: 'T', institute: 'I', organization: 'O', parent: 'PA', hr_professional: 'H', syllabrix_admin: 'SA' };
  const prefix = pMap[u.user_type] || 'U';
  const rawId = String(u.id);
  const core = rawId.match(/^\d+$/) ? rawId.padStart(10, '0') : rawId.replace(/-/g, '').substring(0, 10).toUpperCase();
  return `${prefix}-${core}`;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userType, setUserType] = useState('all');
  const [status, setStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (userType !== 'all') params.user_type = userType;
      if (status !== 'all') params.status = status;
      const res = await adminAPI.getUsers(params);
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, userType, status]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchUsers(); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleVerifyEmail = async (userId, username) => {
    setActionLoading(`verify-${userId}`);
    try {
      await adminAPI.verifyUserEmail(userId);
      toast.success(`@${username} email verified and account activated.`);
      fetchUsers();
    } catch (e) {
      toast.error('Verification failed: ' + (e.response?.data?.error || e.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (userId, currentActive, username) => {
    const newStatus = currentActive ? 'banned' : 'active';
    const reason = currentActive ? prompt(`Reason for banning @${username}:`) : 'Account reinstated by admin';
    if (currentActive && !reason) return;
    setActionLoading(userId);
    try {
      await adminAPI.setUserStatus(userId, newStatus, reason);
      toast.success(`@${username} has been ${newStatus === 'banned' ? 'banned' : 'reinstated'}.`);
      fetchUsers();
    } catch (e) {
      toast.error('Action failed: ' + (e.response?.data?.error || e.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    setActionLoading(`delete-${userId}`);
    try {
      await adminAPI.deleteUser(userId);
      toast.success(`@${username} has been permanently deleted.`);
      setDeleteConfirmId(null);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setTotal(prev => prev - 1);
    } catch (e) {
      toast.error('Delete failed: ' + (e.response?.data?.error || e.message));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or username…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
          />
        </div>
        <select
          value={userType}
          onChange={e => { setUserType(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm focus:outline-none focus:border-indigo-400 appearance-none cursor-pointer shadow-sm"
        >
          {USER_TYPES.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t.replace(/_/g, ' ')}</option>)}
        </select>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm focus:outline-none focus:border-indigo-400 appearance-none cursor-pointer shadow-sm"
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>)}
        </select>
      </div>

      <p className="text-gray-400 text-xs font-medium">{total.toLocaleString()} users found</p>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 animate-pulse h-24 shadow-sm" />
          ))
        ) : users.map(u => (
          <div key={u.id} className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3 min-w-0 group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {u.full_name?.[0] || u.username?.[0] || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-gray-800 font-semibold text-sm truncate group-hover:text-indigo-600 transition-colors">{u.full_name || u.username}</p>
                  <p className="text-gray-400 text-xs">@{u.username}</p>
                </div>
              </Link>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shrink-0 border ${u.is_active ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                {u.is_active ? 'Active' : 'Banned'}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${TYPE_COLORS[u.user_type] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                {u.user_type?.replace(/_/g, ' ')}
              </span>
              {u.email_verified_at
                ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600"><MailCheck size={10} /> Verified</span>
                : <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">Unverified</span>
              }
              {u.report_count > 0 && (
                <span className="text-red-700 font-bold text-[10px] bg-red-100 px-2 py-0.5 rounded-full border border-red-200">{u.report_count} reports</span>
              )}
            </div>
            <p className="text-gray-400 text-xs truncate">{u.email}</p>
            <div className="flex items-center gap-2 pt-1">
              <button onClick={() => { setSelectedUser(u); setIsPanelOpen(true); }}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-all">
                <Activity size={13} /> Activity
              </button>
              {!u.email_verified_at && (
                <button onClick={() => handleVerifyEmail(u.id, u.username)} disabled={actionLoading === `verify-${u.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 disabled:opacity-50 transition-all">
                  <ShieldCheck size={13} /> Verify
                </button>
              )}
              <button onClick={() => handleStatusChange(u.id, u.is_active, u.username)} disabled={actionLoading === u.id}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl transition-all disabled:opacity-50 border ${u.is_active ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'}`}>
                {u.is_active ? <><Ban size={13} /> Ban</> : <><CheckCircle size={13} /> Reinstate</>}
              </button>
            </div>
            {deleteConfirmId === u.id ? (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-red-700 font-semibold flex-1">Permanently delete @{u.username}?</span>
                <button onClick={() => handleDeleteUser(u.id, u.username)} disabled={actionLoading === `delete-${u.id}`}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-all">
                  {actionLoading === `delete-${u.id}` ? 'Deleting…' : 'Confirm'}
                </button>
                <button onClick={() => setDeleteConfirmId(null)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 transition-all">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setDeleteConfirmId(u.id)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-all mt-1">
                <Trash2 size={13} /> Delete User
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['ID', 'User', 'Type', 'Email', 'Verified', 'Reports', 'Last Seen', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-gray-400 text-xs font-semibold uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded-lg animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-4 py-3">
                    <span className="text-gray-400 font-mono text-[10px] tracking-wider bg-gray-100 py-1.5 px-2 rounded-md border border-gray-200">{formatUserId(u)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.full_name?.[0] || u.username?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-gray-800 font-semibold leading-tight group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                          {u.full_name || u.username}
                          <ExternalLink size={10} className="opacity-0 group-hover:opacity-60 transition-opacity text-indigo-400" />
                        </p>
                        <p className="text-gray-400 text-xs">@{u.username}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border uppercase tracking-wide ${TYPE_COLORS[u.user_type] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                      {u.user_type?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.email_verified_at
                      ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600"><MailCheck size={11} /> Verified</span>
                      : <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full border border-amber-200">Unverified</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    {u.report_count > 0
                      ? <span className="text-red-700 font-bold text-xs bg-red-100 px-2 py-1 rounded-lg border border-red-200">{u.report_count} reports</span>
                      : <span className="text-gray-300 text-xs">Clean</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {u.last_seen ? new Date(u.last_seen).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border ${u.is_active ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                      {u.is_active ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {deleteConfirmId === u.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-700 font-semibold whitespace-nowrap">Delete forever?</span>
                        <button onClick={() => handleDeleteUser(u.id, u.username)} disabled={actionLoading === `delete-${u.id}`}
                          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-all whitespace-nowrap">
                          {actionLoading === `delete-${u.id}` ? 'Deleting…' : 'Yes, Delete'}
                        </button>
                        <button onClick={() => setDeleteConfirmId(null)}
                          className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 transition-all">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelectedUser(u); setIsPanelOpen(true); }}
                          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200">
                          <Activity size={12} /> Activity
                        </button>
                        {!u.email_verified_at && (
                          <button onClick={() => handleVerifyEmail(u.id, u.username)} disabled={actionLoading === `verify-${u.id}`}
                            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 disabled:opacity-50">
                            <ShieldCheck size={12} /> Verify
                          </button>
                        )}
                        <button onClick={() => handleStatusChange(u.id, u.is_active, u.username)} disabled={actionLoading === u.id}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50 border ${u.is_active ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'}`}>
                          {u.is_active ? <><Ban size={12} /> Ban</> : <><CheckCircle size={12} /> Reinstate</>}
                        </button>
                        <button onClick={() => setDeleteConfirmId(u.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-all">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UserActivityPanel user={selectedUser} isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-xs">Page {page} of {totalPages} · {total.toLocaleString()} users</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 transition-all shadow-sm">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 transition-all shadow-sm">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
