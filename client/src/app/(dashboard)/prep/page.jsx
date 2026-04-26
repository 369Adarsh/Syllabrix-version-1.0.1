'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getPlatformMode, PLATFORM_MODES } from '@/utils/platformMode';
import { prepAPI } from '@/lib/api/prep.api';
import { aiAPI } from '@/lib/api/ai.api';
import { loadBoardProgress, loadBoardSettings, getChapterStats, BOARD_SUBJECTS } from '@/data/board-syllabus';
import { getTodayFact } from '@/data/curious-mind';
import {
  GraduationCap, Flame, Brain, BarChart3, Target, ArrowRight,
  Newspaper, BookOpen, Gamepad2, Sparkles, Map, Zap, Clock,
  ChevronRight, FileText, Star, Trophy, BookMarked, Loader2
} from 'lucide-react';

// ── Young Explorer PrepSmart ───────────────────────────────────────────────────
function YoungExplorerPrep({ user }) {
  const name = user?.profile?.full_name?.split(' ')[0] || user?.username || 'Explorer';
  const ACTIONS = [
    { href: '/learn-play/word-builder', icon: '🧩', label: 'Word Builder',   desc: 'Build words with letter tiles',   bg: 'bg-violet-50 border-violet-200', text: 'text-violet-700' },
    { href: '/learn-play/sound-tap',    icon: '🔊', label: 'Sound Tap',      desc: 'Tap YES or NO for letter sounds',  bg: 'bg-blue-50 border-blue-200',     text: 'text-blue-700'   },
    { href: '/stories',                 icon: '📚', label: 'Story Library',  desc: 'Read illustrated stories',         bg: 'bg-teal-50 border-teal-200',     text: 'text-teal-700'   },
  ];
  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}>
        <div className="px-5 py-5 relative">
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-white/10 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-white/80 text-[11px] font-bold uppercase tracking-widest mb-0.5">🌈 Young Explorer</p>
            <h1 className="text-white font-extrabold text-[20px]">Hello, {name}! Ready to learn?</h1>
            <p className="text-white/70 text-[12px] mt-1">Pick a game and earn stars today!</p>
          </div>
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Play & Learn</p>
        <div className="space-y-3">
          {ACTIONS.map(a => (
            <Link key={a.href} href={a.href}
              className={`flex items-center gap-4 p-4 rounded-2xl border hover:shadow-md transition-all active:scale-[0.98] ${a.bg}`}>
              <span className="text-[32px] flex-shrink-0">{a.icon}</span>
              <div className="flex-1">
                <p className={`text-[14px] font-extrabold ${a.text}`}>{a.label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{a.desc}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Link href="/ai-buddy" className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-center hover:shadow-md transition-all">
          <span className="text-[28px]">✨</span>
          <p className="text-[13px] font-extrabold text-indigo-700 mt-1">AI Buddy</p>
          <p className="text-[10px] text-gray-500">Ask me anything!</p>
        </Link>
        <Link href="/learn-play" className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center hover:shadow-md transition-all">
          <span className="text-[28px]">🎮</span>
          <p className="text-[13px] font-extrabold text-amber-700 mt-1">All Games</p>
          <p className="text-[10px] text-gray-500">See all activities</p>
        </Link>
      </div>
    </div>
  );
}

// ── Board Warrior PrepSmart ────────────────────────────────────────────────────
function BoardWarriorPrep({ user }) {
  const name = user?.profile?.full_name?.split(' ')[0] || user?.username || 'Warrior';
  const classLevel = parseInt(user?.profile?.class_level || '10') || 10;
  const validClass = classLevel === 9 ? 9 : 10;
  const progress = loadBoardProgress();
  const settings = loadBoardSettings();
  const stats = getChapterStats(validClass, progress);
  const totalDone = Object.values(stats).reduce((a, s) => a + s.done, 0);
  const totalChapters = Object.values(stats).reduce((a, s) => a + s.total, 0);
  const overallPct = totalChapters ? Math.round((totalDone / totalChapters) * 100) : 0;
  const days = settings.examDate ? Math.max(0, Math.ceil((new Date(settings.examDate) - new Date()) / 86400000)) : null;

  const ACTIONS = [
    { href: '/boards',          icon: Target,     label: 'Board Hub',       desc: 'Countdown & subject overview',  color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
    { href: '/boards/chapters', icon: BookOpen,   label: 'Chapter Tracker', desc: 'Mark chapters as done',         color: 'bg-blue-50 border-blue-200',      text: 'text-blue-700'   },
    { href: '/prep/daily-quiz', icon: Brain,      label: 'Quiz Practice',   desc: 'Board-pattern MCQs',            color: 'bg-violet-50 border-violet-200',  text: 'text-violet-700' },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #059669, #16A34A)' }}>
        <div className="px-5 py-5 relative">
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-white/10 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-white/80 text-[11px] font-bold uppercase tracking-widest mb-0.5">🎯 Board Warrior · Class {validClass}</p>
            <h1 className="text-white font-extrabold text-[20px]">Focus, {name}!</h1>
            <div className="flex items-center gap-4 mt-3">
              <div>
                <p className="text-white font-extrabold text-[22px] leading-none">{overallPct}%</p>
                <p className="text-white/60 text-[10px]">Syllabus done</p>
              </div>
              {days !== null && (
                <div>
                  <p className="text-white font-extrabold text-[22px] leading-none">{days}</p>
                  <p className="text-white/60 text-[10px]">Days to exam</p>
                </div>
              )}
            </div>
            <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white/80 rounded-full transition-all" style={{ width: `${overallPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Subject mini-stats */}
      <div className="grid grid-cols-5 gap-1.5">
        {BOARD_SUBJECTS.map(s => (
          <Link key={s.slug} href={`/boards/chapters?subject=${s.slug}`}
            className={`rounded-xl border p-2 text-center hover:shadow-md transition-all ${s.light} ${s.border}`}>
            <p className="text-[16px] mb-0.5">{s.emoji}</p>
            <p className={`text-[13px] font-extrabold ${s.text}`}>{stats[s.slug]?.pct || 0}%</p>
            <p className="text-[8px] text-gray-400 font-semibold truncate">{s.name.split(' ')[0]}</p>
          </Link>
        ))}
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Today's Actions</p>
        <div className="space-y-3">
          {ACTIONS.map(({ href, icon: Icon, label, desc, color, text }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-4 p-4 rounded-2xl border hover:shadow-md transition-all active:scale-[0.98] ${color}`}>
              <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className={text} />
              </div>
              <div className="flex-1">
                <p className={`text-[14px] font-extrabold ${text}`}>{label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Curious Mind PrepSmart ─────────────────────────────────────────────────────
function CuriousMindPrep({ user }) {
  const name = user?.profile?.full_name?.split(' ')[0] || user?.username || 'Explorer';
  const fact = getTodayFact();
  const ACTIONS = [
    { href: '/discover',              icon: Map,      label: 'Discovery Hub',  desc: 'World of Science, Maths, History', color: 'bg-cyan-50 border-cyan-200', text: 'text-cyan-700' },
    { href: '/discover/skill-quiz',   icon: Target,   label: 'Skill Quiz',     desc: 'Creative or Analytical thinker?',  color: 'bg-violet-50 border-violet-200', text: 'text-violet-700' },
    { href: '/prep/daily-quiz',       icon: Brain,    label: 'Quiz Hub',       desc: 'Weekly subject challenge',         color: 'bg-teal-50 border-teal-200',     text: 'text-teal-700'   },
  ];
  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D9488, #0891B2)' }}>
        <div className="px-5 py-5 relative">
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-white/10 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-white/80 text-[11px] font-bold uppercase tracking-widest mb-0.5">🔭 Curious Mind</p>
            <h1 className="text-white font-extrabold text-[20px]">Hey {name}, explore today!</h1>
            <p className="text-white/70 text-[12px] mt-1">Learning feels best when it surprises you.</p>
          </div>
        </div>
      </div>

      {/* Did You Know */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[16px]">💡</span>
          <p className="text-[11px] font-extrabold text-gray-600 uppercase tracking-widest">Did You Know Today?</p>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-[26px] flex-shrink-0">{fact.emoji}</span>
          <p className="text-[12px] text-gray-700 leading-relaxed font-medium">{fact.fact}</p>
        </div>
        <Link href="/discover" className="flex items-center gap-1 mt-3 text-[11px] font-bold text-teal-600 hover:text-teal-700">
          Explore more like this <ArrowRight size={11} />
        </Link>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Discover Today</p>
        <div className="space-y-3">
          {ACTIONS.map(({ href, icon: Icon, label, desc, color, text }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-4 p-4 rounded-2xl border hover:shadow-md transition-all active:scale-[0.98] ${color}`}>
              <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className={text} />
              </div>
              <div className="flex-1">
                <p className={`text-[14px] font-extrabold ${text}`}>{label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Skill Builder / Default redesigned PrepSmart ───────────────────────────────
function SkillBuilderPrep({ user, mode }) {
  const [stats, setStats]       = useState(null);
  const [latestNews, setLatestNews] = useState([]);
  const [myExams, setMyExams]   = useState([]);
  const [loading, setLoading]   = useState(true);

  const name = user?.profile?.full_name?.split(' ')[0] || user?.username || 'Learner';
  const modeConfig = PLATFORM_MODES[mode] || PLATFORM_MODES.default;

  useEffect(() => {
    Promise.all([
      prepAPI.getMyQuizStats().catch(() => ({ data: { data: null } })),
      aiAPI.getNewsroom({ days: 1, limit: 4 }).catch(() => ({ data: { data: { articles: [] } } })),
      prepAPI.getMyExams().catch(() => ({ data: { data: [] } })),
    ]).then(([statsRes, newsRes, examRes]) => {
      setStats(statsRes.data?.data || null);
      const nd = newsRes.data?.data || newsRes.data;
      setLatestNews((nd?.articles || nd || []).slice(0, 4));
      setMyExams(examRes.data?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const ACTIONS = [
    { href: '/prep/daily-quiz',     icon: Brain,      label: 'Quiz Hub',         desc: 'Daily & topic-wise MCQs',   color: 'bg-violet-50 border-violet-200', text: 'text-violet-700' },
    { href: '/prep/current-affairs',icon: Flame,      label: 'Current Affairs',  desc: 'Daily news analysis',       color: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
    { href: '/ai-buddy',            icon: Sparkles,   label: 'AI Mentor',        desc: 'Ask study doubts anytime',  color: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
  ];

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-blue-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="rounded-2xl overflow-hidden" style={{ background: modeConfig.gradient }}>
        <div className="px-5 py-5 relative">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mb-0.5">
                {modeConfig.emoji} PrepSmart
              </p>
              <h1 className="text-white font-extrabold text-[20px]">Welcome back, {name}</h1>
              <p className="text-white/60 text-[12px] mt-0.5">{modeConfig.tagline}</p>
            </div>
            {stats && (
              <div className="flex gap-3">
                <div className="text-center bg-white/10 rounded-xl px-3 py-2">
                  <p className="text-white font-extrabold text-[18px] leading-none">{stats.total_attempts || 0}</p>
                  <p className="text-white/60 text-[9px] uppercase tracking-wider mt-0.5">Quizzes</p>
                </div>
                <div className="text-center bg-white/10 rounded-xl px-3 py-2">
                  <p className="text-white font-extrabold text-[18px] leading-none">{stats.avg_percentage || 0}%</p>
                  <p className="text-white/60 text-[9px] uppercase tracking-wider mt-0.5">Avg Score</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Main */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* 3 Recommended actions */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Recommended for You</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ACTIONS.map(({ href, icon: Icon, label, desc, color, text }) => (
                <Link key={href} href={href}
                  className={`flex flex-col gap-3 p-4 rounded-2xl border hover:shadow-md transition-all active:scale-[0.98] ${color}`}>
                  <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center">
                    <Icon size={18} className={text} />
                  </div>
                  <div>
                    <p className={`text-[13px] font-extrabold ${text}`}>{label}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Latest news */}
          {latestNews.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                  <Newspaper size={11} className="text-blue-500" /> Latest Headlines
                </p>
                <Link href="/newsroom" className="text-[11px] font-semibold text-blue-500 flex items-center gap-1">
                  All news <ArrowRight size={11} />
                </Link>
              </div>
              <div className="space-y-2">
                {latestNews.map((n, i) => (
                  <Link key={i} href="/newsroom"
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-blue-50/40 transition-colors group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    <p className="text-[12px] font-medium text-gray-700 leading-snug group-hover:text-blue-700 transition-colors">
                      {n.headline || n.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* My exams */}
          {myExams.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                <Star size={11} className="text-amber-500" /> My Exams
              </p>
              <div className="space-y-2">
                {myExams.map(e => (
                  <Link key={e.exam_id || e.id} href={`/prep/exam/${e.slug}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Target size={14} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-800">{e.name}</p>
                        <p className="text-[10px] text-gray-400">{e.conducting_body}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="hidden lg:flex flex-col gap-4 w-[220px] flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
              <Zap size={10} className="text-violet-500" /> Quick Links
            </p>
            <div className="space-y-1">
              {[
                { href: '/mindmap',           icon: Brain,       label: 'Mind Maps',     color: 'text-violet-500' },
                { href: '/prep/bookmarks',    icon: BookMarked,  label: 'Bookmarks',     color: 'text-blue-500'   },
                { href: '/prep/my-stats',     icon: BarChart3,   label: 'My Stats',      color: 'text-emerald-500'},
                { href: '/leaderboard',       icon: Trophy,      label: 'Leaderboard',   color: 'text-amber-500'  },
                { href: '/career-explorer',   icon: Map,         label: 'Career Explorer', color: 'text-teal-500' },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  <l.icon size={13} className={l.color} /> {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={14} className="text-amber-500" />
              <p className="text-[11px] font-bold text-amber-700">Daily Habit</p>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Read one news story → take the daily quiz → ask AI Buddy one doubt. Just 15 minutes a day builds exam-ready recall.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root PrepSmart router ──────────────────────────────────────────────────────
export default function PrepPage() {
  const router = useRouter();
  const { user } = useAuth();
  const mode = getPlatformMode(user);

  useEffect(() => {
    if (mode === 'upsc_aspirant') router.replace('/upsc');
    if (mode === 'exam_command')  router.replace('/jee-command');
  }, [mode, router]);

  if (mode === 'upsc_aspirant' || mode === 'exam_command') {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-blue-400" />
      </div>
    );
  }
  if (mode === 'young_explorer') return <YoungExplorerPrep user={user} />;
  if (mode === 'board_warrior')  return <BoardWarriorPrep  user={user} />;
  if (mode === 'curious_mind')   return <CuriousMindPrep   user={user} />;
  return <SkillBuilderPrep user={user} mode={mode} />;
}
