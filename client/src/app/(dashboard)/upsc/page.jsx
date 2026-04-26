'use client';
import Link from 'next/link';
import { BookOpen, Brain, Newspaper, Sparkles, BarChart2, FileText, Map, Trophy, Zap, ChevronRight, Target, Clock } from 'lucide-react';
import { getTodayQuestion } from '@/data/upsc-syllabus';
import { useAuth } from '@/contexts/AuthContext';

const TOOLS = [
  { href: '/upsc/syllabus',       icon: Map,        label: 'Syllabus Tracker',  desc: 'Track GS1–GS4 & CSAT topics',       color: 'bg-blue-50 border-blue-200',  iconColor: 'text-blue-600',  badge: null },
  { href: '/upsc/answer-writing', icon: FileText,   label: 'Answer Writing',    desc: 'Practice & get AI feedback',         color: 'bg-violet-50 border-violet-200', iconColor: 'text-violet-600', badge: 'AI' },
  { href: '/prep/current-affairs',icon: Newspaper,  label: 'Current Affairs',   desc: 'Daily news analysis for UPSC',       color: 'bg-amber-50 border-amber-200', iconColor: 'text-amber-600',  badge: 'Daily' },
  { href: '/prep/daily-quiz',     icon: Brain,      label: 'Quiz Bank',         desc: 'MCQs for Prelims prep',              color: 'bg-emerald-50 border-emerald-200', iconColor: 'text-emerald-600', badge: null },
  { href: '/mindmap',             icon: Map,        label: 'Mind Maps',         desc: 'Visual notes & concept maps',        color: 'bg-rose-50 border-rose-200',   iconColor: 'text-rose-600',   badge: null },
  { href: '/ai-buddy',            icon: Sparkles,   label: 'AI Mentor',         desc: 'Ask your UPSC doubts 24/7',          color: 'bg-indigo-50 border-indigo-200', iconColor: 'text-indigo-600', badge: 'AI' },
];

const QUICK_STATS = [
  { label: 'Days to Prelims',  value: '—',   icon: Clock,   color: 'text-blue-600'   },
  { label: 'Topics Done',      value: '0%',  icon: Target,  color: 'text-emerald-600' },
  { label: 'Answers Written',  value: '0',   icon: FileText, color: 'text-violet-600' },
  { label: 'Quiz Score',       value: '—',   icon: Trophy,  color: 'text-amber-600'  },
];

export default function UPSCCommandCenter() {
  const { user } = useAuth();
  const todayQ = getTodayQuestion();
  const name = user?.profile?.full_name?.split(' ')[0] || user?.username || 'Aspirant';

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Hero banner */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a5f, #b45309)' }}>
        <div className="px-5 py-5 relative">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/3 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[20px]">🏛️</span>
              <span className="text-white/70 text-[11px] font-bold uppercase tracking-widest">UPSC Command Center</span>
            </div>
            <h1 className="text-white font-extrabold text-[20px] leading-tight">
              Good day, {name}
            </h1>
            <p className="text-white/60 text-[12px] mt-1">Your civil services journey, all in one place.</p>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-2">
        {QUICK_STATS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-3 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Icon size={16} className={`mx-auto mb-1 ${color}`} />
            <p className={`text-[15px] font-extrabold ${color}`}>{value}</p>
            <p className="text-[9px] text-gray-400 font-semibold leading-tight mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Today's answer writing question */}
      <div className="bg-white rounded-2xl border border-violet-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
              <FileText size={13} className="text-violet-600" />
            </div>
            <p className="text-[12px] font-extrabold text-gray-700">Today's Question</p>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 font-bold border border-violet-200">
            {todayQ.type} · {todayQ.marks}M
          </span>
        </div>
        <p className="text-[12px] text-gray-700 leading-relaxed mb-3">{todayQ.q}</p>
        <Link
          href="/upsc/answer-writing"
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 text-white font-extrabold text-[12px] hover:bg-violet-700 transition-colors"
        >
          <FileText size={13} /> Write Answer <ChevronRight size={13} />
        </Link>
      </div>

      {/* Tools grid */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Your Prep Tools</p>
        <div className="grid grid-cols-2 gap-3">
          {TOOLS.map(({ href, icon: Icon, label, desc, color, iconColor, badge }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-2xl border p-4 flex flex-col gap-2 hover:shadow-md transition-all active:scale-[0.98] ${color}`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center ${iconColor}`}>
                  <Icon size={18} />
                </div>
                {badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/80 font-bold text-gray-600 border border-gray-200">
                    {badge}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[13px] font-extrabold text-gray-800 leading-snug">{label}</p>
                <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Motivational footer */}
      <div className="bg-gradient-to-r from-blue-950 to-blue-900 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-[28px] flex-shrink-0">🎯</span>
        <div>
          <p className="text-white font-extrabold text-[13px]">Consistency beats intensity</p>
          <p className="text-white/60 text-[11px] mt-0.5">1 answer/day + 20 MCQs/day = selection in 365 days</p>
        </div>
      </div>
    </div>
  );
}
