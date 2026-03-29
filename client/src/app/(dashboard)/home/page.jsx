'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { postsAPI } from '@/lib/api/posts.api';
import { aiAPI } from '@/lib/api/ai.api';
import CreatePostBox from '@/components/feed/CreatePostBox';
import PostCard from '@/components/feed/PostCard';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api-client';
import {
  Map, Sparkles, GraduationCap, Brain, FlaskConical, Newspaper,
  Flame, TrendingUp, Loader2, BookOpen, Trophy, ArrowRight, Zap, Target,
  Gamepad2, Mic, MessageSquare, ChevronRight, Code, Award, Star,
  Play, Store, Building2, Users, Calendar, FileText
} from 'lucide-react';
import AdPanel from '@/components/ads/AdPanel';

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [streak, setStreak] = useState(null);
  const [newsHeadlines, setNewsHeadlines] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const loadFeed = useCallback(async (p = 1) => {
    try {
      const res = await postsAPI.getFeed({ page: p, limit: 10 });
      const data = res.data?.data || res.data || [];
      const pagination = res.data?.pagination;
      if (p === 1) setPosts(data); else setPosts(prev => [...prev, ...data]);
      setHasMore(pagination?.hasNext ?? data.length === 10);
      setPage(p);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadFeed();
    apiClient.get('/moderation/my-streak').then(r => setStreak(r.data?.data)).catch(() => {});
    aiAPI.getNewsroom({ days: 1, limit: 4 }).then(r => {
      const data = r.data?.data || r.data;
      setNewsHeadlines((data.articles || data || []).slice(0, 4));
    }).catch(() => {}).finally(() => setNewsLoading(false));
  }, [loadFeed]);

  const handlePostCreated = (p) => setPosts(prev => [p, ...prev]);
  const handleDeletePost = (id) => setPosts(prev => prev.filter(p => p.id !== id));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex gap-5">
      {/* ═══ MAIN FEED — left/center column ═══ */}
      <div className="flex-1 min-w-0 max-w-[600px] space-y-4">
        {/* Greeting */}
        <div className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[16px] font-bold text-gray-800">{greeting}, {user?.profile?.full_name || user?.username}! 👋</h1>
              <p className="text-[12px] text-gray-400 mt-0.5">Ready to learn something new today?</p>
            </div>
            {streak?.current_streak > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200/50 rounded-lg px-3 py-1.5">
                <Flame size={16} className="text-orange-500" />
                <span className="text-[14px] font-extrabold text-orange-600">{streak.current_streak}</span>
                <span className="text-[9px] text-orange-400 font-medium">day streak</span>
              </div>
            )}
          </div>

          {/* Quick action chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {[
              { label: 'Daily Quiz', href: '/prep/daily-quiz', emoji: '🧠' },
              { label: 'Newsroom', href: '/newsroom', emoji: '📰' },
              { label: 'AI Buddy', href: '/ai-buddy', emoji: '✨' },
              { label: 'Mind Map', href: '/mindmap', emoji: '🗺️' },
              { label: 'Arcade', href: '/arcade', emoji: '🎮' },
              { label: 'Clips', href: '/clips', emoji: '▶️' },
            ].map((a, i) => (
              <Link key={i} href={a.href}
                className="flex items-center gap-1 bg-[#F0F2F5] hover:bg-[#E4E6EB] rounded-full px-3 py-1.5 text-[12px] font-medium text-gray-600 transition-colors">
                <span className="text-[13px]">{a.emoji}</span> {a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Create Post */}
        <CreatePostBox onPostCreated={handlePostCreated} />

        {/* Feed */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-12 text-center">
            <Loader2 size={24} className="animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-gray-400 text-[13px]">Loading your feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <BookOpen size={24} className="text-blue-400" />
            </div>
            <p className="font-bold text-gray-700 text-[15px]">Your feed is empty</p>
            <p className="text-[13px] text-gray-400 mt-1 mb-4">Follow people or create your first post</p>
            <Link href="/explore" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-blue-600 text-white hover:bg-blue-700">
              Discover People <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <>
            {posts.map((post, i) => <PostCard key={post.id || i} post={post} onDelete={handleDeletePost} />)}
            {hasMore && (
              <button onClick={() => loadFeed(page + 1)}
                className="w-full py-2.5 rounded-lg text-[13px] font-medium text-blue-600 hover:bg-blue-50 transition-colors">
                Load more posts
              </button>
            )}
          </>
        )}
      </div>

      {/* ═══ RIGHT SIDEBAR ═══ */}
      <div className="hidden lg:flex w-[280px] flex-shrink-0 flex-col gap-3 sticky top-[72px] self-start max-h-[calc(100vh-88px)] overflow-y-auto scrollbar-hide pb-4">

        {/* ── News Widget — always visible ── */}
        <div className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <h3 className="text-[13px] font-bold text-gray-800 flex items-center gap-1.5">
              <Newspaper size={13} className="text-blue-500" /> Today&apos;s News
            </h3>
            <Link href="/newsroom" className="text-[11px] font-semibold text-blue-600 hover:text-blue-700">See all</Link>
          </div>
          <div className="px-4 pb-3 space-y-2.5">
            {newsLoading ? (
              [1,2,3].map(i => (
                <div key={i} className="space-y-1 animate-pulse">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-2 bg-gray-100 rounded w-1/3 mt-1" />
                </div>
              ))
            ) : newsHeadlines.length > 0 ? (
              newsHeadlines.map((n, i) => (
                <Link key={i} href="/newsroom" className="block group">
                  <p className="text-[12px] font-semibold text-gray-700 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">{n.headline || n.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{n.source || 'Education Today'}</p>
                </Link>
              ))
            ) : (
              [
                { title: 'NEP 2025 reforms to reshape school education across India', source: 'Education Times' },
                { title: 'AI tools are transforming how students learn and prepare for exams', source: 'Tech in Education' },
                { title: 'Career guidance programs see surge in student participation', source: 'Youth India' },
                { title: 'Top colleges open applications for 2025–26 admissions', source: 'Admission Desk' },
              ].map((n, i) => (
                <Link key={i} href="/newsroom" className="block group">
                  <p className="text-[12px] font-semibold text-gray-700 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">{n.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{n.source}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* ── Quick Access Grid ── */}
        <div className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4">
          <h3 className="text-[13px] font-bold text-gray-800 mb-3">Quick Access</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { href: '/career-explorer', icon: Map, label: 'Careers', color: 'bg-blue-100 text-blue-600' },
              { href: '/virtual-lab', icon: FlaskConical, label: 'Lab', color: 'bg-purple-100 text-purple-600' },
              { href: '/ai-buddy', icon: Sparkles, label: 'AI Chat', color: 'bg-emerald-100 text-emerald-600' },
              { href: '/prep', icon: GraduationCap, label: 'Prep', color: 'bg-amber-100 text-amber-600' },
              { href: '/mindmap', icon: Brain, label: 'Mind Map', color: 'bg-rose-100 text-rose-600' },
              { href: '/arcade', icon: Gamepad2, label: 'Arcade', color: 'bg-cyan-100 text-cyan-600' },
              { href: '/code-lab', icon: Code, label: 'Code', color: 'bg-gray-100 text-gray-600' },
              { href: '/mock-interview', icon: Mic, label: 'Interview', color: 'bg-indigo-100 text-indigo-600' },
              { href: '/business-explorer', icon: Store, label: 'Business', color: 'bg-orange-100 text-orange-600' },
            ].map((f, i) => (
              <Link key={i} href={f.href} className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-[#F0F2F5] transition-all group">
                <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <f.icon size={18} />
                </div>
                <span className="text-[10px] font-medium text-gray-500 text-center leading-tight">{f.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Daily Challenge ── */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-blue-200" />
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-blue-200">Daily Challenge</h3>
          </div>
          <p className="text-[13px] font-semibold leading-snug">Take today&apos;s quiz and maintain your streak!</p>
          <Link href="/prep/daily-quiz" className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white text-blue-700 hover:bg-blue-50 transition-colors">
            Start Quiz <ChevronRight size={12} />
          </Link>
        </div>

        {/* ── Trending Topics ── */}
        <div className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4">
          <h3 className="text-[13px] font-bold text-gray-800 mb-3 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-emerald-500" /> Trending Topics
          </h3>
          <div className="space-y-1">
            {[
              { tag: '#ExamPrep2026', count: '2.4K', category: 'Education' },
              { tag: '#AILearning', count: '1.8K', category: 'Technology' },
              { tag: '#CareerExplore', count: '1.2K', category: 'Careers' },
              { tag: '#NEP2025', count: '987', category: 'Policy' },
              { tag: '#CodingForKids', count: '743', category: 'Skills' },
            ].map((item, i) => (
              <Link key={i} href={`/explore?q=${encodeURIComponent(item.tag)}`}
                className="flex items-start justify-between py-1.5 group rounded-lg px-1 hover:bg-[#F0F2F5] transition-colors">
                <div>
                  <p className="text-[10px] text-gray-400">{item.category} · Trending</p>
                  <p className="text-[12px] font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{item.tag}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1">{item.count} posts</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Top Learners ── */}
        <div className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4">
          <h3 className="text-[13px] font-bold text-gray-800 mb-2 flex items-center gap-1.5">
            <Trophy size={14} className="text-amber-500" /> Top Learners
          </h3>
          <div className="space-y-2">
            {[
              { name: 'Aarav', xp: 1200 },
              { name: 'Priya', xp: 1050 },
              { name: 'Rohan', xp: 900 },
            ].map(({ name, xp }, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center flex-shrink-0 ${
                  i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : 'bg-orange-300 text-white'
                }`}>{i + 1}</span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">{name[0]}</div>
                <span className="text-[12px] font-medium text-gray-700 flex-1 truncate">{name}</span>
                <span className="text-[10px] text-gray-400">{xp} XP</span>
              </div>
            ))}
          </div>
          <Link href="/leaderboard" className="block mt-2 text-center py-1.5 rounded-lg text-[11px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
            View All Rankings
          </Link>
        </div>

        {/* Ad Panel */}
        <AdPanel />

        {/* Footer */}
        <div className="px-2 py-1">
          <p className="text-[10px] text-gray-400 leading-relaxed">
            <Link href="/pricing" className="hover:text-gray-600">Premium</Link> · <Link href="/settings" className="hover:text-gray-600">Settings</Link> · <Link href="/" className="hover:text-gray-600">About</Link>
          </p>
          <p className="text-[9px] text-gray-300 mt-1">© 2026 Syllabrix</p>
        </div>
      </div>
    </div>
  );
}
