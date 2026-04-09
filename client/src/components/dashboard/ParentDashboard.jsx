'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { postsAPI } from '@/lib/api/posts.api';
import { parentAPI } from '@/lib/api/parent.api';
import apiClient from '@/lib/api-client';
import Link from 'next/link';
import Image from 'next/image';
import CreatePostBox from '@/components/feed/CreatePostBox';
import PostCard from '@/components/feed/PostCard';
import SafetyStatusWidget from '@/components/widgets/SafetyStatusWidget';
import PendingApprovalsWidget from '@/components/widgets/PendingApprovalsWidget';
import ParentScoreWidget from '@/components/widgets/ParentScoreWidget';
import WeeklyDigestWidget from '@/components/widgets/WeeklyDigestWidget';
import NewsWidget from '@/components/widgets/NewsWidget';
import ParentProUpsellWidget from '@/components/widgets/ParentProUpsellWidget';
import {
  ShieldCheck, Flame, Loader2, ArrowRight, Users, Clock,
  BookOpen, Newspaper, Brain, Sparkles, Star, Trophy, ExternalLink
} from 'lucide-react';
import ProfileHeaderWidget from '@/components/widgets/ProfileHeaderWidget';

// ─── Quick action chips ───────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'Safety command', href: '/parent-dashboard', color: 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100' },
  { label: 'My feed',        href: '/home?tab=feed',    color: 'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100' },
  { label: 'Newsroom',       href: '/newsroom',         color: 'border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100' },
  { label: 'AI buddy',       href: '/ai-buddy',         color: 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100' },
];

// ─── Child avatar helper ──────────────────────────────────────────────────────

function ChildAvatar({ child, size = 36 }) {
  const hasPhoto = child?.profile_photo_url && !child.profile_photo_url.includes('PASTE_');
  const initials = child?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const colors = ['from-blue-400 to-blue-600', 'from-pink-400 to-rose-500', 'from-amber-400 to-orange-500', 'from-violet-400 to-purple-500'];
  const colorClass = colors[(child?.id || 0) % colors.length];

  return (
    <div
      className={`rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center overflow-hidden flex-shrink-0`}
      style={{ width: size, height: size }}
    >
      {hasPhoto ? (
        <Image src={child.profile_photo_url} alt="" width={size} height={size} className="w-full h-full object-cover" />
      ) : (
        <span className="text-white font-bold" style={{ fontSize: size * 0.35 }}>{initials}</span>
      )}
    </div>
  );
}

// ─── Child status card ────────────────────────────────────────────────────────

function ChildStatusCard({ child }) {
  const [score, setScore] = useState(null);
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    if (!child?.user_id && !child?.id) return;
    const uid = child.user_id || child.id;
    apiClient.get(`/score/${uid}`).then(r => setScore(r.data?.data || r.data)).catch(() => {});
    parentAPI.getChildActivity(child.id).then(r => {
      const data = r.data?.data || r.data || [];
      setActivity(Array.isArray(data) ? data : []);
    }).catch(() => setActivity([]));
  }, [child?.id, child?.user_id]);

  const todayMin = activity
    ? activity
        .filter(a => {
          const d = new Date(a.created_at || a.timestamp);
          return d.toDateString() === new Date().toDateString();
        })
        .reduce((sum, a) => sum + (a.duration_minutes || 0), 0)
    : null;

  const totalScore = score?.total_score ?? score?.score ?? null;
  const hasFlags = child?.has_flags || child?.safety_flags > 0;
  const hasPending = child?.pending_approvals > 0;
  const dotColor = hasFlags ? 'bg-red-500' : hasPending ? 'bg-amber-400' : 'bg-emerald-500';

  return (
    <Link
      href={`/parent-dashboard/children/${child.id}`}
      className="flex items-center gap-2.5 bg-white rounded-xl border border-gray-100 px-3 py-3 hover:border-emerald-200 hover:shadow-sm transition-all"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      <ChildAvatar child={child} size={34} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-800 truncate">
          {child.full_name?.split(' ')[0] || child.full_name}
          {child.class_name ? <span className="text-gray-400 font-normal"> · Cl. {child.class_name}</span> : null}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {totalScore !== null && (
            <span className="text-[11px] text-gray-500">Score: <span className="font-semibold text-emerald-600">{totalScore}</span></span>
          )}
          {todayMin !== null && todayMin >= 0 && (
            <span className="text-[11px] text-gray-400">
              · {todayMin >= 60 ? `${Math.floor(todayMin / 60)}h ${todayMin % 60}m` : `${todayMin}m`} today
            </span>
          )}
        </div>
      </div>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
    </Link>
  );
}

// ─── Children activity timeline ───────────────────────────────────────────────

function ChildActivityTimeline({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!children.length) { setLoading(false); return; }
    const colors = ['#378ADD', '#E879A1', '#F59E0B', '#8B5CF6'];
    Promise.allSettled(children.map(c => parentAPI.getChildActivity(c.id)))
      .then(results => {
        const merged = [];
        results.forEach((r, i) => {
          const acts = (r.status === 'fulfilled' ? (r.value.data?.data || r.value.data || []) : []);
          const arr = Array.isArray(acts) ? acts : [];
          arr.forEach(a => merged.push({ ...a, _child: children[i], _color: colors[i % colors.length] }));
        });
        merged.sort((a, b) => new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp));
        setItems(merged.slice(0, 20));
      })
      .finally(() => setLoading(false));
  }, [children]);

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-3/4" />
            <div className="h-2.5 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  if (!items.length) return (
    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
      <Users size={28} className="text-gray-300 mx-auto mb-3" />
      <p className="font-semibold text-gray-500 text-[14px]">No activity yet</p>
      <p className="text-[12px] text-gray-400 mt-1">Your children&apos;s activity will appear here</p>
    </div>
  );

  const timeAgo = (ts) => {
    if (!ts) return '';
    const diff = Math.round((Date.now() - new Date(ts)) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-3.5 flex gap-3" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <ChildAvatar child={item._child} size={32} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-gray-700 leading-snug">
              <span className="font-semibold" style={{ color: item._color }}>{item._child.full_name?.split(' ')[0]}</span>
              {' '}{item.description || item.activity_type || 'was active on Syllabrix'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-gray-400">{timeAgo(item.created_at || item.timestamp)}</span>
              {item.xp_earned > 0 && <span className="text-[11px] font-semibold text-emerald-600">+{item.xp_earned} XP</span>}
              {item.feature && <span className="text-[11px] text-gray-400">· {item.feature}</span>}
            </div>
          </div>
          {item.post_id && (
            <Link href={`/post/${item.post_id}`} className="text-blue-500 hover:text-blue-600 flex-shrink-0 mt-0.5">
              <ExternalLink size={13} />
            </Link>
          )}
        </div>
      ))}
      <Link href="/parent-dashboard/activity" className="block text-center text-[12px] text-blue-500 font-medium py-2 hover:underline">
        View all activity →
      </Link>
    </div>
  );
}

// ─── My Learning tab ──────────────────────────────────────────────────────────

function ParentLearningTab() {
  const { user } = useAuth();
  const [aiHistory, setAiHistory] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      apiClient.get('/ai/buddy/history'),
      apiClient.get('/quizzes/my-attempts'),
      apiClient.get('/newsroom/latest'),
    ]).then(([aiRes, quizRes, newsRes]) => {
      if (aiRes.status === 'fulfilled') {
        const d = aiRes.value.data?.data || aiRes.value.data || [];
        setAiHistory(Array.isArray(d) ? d.slice(0, 3) : []);
      }
      if (quizRes.status === 'fulfilled') {
        const d = quizRes.value.data?.data || quizRes.value.data || [];
        setQuizAttempts(Array.isArray(d) ? d.slice(0, 3) : []);
      }
      if (newsRes.status === 'fulfilled') {
        const d = newsRes.value.data?.data || newsRes.value.data || [];
        setNews(Array.isArray(d) ? d.slice(0, 2) : []);
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-3">
      {[1,2].map(i => <div key={i} className="bg-white rounded-xl border border-gray-100 h-24 animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* AI Buddy history */}
      <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-purple-500" />
            <p className="text-[13px] font-semibold text-gray-700">AI Buddy</p>
          </div>
          <Link href="/ai-buddy" className="text-[11px] text-blue-500 font-medium">Open →</Link>
        </div>
        {aiHistory.length === 0 ? (
          <p className="text-[12px] text-gray-400">No conversations yet — start chatting with AI Buddy!</p>
        ) : (
          <div className="space-y-2">
            {aiHistory.map((h, i) => (
              <div key={i} className="text-[12px] text-gray-600 bg-gray-50 rounded-lg px-3 py-2 truncate">
                {h.title || h.first_message || 'Conversation'}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quiz attempts */}
      <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy size={15} className="text-amber-500" />
            <p className="text-[13px] font-semibold text-gray-700">PrepSmart</p>
          </div>
          <Link href="/prep" className="text-[11px] text-blue-500 font-medium">Open →</Link>
        </div>
        {quizAttempts.length === 0 ? (
          <p className="text-[12px] text-gray-400">No quizzes attempted yet</p>
        ) : (
          <div className="space-y-2">
            {quizAttempts.map((q, i) => (
              <div key={i} className="flex items-center justify-between text-[12px]">
                <span className="text-gray-600 truncate flex-1 mr-2">{q.quiz_title || 'Quiz'}</span>
                <span className="font-semibold text-emerald-600 flex-shrink-0">{q.score ?? q.percentage ?? '—'}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Newsroom */}
      <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Newspaper size={15} className="text-teal-500" />
            <p className="text-[13px] font-semibold text-gray-700">Newsroom</p>
          </div>
          <Link href="/newsroom" className="text-[11px] text-blue-500 font-medium">See all →</Link>
        </div>
        {news.length === 0 ? (
          <p className="text-[12px] text-gray-400">No news available</p>
        ) : (
          <div className="space-y-2.5">
            {news.map((n, i) => (
              <p key={i} className="text-[12px] text-gray-600 leading-snug line-clamp-2">{n.title || n.headline}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Screen time strip ────────────────────────────────────────────────────────

function ScreenTimeStrip({ children }) {
  const [data, setData] = useState({});

  useEffect(() => {
    children.forEach(child => {
      parentAPI.getChildScreenTime(child.id)
        .then(r => {
          const d = r.data?.data || r.data;
          setData(prev => ({ ...prev, [child.id]: d }));
        })
        .catch(() => {});
    });
  }, [children]);

  if (!children.length) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-400" />
          <p className="text-[13px] font-semibold text-gray-700">Screen time today</p>
        </div>
        <Link href="/parent-dashboard/screen-time" className="text-[11px] text-blue-500 font-medium">Set limits →</Link>
      </div>
      <div className="space-y-2.5">
        {children.map((child, i) => {
          const childData = data[child.id];
          const usedMin = childData?.used_minutes ?? childData?.today_minutes ?? 0;
          const limitMin = childData?.limit_minutes ?? 120;
          const pct = Math.min(100, Math.round((usedMin / limitMin) * 100));
          const gradients = ['from-blue-400 to-blue-600', 'from-pink-400 to-rose-500', 'from-amber-400 to-orange-500', 'from-violet-400 to-purple-500'];
          const grad = gradients[i % gradients.length];
          const fmt = (m) => m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;

          return (
            <div key={child.id}>
              <div className="flex items-center justify-between text-[12px] mb-1">
                <span className="font-medium text-gray-700">{child.full_name?.split(' ')[0]}</span>
                <span className="text-gray-400">{fmt(usedMin)} / {fmt(limitMin)}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${grad} rounded-full transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main ParentDashboard ─────────────────────────────────────────────────────

export default function ParentDashboard() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') === 'feed' ? 'feed' : searchParams?.get('tab') === 'learning' ? 'learning' : 'activity';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [children, setChildren] = useState([]);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [streak, setStreak] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [posts, setPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedPage, setFeedPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    parentAPI.getChildren()
      .then(r => setChildren(r.data?.data || r.data || []))
      .catch(() => setChildren([]))
      .finally(() => setChildrenLoading(false));

    apiClient.get('/moderation/my-streak')
      .then(r => setStreak(r.data?.data))
      .catch(() => {});

    parentAPI.getPendingApprovals()
      .then(r => {
        const d = r.data?.data || r.data || [];
        setPendingCount(Array.isArray(d) ? d.length : 0);
      })
      .catch(() => {});
  }, []);

  const loadFeed = useCallback(async (p = 1) => {
    if (p === 1) setFeedLoading(true); else setLoadingMore(true);
    try {
      const res = await postsAPI.getFeed({ page: p, limit: 10 });
      const data = res.data?.data || res.data || [];
      const pagination = res.data?.pagination;
      if (p === 1) setPosts(data); else setPosts(prev => [...prev, ...data]);
      setHasMore(pagination?.hasNext ?? data.length === 10);
      setFeedPage(p);
    } catch {}
    finally { setFeedLoading(false); setLoadingMore(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'feed') loadFeed(1);
  }, [activeTab, loadFeed]);

  const handlePostCreated = (p) => setPosts(prev => [p, ...prev]);
  const handleDeletePost = (id) => setPosts(prev => prev.filter(p => p.id !== id));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.profile?.full_name?.split(' ')[0] || user?.profile?.parent_name?.split(' ')[0] || user?.username || '';
  const currentStreak = streak?.current_streak ?? 0;

  const TABS = [
    { id: 'activity', label: "Children's activity" },
    { id: 'feed',     label: 'My feed' },
    { id: 'learning', label: 'My learning' },
  ];

  return (
    <div className="flex gap-5">

      {/* ═══ MAIN FEED ═══ */}
      <div className="flex-1 min-w-0 space-y-3">

        {/* Profile Header (Replaces Hero) */}
        <div className="space-y-4">
          <ProfileHeaderWidget 
            user={user} 
            type="parent" 
            stats={{
              posts: posts.length,
              followers: user.profile?.followers_count || 0,
              following: user.profile?.following_count || 0
            }}
          />
          
          <div className="flex flex-wrap items-center gap-2 px-1">
            {!childrenLoading && children.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[12px] font-bold text-emerald-700 shadow-sm">
                <ShieldCheck size={13} />
                <span>{children.length} {children.length === 1 ? 'Child' : 'Children'} Linked</span>
              </div>
            )}
            {currentStreak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-[12px] font-bold text-orange-600 shadow-sm">
                <Flame size={13} className="text-orange-500" />
                <span>{currentStreak}-Day Streak</span>
              </div>
            )}
            {QUICK_ACTIONS.map(a => (
              <Link
                key={a.href}
                href={a.href}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors shadow-sm ${a.color}`}
              >
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Children status strip */}
        {childrenLoading ? (
          <div className="grid grid-cols-2 gap-2 animate-pulse">
            {[1,2].map(i => <div key={i} className="h-16 bg-white rounded-xl border border-gray-100" />)}
          </div>
        ) : children.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-emerald-200 p-5 text-center">
            <Users size={22} className="text-emerald-300 mx-auto mb-2" />
            <p className="text-[13px] font-semibold text-gray-600">No children linked yet</p>
            <Link href="/parent-dashboard/link-child" className="inline-block mt-2 text-[12px] text-emerald-600 font-semibold hover:underline">
              + Link a child
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {children.map(child => <ChildStatusCard key={child.id} child={child} />)}
          </div>
        )}

        {/* Tab bar */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex border-b border-gray-100">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-2 py-2.5 text-[12px] font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-emerald-700'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-emerald-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-3">
            {activeTab === 'activity' && (
              children.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-[13px] text-gray-400">Link a child to see their activity</p>
                </div>
              ) : (
                <ChildActivityTimeline children={children} />
              )
            )}

            {activeTab === 'feed' && (
              <div className="space-y-3">
                <CreatePostBox onPostCreated={handlePostCreated} />
                {feedLoading ? (
                  <div className="space-y-3">
                    {[1,2].map(i => (
                      <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                        <div className="flex gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3 bg-gray-100 rounded w-1/3" />
                            <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                          </div>
                        </div>
                        <div className="h-3 bg-gray-100 rounded w-4/5" />
                      </div>
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-[13px] font-semibold text-gray-500">Your feed is empty</p>
                    <p className="text-[12px] text-gray-400 mt-1">Follow teachers and parents to see posts</p>
                    <Link href="/explore" className="inline-flex items-center gap-1 mt-3 px-4 py-2 rounded-lg text-[12px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                      Discover People <ArrowRight size={12} />
                    </Link>
                  </div>
                ) : (
                  <>
                    {posts.map((post, i) => (
                      <PostCard key={post.id || i} post={post} onDelete={handleDeletePost} />
                    ))}
                    {hasMore && (
                      <button
                        onClick={() => loadFeed(feedPage + 1)}
                        disabled={loadingMore}
                        className="w-full py-2 rounded-xl text-[13px] font-medium text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {loadingMore ? <><Loader2 size={14} className="animate-spin" /> Loading...</> : 'Load more'}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'learning' && <ParentLearningTab />}
          </div>
        </div>

        {/* Screen time strip */}
        {children.length > 0 && <ScreenTimeStrip children={children} />}

      </div>

      {/* ═══ RIGHT SIDEBAR ═══ */}
      <div className="hidden lg:flex w-[280px] flex-shrink-0 flex-col gap-3 sticky top-[72px] self-start max-h-[calc(100vh-88px)] overflow-y-auto pb-4" style={{ scrollbarWidth: 'none' }}>
        <SafetyStatusWidget children={children} />
        <PendingApprovalsWidget />
        <ParentScoreWidget />
        <WeeklyDigestWidget children={children} />
        <NewsWidget />
        <ParentProUpsellWidget />
        <p className="text-[9px] text-gray-400 px-1 leading-relaxed">
          © 2026 Syllabrix · <Link href="/settings" className="hover:text-gray-600">Privacy</Link> · <Link href="/help" className="hover:text-gray-600">Support</Link>
        </p>
      </div>

    </div>
  );
}
