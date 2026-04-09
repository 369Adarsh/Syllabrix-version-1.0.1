'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { jeeAPI } from '@/lib/api/jee.api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import {
  Flag, ChevronLeft, ChevronRight, Send, RotateCcw, AlertTriangle,
  Calculator, X, Clock
} from 'lucide-react';

// ─── Question palette status ──────────────────────────────────────────────────
const STATUS = {
  answered:      { bg: 'bg-emerald-500 text-white',  label: 'Answered'      },
  marked:        { bg: 'bg-purple-500 text-white',   label: 'Marked'        },
  not_answered:  { bg: 'bg-red-500 text-white',      label: 'Not Answered'  },
  not_visited:   { bg: 'bg-gray-300 text-gray-700',  label: 'Not Visited'   },
};

function getStatus(idx, current, answers, flagged) {
  const ans = answers[idx];
  const isSelected = ans !== null && ans !== undefined && ans !== '';
  const isFlagged = flagged.has(idx);
  if (isFlagged) return 'marked';
  if (isSelected) return 'answered';
  if (idx < current) return 'not_answered';
  return 'not_visited';
}

// ─── Timer ────────────────────────────────────────────────────────────────────
function Timer({ totalSeconds, onExpire }) {
  const [remaining, setRemaining] = useState(totalSeconds);
  useEffect(() => {
    const iv = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(iv); onExpire(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [onExpire]);
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const isWarning = remaining < 600;
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-[14px] ${isWarning ? 'bg-red-100 text-red-700' : 'bg-white/10 text-white'}`}>
      <Clock size={14} />
      {String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
    </div>
  );
}

// ─── Main ExamPlayer ──────────────────────────────────────────────────────────
export default function ExamPlayer() {
  const { testId } = useParams();
  const router = useRouter();
  const [mock, setMock] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [flagged, setFlagged] = useState(new Set());
  const [timeSpent, setTimeSpent] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [subjectGroups, setSubjectGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [totalTimeUsed, setTotalTimeUsed] = useState(0);
  const questionStartTime = useRef(Date.now());
  const autoSaveRef = useRef(null);

  useEffect(() => {
    const loadExam = async () => {
      try {
        const [mockR, startR] = await Promise.all([
          jeeAPI.getMock(testId),
          jeeAPI.startAttempt(testId),
        ]);
        const mockData = mockR.data?.data;
        const qs = mockData?.questions || [];
        setMock(mockData);
        setQuestions(qs);
        setAnswers(new Array(qs.length).fill(null));
        setTimeSpent(new Array(qs.length).fill(0));
        setAttemptId(startR.data?.data?.attempt_id);
        // Group questions by subject
        const groups = {};
        qs.forEach((q, i) => {
          const sub = q.subject_name || 'Unknown';
          if (!groups[sub]) groups[sub] = [];
          groups[sub].push(i);
        });
        setSubjectGroups(groups);
        setActiveSubject(Object.keys(groups)[0] || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadExam();
  }, [testId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!mock) return;
    autoSaveRef.current = setInterval(() => {
      const answersPayload = answers.map((ans, i) => ({
        question_id: questions[i]?.id,
        selected: ans,
        time_spent: timeSpent[i],
        flagged: flagged.has(i),
      }));
      jeeAPI.saveProgress(testId, { answers: answersPayload, total_time_seconds: totalTimeUsed }).catch(() => {});
    }, 30000);
    return () => clearInterval(autoSaveRef.current);
  }, [mock, answers, flagged, timeSpent, totalTimeUsed, testId, questions]);

  // Track time per question
  useEffect(() => {
    questionStartTime.current = Date.now();
  }, [current]);

  // Track total time
  useEffect(() => {
    const iv = setInterval(() => setTotalTimeUsed(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const selectAnswer = (option) => {
    const elapsed = Math.round((Date.now() - questionStartTime.current) / 1000);
    setTimeSpent(prev => { const n = [...prev]; n[current] += elapsed; return n; });
    questionStartTime.current = Date.now();
    setAnswers(prev => { const n = [...prev]; n[current] = option; return n; });
  };

  const clearResponse = () => {
    setAnswers(prev => { const n = [...prev]; n[current] = null; return n; });
  };

  const toggleFlag = () => {
    setFlagged(prev => {
      const n = new Set(prev);
      if (n.has(current)) n.delete(current); else n.add(current);
      return n;
    });
  };

  const goTo = useCallback((idx) => {
    const elapsed = Math.round((Date.now() - questionStartTime.current) / 1000);
    setTimeSpent(prev => { const n = [...prev]; n[current] += elapsed; return n; });
    questionStartTime.current = Date.now();
    setCurrent(idx);
  }, [current]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answersPayload = answers.map((ans, i) => ({
        question_id: questions[i]?.id,
        selected: ans,
        time_spent: timeSpent[i],
        flagged: flagged.has(i),
      }));
      await jeeAPI.submitAttempt(testId, { answers: answersPayload, total_time_seconds: totalTimeUsed, time_per_subject: {} });
      router.push(`/jee-command/mock-tests/${testId}/result`);
    } catch {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 gap-4">
      <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-gray-500 font-medium">Loading exam...</p>
    </div>
  );

  if (!mock || !questions.length) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 gap-4 p-6">
      <AlertTriangle size={40} className="text-amber-500" />
      <h2 className="font-bold text-[18px]">Exam not available</h2>
      <p className="text-gray-500 text-center">This test has no questions yet. Add questions to the question bank first.</p>
      <button onClick={() => router.back()} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
        Go Back
      </button>
    </div>
  );

  const q = questions[current];
  const options = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : (q.options || []);
  const answered = answers.filter(a => a !== null && a !== '').length;
  const flaggedCount = flagged.size;
  const unanswered = questions.length - answered;

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
      {/* Exam Header */}
      <div className="bg-gradient-to-r from-[#042C53] to-[#185FA5] px-4 py-2.5 flex items-center justify-between flex-shrink-0 sticky top-0 z-30">
        <div className="min-w-0">
          <p className="text-white font-semibold text-[13px] truncate">{mock.title}</p>
          <p className="text-blue-300 text-[10px]">Q.{current + 1} / {questions.length} · {q.subject_name}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Timer totalSeconds={mock.duration_minutes * 60} onExpire={handleSubmit} />
          <button onClick={() => setShowSubmitConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400 text-[#042C53] text-[12px] font-bold hover:bg-yellow-300 transition-colors">
            <Send size={12} /> Submit
          </button>
        </div>
      </div>

      {/* Subject tabs */}
      <div className="bg-white border-b border-gray-200 px-4 flex gap-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {Object.entries(subjectGroups).map(([subName, indices]) => {
          const isActive = subName === activeSubject;
          const subAnswered = indices.filter(i => answers[i] !== null && answers[i] !== '').length;
          return (
            <button key={subName}
              onClick={() => { setActiveSubject(subName); goTo(indices[0]); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium whitespace-nowrap flex-shrink-0 border-b-2 transition-colors ${
                isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {subName}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                {subAnswered}/{indices.length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-0 max-w-7xl mx-auto w-full p-0 lg:p-3 lg:gap-3">
        {/* Question Panel */}
        <div className="flex-1 flex flex-col bg-white lg:rounded-xl overflow-hidden">
          {/* Question */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="text-[11px] text-gray-400 font-medium">
                Q.{current + 1} &nbsp;·&nbsp; +{q.marks} / {q.negative_marks} &nbsp;·&nbsp; ~{Math.round((q.estimated_time_seconds || 120)/60)}min
              </span>
              <button onClick={toggleFlag}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  flagged.has(current) ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-gray-100 text-gray-600 hover:bg-purple-50 border border-gray-200'
                }`}>
                <Flag size={11} /> {flagged.has(current) ? 'Marked' : 'Mark for Review'}
              </button>
            </div>

            <div className="prose prose-sm max-w-none text-[14px] text-gray-800 mb-5 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{q.question_text}</ReactMarkdown>
            </div>

            {/* Options */}
            {options.length > 0 && (
              <div className="space-y-2">
                {options.map(opt => {
                  const isSelected = answers[current] === opt.id;
                  return (
                    <button key={opt.id} onClick={() => selectAnswer(opt.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-[13px] text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}>
                      <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-bold text-[11px] transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 bg-white text-gray-500'
                      }`}>{opt.id}</span>
                      <span className="flex-1 leading-snug">
                        {opt.text.includes('$') ? <InlineMath math={opt.text.replace(/\$/g, '')} /> : opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Numerical input */}
            {q.question_type === 'numerical' && (
              <div className="mt-3">
                <p className="text-[12px] text-gray-500 mb-2">Enter your answer:</p>
                <input
                  type="number"
                  value={answers[current] || ''}
                  onChange={e => selectAnswer(e.target.value)}
                  placeholder="Enter numerical answer"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-[14px] focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between bg-white">
            <button onClick={clearResponse}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium text-red-500 hover:bg-red-50 transition-colors border border-red-200">
              <RotateCcw size={12} /> Clear
            </button>
            <div className="flex gap-2">
              <button onClick={() => goTo(Math.max(0, current - 1))} disabled={current === 0}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-[12px] font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-40">
                <ChevronLeft size={14} /> Prev
              </button>
              <button onClick={() => goTo(Math.min(questions.length - 1, current + 1))} disabled={current === questions.length - 1}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-[12px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40">
                Save &amp; Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Question Palette */}
        <div className="lg:w-[200px] bg-white lg:rounded-xl p-3 flex-shrink-0 border-t lg:border-t-0 border-gray-200">
          {/* Legend */}
          <div className="grid grid-cols-2 gap-1 mb-3">
            {Object.entries(STATUS).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded text-[9px] flex items-center justify-center font-bold ${val.bg}`}>1</div>
                <span className="text-[9px] text-gray-500">{val.label}</span>
              </div>
            ))}
          </div>
          {/* Summary */}
          <div className="flex justify-between text-[10px] mb-2 text-gray-500">
            <span>✅ {answered}</span>
            <span>🚩 {flaggedCount}</span>
            <span>⬜ {unanswered}</span>
          </div>
          {/* Grid */}
          <div className="grid grid-cols-5 gap-1 max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {questions.map((_, i) => {
              const st = getStatus(i, current, answers, flagged);
              const cfg = STATUS[st];
              const isCurrent = i === current;
              return (
                <button key={i} onClick={() => goTo(i)}
                  className={`w-full aspect-square rounded text-[11px] font-bold transition-all ${cfg.bg} ${
                    isCurrent ? 'ring-2 ring-offset-1 ring-blue-400 scale-110' : 'hover:opacity-80'
                  }`}>
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-[16px] text-gray-800 mb-1">Submit Exam?</h3>
            <p className="text-[13px] text-gray-500 mb-4">
              Answered: {answered}/{questions.length} · Flagged: {flaggedCount} · Unanswered: {unanswered}
            </p>
            {unanswered > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
                <p className="text-[12px] text-amber-700">{unanswered} questions unanswered. Unanswered = 0 marks.</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Continue Exam
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-bold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {submitting ? 'Submitting...' : 'Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
