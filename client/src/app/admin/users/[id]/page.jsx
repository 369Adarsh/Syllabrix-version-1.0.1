'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api/admin.api';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  ArrowLeft, User, GraduationCap, Users, Activity,
  MailCheck, ShieldCheck, Ban, CheckCircle, Trash2, Download,
  RefreshCw, Loader2, Calendar, Clock, Globe, Phone, MapPin,
  BookOpen, Target, School, Award, ChevronDown, Smartphone,
  FileText, MessageSquare, Heart, UserPlus, LogIn, ShieldAlert,
  Link2, Copy, ExternalLink
} from 'lucide-react';

// ─── constants ────────────────────────────────────────────────────────────────

const TYPE_COLORS = {
  student:              'bg-blue-500/20 text-blue-300 border-blue-500/30',
  teacher:              'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  institute:            'bg-amber-500/20 text-amber-300 border-amber-500/30',
  parent:               'bg-pink-500/20 text-pink-300 border-pink-500/30',
  professional_learner: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  organization:         'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  hr_professional:      'bg-teal-500/20 text-teal-300 border-teal-500/30',
  syllabrix_admin:      'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

const EVENT_CONFIG = {
  post_created:    { icon: FileText,    color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/20',    label: 'Post Created' },
  comment_created: { icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', label: 'Comment' },
  reaction_like:   { icon: Heart,       color: 'text-rose-400',    bg: 'bg-rose-400/10',    border: 'border-rose-400/20',    label: 'Reaction' },
  followed_user:   { icon: UserPlus,    color: 'text-violet-400',  bg: 'bg-violet-400/10',  border: 'border-violet-400/20',  label: 'Follow' },
  session_started: { icon: LogIn,       color: 'text-cyan-400',    bg: 'bg-cyan-400/10',    border: 'border-cyan-400/20',    label: 'Session' },
  report_filed:    { icon: ShieldAlert, color: 'text-orange-400',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20',  label: 'Report' },
  default:         { icon: Clock,       color: 'text-gray-400',    bg: 'bg-gray-400/10',    border: 'border-gray-400/20',    label: 'Event' },
};

const ACTIVITY_TABS = [
  { key: null,       label: 'All' },
  { key: 'posts',    label: 'Posts' },
  { key: 'social',   label: 'Social' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'reports',  label: 'Reports' },
];

function getEvtCfg(type) {
  if (!type) return EVENT_CONFIG.default;
  if (type.startsWith('reaction_')) return EVENT_CONFIG.reaction_like;
  return EVENT_CONFIG[type] || EVENT_CONFIG.default;
}

function fmtDate(d, opts) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', opts || { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

// ─── sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, value, mono }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 w-28 shrink-0 mt-0.5">{label}</span>
      <span className={`text-[13px] text-white/75 leading-snug ${mono ? 'font-mono text-[11px]' : ''}`}>{value}</span>
    </div>
  );
}

function StatBox({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3 text-center">
      <p className={`text-[22px] font-black ${color}`}>{value ?? '—'}</p>
      <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mt-0.5">{label}</p>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center gap-2.5">
        <Icon size={14} className="text-violet-400" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">{title}</span>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('overview');
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Activity state
  const [activities, setActivities]     = useState([]);
  const [actTotal, setActTotal]         = useState(0);
  const [actPage, setActPage]           = useState(1);
  const [actTotalPages, setActTotalPages] = useState(1);
  const [actLoading, setActLoading]     = useState(false);
  const [actLoadingMore, setActMore]    = useState(false);
  const [actGroup, setActGroup]         = useState(null);
  const [startDate, setStartDate]       = useState('');
  const [endDate, setEndDate]           = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUserProfile(id);
      setData(res.data);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const loadActivity = useCallback(async (p = 1, append = false) => {
    if (!id) return;
    if (p === 1) setActLoading(true); else setActMore(true);
    try {
      const params = { page: p, limit: 30 };
      if (startDate && endDate) { params.startDate = startDate; params.endDate = endDate; }
      if (actGroup) params.actionGroup = actGroup;
      const res = await adminAPI.getUserActivity(id, params);
      const d = res.data;
      setActivities(prev => append ? [...prev, ...(d.activities || [])] : (d.activities || []));
      setActTotal(d.total || 0);
      setActTotalPages(d.totalPages || 1);
      setActPage(p);
    } catch (e) {
      toast.error('Failed to load activity');
    } finally {
      setActLoading(false);
      setActMore(false);
    }
  }, [id, startDate, endDate, actGroup]);

  useEffect(() => {
    if (tab === 'activity') { setActivities([]); loadActivity(1); }
  }, [tab, actGroup, startDate, endDate]);

  const handleStatusChange = async () => {
    if (!data) return;
    const { user } = data;
    const newStatus = user.is_active ? 'banned' : 'active';
    const reason = user.is_active ? prompt(`Reason for banning @${user.username}:`) : 'Account reinstated by admin';
    if (user.is_active && !reason) return;
    setActionLoading('status');
    try {
      await adminAPI.setUserStatus(user.id, newStatus, reason);
      toast.success(`@${user.username} ${newStatus === 'banned' ? 'banned' : 'reinstated'}`);
      loadProfile();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerify = async () => {
    if (!data) return;
    setActionLoading('verify');
    try {
      await adminAPI.verifyUserEmail(data.user.id);
      toast.success('Email verified');
      loadProfile();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Verification failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!data) return;
    setActionLoading('delete');
    try {
      await adminAPI.deleteUser(data.user.id);
      toast.success(`@${data.user.username} deleted`);
      router.push('/admin/users');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Delete failed');
      setActionLoading(null);
      setDeleteConfirm(false);
    }
  };

  const copyToClipboard = (val) => {
    navigator.clipboard.writeText(val);
    toast.success('Copied!');
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="animate-spin text-violet-500" size={32} />
      <p className="text-white/20 text-sm">Loading user profile…</p>
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
      <p className="text-white/40 text-lg font-semibold">User not found</p>
      <Link href="/admin/users" className="text-violet-400 text-sm hover:underline flex items-center gap-1">
        <ArrowLeft size={13} /> Back to User Command
      </Link>
    </div>
  );

  const { user, profile, linkedChildren, linkedParents, recentSessions } = data;
  const isStudent = user.user_type === 'student';
  const isParent  = user.user_type === 'parent';

  return (
    <div className="space-y-6">

      {/* ── Back + breadcrumb ── */}
      <div className="flex items-center gap-2">
        <Link href="/admin/users" className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-[12px] font-semibold transition-colors">
          <ArrowLeft size={13} /> User Command
        </Link>
        <span className="text-white/15 text-xs">/</span>
        <span className="text-white/50 text-[12px] font-semibold truncate">{user.full_name || user.username}</span>
      </div>

      {/* ── Header card ── */}
      <div className="bg-[#0e0e1a] border border-white/[0.08] rounded-2xl overflow-hidden">
        {/* Cover strip */}
        <div className="h-24 w-full" style={{ background: 'linear-gradient(135deg, #1e1040 0%, #0c1a40 100%)' }} />

        <div className="px-6 pb-5 -mt-10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-black border-4 border-[#0e0e1a] shrink-0">
              {user.full_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || '?'}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap pb-1">
              <button
                onClick={() => copyToClipboard(user.syllabrix_id || String(user.id))}
                className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-white/[0.05] text-white/40 hover:text-white/70 border border-white/[0.07] transition-all"
              >
                <Copy size={12} /> Copy ID
              </button>
              {!user.email_verified_at && (
                <button onClick={handleVerify} disabled={actionLoading === 'verify'}
                  className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 disabled:opacity-50 transition-all">
                  <ShieldCheck size={12} /> {actionLoading === 'verify' ? 'Verifying…' : 'Verify Email'}
                </button>
              )}
              <button onClick={handleStatusChange} disabled={actionLoading === 'status'}
                className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border disabled:opacity-50 transition-all ${
                  user.is_active
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20'
                }`}>
                {user.is_active ? <><Ban size={12} /> Ban</> : <><CheckCircle size={12} /> Reinstate</>}
              </button>
              {deleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-red-400 font-semibold whitespace-nowrap">Delete forever?</span>
                  <button onClick={handleDelete} disabled={actionLoading === 'delete'}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-all">
                    {actionLoading === 'delete' ? 'Deleting…' : 'Confirm'}
                  </button>
                  <button onClick={() => setDeleteConfirm(false)}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-white/[0.06] text-white/40 hover:bg-white/10 border border-white/[0.07] transition-all">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(true)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all">
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </div>
          </div>

          {/* Identity */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-white font-bold text-[22px] leading-tight">{user.full_name || user.username}</h1>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wide ${TYPE_COLORS[user.user_type] || 'bg-white/10 text-white/40 border-white/10'}`}>
                {user.user_type?.replace(/_/g, ' ')}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${user.is_active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                {user.is_active ? 'Active' : 'Banned'}
              </span>
              {user.email_verified_at && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <MailCheck size={9} /> Verified
                </span>
              )}
            </div>
            <p className="text-white/40 text-[13px]">@{user.username} · {user.email}</p>
            {user.syllabrix_id && (
              <button onClick={() => copyToClipboard(user.syllabrix_id)}
                className="flex items-center gap-1.5 font-mono text-[11px] text-violet-300/70 bg-violet-500/8 border border-violet-500/15 px-2.5 py-1 rounded-lg hover:bg-violet-500/15 transition-all group">
                {user.syllabrix_id}
                <Copy size={9} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
        </div>

        {/* ── Stat bar ── */}
        <div className="border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 divide-x divide-white/[0.05]">
          {[
            { label: 'Posts',       value: user.post_count },
            { label: 'Followers',   value: user.follower_count },
            { label: 'Following',   value: user.following_count },
            { label: 'Sessions',    value: user.session_count },
            { label: 'Reports',     value: user.report_count, color: user.report_count > 0 ? 'text-red-400' : undefined },
            { label: 'Last Seen',   value: user.last_seen ? fmtDate(user.last_seen, { day: 'numeric', month: 'short' }) : 'Never' },
          ].map(s => (
            <div key={s.label} className="px-4 py-3 text-center">
              <p className={`text-[18px] font-black ${s.color || 'text-white'}`}>{s.value ?? '—'}</p>
              <p className="text-[9px] text-white/25 uppercase tracking-wider font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Tab nav ── */}
        <div className="border-t border-white/[0.06] flex">
          {[
            { key: 'overview',     label: 'Overview',     icon: User },
            { key: 'activity',     label: 'Activity',     icon: Activity },
            { key: 'connections',  label: 'Connections',  icon: Users },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-3 text-[12px] font-semibold border-b-2 transition-all ${
                tab === key
                  ? 'border-violet-500 text-violet-300 bg-violet-500/5'
                  : 'border-transparent text-white/30 hover:text-white/60 hover:bg-white/[0.02]'
              }`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════ OVERVIEW TAB ══════════════ */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Account Info */}
          <SectionCard title="Account" icon={User}>
            <InfoRow label="Full Name"  value={user.full_name} />
            <InfoRow label="Username"   value={`@${user.username}`} />
            <InfoRow label="Email"      value={user.email} />
            <InfoRow label="Phone"      value={user.phone} />
            <InfoRow label="Gender"     value={user.gender} />
            <InfoRow label="Age Group"  value={user.age_group} />
            <InfoRow label="Date of Birth" value={fmtDate(user.date_of_birth)} />
            <InfoRow label="Location"   value={[user.city, user.state, user.country].filter(Boolean).join(', ')} />
            <InfoRow label="Bio"        value={user.bio} />
            <InfoRow label="Joined"     value={fmtDate(user.created_at)} />
            <InfoRow label="Profile"    value={user.is_profile_complete ? 'Complete' : 'Incomplete'} />
          </SectionCard>

          {/* Student academic profile */}
          {isStudent && (
            <SectionCard title="Academic Profile" icon={GraduationCap}>
              {profile ? (
                <>
                  <InfoRow label="Full Name"    value={profile.full_name} />
                  <InfoRow label="Class"        value={profile.class_name} />
                  <InfoRow label="School"       value={profile.school_name} />
                  <InfoRow label="Board"        value={profile.board} />
                  <InfoRow label="Medium"       value={profile.medium} />
                  <InfoRow label="Stream"       value={profile.subject_stream} />
                  <InfoRow label="College"      value={profile.college_name} />
                  <InfoRow label="University"   value={profile.university} />
                  <InfoRow label="Target Exam"  value={profile.target_exam} />
                  <InfoRow label="Education"    value={profile.education_level} />
                  <InfoRow label="Interests"    value={profile.interests} />
                  <InfoRow label="Skills"       value={profile.skills} />
                </>
              ) : (
                <p className="text-white/20 text-sm py-2">No academic profile found</p>
              )}
            </SectionCard>
          )}

          {/* Parent profile */}
          {isParent && (
            <SectionCard title="Parent Profile" icon={Users}>
              {profile ? (
                <>
                  <InfoRow label="Full Name"     value={profile.full_name} />
                  <InfoRow label="Guardian ID"   value={profile.guardian_id} mono />
                  <InfoRow label="Occupation"    value={profile.occupation} />
                  <InfoRow label="Relationship"  value={profile.relationship} />
                  <InfoRow label="Notify Email"  value={profile.notification_email} />
                  {profile.guardian_id && (
                    <button
                      onClick={() => copyToClipboard(profile.guardian_id)}
                      className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      <Copy size={11} /> Copy Guardian ID
                    </button>
                  )}
                </>
              ) : (
                <p className="text-white/20 text-sm py-2">No parent profile found</p>
              )}
            </SectionCard>
          )}

          {/* Professional Learner profile */}
          {!isStudent && !isParent && profile && (
            <SectionCard title="Professional Profile" icon={Award}>
              <InfoRow label="Full Name"   value={profile.full_name} />
              <InfoRow label="Skills"      value={profile.skills} />
              <InfoRow label="LinkedIn"    value={profile.linkedin_url} />
              <InfoRow label="About"       value={profile.about} />
            </SectionCard>
          )}

          {/* Recent Sessions */}
          <SectionCard title="Recent Sessions" icon={Smartphone}>
            {recentSessions.length === 0 ? (
              <p className="text-white/20 text-sm py-2">No sessions recorded</p>
            ) : (
              <div className="space-y-2">
                {recentSessions.map((s, i) => (
                  <div key={i} className="py-2 border-b border-white/[0.04] last:border-0">
                    <p className="text-[11px] text-white/50 leading-snug truncate">{s.user_agent || 'Unknown device'}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-white/20 font-mono">{s.ip_address || '—'}</span>
                      <span className="text-[10px] text-white/20">{fmtDateTime(s.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* ══════════════ ACTIVITY TAB ══════════════ */}
      {tab === 'activity' && (
        <div className="bg-[#0e0e1a] border border-white/[0.08] rounded-2xl overflow-hidden">
          {/* Filters */}
          <div className="px-5 py-4 border-b border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1 flex-wrap">
                {ACTIVITY_TABS.map(t => (
                  <button key={String(t.key)} onClick={() => setActGroup(t.key)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                      actGroup === t.key
                        ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                        : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:text-white/60'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => loadActivity(1)}
                  className="p-2 rounded-lg bg-white/[0.05] text-white/40 hover:text-white/70 border border-white/[0.07] transition-all">
                  <RefreshCw size={13} />
                </button>
                <button onClick={() => {
                    const blob = new Blob([JSON.stringify(activities, null, 2)], { type: 'application/json' });
                    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `activity_${user.syllabrix_id || user.id}.json` });
                    a.click();
                  }}
                  className="p-2 rounded-lg bg-white/[0.05] text-white/40 hover:text-white/70 border border-white/[0.07] transition-all">
                  <Download size={13} />
                </button>
              </div>
            </div>
            {/* Date range */}
            <div className="flex items-center gap-2">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[9px] uppercase font-bold text-white/20 mb-1 ml-1 tracking-wider">From</p>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:border-violet-500/50 transition-all" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-white/20 mb-1 ml-1 tracking-wider">To</p>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:border-violet-500/50 transition-all" />
                </div>
              </div>
              {(startDate || endDate) && (
                <button onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="mt-5 p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/15 transition-all">
                  ✕
                </button>
              )}
            </div>
            <p className="text-white/25 text-[11px]">
              <span className="text-white font-bold">{actTotal.toLocaleString()}</span> events total
            </p>
          </div>

          {/* Timeline */}
          <div className="p-5">
            {actLoading ? (
              <div className="flex flex-col items-center py-16 space-y-3">
                <Loader2 className="animate-spin text-violet-500" size={24} />
                <p className="text-white/20 text-sm">Loading activity…</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center py-16 opacity-25 text-center space-y-3">
                <Activity size={36} className="text-white" />
                <p className="text-sm text-white">No events found</p>
              </div>
            ) : (
              <div className="relative space-y-2 before:absolute before:left-4 before:top-0 before:h-full before:w-px before:bg-gradient-to-b before:from-violet-500/40 before:via-white/10 before:to-transparent">
                {activities.map((item, idx) => {
                  const cfg = getEvtCfg(item.action_type);
                  const Icon = cfg.icon;
                  return (
                    <div key={idx} className="relative pl-11">
                      <div className={`absolute left-0 w-8 h-8 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center`}>
                        <Icon className={cfg.color} size={13} />
                      </div>
                      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 hover:bg-white/[0.04] transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[9px] font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
                              <span className="text-[9px] text-white/20 font-mono">{item.entity_type}#{item.entity_id}</span>
                            </div>
                            {item.summary && (
                              <p className="text-white/55 text-xs mt-1 line-clamp-2 leading-relaxed">
                                {item.action_type === 'session_started'
                                  ? <span className="flex items-center gap-1"><Smartphone size={10} className="text-white/25 shrink-0" /><span className="truncate text-white/35">{item.summary}</span></span>
                                  : item.summary}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-[9px] text-white/25 whitespace-nowrap">{fmtDate(item.created_at)}</div>
                            <div className="text-[9px] text-white/20 mt-0.5">
                              {item.created_at ? new Date(item.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {actPage < actTotalPages && (
              <div className="pt-5 flex justify-center">
                <button onClick={() => loadActivity(actPage + 1, true)} disabled={actLoadingMore}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/50 text-xs font-semibold hover:bg-white/[0.08] disabled:opacity-50 transition-all">
                  {actLoadingMore ? <Loader2 size={13} className="animate-spin" /> : <ChevronDown size={13} />}
                  {actLoadingMore ? 'Loading…' : `Load more · ${actTotal - activities.length} remaining`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ CONNECTIONS TAB ══════════════ */}
      {tab === 'connections' && (
        <div className="space-y-4">

          {/* For parents: linked children */}
          {isParent && (
            <SectionCard title={`Linked Children (${linkedChildren.length})`} icon={Users}>
              {linkedChildren.length === 0 ? (
                <p className="text-white/20 text-sm py-2">No children linked to this parent account</p>
              ) : (
                <div className="space-y-2">
                  {linkedChildren.map(child => (
                    <Link
                      key={child.id}
                      href={`/admin/users/${child.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.10] transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {child.full_name?.[0] || child.username?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white/80 font-semibold text-[13px]">{child.full_name || child.username}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${child.is_active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                            {child.is_active ? 'Active' : 'Banned'}
                          </span>
                        </div>
                        <p className="text-white/30 text-[11px]">@{child.username}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {child.class_name && (
                            <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                              Class {child.class_name}
                            </span>
                          )}
                          {child.school_name && (
                            <span className="text-[10px] text-white/30">{child.school_name}</span>
                          )}
                          {child.board && (
                            <span className="text-[10px] text-white/25">{child.board}</span>
                          )}
                        </div>
                      </div>
                      <ExternalLink size={12} className="text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </SectionCard>
          )}

          {/* For students: linked parent */}
          {isStudent && (
            <SectionCard title={`Linked Parents (${linkedParents.length})`} icon={Users}>
              {linkedParents.length === 0 ? (
                <p className="text-white/20 text-sm py-2">No parent linked to this student</p>
              ) : (
                <div className="space-y-2">
                  {linkedParents.map(parent => (
                    <Link
                      key={parent.id}
                      href={`/admin/users/${parent.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.10] transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-600 to-rose-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {parent.full_name?.[0] || parent.username?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 font-semibold text-[13px]">{parent.full_name || parent.username}</p>
                        <p className="text-white/30 text-[11px]">@{parent.username}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {parent.relationship && (
                            <span className="text-[10px] font-semibold text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full capitalize">
                              {parent.relationship}
                            </span>
                          )}
                          {parent.guardian_id && (
                            <button onClick={(e) => { e.preventDefault(); copyToClipboard(parent.guardian_id); }}
                              className="text-[10px] font-mono text-white/25 hover:text-white/50 transition-colors flex items-center gap-1">
                              <Copy size={9} /> {parent.guardian_id}
                            </button>
                          )}
                        </div>
                      </div>
                      <ExternalLink size={12} className="text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </SectionCard>
          )}

          {/* For non-student/parent types */}
          {!isStudent && !isParent && (
            <div className="flex flex-col items-center py-16 opacity-25 text-center space-y-3">
              <Link2 size={32} className="text-white" />
              <p className="text-sm text-white">No linked accounts for this user type</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
