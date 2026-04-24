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
  MapPin, Calendar, Users, BookOpen, Award, Camera, Settings,
  MessageSquare, Loader2, UserPlus, UserCheck,
  Briefcase, GraduationCap, Star, Grid3X3,
  CheckCircle, ShieldAlert, Building2, Mail, Globe,
  TrendingUp, Zap, Target, Heart, Hash, ExternalLink,
  Linkedin, Phone
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Per-type visual config ────────────────────────────────────────────────────
const TYPE_CFG = {
  student:             { gradient: 'from-[#1a2a6c] via-[#2563EB] to-[#3b82f6]', accent: '#60a5fa', label: 'Student',          icon: GraduationCap },
  teacher:             { gradient: 'from-[#0f4c3a] via-[#059669] to-[#34d399]', accent: '#6ee7b7', label: 'Teacher',          icon: BookOpen },
  professional_learner:{ gradient: 'from-[#1e1b4b] via-[#4f46e5] to-[#7c3aed]', accent: '#a78bfa', label: 'Professional',     icon: Briefcase },
  mentor:              { gradient: 'from-[#451a03] via-[#b45309] to-[#f59e0b]', accent: '#fde68a', label: 'Mentor',           icon: Star },
  hr_professional:     { gradient: 'from-[#4a044e] via-[#9333ea] to-[#c084fc]', accent: '#e9d5ff', label: 'HR Professional',  icon: Users },
  parent:              { gradient: 'from-[#052e16] via-[#16a34a] to-[#4ade80]', accent: '#bbf7d0', label: 'Parent',           icon: Heart },
  organization:        { gradient: 'from-[#0f172a] via-[#1e40af] to-[#3b82f6]', accent: '#93c5fd', label: 'Organization',     icon: Building2 },
};
const getCfg = t => TYPE_CFG[t] || TYPE_CFG.professional_learner;

// ── Highlight strip per type ──────────────────────────────────────────────────
function getHighlights(profile, p) {
  const t = profile?.user_type;
  if (t === 'student') return [
    { icon: GraduationCap, label: 'School',    value: p.school_name  || '—' },
    { icon: BookOpen,      label: 'Class',     value: p.class_name ? `Class ${p.class_name}` : '—' },
    { icon: Hash,          label: 'Board',     value: p.board        || '—' },
  ];
  if (t === 'teacher') return [
    { icon: BookOpen,  label: 'Subject',    value: p.subject_primary || '—' },
    { icon: Briefcase, label: 'Experience', value: p.experience_years ? `${p.experience_years} yrs` : '—' },
    { icon: Building2, label: 'Institute',  value: p.institute_name  || '—' },
  ];
  if (t === 'professional_learner') return [
    { icon: Briefcase,   label: 'Role',       value: p.current_role || profile.bio?.split(' ').slice(0, 3).join(' ') || '—' },
    { icon: Building2,   label: 'Company',    value: p.current_company || '—' },
    { icon: TrendingUp,  label: 'Experience', value: p.experience_years ? `${p.experience_years} yrs` : '—' },
  ];
  if (t === 'hr_professional') return [
    { icon: Building2, label: 'Company',   value: p.current_company || '—' },
    { icon: Briefcase, label: 'Industry',  value: p.industry        || '—' },
    { icon: Users,     label: 'Recruiter', value: 'Talent Acquisition' },
  ];
  if (t === 'mentor') return [
    { icon: Star,    label: 'Domain',     value: p.subject_primary || p.industry || '—' },
    { icon: Zap,     label: 'Experience', value: p.experience_years ? `${p.experience_years} yrs` : '—' },
    { icon: Target,  label: 'Focus',      value: p.stream || 'Mentoring' },
  ];
  if (t === 'parent') return [
    { icon: MapPin,    label: 'Location', value: [profile.city, profile.state].filter(Boolean).join(', ') || '—' },
    { icon: Users,     label: 'Member',   value: 'Parent Community' },
    { icon: Heart,     label: 'Role',     value: 'Parent' },
  ];
  if (t === 'organization') return [
    { icon: Building2, label: 'Industry', value: p.industry    || '—' },
    { icon: Users,     label: 'Size',     value: p.org_size    || '—' },
    { icon: Globe,     label: 'Type',     value: p.org_type    || 'Organization' },
  ];
  return [];
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
const StatPill = ({ value, label }) => (
  <div className="text-center px-4 py-3">
    <p className="text-[18px] font-black text-gray-900 leading-none">{value}</p>
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
  </div>
);

// ── Skill chip ────────────────────────────────────────────────────────────────
const Chip = ({ label, color = 'bg-indigo-50 text-indigo-700 border-indigo-100' }) => (
  <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${color}`}>{label}</span>
);

export default function ProfileView({ userId }) {
  const { user: me, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [tab, setTab] = useState('posts');
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
    <div className="flex items-center justify-center py-24">
      <Loader2 size={28} className="animate-spin text-indigo-500" />
    </div>
  );
  if (!profile) return (
    <div className="text-center py-24">
      <p className="text-gray-400 text-sm">User not found.</p>
    </div>
  );

  const p = profile.profile || {};
  const cfg = getCfg(profile.user_type);
  const Icon = cfg.icon;
  const hasPhoto = profile.profile_photo_url && !profile.profile_photo_url.includes('PASTE_');
  const hasCover = profile.cover_photo_url  && !profile.cover_photo_url.includes('PASTE_');
  const skills = p.skills ? (typeof p.skills === 'string' ? JSON.parse(p.skills) : p.skills) : [];
  const achievements = p.achievements ? (typeof p.achievements === 'string' ? JSON.parse(p.achievements) : p.achievements) : [];
  const highlights = getHighlights(profile, p);
  const displayName = p.full_name || p.name || profile.username;
  const workHistory = Array.isArray(p.work_history) ? p.work_history : (typeof p.work_history === 'string' ? (() => { try { return JSON.parse(p.work_history); } catch { return []; } })() : []);
  const education = Array.isArray(p.education) ? p.education : (typeof p.education === 'string' ? (() => { try { return JSON.parse(p.education); } catch { return []; } })() : []);

  // ── sub-title shown on the banner ─────────────────────────────────────────
  let subTitle = '';
  if (p.current_role && p.current_company) subTitle = `${p.current_role} at ${p.current_company}`;
  else if (p.current_role) subTitle = p.current_role;
  else if (p.school_name) subTitle = `${p.class_name ? `Class ${p.class_name} · ` : ''}${p.school_name}`;
  else if (p.institute_name) subTitle = p.institute_name;
  else if (p.subject_primary) subTitle = p.subject_primary;
  else subTitle = cfg.label;

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-10">

      {/* ══════════════════════════════════════════════════════
          HERO CARD
      ══════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Banner */}
        <div className={`relative h-52 sm:h-60 bg-gradient-to-r ${cfg.gradient} overflow-hidden`}>
          {hasCover && <Image src={profile.cover_photo_url} alt="" fill className="object-cover opacity-40" />}
          {/* Dot texture */}
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Edit cover – own only */}
          {isOwn && (
            <label className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 text-white text-[11px] font-semibold cursor-pointer hover:bg-black/60 backdrop-blur-sm transition-colors z-10">
              <Camera size={12} /> Edit Cover
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            </label>
          )}

          {/* Profile photo — positioned inside banner left */}
          <div className="absolute bottom-[-48px] left-5 sm:left-7 z-10">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white">
                {hasPhoto ? (
                  <Image src={profile.profile_photo_url} alt={displayName} width={112} height={112} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${cfg.gradient} flex items-center justify-center`}>
                    <span className="text-white font-black text-3xl">{displayName?.charAt(0)?.toUpperCase()}</span>
                  </div>
                )}
              </div>
              {isOwn && (
                <label className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-700 transition-colors border-2 border-white">
                  <Camera size={13} className="text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
              {profile.is_verified && (
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                  <CheckCircle size={12} className="text-white" />
                </span>
              )}
            </div>
          </div>

          {/* Name block inside banner (right of photo) */}
          <div className="absolute bottom-4 left-[120px] sm:left-[140px] right-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-white text-xl sm:text-2xl font-black leading-tight drop-shadow-sm truncate">{displayName}</h1>
              <p className="text-[13px] font-semibold mt-0.5 truncate" style={{ color: cfg.accent }}>{subTitle}</p>
              {(profile.city || profile.state) && (
                <p className="text-white/70 text-[11px] font-medium mt-0.5 flex items-center gap-1">
                  <MapPin size={10} /> {[profile.city, profile.state].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isOwn ? (
                <Link href="/settings"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-[12px] font-bold hover:bg-white/30 transition-colors border border-white/30">
                  <Settings size={13} /> Edit Profile
                </Link>
              ) : (
                <>
                  <button onClick={handleFollow}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${
                      following
                        ? 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-red-500/70'
                        : 'bg-white text-gray-900 hover:bg-blue-50 shadow-sm'
                    }`}>
                    {following ? <><UserCheck size={13} /> Following</> : <><UserPlus size={13} /> Follow</>}
                  </button>
                  <Link href={`/messages/${userId}`}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 transition-colors">
                    <MessageSquare size={15} />
                  </Link>
                  <button
                    onClick={() => setIsReportOpen(true)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/30 backdrop-blur-sm text-white border border-red-300/30 hover:bg-red-500/50 transition-colors">
                    <ShieldAlert size={15} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats + user type badge ── */}
        <div className="pt-14 pb-1 px-5 sm:px-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r ${cfg.gradient} text-white`}>
                <Icon size={11} /> {cfg.label}
              </div>
              <span className="text-[11px] text-gray-400">@{profile.username}</span>
            </div>
            {profile.syllabrix_id && (
              <span className="text-[10px] font-black text-blue-600 tracking-tight">ID: {profile.syllabrix_id}</span>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-gray-600 leading-relaxed mt-3 max-w-xl">{profile.bio}</p>
          )}
        </div>

        {/* Stats row */}
        <div className="flex divide-x divide-gray-100 border-t border-gray-100 mt-3">
          <StatPill value={profile.posts_count || 0} label="Posts" />
          <StatPill value={profile.followers_count || 0} label="Followers" />
          <StatPill value={profile.following_count || 0} label="Following" />
          {(profile.syllabrix_score > 0) && (
            <div className="text-center px-4 py-3 flex-1">
              <p className="text-[18px] font-black text-amber-500 leading-none">{parseFloat(profile.syllabrix_score).toFixed(0)}</p>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">Score</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Highlight strip ── */}
      {highlights.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {highlights.map((h, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                <h.icon size={14} className="text-gray-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{h.label}</p>
                <p className="text-[13px] font-bold text-gray-800 truncate mt-0.5">{h.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Skills preview strip ── */}
      {skills.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 mb-3">Skills & Expertise</p>
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 10).map((s, i) => (
              <Chip key={i} label={typeof s === 'string' ? s : s.name || s} />
            ))}
            {skills.length > 10 && <Chip label={`+${skills.length - 10} more`} color="bg-gray-50 text-gray-500 border-gray-100" />}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TABS
      ══════════════════════════════════════════════════════ */}
      <div className="flex gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        {[
          { k: 'posts',  l: 'Posts',  icon: Grid3X3 },
          { k: 'about',  l: 'About',  icon: BookOpen },
          { k: 'badges', l: `Badges${badges.length ? ` (${badges.length})` : ''}`, icon: Award },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[12px] font-bold transition-all ${
              tab === t.k
                ? `bg-white text-gray-900 shadow-sm`
                : 'text-gray-400 hover:text-gray-600 hover:bg-white/60'
            }`}>
            <t.icon size={13} /> {t.l}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB: POSTS
      ══════════════════════════════════════════════════════ */}
      {tab === 'posts' && (
        posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm">
            <Grid3X3 size={30} className="text-gray-200 mx-auto mb-3" />
            <p className="font-bold text-gray-600 text-sm">No posts yet</p>
            <p className="text-xs text-gray-400 mt-1">{isOwn ? 'Share your first post!' : 'Nothing here yet.'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: ABOUT
      ══════════════════════════════════════════════════════ */}
      {tab === 'about' && (
        <div className="space-y-3">

          {/* Bio / Summary */}
          {(p.bio || profile.bio || p.professional_summary) && (
            <Section title="About" icon={BookOpen}>
              <p className="text-[14px] text-gray-700 leading-relaxed">{p.professional_summary || p.bio || profile.bio}</p>
            </Section>
          )}

          {/* Work Experience */}
          {workHistory.length > 0 && (
            <Section title="Experience" icon={Briefcase}>
              <div className="space-y-5">
                {workHistory.map((w, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100">
                      <Building2 size={16} className="text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[14px] font-bold text-gray-900">{w.role || w.title}</p>
                          <p className="text-[13px] text-blue-600 font-semibold">{w.company}</p>
                        </div>
                        {(w.is_current || w.end_date === null) && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100 flex-shrink-0">PRESENT</span>
                        )}
                      </div>
                      {(w.start_date || w.end_date) && (
                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Calendar size={10} />
                          {w.start_date && new Date(w.start_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          {' — '}
                          {w.is_current || !w.end_date ? 'Present' : new Date(w.end_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </p>
                      )}
                      {w.description && <p className="text-[12px] text-gray-500 mt-1.5 leading-relaxed">{w.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Education */}
          {(education.length > 0 || p.school_name || p.education_level) && (
            <Section title="Education" icon={GraduationCap}>
              <div className="space-y-4">
                {education.map((e, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-100">
                      <GraduationCap size={16} className="text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-gray-900">{e.institution || e.college || e.school}</p>
                      <p className="text-[13px] text-gray-500">{e.degree || e.field || e.course}</p>
                      {(e.start_year || e.end_year) && (
                        <p className="text-[11px] text-gray-400 mt-0.5">{e.start_year} — {e.end_year || 'Present'}</p>
                      )}
                    </div>
                  </div>
                ))}
                {/* Fallback for students with school_name */}
                {education.length === 0 && p.school_name && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-100">
                      <GraduationCap size={16} className="text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-gray-900">{p.school_name}</p>
                      <p className="text-[13px] text-gray-500">{p.class_name ? `Class ${p.class_name}` : ''}{p.board ? ` · ${p.board}` : ''}</p>
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Skills (full) */}
          {skills.length > 0 && (
            <Section title="Skills" icon={Zap}>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <Chip key={i} label={typeof s === 'string' ? s : s.name || s} />
                ))}
              </div>
            </Section>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <Section title="Achievements" icon={Award}>
              <div className="space-y-2.5">
                {achievements.map((a, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-100">
                      <span className="text-sm">🏆</span>
                    </div>
                    <p className="text-[13px] text-gray-700 font-medium">{typeof a === 'string' ? a : a.title || a.name}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Location & Meta */}
          <Section title="Info" icon={MapPin}>
            <div className="space-y-3">
              {(profile.city || profile.state) && (
                <InfoRow icon={MapPin} value={[profile.city, profile.state].filter(Boolean).join(', ')} label="Location" />
              )}
              {profile.created_at && (
                <InfoRow icon={Calendar} value={new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} label="Joined" />
              )}
              {p.email && <InfoRow icon={Mail} value={p.email} label="Email" />}
              {p.website && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0"><Globe size={13} className="text-gray-400" /></div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Website</p>
                    <a href={p.website} target="_blank" rel="noreferrer" className="text-[13px] text-blue-600 hover:underline truncate flex items-center gap-1">{p.website} <ExternalLink size={10} /></a>
                  </div>
                </div>
              )}
              {p.linkedin_url && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0"><Linkedin size={13} className="text-blue-600" /></div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">LinkedIn</p>
                    <a href={p.linkedin_url} target="_blank" rel="noreferrer" className="text-[13px] text-blue-600 hover:underline truncate flex items-center gap-1">View Profile <ExternalLink size={10} /></a>
                  </div>
                </div>
              )}
            </div>
          </Section>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: BADGES
      ══════════════════════════════════════════════════════ */}
      {tab === 'badges' && (
        badges.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm">
            <Award size={30} className="text-gray-200 mx-auto mb-3" />
            <p className="font-bold text-gray-600 text-sm">No badges yet</p>
            <p className="text-xs text-gray-400 mt-1">Complete activities to earn badges!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.map(b => (
              <motion.div
                key={b.id}
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl border border-amber-100 p-5 text-center shadow-sm"
              >
                <span className="text-4xl block mb-2">{b.icon_emoji || '🏅'}</span>
                <p className="text-[13px] font-bold text-gray-800">{b.name}</p>
                <p className="text-[11px] text-gray-400 mt-1 leading-snug">{b.description}</p>
              </motion.div>
            ))}
          </div>
        )
      )}

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetUserId={userId}
        targetName={profile.username}
      />
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50">
        <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center">
          <Icon size={13} className="text-gray-500" />
        </div>
        <h2 className="text-[14px] font-black text-gray-900 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
        <Icon size={13} className="text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-[13px] text-gray-800 font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
