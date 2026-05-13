'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getPlatformMode } from '@/utils/platformMode';
import { resolveStudentCurriculum, getPrimaryExams } from '@/data/curriculum-map';
import { postsAPI } from '@/lib/api/posts.api';
import CreatePostBox from '@/components/feed/CreatePostBox';
import PostCard from '@/components/feed/PostCard';
import ScoreWidget from '@/components/widgets/ScoreWidget';
import NewsWidget from '@/components/widgets/NewsWidget';
import DailyChallengeWidget from '@/components/widgets/DailyChallengeWidget';
import SuggestionsWidget from '@/components/widgets/SuggestionsWidget';
import BadgesWidget from '@/components/widgets/BadgesWidget';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import {
  Flame, Loader2, ArrowRight, Sparkles, GraduationCap,
  Brain, Newspaper, Gamepad2, Zap, BookOpen, Target,
  BarChart2, Users, CheckCircle2, Circle, Trophy, Map, BookMarked, ChevronRight
} from 'lucide-react';

// ─── Per-mode config ──────────────────────────────────────────────────────────

const MODE_CONFIG = {
  young_explorer: {
    greeting: (name) => `Hello ${name}! 🌈`,
    subtitle: "Ready for today's adventure?",
    tasks: [
      { icon: '🔤', label: 'Play a word game', href: '/learn-play', color: 'bg-amber-50 border-amber-200' },
      { icon: '📖', label: 'Read a story',     href: '/stories',    color: 'bg-orange-50 border-orange-200' },
      { icon: '🎮', label: 'Visit the Arcade', href: '/arcade',     color: 'bg-red-50 border-red-200' },
    ],
    quickLinks: [
      { label: 'Learn & Play', href: '/learn-play', icon: Gamepad2 },
      { label: 'Stories',      href: '/stories',    icon: BookOpen },
      { label: 'AI Buddy',     href: '/ai-buddy',   icon: Sparkles },
      { label: 'Arcade',       href: '/arcade',     icon: Trophy },
    ],
    showFeed: false,
    showExamCountdown: false,
  },
  curious_mind: {
    greeting: (name) => `Hey ${name}!`,
    subtitle: 'What will you discover today?',
    tasks: [
      { icon: '🧠', label: 'Take today\'s quiz',    href: '/prep/daily-quiz',  color: 'bg-teal-50 border-teal-200' },
      { icon: '🗺️', label: 'Explore a career path', href: '/career-explorer', color: 'bg-cyan-50 border-cyan-200' },
      { icon: '📰', label: 'Read today\'s news',    href: '/newsroom',         color: 'bg-sky-50 border-sky-200' },
    ],
    quickLinks: [
      { label: 'PrepSmart',       href: '/prep',           icon: GraduationCap },
      { label: 'Career Explorer', href: '/career-explorer', icon: Map },
      { label: 'AI Buddy',        href: '/ai-buddy',       icon: Sparkles },
      { label: 'Newsroom',        href: '/newsroom',       icon: Newspaper },
    ],
    showFeed: true,
    showExamCountdown: false,
  },
  board_warrior: {
    greeting: (name) => `Focus up, ${name}`,
    subtitle: 'Boards are closer than you think.',
    tasks: [
      { icon: '📚', label: 'Revise a chapter',      href: '/prep',           color: 'bg-emerald-50 border-emerald-200' },
      { icon: '✏️', label: 'Practice questions',    href: '/prep/daily-quiz', color: 'bg-green-50 border-green-200' },
      { icon: '📊', label: 'Check your weak areas', href: '/prep/my-stats',  color: 'bg-lime-50 border-lime-200' },
    ],
    quickLinks: [
      { label: 'PrepSmart',  href: '/prep',           icon: GraduationCap },
      { label: 'Exam Hub',   href: '/jee-command',    icon: Zap },
      { label: 'My Stats',   href: '/prep/my-stats',  icon: BarChart2 },
      { label: 'AI Buddy',   href: '/ai-buddy',       icon: Sparkles },
    ],
    showFeed: true,
    showExamCountdown: true,
  },
  exam_command: {
    greeting: (name) => `Ready, ${name}?`,
    subtitle: 'Your exam won\'t prepare itself.',
    tasks: [
      { icon: '⚡', label: 'Open Exam Command',    href: '/jee-command',    color: 'bg-blue-50 border-blue-200' },
      { icon: '🧪', label: 'Take a subject quiz',  href: '/prep/daily-quiz', color: 'bg-indigo-50 border-indigo-200' },
      { icon: '📰', label: 'Today\'s science news', href: '/newsroom',       color: 'bg-violet-50 border-violet-200' },
    ],
    quickLinks: [
      { label: 'Exam Command', href: '/jee-command',    icon: Zap },
      { label: 'PrepSmart',    href: '/prep',           icon: GraduationCap },
      { label: 'Mind Maps',    href: '/mindmap',        icon: Brain },
      { label: 'AI Buddy',     href: '/ai-buddy',       icon: Sparkles },
    ],
    showFeed: true,
    showExamCountdown: true,
  },
  upsc_aspirant: {
    greeting: (name) => `Good morning, ${name}`,
    subtitle: 'The journey of a thousand miles begins with today.',
    tasks: [
      { icon: '📰', label: 'Read today\'s current affairs', href: '/prep/current-affairs', color: 'bg-sky-50 border-sky-200' },
      { icon: '📝', label: 'Practice answer writing',       href: '/prep',               color: 'bg-blue-50 border-blue-200' },
      { icon: '🧠', label: 'Take a Prelims quiz',           href: '/prep/daily-quiz',    color: 'bg-slate-50 border-slate-200' },
    ],
    quickLinks: [
      { label: 'Current Affairs', href: '/prep/current-affairs', icon: Newspaper },
      { label: 'PrepSmart',       href: '/prep',                 icon: GraduationCap },
      { label: 'AI Mentor',       href: '/ai-buddy',             icon: Sparkles },
      { label: 'Community',       href: '/groups',               icon: Users },
    ],
    showFeed: true,
    showExamCountdown: false,
  },
  skill_builder: {
    greeting: (name) => `Good to see you, ${name}`,
    subtitle: 'Skills compound over time. Show up today.',
    tasks: [
      { icon: '🎯', label: 'Explore a skill path',  href: '/career-explorer', color: 'bg-violet-50 border-violet-200' },
      { icon: '🤖', label: 'Chat with AI Buddy',    href: '/ai-buddy',        color: 'bg-purple-50 border-purple-200' },
      { icon: '📰', label: 'Stay updated',           href: '/newsroom',        color: 'bg-indigo-50 border-indigo-200' },
    ],
    quickLinks: [
      { label: 'Career Explorer', href: '/career-explorer', icon: Map },
      { label: 'AI Buddy',        href: '/ai-buddy',        icon: Sparkles },
      { label: 'PrepSmart',       href: '/prep',            icon: GraduationCap },
      { label: 'Newsroom',        href: '/newsroom',        icon: Newspaper },
    ],
    showFeed: true,
    showExamCountdown: false,
  },
  default: {
    greeting: (name) => `Welcome back, ${name}`,
    subtitle: 'Your learning journey continues.',
    tasks: [
      { icon: '🤖', label: 'Chat with AI Buddy',  href: '/ai-buddy',       color: 'bg-blue-50 border-blue-200' },
      { icon: '📚', label: 'Open PrepSmart',       href: '/prep',           color: 'bg-indigo-50 border-indigo-200' },
      { icon: '📰', label: 'Read the Newsroom',    href: '/newsroom',       color: 'bg-slate-50 border-slate-200' },
    ],
    quickLinks: [
      { label: 'AI Buddy',  href: '/ai-buddy',  icon: Sparkles },
      { label: 'PrepSmart', href: '/prep',       icon: GraduationCap },
      { label: 'Newsroom',  href: '/newsroom',   icon: Newspaper },
      { label: 'Arcade',    href: '/arcade',     icon: Gamepad2 },
    ],
    showFeed: true,
    showExamCountdown: false,
  },
};

// ─── Adaptive config builder ──────────────────────────────────────────────────
// Overrides mode-level defaults with curriculum-specific values when available.

function buildAdaptiveCfg(baseCfg, curriculum, mode) {
  if (!curriculum || curriculum.tier === 'default') return baseCfg;

  const tasks      = [...baseCfg.tasks];
  const quickLinks = [...baseCfg.quickLinks];

  // For exam-focused modes: point the primary exam task at the curriculum's command
  if ((mode === 'exam_command' || mode === 'board_warrior') && curriculum.examCommandHref) {
    tasks[0] = {
      ...tasks[0],
      label: curriculum.examCommandLabel,
      href:  curriculum.examCommandHref,
    };
    // Update the first quickLink that points to /jee-command or /prep
    const cmdIdx = quickLinks.findIndex(l => l.href === '/jee-command' || l.href === '/prep');
    if (cmdIdx !== -1) {
      quickLinks[cmdIdx] = { ...quickLinks[cmdIdx], label: 'Exam Command', href: curriculum.examCommandHref };
    }
  }

  return {
    ...baseCfg,
    subtitle: curriculum.dashboardSubtitle || baseCfg.subtitle,
    tasks,
    quickLinks,
  };
}

// ─── Curriculum Context Widget ────────────────────────────────────────────────
// Shows the student's resolved class/board context, subjects, and top exams.

const EXAM_TYPE_COLOR = {
  board:       'bg-emerald-50 text-emerald-700 border-emerald-200',
  entrance:    'bg-blue-50 text-blue-700 border-blue-200',
  scholarship: 'bg-amber-50 text-amber-700 border-amber-200',
  olympiad:    'bg-purple-50 text-purple-700 border-purple-200',
  professional:'bg-teal-50 text-teal-700 border-teal-200',
  government:  'bg-sky-50 text-sky-700 border-sky-200',
  career:      'bg-violet-50 text-violet-700 border-violet-200',
  preparation: 'bg-gray-50 text-gray-600 border-gray-200',
  aspirational:'bg-rose-50 text-rose-700 border-rose-200',
  school:      'bg-gray-50 text-gray-500 border-gray-200',
  default:     'bg-gray-50 text-gray-600 border-gray-200',
};

function CurriculumContextWidget({ curriculum, theme }) {
  const [showAll, setShowAll] = useState(false);
  if (!curriculum || curriculum.tier === 'default') return null;

  const primaryExams  = getPrimaryExams(curriculum, 3);
  const allExams      = curriculum.exams || [];
  const subjects      = curriculum.subjects || [];
  const visibleExams  = showAll ? allExams : primaryExams;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked size={14} style={{ color: theme.primaryColor }} />
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Your Curriculum</span>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
          style={{ color: theme.primaryColor, borderColor: `${theme.primaryColor}40`, background: `${theme.primaryColor}0D` }}>
          {curriculum.label}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Subjects */}
        {subjects.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Your Subjects</p>
            <div className="flex flex-wrap gap-1.5">
              {subjects.map(s => (
                <span key={s} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Exams */}
        {allExams.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Relevant Exams</p>
            <div className="space-y-1.5">
              {visibleExams.map((exam, i) => {
                const colorCls = EXAM_TYPE_COLOR[exam.type] || EXAM_TYPE_COLOR.default;
                return (
                  <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-medium ${colorCls}`}>
                    <span className="text-[14px] leading-none flex-shrink-0">{exam.badge}</span>
                    <span className="flex-1 leading-tight">{exam.name}</span>
                    {exam.critical && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 flex-shrink-0">Key</span>
                    )}
                  </div>
                );
              })}
            </div>
            {allExams.length > 3 && (
              <button
                onClick={() => setShowAll(v => !v)}
                className="mt-2 text-[11px] font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: theme.primaryColor }}
              >
                {showAll ? 'Show less' : `+${allExams.length - 3} more exams`}
                <ChevronRight size={11} className={`transition-transform ${showAll ? 'rotate-90' : ''}`} />
              </button>
            )}
          </div>
        )}

        {/* Exam Command CTA */}
        <Link
          href={curriculum.examCommandHref || '/prep'}
          className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-white text-[12px] font-bold transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: theme.gradient }}
        >
          <span>{curriculum.examCommandLabel}</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

// ─── Feed (shared between modes that show it) ─────────────────────────────────

function CommunityFeed() {
  const [posts, setPosts]         = useState([]);
  const [feedLoading, setLoading] = useState(true);
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(true);
  const [loadingMore, setMore]    = useState(false);

  const load = useCallback(async (p = 1) => {
    if (p === 1) setLoading(true); else setMore(true);
    try {
      const res = await postsAPI.getFeed({ page: p, limit: 10 });
      const data = res.data?.data || res.data || [];
      if (p === 1) setPosts(data); else setPosts(prev => [...prev, ...data]);
      setHasMore(res.data?.pagination?.hasNext ?? data.length === 10);
      setPage(p);
    } catch {}
    finally { setLoading(false); setMore(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (feedLoading) return (
    <div className="space-y-3">
      {[1, 2].map(i => (
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
  );

  return (
    <div className="space-y-3">
      <CreatePostBox onPostCreated={p => setPosts(prev => [p, ...prev])} />
      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <Users size={24} className="text-gray-300 mx-auto mb-2" />
          <p className="text-[13px] text-gray-400">Your feed is empty — connect with people to see posts</p>
          <Link href="/explore" className="inline-flex items-center gap-1 mt-3 text-[12px] font-semibold text-blue-500 hover:text-blue-600">
            Discover people <ArrowRight size={12} />
          </Link>
        </div>
      ) : (
        <>
          {posts.map((post, i) => (
            <PostCard key={post.id || i} post={post} onDelete={id => setPosts(prev => prev.filter(p => p.id !== id))} />
          ))}
          {hasMore && (
            <button
              onClick={() => load(page + 1)}
              disabled={loadingMore}
              className="w-full py-2.5 rounded-xl text-[13px] font-medium text-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loadingMore ? <><Loader2 size={14} className="animate-spin" /> Loading...</> : 'Load more'}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function StudentDailyDashboard() {
  const { user }     = useAuth();
  const theme        = useTheme();
  const mode         = getPlatformMode(user);
  const curriculum   = resolveStudentCurriculum(user?.profile);
  const [streak, setStreak] = useState(null);
  const [completedTasks, setCompleted] = useState([]);

  useEffect(() => {
    apiClient.get('/moderation/my-streak').then(r => setStreak(r.data?.data)).catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.profile?.full_name?.split(' ')[0] || user?.username || 'there';

  // Build curriculum-aware config on top of the static MODE_CONFIG
  const baseCfg = MODE_CONFIG[mode] || MODE_CONFIG.default;
  const cfg = buildAdaptiveCfg(baseCfg, curriculum, mode);

  const toggleTask = (i) =>
    setCompleted(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  return (
    <div className="flex gap-5">

      {/* ═══ MAIN COLUMN ═══ */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* ── Hero Banner ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: theme.gradient }}>
          <div className="px-5 py-5 relative">
            {/* subtle circles */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-24 h-24 rounded-full opacity-5 bg-white translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between gap-4">
              <div>
                <p className="text-white/70 text-[11px] font-medium uppercase tracking-widest mb-0.5">
                  Good {timeGreeting}
                </p>
                <h1 className="text-white font-extrabold text-[20px] leading-tight">
                  {cfg.greeting(firstName)}
                </h1>
                <p className="text-white/60 text-[12px] mt-1">{cfg.subtitle}</p>
                {curriculum?.tier !== 'default' && (
                  <span className="inline-block mt-1.5 text-[10px] font-bold text-white/50 bg-white/10 px-2 py-0.5 rounded-full tracking-wide">
                    {curriculum.label}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {streak?.current_streak > 0 && (
                  <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <Flame size={14} className="text-orange-300" />
                      <span className="text-white font-extrabold text-[16px]">{streak.current_streak}</span>
                    </div>
                    <p className="text-white/50 text-[9px] uppercase tracking-wider font-medium">Day streak</p>
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-[20px]">
                  {theme.emoji}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Today's Tasks ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Today's Tasks</p>
            {completedTasks.length === cfg.tasks.length && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">All done! 🎉</span>
            )}
          </div>
          <div className="space-y-2">
            {cfg.tasks.map((task, i) => {
              const done = completedTasks.includes(i);
              return (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${done ? 'bg-gray-50 border-gray-100 opacity-60' : task.color}`}>
                  <button onClick={() => toggleTask(i)} className="flex-shrink-0">
                    {done
                      ? <CheckCircle2 size={18} className="text-emerald-500" />
                      : <Circle size={18} className="text-gray-300" />}
                  </button>
                  <span className="text-[18px] leading-none">{task.icon}</span>
                  <Link href={task.href} className={`flex-1 text-[13px] font-semibold transition-colors ${done ? 'line-through text-gray-400' : 'text-gray-700 hover:text-gray-900'}`}>
                    {task.label}
                  </Link>
                  {!done && <ArrowRight size={13} className="text-gray-300 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {cfg.quickLinks.map((link, i) => {
            const Icon = link.icon;
            return (
              <Link
                key={i}
                href={link.href}
                className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-2.5 hover:border-gray-200 hover:shadow-sm transition-all group"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all" style={{ background: `${theme.primaryColor}15` }}>
                  <Icon size={15} style={{ color: theme.primaryColor }} />
                </div>
                <span className="text-[12px] font-semibold text-gray-700 group-hover:text-gray-900 truncate">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* ── Community Feed ── */}
        {cfg.showFeed && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                <Users size={11} /> Community
              </p>
              <Link href="/explore" className="text-[11px] font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1">
                Discover people <ArrowRight size={11} />
              </Link>
            </div>
            <CommunityFeed />
          </div>
        )}

      </div>

      {/* ═══ RIGHT WIDGET COLUMN ═══ */}
      <div className="hidden lg:flex w-[280px] flex-shrink-0 flex-col gap-3 sticky top-[72px] self-start max-h-[calc(100vh-88px)] overflow-y-auto pb-4" style={{ scrollbarWidth: 'none' }}>
        <CurriculumContextWidget curriculum={curriculum} theme={theme} />
        <ScoreWidget />
        <NewsWidget />
        <DailyChallengeWidget />
        <SuggestionsWidget />
        <BadgesWidget />
        <p className="text-[9px] text-gray-400 px-1 leading-relaxed">
          © 2026 Syllabrix ·{' '}
          <Link href="/settings" className="hover:text-gray-600">Privacy</Link> ·{' '}
          <Link href="/help" className="hover:text-gray-600">Support</Link>
        </p>
      </div>

    </div>
  );
}
