'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { prepAPI } from '@/lib/api/prep.api';
import { aiAPI } from '@/lib/api/ai.api';
import {
  GraduationCap, ChevronRight, Newspaper, Brain, BookMarked, Loader2,
  BarChart3, Target, Flame, ArrowRight, Trophy, Star, Zap, Clock, Map
} from 'lucide-react';

export default function PrepPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [myExams, setMyExams] = useState([]);
  const [stats, setStats] = useState(null);
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      prepAPI.getCategories().catch(() => ({ data: { data: [] } })),
      prepAPI.getMyExams().catch(() => ({ data: { data: [] } })),
      prepAPI.getMyQuizStats().catch(() => ({ data: { data: null } })),
      aiAPI.getNewsroom({ days: 1, limit: 5 }).catch(() => ({ data: { data: { articles: [] } } })),
    ]).then(([catRes, examRes, statsRes, newsRes]) => {
      setCategories(catRes.data?.data || []);
      setMyExams(examRes.data?.data || []);
      setStats(statsRes.data?.data || null);
      const nd = newsRes.data?.data || newsRes.data;
      setLatestNews((nd.articles || nd || []).slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 p-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/15 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/4 w-52 h-52 bg-indigo-500/10 rounded-full translate-y-1/2" />
        <div className="absolute top-6 right-12 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={24} className="text-blue-300" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-white tracking-tight">PrepSmart</h1>
            <p className="text-blue-300/70 text-sm mt-0.5">AI-powered exam preparation — newsroom, quizzes, career navigator &amp; more</p>
          </div>
          {stats && (
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-center bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm border border-white/10">
                <p className="text-xl font-extrabold text-white">{stats.total_attempts || 0}</p>
                <p className="text-[10px] text-blue-300/60 uppercase tracking-wider font-medium">Quizzes</p>
              </div>
              <div className="text-center bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm border border-white/10">
                <p className="text-xl font-extrabold text-white">{stats.avg_percentage || 0}%</p>
                <p className="text-[10px] text-blue-300/60 uppercase tracking-wider font-medium">Avg Score</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions — 6 cards with Newsroom + Navigator */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { href: '/newsroom', icon: Newspaper, label: 'Newsroom', desc: '54 sources', gradient: 'from-slate-700 to-blue-800', bg: 'from-slate-50 to-blue-50', border: 'border-slate-200/50' },
          { href: '/prep/current-affairs', icon: Flame, label: 'Current Affairs', desc: 'Daily updates', gradient: 'from-orange-500 to-red-500', bg: 'from-orange-50 to-red-50', border: 'border-orange-200/50' },
          { href: '/prep/daily-quiz', icon: Brain, label: 'Quiz Hub', desc: 'Daily + Topic', gradient: 'from-purple-500 to-fuchsia-600', bg: 'from-purple-50 to-fuchsia-50', border: 'border-purple-200/50' },
          { href: '/career-explorer', icon: Target, label: 'Navigator', desc: 'Aptitude + Career', gradient: 'from-teal-500 to-emerald-600', bg: 'from-teal-50 to-emerald-50', border: 'border-teal-200/50' },
          { href: '/prep/my-stats', icon: BarChart3, label: 'My Stats', desc: 'Performance', gradient: 'from-emerald-500 to-teal-600', bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200/50' },
          { href: '/prep/bookmarks', icon: BookMarked, label: 'Bookmarks', desc: 'Saved items', gradient: 'from-blue-500 to-indigo-600', bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200/50' },
        ].map((item, i) => (
          <Link key={i} href={item.href}
            className={`bg-gradient-to-br ${item.bg} border ${item.border} rounded-2xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all group`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-2.5 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all`}>
              <item.icon size={20} className="text-white" />
            </div>
            <p className="text-sm font-bold text-gray-800">{item.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>

      <div className="flex gap-5">
        {/* Main Column */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Latest Newsroom Headlines */}
          {latestNews.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 flex items-center gap-1.5">
                  <Newspaper size={11} className="text-blue-500" /> Latest from Newsroom
                </p>
                <Link href="/newsroom" className="text-[11px] font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1">
                  View All <ArrowRight size={11} />
                </Link>
              </div>
              <div className="space-y-2">
                {latestNews.map((n, i) => (
                  <Link key={i} href="/newsroom"
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50/30 transition-all group">
                    <span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800 leading-snug group-hover:text-blue-700 transition-colors">{n.headline || n.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {n.category && <span className="text-[9px] font-semibold text-gray-400 uppercase">{(n.category || '').replace('_', ' ')}</span>}
                        {n.importance === 'critical' && <Flame size={10} className="text-red-500" />}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* My Exams */}
          {myExams.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-4 flex items-center gap-1.5"><Star size={11} className="text-amber-500" /> My Exams</p>
              <div className="space-y-2">
                {myExams.map(e => (
                  <Link key={e.exam_id || e.id} href={`/prep/exam/${e.slug}`}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors"><Target size={16} className="text-blue-600" /></div>
                      <div><p className="text-sm font-semibold text-gray-800">{e.name}</p><p className="text-[11px] text-gray-400">{e.conducting_body}</p></div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* All Categories */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-4 flex items-center gap-1.5"><GraduationCap size={11} className="text-blue-500" /> All Exam Categories</p>
            {categories.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No exam categories available yet.</p>
            ) : (
              <div className="space-y-3">
                {categories.map(cat => (
                  <div key={cat.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-100 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{cat.icon_emoji || '📚'}</span>
                      <h3 className="font-bold text-gray-800 text-sm">{cat.name}</h3>
                    </div>
                    {cat.children?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 ml-10">
                        {cat.children.map(sub => (
                          <Link key={sub.id} href={`/prep/exam/${sub.slug}`}
                            className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all">
                            {sub.icon_emoji} {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block w-[260px] flex-shrink-0 space-y-4">
          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3 flex items-center gap-1.5"><Zap size={11} className="text-blue-500" /> AI Tools</p>
            <div className="space-y-1.5">
              {[
                { href: '/mindmap', icon: Brain, label: 'AI Mind Map', color: 'text-purple-500' },
                { href: '/ai-buddy', icon: Zap, label: 'AI Buddy', color: 'text-indigo-500' },
                { href: '/career-explorer', icon: Map, label: 'Career Explorer', color: 'text-blue-500' },
                { href: '/career-explorer', icon: Target, label: 'Career Navigator', color: 'text-teal-500' },
              ].map((l, i) => (
                <Link key={i} href={l.href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all">
                  <l.icon size={14} className={l.color} /> {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Study tip */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 p-4">
            <div className="flex items-center gap-2 mb-2"><Flame size={16} className="text-amber-500" /><p className="text-xs font-bold text-amber-700">Daily Tip</p></div>
            <p className="text-[12px] text-amber-800 leading-relaxed">
              Read the <strong>Syllabrix Newsroom</strong> every morning. Then take the <strong>Daily Quiz</strong> to test what you remember. This builds exam-ready recall in just 15 minutes a day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
