'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { profileAPI } from '@/lib/api/profile.api';
import { followAPI } from '@/lib/api/follow.api';
import { postsAPI } from '@/lib/api/posts.api';
import { badgesAPI } from '@/lib/api/badges.api';
import { uploadAPI } from '@/lib/api/upload.api';
import PostCard from '@/components/feed/PostCard';
import ReportModal from '@/components/modals/ReportModal';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  MapPin, Award, Camera, Settings, MessageSquare, Loader2,
  UserPlus, UserCheck, Briefcase, GraduationCap, Star,
  CheckCircle, ShieldAlert, Building2, Mail, Globe,
  TrendingUp, Zap, Target, Heart, History, Check,
  Linkedin, BookOpen, Users, Shield, ChevronRight,
  CalendarDays, Pencil, Hash
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Per-type visual config ────────────────────────────────────────────────────
const TYPE_CFG = {
  student:             { gradient: 'from-[#0F172A] via-[#1e3a6e] to-[#2563EB]',   glow1: 'bg-blue-400/10',   glow2: 'bg-indigo-400/10',  accent: 'text-blue-300',   label: 'Student',         icon: GraduationCap },
  teacher:             { gradient: 'from-[#0D2318] via-[#064E3B] to-[#059669]',   glow1: 'bg-teal-400/10',   glow2: 'bg-emerald-400/10', accent: 'text-emerald-300',label: 'Teacher',         icon: BookOpen },
  professional_learner:{ gradient: 'from-[#0F172A] via-[#1E3A5F] to-[#1E40AF]',  glow1: 'bg-blue-400/10',   glow2: 'bg-indigo-400/10',  accent: 'text-sky-300',    label: 'Professional',    icon: Briefcase },
  mentor:              { gradient: 'from-[#1C0A00] via-[#7C2D12] to-[#C2410C]',  glow1: 'bg-orange-400/10', glow2: 'bg-amber-400/10',   accent: 'text-amber-300',  label: 'Mentor',          icon: Star },
  hr_professional:     { gradient: 'from-[#1a0533] via-[#5B21B6] to-[#7C3AED]',  glow1: 'bg-purple-400/10', glow2: 'bg-violet-400/10',  accent: 'text-purple-300', label: 'HR Professional', icon: Users },
  parent:              { gradient: 'from-[#022c22] via-[#065F46] to-[#10B981]',   glow1: 'bg-emerald-400/10',glow2: 'bg-green-400/10',   accent: 'text-green-300',  label: 'Parent',          icon: Heart },
  organization:        { gradient: 'from-[#0f172a] via-[#1e293b] to-[#334155]',   glow1: 'bg-slate-400/10',  glow2: 'bg-gray-400/10',    accent: 'text-slate-300',  label: 'Organization',    icon: Building2 },
};
const getCfg = t => TYPE_CFG[t] || TYPE_CFG.professional_learner;

// ── Stat column (identical to ProfessionalProfile's StatCol) ─────────────────
const StatCol = ({ label, value, sub, icon: Icon, accent = 'text-blue-600' }) => (
  <div className="flex items-start gap-2 sm:gap-3 py-3 sm:py-5 px-3 sm:px-6">
    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={13} className={accent} />
    </div>
    <div className="min-w-0">
      <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 mb-0.5">{label}</p>
      <p className="text-[12px] sm:text-[15px] font-black text-gray-900 leading-tight truncate">{value || '—'}</p>
      <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 font-medium hidden sm:block">{sub}</p>
    </div>
  </div>
);

// ── ConnectLink (identical to ProfessionalProfile) ────────────────────────────
const ConnectLink = ({ icon: Icon, label, value, href }) => (
  <a href={href || '#'} target={href ? '_blank' : undefined} rel="noreferrer"
    className="flex items-center gap-3 py-2.5 group">
    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:border-blue-100 group-hover:bg-blue-50 transition-all">
      <Icon size={13} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-gray-400 font-medium">{label}</p>
      <p className="text-[11px] font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{value || '—'}</p>
    </div>
    {href && <ChevronRight size={12} className="text-gray-300 group-hover:text-blue-400 ml-auto transition-colors shrink-0" />}
  </a>
);

// ── Skill tag ─────────────────────────────────────────────────────────────────
const SkillTag = ({ label }) => (
  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full border border-blue-100">{label}</span>
);

// ── Per-type stats ────────────────────────────────────────────────────────────
function getStats(profile, p, badges) {
  const t = profile?.user_type;
  if (t === 'student') return [
    { label: 'School',   value: p.school_name   || 'Not set', sub: 'Current institution',    icon: GraduationCap, accent: 'text-blue-600' },
    { label: 'Class',    value: p.class_name ? `Class ${p.class_name}` : '—', sub: p.board || 'Board not set', icon: BookOpen, accent: 'text-indigo-600' },
    { label: 'Badges',   value: badges.length > 0 ? `${badges.length} Earned` : 'None yet',  sub: 'Achievements unlocked', icon: Award, accent: 'text-amber-600' },
  ];
  if (t === 'teacher') return [
    { label: 'Subject',    value: p.subject_primary || '—',   sub: 'Primary teaching subject', icon: BookOpen,  accent: 'text-emerald-600' },
    { label: 'Experience', value: p.experience_years ? `${p.experience_years} Years` : '—', sub: 'Teaching experience', icon: Zap, accent: 'text-teal-600' },
    { label: 'Institute',  value: p.institute_name  || '—',   sub: 'Current institution',      icon: Building2, accent: 'text-cyan-600' },
  ];
  if (t === 'hr_professional') return [
    { label: 'Company',    value: p.current_company || '—',   sub: 'Current employer',    icon: Building2,   accent: 'text-purple-600' },
    { label: 'Industry',   value: p.industry        || '—',   sub: 'Domain',              icon: Briefcase,   accent: 'text-violet-600' },
    { label: 'Experience', value: p.experience_years ? `${p.experience_years} Yrs` : '—', sub: 'HR experience', icon: TrendingUp, accent: 'text-indigo-600' },
  ];
  if (t === 'mentor') return [
    { label: 'Domain',     value: p.subject_primary || p.industry || '—', sub: 'Mentorship area',     icon: Target,    accent: 'text-amber-600' },
    { label: 'Experience', value: p.experience_years ? `${p.experience_years} Yrs` : '—', sub: 'Industry experience', icon: Zap, accent: 'text-orange-600' },
    { label: 'Badges',     value: badges.length > 0 ? `${badges.length} Earned` : 'None yet', sub: 'Recognition',  icon: Award, accent: 'text-red-600' },
  ];
  if (t === 'parent') return [
    { label: 'Location',  value: [profile.city, profile.state].filter(Boolean).join(', ') || '—', sub: 'Based in', icon: MapPin, accent: 'text-emerald-600' },
    { label: 'Community', value: 'Parent Network',   sub: 'Syllabrix community', icon: Users,   accent: 'text-green-600' },
    { label: 'Member',    value: profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—', sub: 'Member since', icon: CalendarDays, accent: 'text-teal-600' },
  ];
  if (t === 'organization') return [
    { label: 'Industry', value: p.industry  || '—', sub: 'Sector', icon: Briefcase,   accent: 'text-slate-600' },
    { label: 'Size',     value: p.org_size  || '—', sub: 'Team size', icon: Users,    accent: 'text-gray-600' },
    { label: 'Type',     value: p.org_type  || '—', sub: 'Entity type', icon: Building2, accent: 'text-blue-600' },
  ];
  // professional_learner default
  return [
    { label: 'Role',       value: p.current_role    || '—', sub: 'Current designation', icon: Briefcase,  accent: 'text-blue-600' },
    { label: 'Company',    value: p.current_company || '—', sub: 'Employer',            icon: Building2,  accent: 'text-indigo-600' },
    { label: 'Experience', value: p.experience_years ? `${p.experience_years} Yrs` : '—', sub: 'Industry experience', icon: TrendingUp, accent: 'text-emerald-600' },
  ];
}

// ── Sub-title in banner ───────────────────────────────────────────────────────
function getBannerSubtitle(profile, p, cfg) {
  const t = profile?.user_type;
  if (t === 'student' && p.school_name)  return { main: `${p.class_name ? `Class ${p.class_name} · ` : ''}${p.school_name}`, accent: p.board || '' };
  if (t === 'teacher' && p.subject_primary) return { main: p.subject_primary, accent: p.institute_name ? `at ${p.institute_name}` : '' };
  if (t === 'mentor')  return { main: p.subject_primary || p.industry || 'Mentor', accent: p.experience_years ? `${p.experience_years} yrs experience` : '' };
  if (t === 'hr_professional') return { main: p.designation || 'HR Professional', accent: p.current_company ? `at ${p.current_company}` : '' };
  if (t === 'parent')  return { main: 'Parent', accent: [profile.city, profile.state].filter(Boolean).join(', ') };
  if (t === 'organization') return { main: p.industry || 'Organization', accent: p.org_size || '' };
  // professional
  const role = p.current_role || p.designation || 'Professional';
  const industry = p.industry || '';
  return { main: role, accent: industry ? `in ${industry}` : (p.current_company || '') };
}

// ── Timeline item ─────────────────────────────────────────────────────────────
const TimelineItem = ({ icon: Icon, iconBg, title, sub, period, isCurrent, description, isLast }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isCurrent ? iconBg + ' shadow-sm' : 'bg-gray-50 border border-gray-100'}`}>
        <Icon size={15} className={isCurrent ? 'text-white' : 'text-gray-400'} />
      </div>
      {!isLast && <div className="w-px flex-1 bg-gray-100 mt-3" />}
    </div>
    <div className={`flex-1 min-w-0 ${!isLast ? 'pb-6' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="min-w-0">
          <h4 className="text-[13px] font-black text-gray-900 truncate">{title}</h4>
          <p className="text-[12px] text-gray-500 font-medium">{sub}{period ? ` · ${period}` : ''}</p>
        </div>
        {isCurrent && (
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-emerald-100 shrink-0">
            Present
          </span>
        )}
      </div>
      {description && <p className="text-[12px] text-gray-500 mt-1.5 leading-relaxed">{description}</p>}
    </div>
  </div>
);

export default function ProfileView({ userId }) {
  const { user: me, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [postsExpanded, setPostsExpanded] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const isOwn = me?.id?.toString() === userId?.toString();

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      profileAPI.getById(userId).catch(() => ({ data: { data: null } })),
      postsAPI.getUserPosts(userId, { limit: 20 }).catch(() => ({ data: { data: [] } })),
      badgesAPI.getUserBadges(userId).catch(() => ({ data: { data: [] } })),
    ]).then(([pRes, postsRes, badgesRes]) => {
      setProfile(pRes.data?.data);
      setFollowing(pRes.data?.data?.is_following);
      setPosts(postsRes.data?.data || []);
      setBadges(badgesRes.data?.data || []);
    }).finally(() => setLoading(false));
  }, [userId]);

  const handleFollow = async () => {
    try {
      await followAPI.toggle(userId);
      setFollowing(f => !f);
      setProfile(p => ({ ...p, followers_count: following ? p.followers_count - 1 : p.followers_count + 1 }));
      toast.success(following ? 'Unfollowed' : 'Now following!');
    } catch { toast.error('Failed'); }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { await uploadAPI.coverPhoto(file); await refreshUser(); toast.success('Cover updated!'); } catch { toast.error('Upload failed'); }
  };
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { await uploadAPI.profilePhoto(file); await refreshUser(); toast.success('Photo updated!'); } catch { toast.error('Upload failed'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F1F4F8] flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-indigo-500" />
    </div>
  );
  if (!profile) return (
    <div className="min-h-screen bg-[#F1F4F8] flex items-center justify-center">
      <p className="text-gray-400 text-sm">User not found.</p>
    </div>
  );

  const p   = profile.profile || {};
  const cfg = getCfg(profile.user_type);
  const CfgIcon = cfg.icon;
  const hasPhoto = profile.profile_photo_url && !profile.profile_photo_url.includes('PASTE_');
  const displayName = p.full_name || p.name || profile.username;
  const subtitle = getBannerSubtitle(profile, p, cfg);
  const stats = getStats(profile, p, badges);
  const skills = (() => { try { const s = p.skills; return Array.isArray(s) ? s : (s ? JSON.parse(s) : []); } catch { return []; } })();
  const workHistory = (() => { try { const w = p.work_history; return Array.isArray(w) ? w : (w ? JSON.parse(w) : []); } catch { return []; } })();
  const education = (() => { try { const e = p.education; return Array.isArray(e) ? e : (e ? JSON.parse(e) : []); } catch { return []; } })();
  const achievements = (() => { try { const a = p.achievements; return Array.isArray(a) ? a : (a ? JSON.parse(a) : []); } catch { return []; } })();
  const skillTags = skills.slice(0, 6).map(s => typeof s === 'string' ? s : s?.name).filter(Boolean);
  const location = [profile.city, profile.state].filter(Boolean).join(', ');

  // Build timeline based on user type
  let timeline = [];
  if (workHistory.length > 0) {
    timeline = workHistory.map((w, i) => ({
      icon: Building2,
      iconBg: 'bg-blue-600',
      title: w.company || w.title || 'Company',
      sub: w.role || w.designation || 'Role',
      period: [w.start_date && new Date(w.start_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), w.is_current || !w.end_date ? 'Present' : (w.end_date && new Date(w.end_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }))].filter(Boolean).join(' — '),
      isCurrent: !!(w.is_current || !w.end_date),
      description: w.description || '',
      isLast: i === workHistory.length - 1,
    }));
  } else if (education.length > 0) {
    timeline = education.map((e, i) => ({
      icon: GraduationCap,
      iconBg: 'bg-amber-500',
      title: e.institution || e.college || e.school || 'Institution',
      sub: e.degree || e.field || e.course || '',
      period: [e.start_year, e.end_year || 'Present'].filter(Boolean).join(' — '),
      isCurrent: !e.end_year,
      description: '',
      isLast: i === education.length - 1,
    }));
  } else if (p.school_name && profile.user_type === 'student') {
    timeline = [{
      icon: GraduationCap, iconBg: 'bg-blue-600',
      title: p.school_name, sub: p.class_name ? `Class ${p.class_name}` : 'Student',
      period: p.board || '', isCurrent: true, description: '', isLast: true,
    }];
  } else if (p.institute_name) {
    timeline = [{
      icon: Building2, iconBg: 'bg-teal-600',
      title: p.institute_name, sub: p.subject_primary || cfg.label,
      period: p.experience_years ? `${p.experience_years} years` : '', isCurrent: true, description: '', isLast: true,
    }];
  }

  return (
    <div className="min-h-screen bg-[#F1F4F8]">

      {/* ══════════════════════════════════════════════════════
          DARK HEADER BANNER  (same structure as ProfessionalProfile)
      ══════════════════════════════════════════════════════ */}
      <div className={`relative bg-gradient-to-br ${cfg.gradient} overflow-hidden`}>
        {/* Dot texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        {/* Ambient glows */}
        <div className={`absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 ${cfg.glow1} rounded-full -mr-24 sm:-mr-48 -mt-24 sm:-mt-48 blur-3xl`} />
        <div className={`absolute bottom-0 left-1/3 w-32 sm:w-64 h-32 sm:h-64 ${cfg.glow2} rounded-full -mb-16 sm:-mb-32 blur-3xl`} />

        {/* Cover photo layer */}
        {profile.cover_photo_url && !profile.cover_photo_url.includes('PASTE_') && (
          <div className="absolute inset-0">
            <Image src={profile.cover_photo_url} alt="" fill className="object-cover opacity-20" />
          </div>
        )}

        {/* Edit cover — own only */}
        {isOwn && (
          <label className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] font-semibold cursor-pointer backdrop-blur-sm transition-colors">
            <Camera size={12} /> Edit Cover
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </label>
        )}

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-6">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white/10 border-2 border-white/20 overflow-hidden shadow-2xl">
                {hasPhoto
                  ? <Image src={profile.profile_photo_url} alt={displayName} width={112} height={112} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl font-black text-white/60">{displayName?.[0]?.toUpperCase()}</span>
                    </div>
                }
              </div>
              {profile.is_verified && (
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-400 border-2 border-[#0F172A] flex items-center justify-center">
                  <Check size={11} className="text-white" />
                </div>
              )}
              {isOwn && (
                <label className="absolute inset-0 rounded-2xl cursor-pointer group flex items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/40 transition-colors" />
                  <Camera size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity relative z-10" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight mb-1">{displayName}</h1>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3">
                <p className="text-[13px] font-semibold text-white/80">
                  {subtitle.main}
                  {subtitle.accent && (
                    <> <span className="text-white/50">·</span> <span className={cfg.accent}>{subtitle.accent}</span></>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {location && (
                  <span className="flex items-center gap-1 text-[11px] text-white/60 font-medium">
                    <MapPin size={11} /> {location}
                  </span>
                )}
                {(p.current_company || p.institute_name) && (
                  <span className="flex items-center gap-1 text-[11px] text-white/60 font-medium">
                    <Building2 size={11} /> {p.current_company || p.institute_name}
                  </span>
                )}
                {profile.syllabrix_id && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 bg-white/10 border border-white/20 text-[9px] font-black text-white/80 uppercase tracking-widest rounded-full">
                    <Shield size={9} /> {profile.syllabrix_id}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0 self-start md:self-end">
              {isOwn ? (
                <Link href="/settings"
                  className="flex items-center gap-1.5 px-4 py-2 bg-white text-blue-900 text-[11px] font-black rounded-xl hover:bg-blue-50 transition-all shadow-lg">
                  <Pencil size={13} /> Edit Profile
                </Link>
              ) : (
                <>
                  <button onClick={handleFollow}
                    className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-black rounded-xl transition-all shadow-lg ${
                      following
                        ? 'bg-white/20 hover:bg-white/30 border border-white/30 text-white'
                        : 'bg-white text-blue-900 hover:bg-blue-50'
                    }`}>
                    {following ? <><UserCheck size={13} /> Following</> : <><UserPlus size={13} /> Follow</>}
                  </button>
                  <Link href={`/messages/${userId}`}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-colors">
                    <MessageSquare size={15} />
                  </Link>
                  <button onClick={() => setIsReportOpen(true)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/30 hover:bg-red-500/50 border border-red-300/30 text-white transition-colors">
                    <ShieldAlert size={15} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          STATS ROW  (identical position as ProfessionalProfile)
      ══════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white border-x border-b border-gray-100 rounded-b-2xl shadow-sm overflow-x-auto">
          <div className="grid grid-cols-3 divide-x divide-gray-100 min-w-[280px]">
            {stats.map((s, i) => <StatCol key={i} {...s} />)}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          BODY  (2/3 main + 1/3 sidebar — same as ProfessionalProfile)
      ══════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">

          {/* ── LEFT — main content (2 cols) ── */}
          <div className="lg:col-span-2 space-y-0">

            {/* Identity card */}
            <div className="bg-white rounded-t-2xl border border-gray-100 border-b-0 px-7 pt-7 pb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-[0.1em]">
                  {profile.user_type === 'student'   ? 'Academic Identity' :
                   profile.user_type === 'teacher'   ? 'Teaching Identity' :
                   profile.user_type === 'mentor'    ? 'Mentor Profile' :
                   profile.user_type === 'parent'    ? 'About' :
                   'Professional Identity'}
                </h2>
                <Target size={16} className="text-gray-200" />
              </div>

              <p className="text-[13px] text-gray-600 leading-relaxed mb-5 font-medium">
                {profile.bio || p.professional_summary || p.about ||
                  (profile.user_type === 'student'   ? 'Ambitious learner passionate about knowledge and growth.' :
                   profile.user_type === 'teacher'   ? 'Dedicated educator committed to shaping future minds.' :
                   profile.user_type === 'mentor'    ? 'Experienced professional dedicated to guiding and inspiring others.' :
                   profile.user_type === 'parent'    ? 'Active community member supporting children\'s education journey.' :
                   'Results-oriented professional with expertise in delivering enterprise-scale impact.')
                }
              </p>

              {skillTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skillTags.map(tag => <SkillTag key={tag} label={tag} />)}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="bg-white border-x border-gray-100">
              <div className="mx-7 border-t border-gray-100" />
            </div>

            {/* Timeline card */}
            <div className="bg-white border border-gray-100 border-t-0 px-7 pt-6 pb-7" style={{ borderRadius: achievements.length > 0 ? '0' : '0 0 1rem 1rem' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-[0.1em]">
                  {profile.user_type === 'student' ? 'Education' :
                   profile.user_type === 'teacher' ? 'Teaching Experience' :
                   'Experience'}
                </h2>
                <Briefcase size={16} className="text-gray-200" />
              </div>

              {timeline.length > 0 ? (
                <div className="space-y-0">
                  {timeline.map((item, i) => <TimelineItem key={i} {...item} />)}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <History size={20} className="text-gray-300" />
                  </div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">No history added yet</p>
                </div>
              )}
            </div>

            {/* Achievements card */}
            {achievements.length > 0 && (
              <>
                <div className="bg-white border-x border-gray-100">
                  <div className="mx-7 border-t border-gray-100" />
                </div>
                <div className="bg-white rounded-b-2xl border border-gray-100 border-t-0 px-7 pt-6 pb-7">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-[0.1em]">Achievements</h2>
                    <Award size={16} className="text-gray-200" />
                  </div>
                  <div className="space-y-3">
                    {achievements.map((a, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                          <span className="text-sm">🏆</span>
                        </div>
                        <p className="text-[13px] text-gray-700 font-medium">{typeof a === 'string' ? a : a?.title || a?.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Posts section */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-black text-gray-700 uppercase tracking-[0.1em] flex items-center gap-2">
                  Posts
                  {posts.length > 0 && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-black rounded-full">{posts.length}</span>}
                </h2>
              </div>

              {posts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <BookOpen size={20} className="text-gray-300" />
                  </div>
                  <p className="text-[12px] font-bold text-gray-400">No posts yet</p>
                  <p className="text-[11px] text-gray-400 mt-1">{isOwn ? 'Share your first post!' : 'Nothing shared yet.'}</p>
                </div>
              ) : (
                <>
                  {(postsExpanded ? posts : posts.slice(0, 3)).map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                  {posts.length > 3 && (
                    <button
                      onClick={() => setPostsExpanded(v => !v)}
                      className="w-full py-3 rounded-2xl bg-white border border-gray-100 text-[12px] font-bold text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                    >
                      {postsExpanded ? 'Show less' : `Show all ${posts.length} posts`}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-4">

            {/* Badges */}
            {badges.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 px-5 py-5 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-4">Badges & Recognition</p>
                <div className="grid grid-cols-3 gap-2">
                  {badges.slice(0, 6).map(b => (
                    <motion.div key={b.id} whileHover={{ y: -2 }}
                      title={b.description}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl bg-amber-50 border border-amber-100 cursor-default">
                      <span className="text-xl">{b.icon_emoji || '🏅'}</span>
                      <p className="text-[9px] font-bold text-gray-600 text-center leading-tight truncate w-full">{b.name}</p>
                    </motion.div>
                  ))}
                </div>
                {badges.length > 6 && (
                  <p className="text-[10px] text-gray-400 text-center mt-2 font-semibold">+{badges.length - 6} more</p>
                )}
              </div>
            )}

            {/* Connectivity */}
            <div className="bg-white rounded-2xl border border-gray-100 px-5 py-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3">Connectivity</p>
              <div className="divide-y divide-gray-50">
                <ConnectLink icon={Mail}     label="Email"     value={profile.email || p.email || '—'} href={profile.email ? `mailto:${profile.email}` : null} />
                {p.linkedin_url && <ConnectLink icon={Linkedin}  label="LinkedIn"   value="View Profile"  href={p.linkedin_url} />}
                {(p.portfolio_url || p.website) && <ConnectLink icon={Globe} label="Website" value={p.portfolio_url || p.website} href={p.portfolio_url || p.website} />}
                {!p.linkedin_url && !p.portfolio_url && !p.website && (
                  <p className="py-3 text-[11px] text-gray-400 font-medium">No social links added.</p>
                )}
              </div>
            </div>

            {/* Social stats */}
            <div className="bg-white rounded-2xl border border-gray-100 px-5 py-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-4">Network</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { v: profile.posts_count || 0, l: 'Posts' },
                  { v: profile.followers_count || 0, l: 'Followers' },
                  { v: profile.following_count || 0, l: 'Following' },
                ].map(({ v, l }) => (
                  <div key={l} className="py-2">
                    <p className="text-[16px] font-black text-gray-900">{v}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight card — only if they have a score */}
            {profile.syllabrix_score > 0 && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl px-5 py-5 text-white shadow-lg shadow-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={13} className="text-blue-200" />
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-200">Syllabrix Score</p>
                </div>
                <p className="text-3xl font-black text-white">{parseFloat(profile.syllabrix_score).toFixed(0)}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white/70 rounded-full" style={{ width: `${Math.min(100, profile.syllabrix_score)}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-white/80">/{100}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetUserId={userId}
        targetName={profile.username}
      />
    </div>
  );
}
