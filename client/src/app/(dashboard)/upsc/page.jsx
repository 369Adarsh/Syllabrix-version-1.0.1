'use client';
import Link from 'next/link';
import { BookOpen, Brain, Newspaper, Sparkles, BarChart2, FileText, Map, Trophy, Zap, ChevronRight, Target, Clock } from 'lucide-react';
import { getTodayQuestion } from '@/data/upsc-syllabus';
import { useAuth } from '@/contexts/AuthContext';

const TOOLS = [
  { href: '/upsc/syllabus',        icon: Map,        label: 'Syllabus Tracker',  desc: 'Track GS1–GS4 & CSAT topics',       color: 'bg-blue-50 border-blue-200',    iconColor: 'text-blue-600',   badge: null   },
  { href: '/upsc/answer-writing',  icon: FileText,   label: 'Answer Writing',    desc: 'Practice & get AI feedback',         color: 'bg-violet-50 border-violet-200', iconColor: 'text-violet-600', badge: 'AI'   },
  { href: '/prep/current-affairs', icon: Newspaper,  label: 'Current Affairs',   desc: 'Daily news analysis for UPSC',       color: 'bg-amber-50 border-amber-200',   iconColor: 'text-amber-600',  badge: 'Daily'},
  { href: '/prep/daily-quiz',      icon: Brain,      label: 'Quiz Bank',         desc: 'MCQs for Prelims prep',              color: 'bg-emerald-50 border-emerald-200',iconColor: 'text-emerald-600',badge: null   },
  { href: '/mindmap',              icon: Map,        label: 'Mind Maps',         desc: 'Visual notes & concept maps',        color: 'bg-rose-50 border-rose-200',     iconColor: 'text-rose-600',   badge: null   },
  { href: '/ai-buddy',             icon: Sparkles,   label: 'AI Mentor',         desc: 'Ask your UPSC doubts 24/7',          color: 'bg-indigo-50 border-indigo-200', iconColor: 'text-indigo-600', badge: 'AI'   },
];

const QUICK_STATS = [
  { label: 'Days to Prelims', value: '—',  icon: Clock,    color: 'text-blue-600',    bg: 'bg-blue-50'    },
  { label: 'Topics Done',     value: '0%', icon: Target,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Answers Written', value: '0',  icon: FileText, color: 'text-violet-600',  bg: 'bg-violet-50'  },
  { label: 'Quiz Score',      value: '—',  icon: Trophy,   color: 'text-amber-600',   bg: 'bg-amber-50'   },
];

export default function UPSCCommandCenter() {
  const { user } = useAuth();
  const todayQ = getTodayQuestion();
  const name = user?.profile?.full_name?.split(' ')[0] || user?.username || 'Aspirant';

  return (
    <div className="space-y-6">

      {/* Hero banner — full width, taller on desktop */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a5f, #b45309)' }}>
        <div className="px-6 py-7 md:px-10 md:py-10 relative">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 w-40 h-40 rounded-full bg-white/4 translate-y-1/2 pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏛️</span>
                <span className="text-white/70 text-[11px] font-bold uppercase tracking-widest">UPSC Command Center</span>
              </div>
              <h1 className="text-white font-extrabold text-2xl md:text-3xl leading-tight">
                Good day, {name}
              </h1>
              <p className="text-white/60 text-sm mt-1.5">Your civil services journey — tracked, analysed, achieved.</p>
            </div>
            <span className="text-6xl md:text-7xl flex-shrink-0 hidden sm:block">🎯</span>
          </div>
        </div>
      </div>

      {/* Stats row — 4 cols always on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK_STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-white p-4 flex items-center gap-4 shadow-sm`}>
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className={`text-xl font-extrabold ${color}`}>{value}</p>
              <p className="text-[11px] text-gray-500 font-semibold leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column desktop layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — main content (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Tools grid — 3 cols on desktop */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Your Prep Tools</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {TOOLS.map(({ href, icon: Icon, label, desc, color, iconColor, badge }) => (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-2xl border p-5 flex flex-col gap-3 hover:shadow-lg transition-all active:scale-[0.98] group ${color}`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center ${iconColor} group-hover:scale-110 transition-transform`}>
                      <Icon size={20} />
                    </div>
                    {badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/80 font-bold text-gray-600 border border-gray-200">
                        {badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-[14px] font-extrabold text-gray-800 leading-snug">{label}</p>
                    <p className="text-[12px] text-gray-500 leading-snug mt-1">{desc}</p>
                  </div>
                  <ChevronRight size={14} className={`${iconColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </Link>
              ))}
            </div>
          </div>

          {/* Motivational banner */}
          <div className="bg-gradient-to-r from-blue-950 to-blue-900 rounded-2xl p-6 flex items-center gap-5">
            <span className="text-4xl flex-shrink-0">🎯</span>
            <div>
              <p className="text-white font-extrabold text-[15px]">Consistency beats intensity</p>
              <p className="text-white/60 text-sm mt-1">1 answer/day + 20 MCQs/day = selection in 365 days</p>
            </div>
            <Link href="/upsc/answer-writing" className="ml-auto flex-shrink-0 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition-colors">
              Start Today →
            </Link>
          </div>
        </div>

        {/* RIGHT — sidebar (1/3) */}
        <div className="space-y-5">

          {/* Today's Question */}
          <div className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                  <FileText size={15} className="text-violet-600" />
                </div>
                <p className="text-sm font-extrabold text-gray-700">Today's Question</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 font-bold border border-violet-200">
                {todayQ.type} · {todayQ.marks}M
              </span>
            </div>
            <p className="text-[13px] text-gray-700 leading-relaxed mb-4">{todayQ.q}</p>
            <Link
              href="/upsc/answer-writing"
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 text-white font-extrabold text-sm hover:bg-violet-700 transition-colors"
            >
              <FileText size={14} /> Write Answer
            </Link>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Quick Access</p>
            {[
              { href: '/upsc/syllabus', emoji: '🗺️', label: 'Syllabus Tracker', sub: 'GS1–GS4 + CSAT', color: 'text-blue-600' },
              { href: '/newsroom',      emoji: '📰', label: 'Today\'s News',     sub: 'Current affairs digest', color: 'text-amber-600' },
              { href: '/ai-buddy',      emoji: '✨', label: 'AI Mentor',         sub: 'Ask any doubt',  color: 'text-violet-600' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <span className="text-xl w-8 text-center">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${item.color}`}>{item.label}</p>
                  <p className="text-[11px] text-gray-400">{item.sub}</p>
                </div>
                <ChevronRight size={13} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
