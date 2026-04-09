'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { postsAPI } from '@/lib/api/posts.api';
import CreatePostBox from '@/components/feed/CreatePostBox';
import PostCard from '@/components/feed/PostCard';
import StoriesBar from '@/components/stories/StoriesBar';
import ScoreWidget from '@/components/widgets/ScoreWidget';
import NewsWidget from '@/components/widgets/NewsWidget';
import DailyChallengeWidget from '@/components/widgets/DailyChallengeWidget';
import UpcomingClassesWidget from '@/components/widgets/UpcomingClassesWidget';
import SuggestionsWidget from '@/components/widgets/SuggestionsWidget';
import BadgesWidget from '@/components/widgets/BadgesWidget';
import AdPanel from '@/components/ads/AdPanel';
import ProfileHeaderWidget from '@/components/widgets/ProfileHeaderWidget';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import {
  Flame, Loader2, ArrowRight, Sparkles, GraduationCap,
  Brain, Newspaper, Gamepad2, Compass
} from 'lucide-react';

// ─── Quick action chips ───────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'Daily quiz',  href: '/prep',          color: 'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100' },
  { label: 'AI buddy',    href: '/ai-buddy',       color: 'border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100' },
  { label: 'Newsroom',    href: '/newsroom',       color: 'border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100' },
  { label: 'Mind map',    href: '/mindmap',        color: 'border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100' },
  { label: 'Arcade',      href: '/arcade',         color: 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100' },
];

// ─── Skeleton loader for feed ─────────────────────────────────────────────────

function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-100 rounded w-1/3" />
              <div className="h-2.5 bg-gray-100 rounded w-1/4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [streak, setStreak] = useState(null);

  const loadFeed = useCallback(async (p = 1) => {
    if (p === 1) setFeedLoading(true); else setLoadingMore(true);
    try {
      const res = await postsAPI.getFeed({ page: p, limit: 10 });
      const data = res.data?.data || res.data || [];
      const pagination = res.data?.pagination;
      if (p === 1) setPosts(data); else setPosts(prev => [...prev, ...data]);
      setHasMore(pagination?.hasNext ?? data.length === 10);
      setPage(p);
    } catch {}
    finally {
      setFeedLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
    apiClient.get('/moderation/my-streak')
      .then(r => setStreak(r.data?.data))
      .catch(() => {});
  }, [loadFeed]);

  const handlePostCreated = (p) => setPosts(prev => [p, ...prev]);
  const handleDeletePost = (id) => setPosts(prev => prev.filter(p => p.id !== id));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.profile?.full_name?.split(' ')[0] || user?.username || '';

  return (
    <div className="flex gap-5">

      {/* ═══ MAIN FEED ═══ */}
      <div className="flex-1 min-w-0 space-y-3">

        {/* Profile Header (Replaces Hero) */}
        <div className="space-y-4">
          <ProfileHeaderWidget 
            user={user} 
            type="student" 
            stats={{
              posts: posts.length,
              followers: user.profile?.followers_count || 0,
              following: user.profile?.following_count || 0
            }}
          />
          
          <div className="flex flex-wrap items-center gap-2 px-1">
            {streak?.current_streak > 0 && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-[12px] font-bold text-orange-600 shadow-sm">
                <Flame size={13} className="text-orange-500" />
                <span>{streak.current_streak}-Day Streak</span>
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

        {/* Stories */}
        <StoriesBar />

        {/* Create post */}
        <CreatePostBox onPostCreated={handlePostCreated} />

        {/* Feed */}
        {feedLoading ? (
          <FeedSkeleton />
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Compass size={24} className="text-[#378ADD]" />
            </div>
            <p className="font-semibold text-gray-700 text-[15px]">Your feed is empty</p>
            <p className="text-[13px] text-gray-400 mt-1 mb-4">Follow people to see their posts here</p>
            <Link href="/explore" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-[#378ADD] text-white hover:bg-[#2d6fb5] transition-colors">
              Discover People <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <>
            {posts.map((post, i) => (
              <PostCard key={post.id || i} post={post} onDelete={handleDeletePost} />
            ))}
            {hasMore && (
              <button
                onClick={() => loadFeed(page + 1)}
                disabled={loadingMore}
                className="w-full py-2.5 rounded-xl text-[13px] font-medium text-[#378ADD] hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loadingMore ? <><Loader2 size={14} className="animate-spin" /> Loading...</> : 'Load more posts'}
              </button>
            )}
          </>
        )}
      </div>

      {/* ═══ RIGHT SIDEBAR — sticky widget column ═══ */}
      <div className="hidden lg:flex w-[280px] flex-shrink-0 flex-col gap-3 sticky top-[72px] self-start max-h-[calc(100vh-88px)] overflow-y-auto pb-4" style={{ scrollbarWidth: 'none' }}>
        <ScoreWidget />
        <NewsWidget />
        <DailyChallengeWidget />
        <UpcomingClassesWidget />
        <SuggestionsWidget />
        <BadgesWidget />
        <AdPanel />
        <p className="text-[9px] text-gray-400 px-1 leading-relaxed">
          © 2026 Syllabrix · <Link href="/settings" className="hover:text-gray-600">Privacy</Link> · <Link href="/help" className="hover:text-gray-600">Support</Link>
        </p>
      </div>

    </div>
  );
}
