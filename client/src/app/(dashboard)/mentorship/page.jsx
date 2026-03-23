'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mentorshipAPI } from '@/lib/api/mentorship.api';
import Link from 'next/link';
import {
  UserCheck, Star, MessageCircle, Calendar, Target, TrendingUp,
  Loader2, Sparkles, ChevronRight, Award, Users, Clock, Heart,
  BookOpen, Video, Search, Filter, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const STAGES = [
  { name: 'Explorer', emoji: '🔍', desc: 'Browse mentors, attend workshops', color: 'from-blue-400 to-blue-600' },
  { name: 'Enthusiast', emoji: '⭐', desc: 'Apply to a mentor, start learning', color: 'from-purple-400 to-purple-600' },
  { name: 'Dedicated', emoji: '🔥', desc: 'Regular sessions, complete tasks', color: 'from-amber-400 to-amber-600' },
  { name: 'Mentee', emoji: '🎯', desc: 'Personalized roadmap, deep guidance', color: 'from-emerald-400 to-emerald-600' },
  { name: 'Champion', emoji: '🏆', desc: 'Become a mentor yourself!', color: 'from-rose-400 to-rose-600' },
];

const WORKSHOPS = [
  { title: 'UPSC Strategy by IAS Topper', mentor: 'Aditya Verma, IAS', date: 'Every Saturday 10 AM', emoji: '🏛️', attendees: 234, category: 'Exam Prep' },
  { title: 'Cracking Tech Interviews', mentor: 'Sneha Rao, Ex-Google', date: 'Every Wednesday 7 PM', emoji: '💻', attendees: 156, category: 'Career' },
  { title: 'Medical Entrance Prep', mentor: 'Dr. Priya, AIIMS Delhi', date: 'Every Sunday 9 AM', emoji: '🩺', attendees: 312, category: 'Medical' },
  { title: 'Creative Writing Workshop', mentor: 'Kavya Iyer, Author', date: 'Every Friday 6 PM', emoji: '✍️', attendees: 89, category: 'Skills' },
  { title: 'Business Plan Building', mentor: 'Rajesh Kumar, Startup Founder', date: 'Bi-weekly Thursday 8 PM', emoji: '🚀', attendees: 67, category: 'Business' },
  { title: 'Science Olympiad Prep', mentor: 'Prof. Desai, IISc', date: 'Every Monday 5 PM', emoji: '🔬', attendees: 178, category: 'Competition' },
];

const FEATURED_MENTORS = [
  { name: 'Aditya Verma', role: 'IAS Officer', expertise: 'UPSC, Public Policy', rating: 4.9, mentees: 42, emoji: '🏛️' },
  { name: 'Sneha Rao', role: 'Software Architect', expertise: 'DSA, System Design', rating: 4.8, mentees: 31, emoji: '💻' },
  { name: 'Dr. Priya Sharma', role: 'Cardiologist, AIIMS', expertise: 'NEET, Medical Career', rating: 5.0, mentees: 58, emoji: '🩺' },
  { name: 'Vikram Singh', role: 'Space Scientist, ISRO', expertise: 'Physics, Research Career', rating: 4.7, mentees: 24, emoji: '🚀' },
  { name: 'Meera Joshi', role: 'CA & Financial Advisor', expertise: 'CA Exam, Finance Career', rating: 4.9, mentees: 36, emoji: '💰' },
  { name: 'Arjun Nair', role: 'Art Director', expertise: 'Design, Creative Career', rating: 4.6, mentees: 18, emoji: '🎨' },
];

export default function MentorshipPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('workshops'); // workshops | mentors | my-journey | apply
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    mentorshipAPI.getMentors({ limit: 20 }).then(r => setMentors(r.data?.data || [])).catch(() => {});
  }, []);

  const filteredMentors = searchQuery
    ? FEATURED_MENTORS.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.expertise.toLowerCase().includes(searchQuery.toLowerCase()))
    : FEATURED_MENTORS;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-800 via-purple-800 to-fuchsia-800 p-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute top-5 right-10 text-3xl">🌟</div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0"><UserCheck size={24} className="text-purple-200" /></div>
          <div><h1 className="text-xl font-extrabold text-white tracking-tight">Mentorship Hub</h1>
          <p className="text-purple-200/70 text-sm mt-0.5">Learn from real professionals — IAS officers, doctors, engineers, artists</p></div>
        </div>
      </div>

      {/* 5-Stage Pipeline */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Your Mentorship Journey — 5 Stages</p>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {STAGES.map((s, i) => (
            <div key={i} className="flex items-center gap-1 flex-shrink-0">
              <div className={`px-3 py-2 rounded-xl text-center min-w-[100px] ${i === 0 ? `bg-gradient-to-r ${s.color} text-white shadow-md` : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                <span className="text-lg block">{s.emoji}</span>
                <p className="text-[10px] font-bold mt-0.5">{s.name}</p>
              </div>
              {i < STAGES.length - 1 && <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
        {[
          { k: 'workshops', l: 'Workshops', icon: Video },
          { k: 'mentors', l: 'Find Mentors', icon: Users },
          { k: 'my-journey', l: 'My Journey', icon: TrendingUp },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              tab === t.k ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}><t.icon size={13} /> {t.l}</button>
        ))}
      </div>

      {/* ═══ WORKSHOPS ═══ */}
      {tab === 'workshops' && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Live Workshops — Free for All Students</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {WORKSHOPS.map((w, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all group">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl flex-shrink-0">{w.emoji}</span>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm group-hover:text-purple-600 transition-colors">{w.title}</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">{w.mentor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><Calendar size={10} /> {w.date}</span>
                  <span className="flex items-center gap-1"><Users size={10} /> {w.attendees} joined</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[9px] font-bold">{w.category}</span>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                    <Zap size={10} /> Join Free
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ FIND MENTORS ═══ */}
      {tab === 'mentors' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search mentors by name, expertise..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredMentors.map((m, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all text-center group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mx-auto mb-3 text-3xl group-hover:scale-110 transition-transform">{m.emoji}</div>
                <h3 className="font-bold text-gray-800 text-sm">{m.name}</h3>
                <p className="text-[11px] text-gray-500">{m.role}</p>
                <p className="text-[10px] text-purple-600 font-medium mt-1">{m.expertise}</p>
                <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-gray-400">
                  <span className="flex items-center gap-0.5"><Star size={10} className="text-amber-400 fill-amber-400" /> {m.rating}</span>
                  <span className="flex items-center gap-0.5"><Users size={10} /> {m.mentees} mentees</span>
                </div>
                <button className="w-full mt-3 py-2 rounded-lg text-[11px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm hover:from-purple-700 transition-all">
                  Request Mentorship
                </button>
              </div>
            ))}
          </div>
          {/* Also show backend mentors if any */}
          {mentors.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Platform Mentors ({mentors.length})</p>
              {mentors.slice(0, 5).map((m, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-200 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">{(m.username || m.full_name || '?').charAt(0).toUpperCase()}</div>
                  <div className="flex-1"><p className="text-sm font-semibold text-gray-700">{m.full_name || m.username}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ MY JOURNEY ═══ */}
      {tab === 'my-journey' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100/50 text-center">
            <span className="text-4xl block mb-3">🔍</span>
            <h2 className="font-bold text-gray-800 text-lg mb-1">Stage 1: Explorer</h2>
            <p className="text-sm text-gray-500 mb-4">Browse workshops, attend sessions, find your ideal mentor</p>
            <div className="flex items-center justify-center gap-1 mb-4">
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: '15%' }} />
              </div>
              <span className="text-xs font-bold text-purple-600 ml-2">15%</span>
            </div>
            <p className="text-xs text-gray-400 mb-4">Complete these to advance:</p>
            <div className="space-y-2 max-w-sm mx-auto text-left">
              {[
                { task: 'Attend 1 workshop', done: false },
                { task: 'Browse 5 mentor profiles', done: false },
                { task: 'Apply to a mentor', done: false },
                { task: 'Complete your profile interests', done: true },
              ].map((t, i) => (
                <div key={i} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl ${t.done ? 'bg-emerald-50 border border-emerald-200' : 'bg-white border border-gray-200'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${t.done ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                    {t.done && <Zap size={10} className="text-white" />}
                  </div>
                  <span className={`text-sm ${t.done ? 'text-emerald-700 line-through' : 'text-gray-700'}`}>{t.task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
