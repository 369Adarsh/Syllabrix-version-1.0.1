'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api/admin.api';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  ArrowLeft, User, GraduationCap, Users, Activity,
  MailCheck, ShieldCheck, Ban, CheckCircle, Trash2, Download,
  RefreshCw, Loader2, Calendar, Clock, Smartphone,
  FileText, MessageSquare, Heart, UserPlus, LogIn, ShieldAlert,
  Link2, Copy, ExternalLink, ChevronDown, MapPin, Phone, BookOpen,
  Award, School, Target, Briefcase
} from 'lucide-react';

// ─── constants ────────────────────────────────────────────────────────────────

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

const EVENT_CONFIG = {
  post_created:    { icon: FileText,    color: 'text-blue-500',   bg: 'bg-blue-50',   border: 'border-blue-200',   label: 'Post Created' },
  comment_created: { icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Comment' },
  reaction_like:   { icon: Heart,       color: 'text-rose-500',   bg: 'bg-rose-50',   border: 'border-rose-200',   label: 'Reaction' },
  followed_user:   { icon: UserPlus,    color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200', label: 'Follow' },
  session_started: { icon: LogIn,       color: 'text-cyan-600',   bg: 'bg-cyan-50',   border: 'border-cyan-200',   label: 'Session' },
  report_filed:    { icon: ShieldAlert, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Report' },
  default:         { icon: Clock,       color: 'text-gray-400',   bg: 'bg-gray-50',   border: 'border-gray-200',   label: 'Event' },
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
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-IN', opts || { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

// ─── shared light-theme components ───────────────────────────────────────────

function Card({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm ${className}`}>
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5">
        <Icon size={14} className="text-indigo-500" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono, badge, badgeColor }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-[11px] font-semibold text-gray-400 w-32 shrink-0 mt-0.5">{label}</span>
      <span className={`text-[13px] text-gray-700 leading-snug flex-1 ${mono ? 'font-mono text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block' : ''}`}>
        {badge ? (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeColor || 'bg-gray-100 text-gray-600'}`}>{value}</span>
        ) : value}
      </span>
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center py-10 text-center opacity-40 space-y-2">
      <Icon size={28} className="text-gray-400" />
      <p className="text-sm text-gray-500">{text}</p>
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
  const [activities, setActivities]       = useState([]);
  const [actTotal, setActTotal]           = useState(0);
  const [actPage, setActPage]             = useState(1);
  const [actTotalPages, setActTotalPages] = useState(1);
  const [actLoading, setActLoading]       = useState(false);
  const [actLoadingMore, setActMore]      = useState(false);
  const [actGroup, setActGroup]           = useState(null);
  const [startDate, setStartDate]         = useState('');
  const [endDate, setEndDate]             = useState('');

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
    } catch {
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

  const copy = (val) => { navigator.clipboard.writeText(val); toast.success('Copied!'); };

  // ── loading / error ──
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
      <Loader2 className="animate-spin text-indigo-500" size={28} />
      <p className="text-gray-400 text-sm">Loading user profile…</p>
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3 text-center">
      <p className="text-gray-500 font-semibold">User not found</p>
      <Link href="/admin/users" className="text-indigo-500 text-sm hover:underline flex items-center gap-1">
        <ArrowLeft size={13} /> Back to User Command
      </Link>
    </div>
  );

  const { user, profile, linkedChildren, linkedParents, recentSessions } = data;
  const isStudent = user.user_type === 'student';
  const isParent  = user.user_type === 'parent';

  return (
    <div className="space-y-5 max-w-6xl">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href="/admin/users" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-[12px] font-semibold transition-colors">
          <ArrowLeft size={13} /> User Command
        </Link>
        <span className="text-gray-300 text-xs">/</span>
        <span className="text-gray-600 text-[12px] font-semibold truncate">{user.full_name || user.username}</span>
      </div>

      {/* ── Hero card (keeps dark theme — looks like a profile banner) ── */}
      <div className="bg-[#0f1123] rounded-2xl overflow-hidden shadow-lg">
        {/* Cover */}
        <div className="h-20 w-full" style={{ background: 'linear-gradient(135deg, #312e81 0%, #1e3a5f 50%, #0f172a 100%)' }} />

        {/* Identity row */}
        <div className="px-6 pb-5 -mt-10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center text-white text-3xl font-black border-4 border-[#0f1123] shrink-0 shadow-lg">
              {user.full_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || '?'}
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap pb-1">
              <button onClick={() => copy(user.syllabrix_id || String(user.id))}
                className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 border border-white/10 transition-all">
                <Copy size={11} /> Copy ID
              </button>
              {!user.email_verified_at && (
                <button onClick={handleVerify} disabled={actionLoading === 'verify'}
                  className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 disabled:opacity-50 transition-all">
                  <ShieldCheck size={11} /> {actionLoading === 'verify' ? 'Verifying…' : 'Verify Email'}
                </button>
              )}
              <button onClick={handleStatusChange} disabled={actionLoading === 'status'}
                className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border disabled:opacity-50 transition-all ${
                  user.is_active
                    ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border-red-500/25'
                    : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/25'
                }`}>
                {user.is_active ? <><Ban size={11} /> Ban</> : <><CheckCircle size={11} /> Reinstate</>}
              </button>
              {deleteConfirm ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-red-400 font-semibold">Delete forever?</span>
                  <button onClick={handleDelete} disabled={actionLoading === 'delete'}
                    className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-all">
                    {actionLoading === 'delete' ? '…' : 'Yes'}
                  </button>
                  <button onClick={() => setDeleteConfirm(false)}
                    className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-white/10 text-white/50 hover:bg-white/20 border border-white/10 transition-all">
                    No
                  </button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(true)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/25 transition-all">
                  <Trash2 size={11} /> Delete
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-white font-bold text-[20px] leading-tight">{user.full_name || user.username}</h1>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide ${TYPE_COLORS[user.user_type] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                {user.user_type?.replace(/_/g, ' ')}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${user.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {user.is_active ? 'Active' : 'Banned'}
              </span>
              {user.email_verified_at && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                  <MailCheck size={9} /> Verified
                </span>
              )}
            </div>
            <p className="text-white/40 text-[12px]">@{user.username} · {user.email}</p>
            {user.syllabrix_id && (
              <button onClick={() => copy(user.syllabrix_id)}
                className="flex items-center gap-1.5 font-mono text-[11px] text-indigo-300/80 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg hover:bg-indigo-500/20 transition-all group mt-1">
                {user.syllabrix_id}
                <Copy size={9} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/[0.07] grid grid-cols-3 sm:grid-cols-6 divide-x divide-white/[0.06]">
          {[
            { label: 'Posts',     value: user.post_count ?? 0 },
            { label: 'Followers', value: user.follower_count ?? 0 },
            { label: 'Following', value: user.following_count ?? 0 },
            { label: 'Sessions',  value: user.session_count ?? 0 },
            { label: 'Reports',   value: user.report_count ?? 0, red: (user.report_count ?? 0) > 0 },
            { label: 'Last Seen', value: user.last_seen ? fmtDate(user.last_seen, { day: 'numeric', month: 'short' }) : 'Never' },
          ].map(s => (
            <div key={s.label} className="px-4 py-3 text-center">
              <p className={`text-[17px] font-black ${s.red ? 'text-red-400' : 'text-white'}`}>{s.value}</p>
              <p className="text-[9px] text-white/25 uppercase tracking-wider font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div className="border-t border-white/[0.07] flex">
          {[
            { key: 'overview',    label: 'Overview',    icon: User },
            { key: 'activity',    label: 'Activity',    icon: Activity },
            { key: 'connections', label: 'Connections', icon: Users },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-3 text-[12px] font-semibold border-b-2 transition-all ${
                tab === key
                  ? 'border-violet-400 text-violet-300 bg-violet-500/8'
                  : 'border-transparent text-white/35 hover:text-white/60 hover:bg-white/5'
              }`}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════ OVERVIEW TAB ══════════════ */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Account */}
          <Card title="Account Information" icon={User}>
            <InfoRow label="Full Name"    value={user.full_name} />
            <InfoRow label="Username"     value={`@${user.username}`} />
            <InfoRow label="Email"        value={user.email} />
            <InfoRow label="Phone"        value={user.phone} />
            <InfoRow label="Gender"       value={user.gender} />
            <InfoRow label="Age Group"    value={user.age_group} />
            <InfoRow label="Date of Birth" value={fmtDate(user.date_of_birth)} />
            <InfoRow label="City"         value={user.city} />
            <InfoRow label="State"        value={user.state} />
            <InfoRow label="Country"      value={user.country} />
            <InfoRow label="Bio"          value={user.bio} />
            <InfoRow label="Joined"       value={fmtDate(user.created_at)} />
            <InfoRow label="Last Updated" value={fmtDate(user.updated_at)} />
            <InfoRow label="Profile"      value={user.is_profile_complete ? '✓ Complete' : '✗ Incomplete'}
              badge badgeColor={user.is_profile_complete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} />
          </Card>

          {/* Student: Academic Profile */}
          {isStudent && (
            <Card title="Academic Profile" icon={GraduationCap}>
              {profile ? (
                <>
                  <InfoRow label="Class"       value={profile.class_name ? `Class ${profile.class_name}` : null}
                    badge badgeColor="bg-blue-100 text-blue-700" />
                  <InfoRow label="Board"       value={profile.board}
                    badge badgeColor="bg-indigo-100 text-indigo-700" />
                  <InfoRow label="School"      value={profile.school_name} />
                  <InfoRow label="Medium"      value={profile.medium} />
                  <InfoRow label="Stream"      value={profile.subject_stream}
                    badge badgeColor="bg-violet-100 text-violet-700" />
                  <InfoRow label="College"     value={profile.college_name} />
                  <InfoRow label="University"  value={profile.university} />
                  <InfoRow label="Education"   value={profile.education_level} />
                  <InfoRow label="Target Exam" value={profile.target_exam}
                    badge badgeColor="bg-rose-100 text-rose-700" />
                  <InfoRow label="Interests"   value={profile.interests} />
                  <InfoRow label="Skills"      value={profile.skills} />
                </>
              ) : (
                <EmptyState icon={GraduationCap} text="No academic profile on file" />
              )}
            </Card>
          )}

          {/* Parent: Guardian Profile */}
          {isParent && (
            <Card title="Parent / Guardian Profile" icon={Users}>
              {profile ? (
                <>
                  <InfoRow label="Full Name"     value={profile.full_name} />
                  <InfoRow label="Guardian ID"   value={profile.guardian_id} mono />
                  <InfoRow label="Occupation"    value={profile.occupation} />
                  <InfoRow label="Relationship"  value={profile.relationship}
                    badge badgeColor="bg-pink-100 text-pink-700" />
                  <InfoRow label="Notify Email"  value={profile.notification_email} />
                  {profile.guardian_id && (
                    <button onClick={() => copy(profile.guardian_id)}
                      className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                      <Copy size={12} /> Copy Guardian ID
                    </button>
                  )}
                </>
              ) : (
                <EmptyState icon={Users} text="No parent profile on file" />
              )}
            </Card>
          )}

          {/* Professional / other types */}
          {!isStudent && !isParent && profile && (
            <Card title="Professional Profile" icon={Briefcase}>
              <InfoRow label="Full Name"  value={profile.full_name} />
              <InfoRow label="Skills"     value={profile.skills} />
              <InfoRow label="LinkedIn"   value={profile.linkedin_url} />
              <InfoRow label="About"      value={profile.about} />
              <InfoRow label="Location"   value={profile.location} />
            </Card>
          )}

          {/* Recent Sessions */}
          <Card title="Recent Sessions" icon={Smartphone} className={isStudent || isParent || (!profile) ? '' : ''}>
            {recentSessions.length === 0 ? (
              <EmptyState icon={Smartphone} text="No sessions recorded" />
            ) : (
              <div className="space-y-1">
                {recentSessions.map((s, i) => (
                  <div key={i} className="py-2.5 border-b border-gray-50 last:border-0">
                    <p className="text-[12px] text-gray-600 leading-snug truncate">{s.user_agent || 'Unknown device'}</p>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <span className="text-[10px] text-gray-400 font-mono">{s.ip_address || '—'}</span>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{fmtDateTime(s.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ══════════════ ACTIVITY TAB ══════════════ */}
      {tab === 'activity' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Filters */}
          <div className="px-5 py-4 border-b border-gray-100 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                {ACTIVITY_TABS.map(t => (
                  <button key={String(t.key)} onClick={() => setActGroup(t.key)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                      actGroup === t.key
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => loadActivity(1)}
                  className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all">
                  <RefreshCw size={13} />
                </button>
                <button onClick={() => {
                    const blob = new Blob([JSON.stringify(activities, null, 2)], { type: 'application/json' });
                    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `activity_${user.syllabrix_id || user.id}.json` });
                    a.click();
                  }}
                  className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all">
                  <Download size={13} />
                </button>
              </div>
            </div>

            {/* Date range */}
            <div className="flex items-center gap-2">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[9px] uppercase font-bold text-gray-400 mb-1 ml-0.5 tracking-wider">From</p>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] text-gray-700 focus:outline-none focus:border-indigo-400 transition-all" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-gray-400 mb-1 ml-0.5 tracking-wider">To</p>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] text-gray-700 focus:outline-none focus:border-indigo-400 transition-all" />
                </div>
              </div>
              {(startDate || endDate) && (
                <button onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="mt-5 p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition-all text-xs font-bold">✕</button>
              )}
            </div>

            <p className="text-gray-400 text-[11px]">
              <span className="text-gray-700 font-bold">{actTotal.toLocaleString()}</span> events total
            </p>
          </div>

          {/* Timeline */}
          <div className="p-5">
            {actLoading ? (
              <div className="flex flex-col items-center py-16 space-y-3">
                <Loader2 className="animate-spin text-indigo-400" size={22} />
                <p className="text-gray-400 text-sm">Loading activity…</p>
              </div>
            ) : activities.length === 0 ? (
              <EmptyState icon={Activity} text="No events found" />
            ) : (
              <>
                <div className="relative space-y-2 before:absolute before:left-4 before:top-0 before:h-full before:w-px before:bg-gradient-to-b before:from-indigo-300 before:via-gray-200 before:to-transparent">
                  {activities.map((item, idx) => {
                    const cfg = getEvtCfg(item.action_type);
                    const Icon = cfg.icon;
                    return (
                      <div key={idx} className="relative pl-11">
                        <div className={`absolute left-0 w-8 h-8 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center`}>
                          <Icon className={cfg.color} size={13} />
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 hover:bg-white hover:border-gray-200 transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
                                <span className="text-[9px] text-gray-400 font-mono">{item.entity_type}#{item.entity_id}</span>
                              </div>
                              {item.summary && (
                                <p className="text-gray-600 text-[12px] mt-1 line-clamp-2 leading-relaxed">
                                  {item.action_type === 'session_started'
                                    ? <span className="flex items-center gap-1"><Smartphone size={10} className="text-gray-400 shrink-0" /><span className="truncate text-gray-400">{item.summary}</span></span>
                                    : item.summary}
                                </p>
                              )}
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="text-[10px] text-gray-400 whitespace-nowrap">{fmtDate(item.created_at)}</div>
                              <div className="text-[10px] text-gray-300 mt-0.5">
                                {item.created_at ? new Date(item.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {actPage < actTotalPages && (
                  <div className="pt-5 flex justify-center">
                    <button onClick={() => loadActivity(actPage + 1, true)} disabled={actLoadingMore}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 text-[12px] font-semibold hover:bg-gray-100 disabled:opacity-50 transition-all">
                      {actLoadingMore ? <Loader2 size={13} className="animate-spin" /> : <ChevronDown size={13} />}
                      {actLoadingMore ? 'Loading…' : `Load more · ${actTotal - activities.length} remaining`}
                    </button>
                  </div>
                )}
                <p className="text-center text-gray-300 text-[10px] pt-3">Showing {activities.length} of {actTotal} events</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ CONNECTIONS TAB ══════════════ */}
      {tab === 'connections' && (
        <div className="space-y-4">

          {/* Parent → children */}
          {isParent && (
            <Card title={`Linked Children · ${linkedChildren.length} account${linkedChildren.length !== 1 ? 's' : ''}`} icon={Users}>
              {linkedChildren.length === 0 ? (
                <EmptyState icon={Users} text="No children linked to this parent account yet" />
              ) : (
                <div className="space-y-2">
                  {linkedChildren.map(child => (
                    <Link key={child.id} href={`/admin/users/${child.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {child.full_name?.[0]?.toUpperCase() || child.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-gray-800 font-semibold text-[13px] group-hover:text-indigo-700 transition-colors">{child.full_name || child.username}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${child.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {child.is_active ? 'Active' : 'Banned'}
                          </span>
                        </div>
                        <p className="text-gray-400 text-[11px]">@{child.username}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {child.class_name && (
                            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                              Class {child.class_name}
                            </span>
                          )}
                          {child.board && (
                            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                              {child.board}
                            </span>
                          )}
                          {child.school_name && (
                            <span className="text-[10px] text-gray-400">{child.school_name}</span>
                          )}
                          {child.target_exam && (
                            <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              {child.target_exam}
                            </span>
                          )}
                        </div>
                      </div>
                      <ExternalLink size={13} className="text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Student → parent */}
          {isStudent && (
            <Card title={`Linked Parents · ${linkedParents.length} account${linkedParents.length !== 1 ? 's' : ''}`} icon={Users}>
              {linkedParents.length === 0 ? (
                <EmptyState icon={Users} text="No parent linked to this student account yet" />
              ) : (
                <div className="space-y-2">
                  {linkedParents.map(parent => (
                    <Link key={parent.id} href={`/admin/users/${parent.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-pink-50 hover:border-pink-200 transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {parent.full_name?.[0]?.toUpperCase() || parent.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-semibold text-[13px] group-hover:text-pink-700 transition-colors">{parent.full_name || parent.username}</p>
                        <p className="text-gray-400 text-[11px]">@{parent.username}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {parent.relationship && (
                            <span className="text-[10px] font-semibold text-pink-600 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-full capitalize">
                              {parent.relationship}
                            </span>
                          )}
                          {parent.occupation && (
                            <span className="text-[10px] text-gray-400">{parent.occupation}</span>
                          )}
                          {parent.guardian_id && (
                            <button onClick={e => { e.preventDefault(); copy(parent.guardian_id); }}
                              className="flex items-center gap-1 text-[10px] font-mono text-indigo-500 hover:text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full transition-colors">
                              <Copy size={9} /> {parent.guardian_id}
                            </button>
                          )}
                        </div>
                      </div>
                      <ExternalLink size={13} className="text-gray-300 group-hover:text-pink-500 transition-colors shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )}

          {!isStudent && !isParent && (
            <Card title="Connections" icon={Link2}>
              <EmptyState icon={Link2} text="No linked accounts for this user type" />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
