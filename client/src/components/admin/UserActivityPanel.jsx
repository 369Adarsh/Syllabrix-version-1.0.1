'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Clock, MessageSquare, Heart, UserPlus, LogIn,
  ShieldAlert, FileText, Loader2, Calendar, Smartphone,
  Activity, ChevronDown, MailCheck, Ban, CheckCircle,
  Filter, RefreshCw, Download
} from 'lucide-react';
import { adminAPI } from '@/lib/api/admin.api';
import { toast } from 'sonner';

const EVENT_CONFIG = {
  post_created:      { icon: FileText,    color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/20',    label: 'Post Created' },
  comment_created:   { icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', label: 'Comment Posted' },
  reaction_like:     { icon: Heart,       color: 'text-rose-400',    bg: 'bg-rose-400/10',    border: 'border-rose-400/20',    label: 'Reacted' },
  followed_user:     { icon: UserPlus,    color: 'text-violet-400',  bg: 'bg-violet-400/10',  border: 'border-violet-400/20',  label: 'Followed User' },
  session_started:   { icon: LogIn,       color: 'text-cyan-400',    bg: 'bg-cyan-400/10',    border: 'border-cyan-400/20',    label: 'Session Started' },
  report_filed:      { icon: ShieldAlert, color: 'text-orange-400',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20',  label: 'Report Filed' },
  default:           { icon: Clock,       color: 'text-gray-400',    bg: 'bg-gray-400/10',    border: 'border-gray-400/20',    label: 'Event' },
};

const FILTER_TABS = [
  { key: null,       label: 'All Activity' },
  { key: 'posts',    label: 'Posts & Comments' },
  { key: 'social',   label: 'Social' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'reports',  label: 'Reports' },
];

const TYPE_COLORS = {
  student: 'bg-blue-500/15 text-blue-400',
  teacher: 'bg-green-500/15 text-green-400',
  institute: 'bg-yellow-500/15 text-yellow-400',
  parent: 'bg-pink-500/15 text-pink-400',
  professional_learner: 'bg-violet-500/15 text-violet-400',
  organization: 'bg-cyan-500/15 text-cyan-400',
  syllabrix_admin: 'bg-rose-500/15 text-rose-400',
};

function formatTs(date) {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

function getEventConfig(actionType) {
  if (!actionType) return EVENT_CONFIG.default;
  if (actionType.startsWith('reaction_')) return EVENT_CONFIG.reaction_like;
  return EVENT_CONFIG[actionType] || EVENT_CONFIG.default;
}

export default function UserActivityPanel({ user, isOpen, onClose }) {
  const [activities, setActivities] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeGroup, setActiveGroup] = useState(null);

  const resetAndFetch = useCallback(async (p = 1, append = false) => {
    if (!user?.id) return;
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params = { page: p, limit: 30 };
      if (startDate && endDate) { params.startDate = startDate; params.endDate = endDate; }
      if (activeGroup) params.actionGroup = activeGroup;
      const res = await adminAPI.getUserActivity(user.id, params);
      const data = res.data;
      setActivities(prev => append ? [...prev, ...(data.activities || [])] : (data.activities || []));
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setPage(p);
    } catch (e) {
      toast.error('Failed to load activity: ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user?.id, startDate, endDate, activeGroup]);

  useEffect(() => {
    if (isOpen && user?.id) {
      setActivities([]);
      setPage(1);
      resetAndFetch(1);
    }
  }, [isOpen, user?.id, startDate, endDate, activeGroup]);

  const handleLoadMore = () => resetAndFetch(page + 1, true);

  const clearDates = () => { setStartDate(''); setEndDate(''); };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(activities, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_${user?.syllabrix_id || user?.id}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-[#08080f] border-l border-white/[0.08] shadow-2xl z-[70] flex flex-col"
          >
            {/* ── User Profile Header ── */}
            <div className="p-5 border-b border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/40 to-purple-600/40 flex items-center justify-center text-white text-xl font-bold shrink-0 border border-white/10">
                    {user?.full_name?.[0] || user?.username?.[0] || '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-white font-bold text-lg leading-tight">{user?.full_name || user?.username}</h2>
                      {user?.syllabrix_id && (
                        <span className="font-mono text-[10px] text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md">
                          {user.syllabrix_id}
                        </span>
                      )}
                    </div>
                    <p className="text-white/40 text-xs mt-0.5">@{user?.username}</p>
                    <p className="text-white/30 text-xs mt-0.5">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${TYPE_COLORS[user?.user_type] || 'bg-white/10 text-white/40'}`}>
                        {user?.user_type?.replace('_', ' ')}
                      </span>
                      {user?.email_verified_at ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          <MailCheck size={9} /> Email Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                          Unverified
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${user?.is_active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                        {user?.is_active ? 'Active' : 'Banned'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleExport}
                    title="Export activity as JSON"
                    className="p-2 rounded-xl bg-white/[0.05] text-white/40 hover:text-white/80 hover:bg-white/[0.08] border border-white/[0.06] transition-all"
                  >
                    <Download size={15} />
                  </button>
                  <button
                    onClick={() => resetAndFetch(1)}
                    title="Refresh"
                    className="p-2 rounded-xl bg-white/[0.05] text-white/40 hover:text-white/80 hover:bg-white/[0.08] border border-white/[0.06] transition-all"
                  >
                    <RefreshCw size={15} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl bg-white/[0.05] text-white/40 hover:text-white hover:bg-white/[0.1] border border-white/[0.06] transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Joined */}
              <p className="text-white/20 text-[10px] mt-3">
                Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                {user?.last_seen && ` · Last seen ${new Date(user.last_seen).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                {user?.report_count > 0 && ` · ${user.report_count} report${user.report_count > 1 ? 's' : ''} against account`}
              </p>
            </div>

            {/* ── Stats Bar ── */}
            <div className="px-5 py-3 border-b border-white/[0.06] bg-white/[0.01]">
              <div className="flex items-center gap-1">
                <Activity size={12} className="text-violet-400 shrink-0" />
                <span className="text-white/50 text-xs">
                  <span className="text-white font-bold">{total.toLocaleString()}</span> total events
                  {(startDate || endDate) && <span className="text-white/30"> · filtered by date</span>}
                </span>
              </div>
            </div>

            {/* ── Filters ── */}
            <div className="px-5 py-3 border-b border-white/[0.06] space-y-3">
              {/* Category tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {FILTER_TABS.map(tab => (
                  <button
                    key={String(tab.key)}
                    onClick={() => setActiveGroup(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all border ${
                      activeGroup === tab.key
                        ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                        : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:text-white/60 hover:bg-white/[0.06]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Date range */}
              <div className="flex items-center gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-white/20 ml-1 tracking-wider">From</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:border-violet-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-white/20 ml-1 tracking-wider">To</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:border-violet-500/50 transition-all"
                    />
                  </div>
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={clearDates}
                    className="mt-5 p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/15"
                    title="Clear dates"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* ── Timeline ── */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3">
                  <Loader2 className="animate-spin text-violet-500" size={28} />
                  <p className="text-white/20 text-sm">Loading activity trace...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-25 text-center space-y-3">
                  <Activity size={40} />
                  <p className="text-sm">No events found</p>
                  {activeGroup && <p className="text-xs">Try switching to "All Activity"</p>}
                </div>
              ) : (
                <>
                  <div className="relative space-y-2 before:absolute before:left-4 before:top-0 before:h-full before:w-px before:bg-gradient-to-b before:from-violet-500/40 before:via-white/10 before:to-transparent">
                    {activities.map((item, idx) => {
                      const cfg = getEventConfig(item.action_type);
                      const Icon = cfg.icon;
                      return (
                        <div key={idx} className="relative pl-11 group">
                          {/* Timeline dot */}
                          <div className={`absolute left-0 w-8 h-8 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center`}>
                            <Icon className={cfg.color} size={13} />
                          </div>

                          {/* Card */}
                          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[9px] font-black uppercase tracking-widest ${cfg.color}`}>
                                    {cfg.label}
                                  </span>
                                  <span className="text-[9px] text-white/20 font-mono">
                                    {item.entity_type}#{item.entity_id}
                                  </span>
                                </div>
                                {item.summary && (
                                  <p className="text-white/65 text-xs mt-1 leading-relaxed line-clamp-2">
                                    {item.action_type === 'session_started' ? (
                                      <span className="flex items-center gap-1.5">
                                        <Smartphone size={10} className="text-white/30 shrink-0" />
                                        <span className="truncate text-white/40">{item.summary}</span>
                                      </span>
                                    ) : item.summary}
                                  </p>
                                )}
                              </div>
                              <div className="shrink-0 text-right">
                                <div className="flex items-center gap-1 text-white/25 text-[9px] whitespace-nowrap">
                                  <Calendar size={9} />
                                  {item.created_at
                                    ? new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                    : '—'}
                                </div>
                                <div className="text-white/20 text-[9px] mt-0.5">
                                  {item.created_at
                                    ? new Date(item.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                                    : ''}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Load More */}
                  {page < totalPages && (
                    <div className="pt-4 flex justify-center">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/50 text-xs font-semibold hover:bg-white/[0.08] hover:text-white/70 disabled:opacity-50 transition-all"
                      >
                        {loadingMore ? <Loader2 size={13} className="animate-spin" /> : <ChevronDown size={13} />}
                        {loadingMore ? 'Loading...' : `Load more · ${total - activities.length} remaining`}
                      </button>
                    </div>
                  )}

                  <p className="text-center text-white/15 text-[10px] pt-2">
                    Showing {activities.length} of {total} events
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
