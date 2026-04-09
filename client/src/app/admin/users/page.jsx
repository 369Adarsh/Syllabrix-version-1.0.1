'use client';
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/lib/api/admin.api';
import UserActivityPanel from '@/components/admin/UserActivityPanel';
import { Search, Filter, Ban, CheckCircle, Eye, UserCheck, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { toast } from 'sonner';

const USER_TYPES = ['all', 'student', 'teacher', 'institute', 'parent', 'professional_learner', 'organization'];
const STATUS_OPTIONS = ['all', 'active', 'banned'];

const TYPE_COLORS = {
  student: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  teacher: 'bg-green-500/15 text-green-400 border-green-500/20',
  institute: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  parent: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  professional_learner: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  organization: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  syllabrix_admin: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
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
      const msg = e.response?.data?.error || 'Failed to load user intelligence';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, search, userType, status]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

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

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or username…"
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white/80 text-sm placeholder-white/25 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all"
          />
        </div>
        <select
          value={userType}
          onChange={e => { setUserType(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white/70 text-sm focus:outline-none focus:border-violet-500/50 appearance-none cursor-pointer"
        >
          {USER_TYPES.map(t => <option key={t} value={t} className="bg-[#1a1a2e]">{t === 'all' ? 'All Types' : t.replace('_', ' ')}</option>)}
        </select>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white/70 text-sm focus:outline-none focus:border-violet-500/50 appearance-none cursor-pointer"
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-[#1a1a2e]">{s === 'all' ? 'All Status' : s}</option>)}
        </select>
      </div>

      {/* Count */}
      <p className="text-white/30 text-xs font-medium">{total.toLocaleString()} users found</p>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['User', 'Type', 'Email', 'Reports', 'Last Seen', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left text-white/30 text-xs font-semibold uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-white/[0.05] rounded-lg animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-white/[0.025] transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/40 to-purple-500/40 flex items-center justify-center text-white/80 text-xs font-bold shrink-0">
                      {u.full_name?.[0] || u.username?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-white/85 font-semibold leading-tight">{u.full_name || u.username}</p>
                      <p className="text-white/30 text-xs">@{u.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border uppercase tracking-wide ${TYPE_COLORS[u.user_type] || 'bg-white/10 text-white/40 border-white/10'}`}>
                    {u.user_type?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/50 text-xs">{u.email}</td>
                <td className="px-4 py-3">
                  {u.report_count > 0 ? (
                    <span className="text-red-400 font-bold text-xs bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20">{u.report_count} reports</span>
                  ) : (
                    <span className="text-white/20 text-xs">Clean</span>
                  )}
                </td>
                <td className="px-4 py-3 text-white/30 text-xs">
                  {u.last_seen ? new Date(u.last_seen).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Never'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${u.is_active ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>
                    {u.is_active ? 'Active' : 'Banned'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setSelectedUser(u); setIsPanelOpen(true); }}
                      title="Show Activity"
                      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white/[0.05] text-white/50 hover:bg-white/[0.1] border border-white/[0.08]"
                    >
                      <Activity size={12} />
                      Activity
                    </button>
                    <button
                      onClick={() => handleStatusChange(u.id, u.is_active, u.username)}
                      disabled={actionLoading === u.id}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all ${
                        u.is_active
                          ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/25'
                          : 'bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/25'
                      } disabled:opacity-50`}
                    >
                      {u.is_active ? <Ban size={12} /> : <CheckCircle size={12} />}
                      {u.is_active ? 'Ban' : 'Reinstate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Activity Panel */}
        <UserActivityPanel 
          user={selectedUser}
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
        />

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
          <p className="text-white/30 text-xs">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 disabled:opacity-30 transition-all">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 disabled:opacity-30 transition-all">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
