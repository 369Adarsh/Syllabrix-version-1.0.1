'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { postsAPI } from '@/lib/api/posts.api';
import { getPlatformMode } from '@/utils/platformMode';
import {
  getAgeTier, getDailyChallenge, getDailyCards, ACTIVITY_TYPES,
} from '@/data/young-explorer-feed';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import {
  Heart, MessageCircle, Plus, Sparkles, BookOpen, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const GREETING = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const activityMeta = (hashtags = []) =>
  ACTIVITY_TYPES.find(a => hashtags.includes(a.id)) || ACTIVITY_TYPES[7];

const timeAgo = (dateStr) => {
  const s = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (s < 60)   return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

function AICard({ card, className = '' }) {
  const [open, setOpen] = useState(false);
  const bgMap = { habit: 'from-amber-400 to-orange-400', activity: 'from-teal-400 to-emerald-400', story: 'from-violet-400 to-purple-500' };
  const labelMap = { habit: '✨ Habit', activity: '🎯 Activity', story: '📖 Story' };

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-md cursor-pointer select-none ${className}`}
      onClick={() => setOpen(o => !o)}
    >
      <div className={`bg-gradient-to-br ${card.color || bgMap[card.type]} p-4`}>
        <p className="text-[10px] font-black text-white/80 uppercase tracking-widest mb-1">{labelMap[card.type]}</p>
        <div className="flex items-start gap-2">
          <span className="text-2xl leading-none mt-0.5">{card.emoji}</span>
          <div>
            <p className="font-black text-white text-[14px] leading-snug">{card.title}</p>
            {(card.time || card.moral) && (
              <p className="text-[11px] text-white/70 mt-0.5">{card.time || `Moral: ${card.moral}`}</p>
            )}
          </div>
        </div>
        {open && (
          <div className="mt-3 pt-3 border-t border-white/20">
            {card.lines
              ? card.lines.map((l, i) => <p key={i} className="text-white/90 text-[13px] leading-relaxed mb-1">{l}</p>)
              : <p className="text-white/90 text-[13px] leading-relaxed">{card.body || card.instruction}</p>}
            {card.moral && (
              <p className="mt-2 text-white font-bold text-[12px]">💡 {card.moral}</p>
            )}
          </div>
        )}
        <p className="text-[11px] text-white/60 mt-2">{open ? 'Tap to close ▲' : 'Tap to read more ▼'}</p>
      </div>
    </div>
  );
}

function DailyChallenge({ challenge }) {
  const [done, setDone] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden shadow-md"
      style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}>
      <div className="px-5 py-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-white/80" />
          <span className="text-[11px] font-black text-white/80 uppercase tracking-widest">Daily Challenge</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-4xl leading-none">{challenge.emoji}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-white text-[17px] leading-tight">{challenge.title}</h3>
            <p className="text-white/85 text-[13px] mt-1 leading-relaxed">{challenge.desc}</p>
            <p className="text-white/70 text-[12px] mt-1">Reward: {challenge.reward}</p>
          </div>
        </div>
        <button
          onClick={() => { setDone(true); toast.success('Amazing! Challenge marked done! 🌟', { icon: challenge.reward }); }}
          disabled={done}
          className={`mt-4 w-full py-2.5 rounded-xl font-black text-[14px] transition-all ${done ? 'bg-white/20 text-white/60' : 'bg-white text-orange-600 shadow-md hover:shadow-lg active:scale-[0.98]'}`}
        >
          {done ? '✅ Done for today!' : "✋ I'll do this today!"}
        </button>
      </div>
    </div>
  );
}

function PostCard({ post, currentUserId }) {
  const [liked, setLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const meta = activityMeta(post.hashtags || []);
  const isOwn = post.user_id === currentUserId;

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikeCount(c => c + (next ? 1 : -1));
    try { await postsAPI.like(post.id, { reaction_type: 'like' }); }
    catch { setLiked(!next); setLikeCount(c => c + (next ? -1 : 1)); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="relative flex-shrink-0">
          <Avatar src={post.profile_photo_url} size="sm" className="w-10 h-10 ring-2 ring-amber-200" />
          <span className="absolute -bottom-1 -right-1 text-sm leading-none">{meta.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-gray-900 text-[14px] truncate">{post.full_name || post.username}</p>
          <p className="text-[11px] text-gray-400">{timeAgo(post.created_at)}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex-shrink-0 ${meta.color}`}>
          {meta.emoji} {meta.label}
        </span>
      </div>

      {post.content && (
        <p className="px-4 pb-3 text-[14px] text-gray-800 leading-relaxed">{post.content}</p>
      )}

      {post.media_url && (
        <div className="px-4 pb-3">
          <img src={post.media_url} alt="activity" className="w-full rounded-xl object-cover max-h-64" />
        </div>
      )}

      <div className="flex items-center gap-4 px-4 pb-4 pt-1 border-t border-gray-50">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-[13px] font-bold transition-colors ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>
        <button className="flex items-center gap-1.5 text-[13px] font-bold text-gray-400 hover:text-blue-400 transition-colors">
          <MessageCircle size={16} />
          {post.comments_count > 0 && <span>{post.comments_count}</span>}
        </button>
        {isOwn && <span className="ml-auto text-[10px] text-amber-500 font-bold">⭐ Your post</span>}
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-2xl p-4 space-y-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
              <div className="h-2.5 bg-gray-100 rounded-lg w-1/5" />
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded-lg" />
          <div className="h-3 bg-gray-100 rounded-lg w-4/5" />
        </div>
      ))}
    </div>
  );
}

function EmptyFeed({ onPost }) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-amber-200">
      <p className="text-4xl mb-3">🌱</p>
      <h3 className="font-black text-gray-800 text-[16px]">Be the first to share!</h3>
      <p className="text-gray-500 text-[13px] mt-1 mb-4">Share a drawing, a dance, or something amazing you did today.</p>
      <button onClick={onPost} className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black rounded-full text-[14px] shadow-md hover:shadow-lg transition-all">
        ✨ Share Now
      </button>
    </div>
  );
}

export default function MyWorldPage() {
  const { user } = useAuth();
  const router = useRouter();
  const mode = getPlatformMode(user);

  useEffect(() => {
    if (user && mode !== 'young_explorer') router.replace('/home');
  }, [user, mode, router]);

  const tier = getAgeTier(user?.profile);
  const challenge = getDailyChallenge(tier);
  const cards = getDailyCards(tier);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await postsAPI.getFeed({ limit: 30, page: 1 });
      setPosts(res.data?.data || []);
    } catch {
      // show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const goPost = () => router.push('/my-world/post');

  const greetName = user?.full_name?.split(' ')[0] || user?.username || 'Explorer';
  const classLabel = user?.profile?.class_name ? `${user.profile.class_name}` : '';

  if (!user || mode !== 'young_explorer') return null;

  const filtered = tab === 'my' ? posts.filter(p => p.user_id === user?.id) : posts;

  return (
    <div className="space-y-6">

      {/* Hero — full width */}
      <div className="rounded-2xl overflow-hidden shadow-md"
        style={{ background: 'linear-gradient(135deg, #FCD34D, #F97316)' }}>
        <div className="px-6 py-6 md:px-10 md:py-8 relative">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between gap-6">
            <div>
              <p className="text-[11px] font-black text-white/70 uppercase tracking-widest">{GREETING()}</p>
              <h1 className="text-white font-extrabold text-2xl md:text-3xl leading-tight mt-0.5">{greetName}! 🌈</h1>
              {classLabel && (
                <span className="inline-block mt-2 px-3 py-0.5 bg-white/20 rounded-full text-[11px] font-bold text-white">
                  📚 {classLabel}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button onClick={goPost}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-white rounded-xl text-orange-600 font-extrabold text-[13px] shadow-md hover:shadow-lg active:scale-[0.97] transition-all">
                <Plus size={15} /> Share Today
              </button>
              <button
                onClick={() => router.push('/stories')}
                className="flex items-center justify-center gap-1.5 px-5 py-2 bg-white/20 rounded-xl text-white font-bold text-[13px]">
                <BookOpen size={14} /> Stories
              </button>
            </div>
            <span className="text-6xl md:text-7xl flex-shrink-0 hidden sm:block">🌟</span>
          </div>
        </div>
      </div>

      {/* Two-column desktop layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — Community Feed (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Community Feed</p>
            <div className="flex gap-2">
              {[
                { id: 'all', label: '🌍 All' },
                { id: 'my',  label: '⭐ Mine' },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`px-4 py-1.5 rounded-xl font-bold text-[12px] transition-all ${tab === t.id ? 'bg-amber-400 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? <FeedSkeleton /> : (() => {
            if (!filtered.length) return <EmptyFeed onPost={goPost} />;
            return (
              <div className="space-y-4">
                {filtered.map((post, i) => (
                  <div key={post.id}>
                    <PostCard post={post} currentUserId={user?.id} />
                    {(i + 1) % 3 === 0 && i < filtered.length - 1 && (
                      <div className="mt-4">
                        <AICard card={cards[i % cards.length]} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* RIGHT — Sidebar (1/3) */}
        <div className="space-y-5">
          {/* Daily Challenge */}
          <DailyChallenge challenge={challenge} />

          {/* Today's Picks */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles size={14} className="text-amber-500" />
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Today's Picks</p>
            </div>
            <div className="space-y-3">
              {cards.map((card, i) => (
                <AICard key={i} card={card} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={goPost}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center z-30 active:scale-95 transition-all"
        style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}
      >
        <Plus size={24} className="text-white" />
      </button>
    </div>
  );
}
