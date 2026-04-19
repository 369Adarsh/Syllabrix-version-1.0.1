'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mentorshipAPI } from '@/lib/api/mentorship.api';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  UserCheck, Star, MessageCircle, Calendar, Target, TrendingUp,
  Loader2, Sparkles, ChevronRight, Award, Users, Clock, Heart,
  BookOpen, Video, Search, Zap, Shield, ArrowRight,
  Briefcase, Globe, Crown, Lightbulb
} from 'lucide-react';
import toast from 'react-hot-toast';

const STAGES = [
  { name: 'Explorer',    emoji: '🔍', desc: 'Analyse domains and find alignment',           color: 'bg-blue-50   text-blue-700   border-blue-100' },
  { name: 'Candidate',   emoji: '⭐', desc: 'Secure mentorship and calibrate roadmap',       color: 'bg-purple-50 text-purple-700 border-purple-100' },
  { name: 'Specialist',  emoji: '🔥', desc: 'Execution-focused sessions and validation',     color: 'bg-slate-100 text-slate-700  border-slate-200' },
  { name: 'Mentee',      emoji: '🎯', desc: 'Deep vertical expertise and network access',    color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { name: 'Champion',    emoji: '🏆', desc: 'Elite mastery — mentor the next generation',   color: 'bg-amber-50  text-amber-700  border-amber-100' },
];

const WORKSHOPS = [
  { title: 'Executive Strategy & Governance',  mentor: 'Sh. Aditya Verma, IAS',       date: 'Sat 10:00 AM', attendees: 234, category: 'Strategy'    },
  { title: 'Cloud Architecture at Scale',      mentor: 'Sneha Rao, Senior Architect',  date: 'Wed 07:00 PM', attendees: 156, category: 'Engineering'  },
  { title: 'Advanced Diagnostic Protocols',    mentor: 'Dr. Priya, AIIMS Faculty',     date: 'Sun 09:00 AM', attendees: 312, category: 'Medical'      },
  { title: 'Venture Capital & Deal Flow',      mentor: 'Rajesh Kumar, GP Portfolio',   date: 'Thu 08:00 PM', attendees: 67,  category: 'Business'    },
];

const FEATURED_MENTORS = [
  { name: 'Aditya Verma',     role: 'Strategic Advisor',          expertise: 'Public Policy, Governance',         rating: 4.9, mentees: 42 },
  { name: 'Sneha Rao',        role: 'Senior Software Architect',  expertise: 'Distributed Systems, DSA',          rating: 4.8, mentees: 31 },
  { name: 'Dr. Priya Sharma', role: 'Chief of Cardiology',        expertise: 'Clinical Residency, NEET',          rating: 5.0, mentees: 58 },
  { name: 'Vikram Singh',     role: 'Principal Space Scientist',  expertise: 'Aerospace Engineering, Research',   rating: 4.7, mentees: 24 },
  { name: 'Meera Joshi',      role: 'Senior Finance Partner',     expertise: 'Auditing, Corporate Law',           rating: 4.9, mentees: 36 },
  { name: 'Arjun Nair',       role: 'Executive Creative Director', expertise: 'Brand Identity, UI/UX',            rating: 4.6, mentees: 18 },
];

export default function MentorshipPage() {
  const { user } = useAuth();
  const [tab, setTab]               = useState('workshops');
  const [mentors, setMentors]       = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    mentorshipAPI.getMentors({ limit: 20 }).then(r => setMentors(r.data?.data || [])).catch(() => {});
  }, []);

  const filteredMentors = searchQuery
    ? FEATURED_MENTORS.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.expertise.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : FEATURED_MENTORS;

  const TABS = [
    { k: 'workshops',   l: 'Workshops',     icon: Video    },
    { k: 'mentors',     l: 'Find Mentors',  icon: Users    },
    { k: 'my-journey',  l: 'My Journey',    icon: TrendingUp },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 px-3 sm:px-4 md:px-0">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck size={22} className="text-purple-600" /> Mentorship
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Connect with senior specialists across Engineering, Policy, Medicine, and Finance.
          </p>
        </div>
        <Link
          href="/mentor-apply"
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors shrink-0"
        >
          Apply as Mentor
        </Link>
      </div>

      {/* Career phases */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Career Advancement Phases</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {STAGES.map((s, i) => (
            <div key={i} className={`rounded-xl border px-3 py-2.5 ${i === 0 ? 'bg-gray-900 text-white border-gray-800' : s.color}`}>
              <p className="text-base mb-0.5">{s.emoji}</p>
              <p className={`text-xs font-bold leading-tight ${i === 0 ? 'text-white' : ''}`}>{s.name}</p>
              <p className={`text-[10px] mt-0.5 leading-snug ${i === 0 ? 'text-gray-400' : 'text-gray-400'}`}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-full sm:w-auto">
        {TABS.map(t => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === t.k ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon size={13} /> {t.l}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── Workshops ── */}
        {tab === 'workshops' && (
          <motion.div key="ws" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-3">
            {WORKSHOPS.map((w, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:border-purple-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                  <Video size={18} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{w.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{w.mentor}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{w.category}</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={9} /> {w.date}</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1"><Users size={9} /> {w.attendees}</span>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-xl hover:bg-purple-700 transition-colors shrink-0">
                  <Zap size={12} /> Join
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Find Mentors ── */}
        {tab === 'mentors' && (
          <motion.div key="mn" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name or expertise..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMentors.map((m, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-purple-200 transition-colors flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {m.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{m.name}</p>
                      <p className="text-xs text-gray-400 truncate">{m.role}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed">{m.expertise}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Star size={11} className="text-amber-400 fill-amber-400" /> {m.rating}</span>
                    <span>{m.mentees} mentees</span>
                  </div>

                  <button className="w-full py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-purple-700 transition-colors">
                    Request Mentorship
                  </button>
                </div>
              ))}
            </div>

            {mentors.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 mb-3">Verified Platform Mentors</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {mentors.slice(0, 8).map((m, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(m.full_name || m.username || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{m.full_name || m.username}</p>
                        <p className="text-[10px] text-green-600 font-medium">Verified</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── My Journey ── */}
        {tab === 'my-journey' && (
          <motion.div key="jn" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">

            {/* Current phase card */}
            <div className="bg-gray-900 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">🔍</div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Current Phase</p>
                    <h3 className="text-base font-bold text-white">Phase 01: Explorer</h3>
                  </div>
                </div>
                <span className="text-xs font-semibold text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full">20% done</span>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                Analyse domain landscapes, identify career-aligned experts, and calibrate your mentorship roadmap.
              </p>

              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-5">
                <motion.div initial={{ width: 0 }} animate={{ width: '20%' }} className="h-full bg-purple-400 rounded-full" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { task: 'Attend 1 Executive Workshop', done: false },
                  { task: 'Review 5 Specialist Profiles', done: true  },
                  { task: 'Send a Mentorship Request',   done: false },
                  { task: 'Set your industry interests', done: true  },
                ].map((t, i) => (
                  <div key={i} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl ${t.done ? 'bg-emerald-500/10 text-emerald-300' : 'bg-white/5 text-gray-400'}`}>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${t.done ? 'bg-emerald-400 border-emerald-400' : 'border-gray-600'}`}>
                      {t.done && <span className="text-[8px] text-white font-bold">✓</span>}
                    </div>
                    <span className="text-xs font-medium">{t.task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI tip + goal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-blue-500" />
                  <p className="text-xs font-semibold text-gray-600">AI Tip</p>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic">
                  &quot;Focus on mentors who bridge the gap between technical architecture and executive governance.&quot;
                </p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Crown size={14} className="text-amber-500" />
                  <p className="text-xs font-semibold text-gray-600">Final Goal</p>
                </div>
                <p className="text-xs font-semibold text-gray-900 mb-1">Phase 05: Champion</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Transition from mentee to guide. Build domain authority and mentor the next generation.
                </p>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Footer CTA */}
      <div className="bg-gray-900 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Mastery is a shared journey.</h3>
          <p className="text-sm text-gray-400 mt-1">Every specialist is verified for technical mastery and strategic vision.</p>
        </div>
        <Link
          href="/mentor-apply"
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors shrink-0"
        >
          Become a Mentor <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
