'use client';
import { useEffect, useState } from 'react';
import { jeeAPI } from '@/lib/api/jee.api';
import { useJee } from '../layout';
import Link from 'next/link';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import {
  TrendingUp, Target, Flame, Clock, BookOpen, ClipboardList,
  AlertCircle, CheckCircle2, Zap, BarChart2, Trophy, ArrowRight
} from 'lucide-react';

const SUBJECT_COLORS = {
  physics:     '#378ADD',
  chemistry:   '#0F6E56',
  mathematics: '#534AB7',
};

const ERROR_COLORS = {
  conceptual:  '#ef4444',
  calculation: '#f59e0b',
  silly:       '#f97316',
  guessed:     '#a855f7',
  misread:     '#64748b',
};

function StatCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const colors = {
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-700',    icon: 'text-blue-500'    },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-500' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   icon: 'text-amber-500'   },
    violet:  { bg: 'bg-violet-50',  text: 'text-violet-700',  icon: 'text-violet-500'  },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className={`${c.bg} rounded-xl p-4 border border-white`}>
      <Icon size={16} className={c.icon} />
      <p className={`text-[24px] font-extrabold ${c.text} mt-1`}>{value}</p>
      <p className="text-[11px] text-gray-600 font-medium">{label}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function SectionTitle({ title, href, linkLabel }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[13px] font-bold text-gray-700">{title}</h2>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-[11px] text-blue-500 font-medium hover:underline">
          {linkLabel} <ArrowRight size={11} />
        </Link>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const { examType } = useJee();
  const [overview, setOverview] = useState(null);
  const [mockTrends, setMockTrends] = useState([]);
  const [errorPatterns, setErrorPatterns] = useState([]);
  const [rankPrediction, setRankPrediction] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      jeeAPI.getAnalyticsOverview(),
      jeeAPI.getMockTrends(),
      jeeAPI.getErrorPatterns(),
      jeeAPI.getRankPrediction(),
      jeeAPI.getSubjects(),
      jeeAPI.getProgressOverview(),
    ]).then(([ovR, trendsR, errR, rankR, subR, progR]) => {
      if (ovR.status === 'fulfilled')     setOverview(ovR.value.data?.data);
      if (trendsR.status === 'fulfilled') setMockTrends(trendsR.value.data?.data || []);
      if (errR.status === 'fulfilled')    setErrorPatterns(errR.value.data?.data || []);
      if (rankR.status === 'fulfilled')   setRankPrediction(rankR.value.data?.data);
      if (subR.status === 'fulfilled')    setSubjects(subR.value.data?.data || []);
      if (progR.status === 'fulfilled')   setProgress(progR.value.data?.data || []);
    }).finally(() => setLoading(false));
  }, [examType]);

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse border" />)}
    </div>
  );

  // Build radar data from progress
  const radarData = subjects.map(s => {
    const chaps = progress.filter(p => p.subject_slug === s.slug);
    const mastered = chaps.filter(c => c.mastery_level === 'mastered').length;
    const studied = chaps.filter(c => c.mastery_level !== 'not_started').length;
    const pct = chaps.length > 0 ? Math.round((studied / chaps.length) * 100) : 0;
    return { subject: s.name?.split(' ')[0] || s.slug, score: pct, fullMark: 100 };
  });

  // Mastery distribution
  const masteryDist = ['not_started','beginner','intermediate','advanced','mastered'].map(m => ({
    name: m.replace('_', ' '),
    count: progress.filter(p => p.mastery_level === m).length,
    color: { not_started: '#94a3b8', beginner: '#60a5fa', intermediate: '#f59e0b', advanced: '#8b5cf6', mastered: '#22c55e' }[m],
  })).filter(d => d.count > 0);

  // Error pie data
  const errorPieData = errorPatterns.map(e => ({
    name: e.error_type,
    value: e.count,
    color: ERROR_COLORS[e.error_type] || '#94a3b8',
  }));

  const totalErrors = errorPieData.reduce((s, e) => s + e.value, 0);

  return (
    <div className="space-y-5">
      {/* Key stats */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Target}      label="Syllabus Coverage" value={`${overview.syllabus_percent}%`} sub="of all chapters studied" color="blue" />
          <StatCard icon={ClipboardList} label="Mocks Taken"     value={overview.mock_tests_taken}      sub="total attempts"          color="violet" />
          <StatCard icon={TrendingUp}   label="Avg Mock Score"   value={`${overview.mock_avg_score}%`} sub="across all mocks"        color="emerald" />
          <StatCard icon={Flame}        label="Study Streak"     value={`${overview.streak}d`}          sub="days in a row"           color="amber" />
        </div>
      )}

      {/* Mock score trend */}
      {mockTrends.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <SectionTitle title="Mock Test Score Trend" href="/jee-command/mock-tests" linkLabel="All mocks" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mockTrends} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" />
              <Tooltip formatter={v => [`${v}%`, 'Score']} labelStyle={{ fontSize: 11 }} contentStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Subject radar + mastery dist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {radarData.length >= 2 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <SectionTitle title="Subject Coverage Radar" href="/jee-command/syllabus" linkLabel="Syllabus" />
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {masteryDist.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <SectionTitle title="Chapter Mastery Distribution" />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={masteryDist} layout="vertical" margin={{ right: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {masteryDist.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Chapter mastery heatmap */}
      {progress.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <SectionTitle title="Chapter Mastery Heatmap" href="/jee-command/syllabus" linkLabel="View syllabus" />
          <div className="space-y-3">
            {subjects.map(s => {
              const subChapters = progress.filter(p => p.subject_slug === s.slug);
              if (!subChapters.length) return null;
              return (
                <div key={s.slug}>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">{s.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {subChapters.map(ch => {
                      const m = ch.mastery_level || 'not_started';
                      const color = {
                        not_started: 'bg-gray-100 border-gray-200',
                        beginner:    'bg-blue-100 border-blue-200',
                        intermediate:'bg-amber-100 border-amber-200',
                        advanced:    'bg-purple-100 border-purple-200',
                        mastered:    'bg-emerald-100 border-emerald-300',
                      }[m];
                      return (
                        <Link key={ch.id} href={`/jee-command/syllabus/${s.slug}/${ch.slug}`}
                          title={`${ch.chapter_name} — ${m.replace('_', ' ')}`}
                          className={`w-6 h-6 rounded border text-center text-[9px] font-bold flex items-center justify-center hover:opacity-80 transition-opacity ${color}`}>
                          {ch.chapter_number || '?'}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {[
                { color: 'bg-gray-100',    label: 'Not started' },
                { color: 'bg-blue-100',    label: 'Beginner'    },
                { color: 'bg-amber-100',   label: 'Intermediate'},
                { color: 'bg-purple-100',  label: 'Advanced'    },
                { color: 'bg-emerald-100', label: 'Mastered'    },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className={`w-4 h-4 rounded border ${l.color}`} />
                  <span className="text-[10px] text-gray-400">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error analysis */}
      {errorPieData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <SectionTitle title="Error Pattern Analysis" />
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ResponsiveContainer width="40%" height={180}>
              <PieChart>
                <Pie data={errorPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {errorPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [v, 'errors']} contentStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {errorPieData.map(e => (
                <div key={e.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                  <span className="text-[12px] text-gray-600 capitalize flex-1">{e.name} errors</span>
                  <span className="text-[12px] font-bold text-gray-700">{e.value}</span>
                  <span className="text-[10px] text-gray-400">({Math.round((e.value/totalErrors)*100)}%)</span>
                </div>
              ))}
            </div>
          </div>
          {errorPieData.find(e => e.name === 'conceptual')?.value > 3 && (
            <div className="mt-3 p-2.5 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-[12px] text-red-700">⚠️ High conceptual errors — focus on theory and understanding before more practice.</p>
            </div>
          )}
        </div>
      )}

      {/* Rank prediction */}
      {rankPrediction && (
        <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #042C53, #185FA5)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={18} className="text-yellow-300" />
            <h2 className="text-[15px] font-bold text-white">JEE Rank Prediction</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-[22px] font-extrabold text-white">{rankPrediction.predicted_percentile}%</p>
              <p className="text-[11px] text-blue-200">Percentile</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-[18px] font-extrabold text-white">{rankPrediction.rank_range}</p>
              <p className="text-[11px] text-blue-200">Rank Range</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-[18px] font-extrabold text-yellow-300">{rankPrediction.percentage ? parseFloat(rankPrediction.percentage).toFixed(1) + '%' : '—'}</p>
              <p className="text-[11px] text-blue-200">Latest Mock Score</p>
            </div>
          </div>
          {rankPrediction.message && (
            <p className="text-[12px] text-blue-200">{rankPrediction.message}</p>
          )}
          {overview && overview.syllabus_percent < 60 && (
            <p className="text-[12px] text-amber-300 mt-1">⚡ Complete more of the syllabus to improve this prediction.</p>
          )}
        </div>
      )}

      {/* Empty state if no data at all */}
      {!overview && mockTrends.length === 0 && progress.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <BarChart2 size={36} className="text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">No analytics data yet</p>
          <p className="text-[12px] text-gray-400 mt-1 mb-4">Start studying chapters and taking mock tests to see your analytics.</p>
          <div className="flex justify-center gap-3">
            <Link href="/jee-command/syllabus" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-semibold hover:bg-blue-700 transition-colors">
              Study Syllabus
            </Link>
            <Link href="/jee-command/mock-tests" className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-[13px] font-semibold hover:bg-gray-50 transition-colors">
              Take a Mock Test
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
