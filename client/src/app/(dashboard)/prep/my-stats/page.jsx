'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { prepAPI } from '@/lib/api/prep.api';
import { BarChart3, Target, TrendingUp, AlertTriangle, ArrowLeft, Loader2, Trophy, CheckCircle, Flame, Brain } from 'lucide-react';
import Link from 'next/link';

export default function PrepStatsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prepAPI.getMyQuizStats()
      .then(r => setStats(r.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-600 p-5">
        <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex items-center gap-3">
          <Link href="/prep" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <ArrowLeft size={16} className="text-white" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <BarChart3 size={20} className="text-emerald-200" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white">My Performance</h1>
            <p className="text-emerald-200/70 text-xs">Track your quiz results and identify weak areas</p>
          </div>
        </div>
      </div>

      {!stats ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={28} className="text-emerald-400" />
          </div>
          <h2 className="font-bold text-gray-700 mb-2">No Stats Yet</h2>
          <p className="text-sm text-gray-400 mb-5">Take quizzes to see your performance here.</p>
          <Link href="/prep/daily-quiz"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-md hover:from-purple-600 hover:to-fuchsia-600 transition-all">
            <Brain size={16} /> Take a Quiz
          </Link>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Quizzes Taken', value: stats.total_attempts || 0, icon: Target, gradient: 'from-blue-500 to-indigo-600', bg: 'from-blue-50 to-indigo-50' },
              { label: 'Avg Score', value: `${stats.avg_percentage || 0}%`, icon: TrendingUp, gradient: 'from-emerald-500 to-teal-600', bg: 'from-emerald-50 to-teal-50' },
              { label: 'Correct Answers', value: stats.total_correct || 0, icon: CheckCircle, gradient: 'from-purple-500 to-fuchsia-600', bg: 'from-purple-50 to-fuchsia-50' },
              { label: 'Best Score', value: `${stats.best_percentage || stats.avg_percentage || 0}%`, icon: Trophy, gradient: 'from-amber-500 to-orange-600', bg: 'from-amber-50 to-orange-50' },
            ].map((s, i) => (
              <div key={i} className={`bg-gradient-to-br ${s.bg} border border-gray-100 rounded-2xl p-4 shadow-sm`}>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-3 shadow-sm`}>
                  <s.icon size={18} className="text-white" />
                </div>
                <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Performance gauge */}
          {stats.avg_percentage !== undefined && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3 flex items-center gap-1.5">
                <TrendingUp size={11} className="text-emerald-500" /> Performance Level
              </p>
              <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${
                  stats.avg_percentage >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                  stats.avg_percentage >= 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                  'bg-gradient-to-r from-amber-500 to-orange-500'
                }`} style={{ width: `${Math.min(stats.avg_percentage || 0, 100)}%` }} />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-400">0%</span>
                <span className={`text-xs font-bold ${
                  stats.avg_percentage >= 80 ? 'text-emerald-600' :
                  stats.avg_percentage >= 50 ? 'text-blue-600' : 'text-amber-600'
                }`}>
                  {stats.avg_percentage >= 80 ? '🎯 Excellent!' :
                   stats.avg_percentage >= 50 ? '💪 Good progress' : '📚 Keep practicing'}
                </span>
                <span className="text-xs text-gray-400">100%</span>
              </div>
            </div>
          )}

          {/* Weak topics */}
          {stats.weak_topics?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-4 flex items-center gap-1.5">
                <AlertTriangle size={11} className="text-amber-500" /> Topics to Improve
              </p>
              <div className="space-y-2">
                {stats.weak_topics.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-100/40">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Flame size={14} className="text-amber-500" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{typeof t === 'string' ? t : t.topic || t.name}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      Needs practice
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
