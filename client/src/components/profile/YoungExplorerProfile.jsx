'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api/auth.api';
import { uploadAPI } from '@/lib/api/upload.api';
import { postsAPI } from '@/lib/api/posts.api';
import {
  ACTIVITY_TYPES, BADGES, computeBadges, YOUNG_CLASSES,
} from '@/data/young-explorer-feed';
import Avatar from '@/components/ui/Avatar';
import {
  Camera, Pencil, CheckCircle, Loader2, X, Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// ─── Static options ───────────────────────────────────────────────────────────
const SUBJECTS  = ['Maths', 'Science', 'English', 'Hindi', 'Social Studies', 'Art', 'Music', 'Sports', 'Computer', 'Other'];
const HOBBIES   = ['Reading', 'Drawing', 'Dancing', 'Singing', 'Cooking', 'Gardening', 'Playing games', 'Cycling', 'Crafts', 'Watching cartoons', 'Other'];
const SPORTS_L  = ['Cricket', 'Football', 'Badminton', 'Chess', 'Kabaddi', 'Basketball', 'Swimming', 'Athletics', 'Table Tennis', 'Other'];
const AMBITIONS = ['Doctor', 'Teacher', 'Scientist', 'Pilot', 'Artist', 'Engineer', 'Dancer', 'Cricketer', 'Astronaut', 'Chef', 'Singer', 'Other'];
const BOARDS    = ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'Other'];

// ─── Pill Toggle ─────────────────────────────────────────────────────────────
const PillToggle = ({ label, options, selected = [], onChange, max = 6, color = 'amber' }) => {
  const colors = {
    amber: { active: 'bg-amber-400 text-white border-amber-400', inactive: 'bg-white text-gray-600 border-gray-200 hover:border-amber-300' },
    teal:  { active: 'bg-teal-500 text-white border-teal-500',   inactive: 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'  },
    blue:  { active: 'bg-blue-500 text-white border-blue-500',   inactive: 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'  },
  };
  const c = colors[color] || colors.amber;
  const toggle = (v) => {
    const arr = typeof selected === 'string' ? (selected ? [selected] : []) : (selected || []);
    if (arr.includes(v)) { onChange(arr.filter(x => x !== v)); }
    else if (arr.length < max) { onChange([...arr, v]); }
    else { toast.error(`Pick up to ${max}`); }
  };
  const arr = typeof selected === 'string' ? (selected ? [selected] : []) : (selected || []);
  return (
    <div>
      {label && <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button key={o} type="button" onClick={() => toggle(o)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold border transition-all ${arr.includes(o) ? c.active : c.inactive}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Stat Chip ────────────────────────────────────────────────────────────────
const StatChip = ({ emoji, label, value }) => (
  <div className="flex flex-col items-center gap-0.5">
    <span className="text-xl">{emoji}</span>
    <span className="text-[18px] font-black text-gray-900">{value}</span>
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
  </div>
);

// ─── Post Mini Card ───────────────────────────────────────────────────────────
const PostMini = ({ post }) => {
  const meta = ACTIVITY_TYPES.find(a => post.hashtags?.includes(a.id)) || ACTIVITY_TYPES[7];
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
      {post.media_url
        ? <img src={post.media_url} alt="activity" className="w-full h-24 object-cover" />
        : (
          <div className={`w-full h-24 flex items-center justify-center text-3xl bg-gradient-to-br from-amber-50 to-orange-50`}>
            {meta.emoji}
          </div>
        )}
      <div className="px-2 py-1.5">
        <p className="text-[10px] font-bold text-gray-600 truncate">{post.content || meta.label}</p>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function YoungExplorerProfile({ onSave }) {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  const p = user?.profile || {};

  const normalizeArr = (v) => {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; }
  };

  const [form, setForm] = useState({
    full_name:         user?.full_name || '',
    school_name:       p.school_name || '',
    class_name:        p.class_name || '',
    board:             p.board || '',
    medium:            p.medium || '',
    favorite_subject:  p.favorite_subject || '',
    difficult_subject: p.difficult_subject || '',
    hobby:             normalizeArr(p.hobby),
    sports:            normalizeArr(p.sports),
    ambition:          p.ambition || '',
  });

  useEffect(() => {
    setForm({
      full_name:         user?.full_name || '',
      school_name:       p.school_name || '',
      class_name:        p.class_name || '',
      board:             p.board || '',
      medium:            p.medium || '',
      favorite_subject:  p.favorite_subject || '',
      difficult_subject: p.difficult_subject || '',
      hobby:             normalizeArr(p.hobby),
      sports:            normalizeArr(p.sports),
      ambition:          p.ambition || '',
    });
  }, [user?.id]);

  const loadPosts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await postsAPI.getUserPosts(user.id, { limit: 20 });
      setPosts(res.data?.data || []);
    } catch {} finally { setPostsLoading(false); }
  }, [user?.id]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const earnedBadges = computeBadges(posts);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile({
        school_name:       form.school_name,
        class_name:        form.class_name,
        board:             form.board,
        medium:            form.medium,
        favorite_subject:  form.favorite_subject,
        difficult_subject: form.difficult_subject,
        hobby:             form.hobby,
        sports:            form.sports,
        ambition:          form.ambition,
      });
      await refreshUser();
      setEditing(false);
      toast.success('Profile updated! ⭐');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not save. Try again!');
    } finally {
      setSaving(false);
    }
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    try { await uploadAPI.profilePhoto(file); await refreshUser(); toast.success('Photo updated! 📸'); }
    catch { toast.error('Upload failed'); }
    finally { setPhotoLoading(false); }
  };

  const classLabel = form.class_name || 'Not set';
  const schoolLabel = form.school_name || 'No school set yet';
  const initials = (user?.full_name || user?.username || '?')[0].toUpperCase();

  return (
    <div className="max-w-lg mx-auto space-y-5 pb-24">
      {/* Hero Card */}
      <div className="rounded-3xl overflow-hidden shadow-lg"
        style={{ background: 'linear-gradient(135deg, #FCD34D, #F97316)' }}>
        <div className="px-5 pt-6 pb-5">
          {/* Avatar */}
          <div className="flex items-end gap-4 mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl ring-4 ring-white overflow-hidden shadow-xl">
                {user?.profile_photo_url
                  ? <img src={user.profile_photo_url} alt="avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-white/30 flex items-center justify-center text-4xl font-black text-white">{initials}</div>}
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:scale-110 transition-transform">
                {photoLoading ? <Loader2 size={13} className="animate-spin text-orange-500" /> : <Camera size={13} className="text-orange-500" />}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </label>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-black text-white text-[22px] leading-tight truncate">{user?.full_name || user?.username}</h1>
              <p className="text-white/80 text-[13px] font-semibold mt-0.5">{classLabel} • {schoolLabel}</p>
              <p className="text-[11px] text-white/60 mt-0.5">@{user?.username}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white/20 rounded-2xl px-4 py-3 flex items-center justify-around">
            <StatChip emoji="📝" label="Posts"  value={posts.length} />
            <div className="w-px h-8 bg-white/30" />
            <StatChip emoji="🏅" label="Badges" value={earnedBadges.length} />
            <div className="w-px h-8 bg-white/30" />
            <StatChip emoji="⭐" label="Stars"  value={posts.reduce((s, p) => s + (p.likes_count || 0), 0)} />
          </div>
        </div>
      </div>

      {/* Badges Wall */}
      {earnedBadges.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-black text-gray-900 text-[15px] mb-3 flex items-center gap-1.5">
            <Star size={15} className="text-amber-500" /> My Badges
          </h2>
          <div className="flex flex-wrap gap-3">
            {earnedBadges.map(b => (
              <div key={b.id} className="flex flex-col items-center gap-1 p-2 bg-amber-50 rounded-2xl border border-amber-100 w-[70px]">
                <span className="text-2xl">{b.emoji}</span>
                <span className="text-[10px] font-black text-amber-700 text-center leading-tight">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* About Me */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h2 className="font-black text-gray-900 text-[15px]">🌈 About Me</h2>
          {!editing
            ? <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 font-bold transition-all">
                <Pencil size={12} /> Edit
              </button>
            : <div className="flex gap-2">
                <button onClick={() => setEditing(false)}
                  className="px-3 py-1.5 text-[12px] text-gray-500 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-400 text-white text-[12px] font-black rounded-xl hover:bg-amber-500 transition-all disabled:opacity-50">
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} Save
                </button>
              </div>}
        </div>
        <div className="px-5 py-5 space-y-5">
          {editing ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1.5">My School 🏫</p>
                  <input value={form.school_name} onChange={e => setForm(f => ({ ...f, school_name: e.target.value }))}
                    placeholder="School name"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-amber-300 transition-all" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1.5">My Class 📚</p>
                  <select value={form.class_name} onChange={e => setForm(f => ({ ...f, class_name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-amber-300 transition-all">
                    <option value="">Pick class</option>
                    {YOUNG_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Board</p>
                  <select value={form.board} onChange={e => setForm(f => ({ ...f, board: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-amber-300 transition-all">
                    <option value="">Pick board</option>
                    {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Language</p>
                  <input value={form.medium} onChange={e => setForm(f => ({ ...f, medium: e.target.value }))}
                    placeholder="e.g. Hindi, English"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-amber-300 transition-all" />
                </div>
              </div>

              <PillToggle label="My Favourite Subject ❤️" options={SUBJECTS}
                selected={form.favorite_subject ? [form.favorite_subject] : []} max={1}
                onChange={arr => setForm(f => ({ ...f, favorite_subject: arr[arr.length - 1] || '' }))} color="amber" />

              <PillToggle label="Subject I'm Working On 💪" options={SUBJECTS}
                selected={form.difficult_subject ? [form.difficult_subject] : []} max={1}
                onChange={arr => setForm(f => ({ ...f, difficult_subject: arr[arr.length - 1] || '' }))} color="blue" />

              <PillToggle label="My Hobbies 🎨" options={HOBBIES}
                selected={form.hobby} onChange={arr => setForm(f => ({ ...f, hobby: arr }))} max={5} color="teal" />

              <PillToggle label="Sports I Play ⚽" options={SPORTS_L}
                selected={form.sports} onChange={arr => setForm(f => ({ ...f, sports: arr }))} max={4} color="amber" />

              <PillToggle label="What I Want to Be 🌟" options={AMBITIONS}
                selected={form.ambition ? [form.ambition] : []} max={1}
                onChange={arr => setForm(f => ({ ...f, ambition: arr[arr.length - 1] || '' }))} color="teal" />
            </>
          ) : (
            <div className="space-y-4">
              {[
                { emoji: '🏫', label: 'School',          value: p.school_name },
                { emoji: '📚', label: 'Class',           value: p.class_name },
                { emoji: '📋', label: 'Board',           value: p.board },
                { emoji: '🗣️', label: 'Language',        value: p.medium },
                { emoji: '❤️', label: 'Fav Subject',      value: p.favorite_subject },
                { emoji: '💪', label: 'Working On',      value: p.difficult_subject },
                { emoji: '🌟', label: 'Dream Job',       value: p.ambition },
              ].map(({ emoji, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="text-lg leading-none mt-0.5">{emoji}</span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">{label}</p>
                    <p className="text-[14px] text-gray-800 font-semibold mt-0.5">
                      {value || <span className="italic text-gray-400 text-[13px]">Not set yet — tap Edit!</span>}
                    </p>
                  </div>
                </div>
              ))}
              {normalizeArr(p.hobby).length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="text-lg">🎨</span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Hobbies</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {normalizeArr(p.hobby).map(h => <span key={h} className="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[12px] font-bold">{h}</span>)}
                    </div>
                  </div>
                </div>
              )}
              {normalizeArr(p.sports).length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="text-lg">⚽</span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Sports</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {normalizeArr(p.sports).map(s => <span key={s} className="px-2.5 py-0.5 bg-teal-100 text-teal-700 rounded-full text-[12px] font-bold">{s}</span>)}
                    </div>
                  </div>
                </div>
              )}
              {!p.school_name && !p.class_name && !p.favorite_subject && (
                <button onClick={() => setEditing(true)}
                  className="w-full py-3 border-2 border-dashed border-amber-200 rounded-2xl text-amber-500 font-black text-[13px] hover:bg-amber-50 transition-all">
                  ✏️ Fill in your profile — it takes 1 minute!
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* My Activities */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-gray-900 text-[15px]">🎨 My Activities</h2>
          <button onClick={() => router.push('/my-world/post')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 text-white text-[12px] font-black rounded-xl hover:bg-amber-500 transition-all">
            + Add
          </button>
        </div>
        {postsLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-gray-500 text-[13px]">No activities yet. Share your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {posts.slice(0, 9).map(post => <PostMini key={post.id} post={post} />)}
          </div>
        )}
        {posts.length > 9 && (
          <button onClick={() => router.push('/my-world')}
            className="mt-3 w-full text-center text-[12px] text-amber-500 font-bold hover:text-amber-700 transition-colors">
            See all {posts.length} activities →
          </button>
        )}
      </div>

      {/* All Badges */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-black text-gray-900 text-[15px] mb-4">🏅 All Badges to Earn</h2>
        <div className="grid grid-cols-2 gap-3">
          {BADGES.map(b => {
            const earned = earnedBadges.some(e => e.id === b.id);
            return (
              <div key={b.id} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${earned ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                <span className="text-2xl">{b.emoji}</span>
                <div>
                  <p className="font-black text-gray-800 text-[12px]">{b.label}</p>
                  <p className="text-[10px] text-gray-500">{b.desc}</p>
                  {earned && <p className="text-[10px] text-amber-600 font-bold mt-0.5">✅ Earned!</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
