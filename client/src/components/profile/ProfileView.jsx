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
import {
  MapPin, Calendar, Users, BookOpen, Award, Camera, Settings,
  MessageSquare, MoreHorizontal, Loader2, UserPlus, UserCheck,
  Briefcase, GraduationCap, Star, TrendingUp, Grid3X3, List,
  ExternalLink, Shield, Flame, CheckCircle, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfileView({ userId }) {
  const { user: me, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [tab, setTab] = useState('posts');
  const [postsView, setPostsView] = useState('list');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
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
      setFollowing(!following);
      setProfile(p => ({ ...p, followers_count: following ? p.followers_count - 1 : p.followers_count + 1 }));
      toast.success(following ? 'Unfollowed' : 'Following!');
    } catch { toast.error('Failed'); }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { await uploadAPI.coverPhoto(file); await refreshUser(); toast.success('Cover updated!'); } catch { toast.error('Failed'); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { await uploadAPI.profilePhoto(file); await refreshUser(); toast.success('Photo updated!'); } catch { toast.error('Failed'); }
  };

  const timeAgo = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-blue-500" /></div>;
  if (!profile) return <div className="text-center py-20"><p className="text-gray-400">User not found</p></div>;

  const p = profile.profile || {};
  const hasPhoto = profile.profile_photo_url && !profile.profile_photo_url.includes('PASTE_');
  const hasCover = profile.cover_photo_url && !profile.cover_photo_url.includes('PASTE_');
  const skills = p.skills ? (typeof p.skills === 'string' ? JSON.parse(p.skills) : p.skills) : [];
  const achievements = p.achievements ? (typeof p.achievements === 'string' ? JSON.parse(p.achievements) : p.achievements) : [];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* ═══ COVER + PROFILE PHOTO ═══ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Cover */}
        <div className="relative h-48 sm:h-56 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
          {hasCover && (
            <Image src={profile.cover_photo_url} alt="Cover" fill className="object-cover" />
          )}
          {/* Decorative overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          {/* Dot pattern */}
          <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)',backgroundSize:'20px 20px'}} />
          {isOwn && (
            <label className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 text-white text-[11px] font-medium cursor-pointer hover:bg-black/60 backdrop-blur-sm transition-colors">
              <Camera size={13} /> Edit Cover
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            </label>
          )}
        </div>

        {/* Profile info section */}
        <div className="px-5 sm:px-6 pb-5 relative">
          {/* Avatar */}
          <div className="relative -mt-16 mb-3">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden">
              {hasPhoto ? (
                <Image src={profile.profile_photo_url} alt={profile.username} width={128} height={128} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">{profile.username?.charAt(0)?.toUpperCase()}</span>
                </div>
              )}
            </div>
            {isOwn && (
              <label className="absolute bottom-1 right-1 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-700 transition-colors">
                <Camera size={14} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>

          {/* Name + Actions row */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-gray-900">{p.full_name || p.name || profile.username}</h1>
                {profile.is_verified && <CheckCircle size={18} className="text-blue-500" />}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-gray-500">@{profile.username}</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold capitalize">{profile.user_type}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {isOwn ? (
                <Link href="/settings"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
                  <Settings size={14} /> Edit Profile
                </Link>
              ) : (
                <>
                  <button onClick={handleFollow}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      following
                        ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700'
                    }`}>
                    {following ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
                  </button>
                  <Link href={`/messages/${userId}`}
                    className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all">
                    <MessageSquare size={16} />
                  </Link>
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    title="Report User"
                    className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-100"
                  >
                    <ShieldAlert size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-gray-600 leading-relaxed mt-3">{profile.bio}</p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[12px] text-gray-500">
            {p.school_name && <span className="flex items-center gap-1"><GraduationCap size={13} className="text-gray-400" /> {p.school_name}{p.class_name ? ` — Class ${p.class_name}` : ''}</span>}
            {p.institute_name && <span className="flex items-center gap-1"><Briefcase size={13} className="text-gray-400" /> {p.institute_name}</span>}
            {p.subject_primary && <span className="flex items-center gap-1"><BookOpen size={13} className="text-gray-400" /> {p.subject_primary}</span>}
            {(profile.city || profile.state) && <span className="flex items-center gap-1"><MapPin size={13} className="text-gray-400" /> {[profile.city, profile.state].filter(Boolean).join(', ')}</span>}
            <span className="flex items-center gap-1"><Calendar size={13} className="text-gray-400" /> Joined {timeAgo(profile.created_at)}</span>
          </div>

          {/* Stats row — Instagram style */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-lg font-extrabold text-gray-900">{profile.posts_count || 0}</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-gray-900">{profile.followers_count || 0}</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-gray-900">{profile.following_count || 0}</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Following</p>
            </div>
            {profile.syllabrix_score > 0 && (
              <div className="text-center ml-auto">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-amber-500" />
                  <p className="text-lg font-extrabold text-amber-600">{parseFloat(profile.syllabrix_score).toFixed(0)}</p>
                </div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Score</p>
              </div>
            )}
          </div>

          {/* Skills chips */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {skills.slice(0, 8).map((s, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold border border-blue-100">{s}</span>
              ))}
              {skills.length > 8 && <span className="px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 text-[10px] font-semibold">+{skills.length - 8} more</span>}
            </div>
          )}
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
        {[
          { k: 'posts', l: 'Posts', icon: Grid3X3 },
          { k: 'about', l: 'About', icon: BookOpen },
          { k: 'badges', l: `Badges (${badges.length})`, icon: Award },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              tab === t.k ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}>
            <t.icon size={13} /> {t.l}
          </button>
        ))}
      </div>

      {/* ═══ TAB CONTENT ═══ */}
      {tab === 'posts' && (
        <>
          {posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <Grid3X3 size={28} className="text-gray-300 mx-auto mb-3" />
              <p className="font-bold text-gray-600">No posts yet</p>
              <p className="text-sm text-gray-400 mt-1">{isOwn ? 'Share your first post!' : 'This user hasn\'t posted yet.'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          )}
        </>
      )}

      {tab === 'about' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          {/* Education / Work */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Details</p>
            <div className="space-y-3">
              {p.school_name && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0"><GraduationCap size={16} className="text-blue-500" /></div>
                  <div><p className="text-sm font-semibold text-gray-800">{p.school_name}</p><p className="text-[11px] text-gray-400">{p.class_name ? `Class ${p.class_name}` : 'Student'}{p.board ? ` · ${p.board}` : ''}</p></div>
                </div>
              )}
              {p.institute_name && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0"><Briefcase size={16} className="text-purple-500" /></div>
                  <div><p className="text-sm font-semibold text-gray-800">{p.institute_name}</p><p className="text-[11px] text-gray-400">{p.subject_primary || profile.user_type}</p></div>
                </div>
              )}
              {p.subject_primary && !p.institute_name && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0"><BookOpen size={16} className="text-emerald-500" /></div>
                  <div><p className="text-sm font-semibold text-gray-800">Teaches {p.subject_primary}</p>{p.experience_years && <p className="text-[11px] text-gray-400">{p.experience_years} years experience</p>}</div>
                </div>
              )}
              {(profile.city || profile.state) && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0"><MapPin size={16} className="text-amber-500" /></div>
                  <div><p className="text-sm font-semibold text-gray-800">{[profile.city, profile.state].filter(Boolean).join(', ')}</p><p className="text-[11px] text-gray-400">Location</p></div>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Skills</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-semibold border border-indigo-100">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Achievements</p>
              <div className="space-y-2">
                {achievements.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700"><Trophy size={14} className="text-amber-500" /> {typeof a === 'string' ? a : a.title || a.name}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'badges' && (
        <>
          {badges.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <Award size={28} className="text-gray-300 mx-auto mb-3" />
              <p className="font-bold text-gray-600">No badges yet</p>
              <p className="text-sm text-gray-400 mt-1">Complete activities to earn badges!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {badges.map(b => (
                <div key={b.id} className="bg-white rounded-2xl border border-amber-200/50 p-4 text-center shadow-sm">
                  <span className="text-3xl block mb-2">{b.icon_emoji || '🏅'}</span>
                  <p className="text-xs font-bold text-gray-800">{b.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{b.description}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {/* ═══ MODALS ═══ */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetUserId={userId}
        targetName={profile.username}
      />
    </div>
  );
}
