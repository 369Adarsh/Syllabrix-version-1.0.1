'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { jeeAPI } from '@/lib/api/jee.api';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid
} from 'recharts';
import {
  Trophy, Target, Clock, TrendingUp, AlertCircle, CheckCircle2, XCircle,
  Minus, ChevronDown, ChevronUp, ArrowLeft, RotateCcw, Eye, EyeOff,
  Lightbulb, Zap, AlertTriangle, BookOpen, BarChart2
} from 'lucide-react';

const SUBJECT_COLORS = {
  physics:     { primary: '#378ADD', bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
  chemistry:   { primary: '#0F6E56', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  mathematics: { primary: '#534AB7', bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200'  },
};

const ERROR_ICONS = {
  conceptual:  { icon: BookOpen,      color: 'text-red-500',    bg: 'bg-red-50',    label: 'Conceptual' },
  calculation: { icon: AlertTriangle, color: 'text-amber-500',  bg: 'bg-amber-50',  label: 'Calculation' },
  silly:       { icon: Zap,           color: 'text-orange-500', bg: 'bg-orange-50', label: 'Silly' },
  guessed:     { icon: Lightbulb,     color: 'text-purple-500', bg: 'bg-purple-50', label: 'Guessed' },
};

function ScoreMeter({ score, maxScore }) {
  const pct = maxScore > 0 ? Math.max(0, (score / maxScore) * 100) : 0;
  const color = pct >= 60 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="48" fill="none" stroke="#f1f5f9" strokeWidth="12" />
        <circle cx="60" cy="60" r="48" fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${(pct / 100) * 301.6} 301.6`}
          strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[22px] font-extrabold text-gray-800">{score}</span>
        <span className="text-[11px] text-gray-400">/{maxScore}</span>
      </div>
    </div>
  );
}

function QuestionReview({ q, index }) {
  const [open, setOpen] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const options = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : (q.options || []);
  const statusMap = {
    correct:     { icon: CheckCircle2, cls: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Correct'     },
    wrong:       { icon: XCircle,      cls: 'text-red-600',     bg: 'bg-red-50 border-red-200',         label: 'Wrong'       },
    unanswered:  { icon: Minus,        cls: 'text-gray-400',    bg: 'bg-gray-50 border-gray-200',       label: 'Unanswered'  },
  };
  const st = statusMap[q.status] || statusMap.unanswered;
  const Icon = st.icon;

  return (
    <div className={`rounded-xl border ${st.bg} overflow-hidden`}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 p-3 text-left">
        <span className="w-6 h-6 rounded-full bg-white border flex items-center justify-center text-[11px] font-bold text-gray-500 flex-shrink-0">
          {index}
        </span>
        <Icon size={15} className={`flex-shrink-0 ${st.cls}`} />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-gray-700 truncate">{q.question_text?.replace(/[#*`]/g, '').slice(0, 80)}...</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {q.score_earned !== undefined && (
            <span className={`text-[12px] font-bold ${q.score_earned > 0 ? 'text-emerald-600' : q.score_earned < 0 ? 'text-red-500' : 'text-gray-400'}`}>
              {q.score_earned > 0 ? '+' : ''}{q.score_earned}
            </span>
          )}
          {q.time_spent_seconds > 0 && (
            <span className="text-[10px] text-gray-400">{Math.round(q.time_spent_seconds)}s</span>
          )}
          {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 border-t border-white/60 pt-3">
          <div className="prose prose-sm max-w-none text-[13px] text-gray-800 mb-3">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{q.question_text}</ReactMarkdown>
          </div>

          {options.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
              {options.map(opt => {
                let cls = 'bg-white border-gray-200 text-gray-600';
                if (opt.id === q.correct_answer) cls = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-medium';
                if (opt.id === q.user_answer && opt.id !== q.correct_answer) cls = 'bg-red-50 border-red-400 text-red-800 line-through';
                return (
                  <div key={opt.id} className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-[12px] ${cls}`}>
                    <span className="font-bold flex-shrink-0">{opt.id}.</span>
                    <span>
                      {opt.text.includes('$') ? <InlineMath math={opt.text.replace(/\$/g, '')} /> : opt.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {q.question_type === 'numerical' && (
            <div className="flex items-center gap-3 mb-3 text-[12px]">
              <span className="text-gray-500">Your answer: <span className="font-bold text-gray-700">{q.user_answer ?? '—'}</span></span>
              <span className="text-gray-500">Correct: <span className="font-bold text-emerald-600">{q.correct_answer}</span></span>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {q.error_type && ERROR_ICONS[q.error_type] && (() => {
              const ec = ERROR_ICONS[q.error_type];
              const EIcon = ec.icon;
              return (
                <span className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-full ${ec.bg} ${ec.color} font-medium`}>
                  <EIcon size={11} /> {ec.label} error
                </span>
              );
            })()}
            {q.solution_text && (
              <button onClick={() => setShowSolution(v => !v)}
                className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-white border text-gray-600 hover:bg-gray-50 transition-colors ml-auto">
                {showSolution ? <EyeOff size={11} /> : <Eye size={11} />} Solution
              </button>
            )}
          </div>

          {showSolution && q.solution_text && (
            <div className="mt-2 bg-blue-50 rounded-lg p-3">
              <p className="text-[11px] font-semibold text-blue-800 mb-1.5">Step-by-step Solution</p>
              <div className="prose prose-sm max-w-none text-[12px] text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{q.solution_text}</ReactMarkdown>
              </div>
              {q.quick_trick && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-[11px] font-semibold text-yellow-800">⚡ Quick Trick</p>
                  <p className="text-[12px] text-yellow-900 mt-0.5">{q.quick_trick}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MockResultPage() {
  const { testId } = useParams();
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSubject, setExpandedSubject] = useState(null);

  useEffect(() => {
    jeeAPI.getResult(testId)
      .then(r => setResult(r.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [testId]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="space-y-3 w-full max-w-lg">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  if (!result) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle size={32} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Result not found</p>
        <Link href="/jee-command/mock-tests" className="text-blue-500 text-sm mt-2 block">← Back to mock tests</Link>
      </div>
    </div>
  );

  const { attempt, mock, subject_breakdown = [], question_review = [], rank_prediction } = result;
  const pct = mock.total_marks > 0 ? Math.max(0, (attempt.total_score / mock.total_marks) * 100) : 0;
  const totalCorrect = question_review.filter(q => q.status === 'correct').length;
  const totalWrong = question_review.filter(q => q.status === 'wrong').length;
  const totalSkipped = question_review.filter(q => q.status === 'unanswered').length;
  const accuracy = (totalCorrect + totalWrong) > 0 ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) : 0;
  const timeTaken = attempt.time_taken_seconds || 0;
  const timeStr = `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`;

  const radarData = subject_breakdown.map(s => ({
    subject: s.subject_name?.split(' ')[0] || s.subject_slug,
    score: s.subject_score_max > 0 ? Math.round((s.subject_score / s.subject_score_max) * 100) : 0,
    fullMark: 100,
  }));

  const pieData = [
    { name: 'Correct', value: totalCorrect, color: '#22c55e' },
    { name: 'Wrong',   value: totalWrong,   color: '#ef4444' },
    { name: 'Skipped', value: totalSkipped, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  const errorData = Object.entries(
    question_review.filter(q => q.status === 'wrong' && q.error_type).reduce((acc, q) => {
      acc[q.error_type] = (acc[q.error_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({ type, count, label: ERROR_ICONS[type]?.label || type }));

  const TABS = [
    { id: 'overview',  label: 'Overview' },
    { id: 'subjects',  label: 'By Subject' },
    { id: 'questions', label: 'Questions' },
    { id: 'errors',    label: 'Error Analysis' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link href="/jee-command/mock-tests"
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft size={16} className="text-gray-600" />
            </Link>
            <div>
              <p className="text-[13px] font-semibold text-gray-800 leading-tight">{mock.title}</p>
              <p className="text-[10px] text-gray-400">Result & Analysis</p>
            </div>
          </div>
          <Link href={`/jee-command/mock-tests/${testId}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[12px] font-semibold hover:bg-blue-700 transition-colors">
            <RotateCcw size={12} /> Retake
          </Link>
        </div>
        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1 pb-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-[12px] font-medium border-b-2 transition-colors ${
                activeTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>{t.label}</button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Score hero */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ScoreMeter score={attempt.total_score} maxScore={mock.total_marks} />
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-[13px] text-gray-500 mb-1">{mock.title}</p>
                  <div className="flex items-center gap-2 justify-center sm:justify-start mb-3">
                    <Trophy size={18} className="text-yellow-500" />
                    <span className="text-[22px] font-extrabold text-gray-800">{Math.round(pct)}%</span>
                    <span className={`text-[12px] px-2 py-0.5 rounded-full font-medium ${
                      pct >= 60 ? 'bg-emerald-50 text-emerald-700' : pct >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                    }`}>{pct >= 60 ? 'Good' : pct >= 40 ? 'Average' : 'Below Average'}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Correct',   value: totalCorrect,   color: 'text-emerald-600' },
                      { label: 'Wrong',     value: totalWrong,     color: 'text-red-500'     },
                      { label: 'Skipped',   value: totalSkipped,   color: 'text-gray-400'    },
                      { label: 'Accuracy',  value: `${accuracy}%`, color: 'text-blue-600'    },
                    ].map(s => (
                      <div key={s.label} className="bg-gray-50 rounded-lg p-2.5 text-center">
                        <p className={`text-[18px] font-extrabold ${s.color}`}>{s.value}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Time + rank */}
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-[12px] text-gray-500">
                  <Clock size={13} className="text-blue-400" />
                  Time taken: <span className="font-semibold text-gray-700">{timeStr}</span>
                </div>
                {rank_prediction && (
                  <div className="flex items-center gap-2 text-[12px] text-gray-500">
                    <Target size={13} className="text-indigo-400" />
                    Est. rank: <span className="font-semibold text-gray-700">{rank_prediction.rank_range}</span>
                    <span className="text-gray-400">({rank_prediction.percentile}%ile)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Radar */}
              {radarData.length >= 3 && (
                <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <p className="text-[12px] font-semibold text-gray-700 mb-3">Subject Performance</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#9ca3af' }} />
                      <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Pie */}
              <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <p className="text-[12px] font-semibold text-gray-700 mb-3">Attempt Distribution</p>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={140}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2">
                    {pieData.map(d => (
                      <div key={d.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-[12px] text-gray-600">{d.name}: <strong>{d.value}</strong></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Rank prediction */}
            {rank_prediction && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={15} className="text-indigo-600" />
                  <p className="text-[13px] font-semibold text-indigo-800">JEE Main Rank Prediction</p>
                </div>
                <p className="text-[13px] text-indigo-700">Based on your score of <strong>{attempt.total_score}/{mock.total_marks}</strong>, your estimated rank is in the range <strong>{rank_prediction.rank_range}</strong> ({rank_prediction.percentile}th percentile).</p>
                {rank_prediction.message && (
                  <p className="text-[12px] text-indigo-500 mt-1">{rank_prediction.message}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* SUBJECTS TAB */}
        {activeTab === 'subjects' && (
          <div className="space-y-3">
            {subject_breakdown.map(s => {
              const cfg = SUBJECT_COLORS[s.subject_slug] || SUBJECT_COLORS.physics;
              const sPct = s.subject_score_max > 0 ? Math.round((s.subject_score / s.subject_score_max) * 100) : 0;
              const sAcc = (s.correct + s.wrong) > 0 ? Math.round((s.correct / (s.correct + s.wrong)) * 100) : 0;
              const isExpanded = expandedSubject === s.subject_slug;

              return (
                <div key={s.subject_slug} className={`bg-white rounded-xl border ${cfg.border} overflow-hidden`}
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <button onClick={() => setExpandedSubject(isExpanded ? null : s.subject_slug)}
                    className="w-full p-4 text-left">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`text-[14px] font-bold ${cfg.text}`}>{s.subject_name}</h3>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.text}`}>{sPct}%</span>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-gray-500">
                          <span className="text-emerald-600 font-medium">✓ {s.correct}</span>
                          <span className="text-red-500 font-medium">✗ {s.wrong}</span>
                          <span className="text-gray-400">— {s.unanswered}</span>
                          <span>Acc: {sAcc}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-[20px] font-extrabold ${cfg.text}`}>{s.subject_score}</p>
                        <p className="text-[10px] text-gray-400">/{s.subject_score_max}</p>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${sPct}%`, backgroundColor: cfg.primary }} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-2">
                      {question_review.filter(q => q.subject_slug === s.subject_slug).map((q, i) => (
                        <QuestionReview key={q.id} q={q} index={i + 1} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* QUESTIONS TAB */}
        {activeTab === 'questions' && (
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {[
                { key: 'all',       label: 'All',     count: question_review.length },
                { key: 'correct',   label: 'Correct', count: totalCorrect           },
                { key: 'wrong',     label: 'Wrong',   count: totalWrong             },
                { key: 'unanswered',label: 'Skipped', count: totalSkipped           },
              ].map(f => (
                <button key={f.key} className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
            {question_review.map((q, i) => (
              <QuestionReview key={q.id} q={q} index={i + 1} />
            ))}
          </div>
        )}

        {/* ERRORS TAB */}
        {activeTab === 'errors' && (
          <div className="space-y-4">
            {/* Error breakdown */}
            {errorData.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(ERROR_ICONS).map(([key, ec]) => {
                    const count = errorData.find(e => e.type === key)?.count || 0;
                    const EIcon = ec.icon;
                    return (
                      <div key={key} className={`${ec.bg} rounded-xl p-3 text-center border border-white`}>
                        <EIcon size={18} className={`${ec.color} mx-auto mb-1.5`} />
                        <p className={`text-[20px] font-extrabold ${ec.color}`}>{count}</p>
                        <p className="text-[11px] text-gray-600">{ec.label}</p>
                      </div>
                    );
                  })}
                </div>

                {errorData.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <p className="text-[12px] font-semibold text-gray-700 mb-3">Error Distribution</p>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={errorData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis dataKey="label" type="category" tick={{ fontSize: 11 }} width={80} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Wrong questions */}
                <div>
                  <p className="text-[12px] font-semibold text-gray-700 mb-2">Wrong answers to review</p>
                  <div className="space-y-2">
                    {question_review.filter(q => q.status === 'wrong').map((q, i) => (
                      <QuestionReview key={q.id} q={q} index={i + 1} />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-3" />
                <p className="font-semibold text-gray-600">No errors to analyze!</p>
                <p className="text-[12px] text-gray-400 mt-1">{totalSkipped > 0 ? `${totalSkipped} questions were skipped.` : 'Perfect attempt.'}</p>
              </div>
            )}

            {/* Improvement suggestions */}
            {question_review.filter(q => q.status !== 'correct').length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={15} className="text-amber-600" />
                  <p className="text-[13px] font-semibold text-amber-800">Improvement Roadmap</p>
                </div>
                <ul className="space-y-1.5">
                  {subject_breakdown.filter(s => (s.subject_score / s.subject_score_max) < 0.5).map(s => (
                    <li key={s.subject_slug} className="flex items-center gap-2 text-[12px] text-amber-700">
                      <AlertCircle size={12} className="text-amber-500 flex-shrink-0" />
                      <strong>{s.subject_name}</strong>: Only {Math.round((s.subject_score/s.subject_score_max)*100)}% — needs focused practice.
                      <Link href={`/jee-command/syllabus?subject=${s.subject_slug}`}
                        className="text-blue-600 font-medium hover:underline ml-auto flex-shrink-0">
                        Study →
                      </Link>
                    </li>
                  ))}
                  {question_review.filter(q => q.status === 'wrong' && q.error_type === 'conceptual').length > 2 && (
                    <li className="flex items-center gap-2 text-[12px] text-amber-700">
                      <BookOpen size={12} className="text-red-500 flex-shrink-0" />
                      Multiple conceptual errors — revisit theory before attempting more mocks.
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
