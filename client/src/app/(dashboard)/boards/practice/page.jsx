'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BOARD_SUBJECTS, CBSE_CHAPTERS } from '@/data/board-syllabus';
import apiClient from '@/lib/api-client';
import Link from 'next/link';
import {
  ArrowLeft, Sparkles, CheckCircle2, XCircle, ChevronRight,
  RotateCcw, BookOpen, Loader2, ChevronDown, ChevronUp,
  Target, Brain, FileText, AlignLeft, List, ToggleLeft,
  Grid3x3, Columns2, Zap
} from 'lucide-react';

// ── Question type config ──────────────────────────────────────────────────────

const QUESTION_TYPES = [
  { key: 'mcq',             label: 'MCQ',             emoji: '🔘', marks: '1 mark',  desc: '4-option multiple choice' },
  { key: 'assertion_reason',label: 'Assertion-Reason', emoji: '⚖️',  marks: '1 mark',  desc: 'Evaluate A & R statements' },
  { key: 'very_short',      label: 'Very Short Ans',  emoji: '✏️',  marks: '2 marks', desc: '1-2 sentence answer' },
  { key: 'short_answer',    label: 'Short Answer',    emoji: '📝',  marks: '3 marks', desc: '3-5 sentence answer' },
  { key: 'long_answer',     label: 'Long Answer',     emoji: '📄',  marks: '5 marks', desc: 'Detailed essay answer' },
  { key: 'case_based',      label: 'Case-Based (CBQ)',emoji: '📊',  marks: '5 marks', desc: 'Passage + sub-questions' },
  { key: 'fill_blanks',     label: 'Fill in Blanks',  emoji: '📌',  marks: '1 mark',  desc: 'Complete the sentence' },
  { key: 'match_following', label: 'Match Following', emoji: '🔗',  marks: '5 marks', desc: 'Match Column A to B' },
  { key: 'true_false',      label: 'True / False',    emoji: '✅',  marks: '1 mark',  desc: 'Statement evaluation' },
];

const DIFFICULTY = ['easy', 'medium', 'hard'];

// ── Answer display helpers ────────────────────────────────────────────────────

function MCQQuestion({ q, idx, showAnswer, onAnswer, userAnswer }) {
  const optKeys = ['a', 'b', 'c', 'd'];
  return (
    <div className="space-y-3">
      <p className="text-[14px] font-semibold text-gray-800 leading-relaxed">{idx + 1}. {q.question}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {optKeys.map(k => {
          const selected = userAnswer === k;
          const correct = q.answer === k;
          let cls = 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100';
          if (showAnswer) {
            if (correct) cls = 'border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold';
            else if (selected && !correct) cls = 'border-red-300 bg-red-50 text-red-700';
          } else if (selected) {
            cls = 'border-blue-400 bg-blue-50 text-blue-800';
          }
          return (
            <button key={k} disabled={showAnswer}
              onClick={() => onAnswer(k)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[13px] transition-all text-left ${cls}`}>
              <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-black border-current shrink-0">{k.toUpperCase()}</span>
              {q.options[k]}
            </button>
          );
        })}
      </div>
      {showAnswer && q.explanation && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[12px] text-blue-800">
          <span className="font-bold">Explanation: </span>{q.explanation}
        </div>
      )}
    </div>
  );
}

function AssertionReasonQuestion({ q, idx, showAnswer, onAnswer, userAnswer }) {
  const opts = ['A', 'B', 'C', 'D'];
  const labels = [
    'Both A & R true; R is correct explanation',
    'Both A & R true; R is NOT correct explanation',
    'A is true; R is false',
    'A is false; R is true',
  ];
  return (
    <div className="space-y-3">
      <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">{idx + 1}. Assertion-Reason</p>
      <div className="space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-[13px] text-gray-800"><span className="font-bold">Assertion (A):</span> {q.assertion}</p>
        <p className="text-[13px] text-gray-800"><span className="font-bold">Reason (R):</span> {q.reason}</p>
      </div>
      <div className="space-y-1.5">
        {opts.map((opt, i) => {
          const selected = userAnswer === opt;
          const correct = q.answer === opt;
          let cls = 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50';
          if (showAnswer) {
            if (correct) cls = 'border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold';
            else if (selected) cls = 'border-red-300 bg-red-50 text-red-700';
          } else if (selected) cls = 'border-blue-400 bg-blue-50 text-blue-800';
          return (
            <button key={opt} disabled={showAnswer} onClick={() => onAnswer(opt)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] text-left transition-all ${cls}`}>
              <span className="font-bold shrink-0">({opt})</span> {labels[i]}
            </button>
          );
        })}
      </div>
      {showAnswer && q.explanation && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[12px] text-blue-800">
          <span className="font-bold">Explanation: </span>{q.explanation}
        </div>
      )}
    </div>
  );
}

function WrittenQuestion({ q, idx, showAnswer, type }) {
  const [revealed, setRevealed] = useState(false);
  const show = showAnswer || revealed;
  return (
    <div className="space-y-3">
      <p className="text-[14px] font-semibold text-gray-800 leading-relaxed">
        {idx + 1}. {q.question}
        <span className="ml-2 text-[11px] font-bold text-gray-400">[{q.marks} marks]</span>
      </p>
      {!show ? (
        <button onClick={() => setRevealed(true)}
          className="text-[12px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
          <ChevronDown size={14} /> Show model answer
        </button>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5">Model Answer</p>
          <p className="text-[13px] text-gray-700 leading-relaxed">{q.answer}</p>
          {q.markingScheme?.length > 0 && (
            <div className="mt-2 pt-2 border-t border-emerald-200">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Marking Scheme</p>
              <ul className="space-y-0.5">
                {q.markingScheme.map((pt, i) => (
                  <li key={i} className="text-[11px] text-gray-600 flex gap-1.5">
                    <span className="text-emerald-500 shrink-0">•</span>{pt}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CaseBasedQuestion({ q, idx, showAnswer }) {
  const [answers, setAnswers] = useState({});
  const setAns = (i, v) => setAnswers(p => ({ ...p, [i]: v }));
  return (
    <div className="space-y-3">
      <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">{idx + 1}. Case-Based Question [5 marks]</p>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-[13px] text-gray-700 leading-relaxed">{q.passage}</p>
      </div>
      <div className="space-y-3">
        {(q.questions || []).map((sub, si) => {
          if (sub.type === 'mcq') {
            const selected = answers[si];
            const correct = sub.answer;
            return (
              <div key={si} className="pl-3 border-l-2 border-gray-200 space-y-2">
                <p className="text-[13px] font-semibold text-gray-700">({si + 1}) {sub.q} <span className="text-[11px] text-gray-400">[{sub.marks} mark]</span></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {['a', 'b', 'c', 'd'].map(k => {
                    let cls = 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100';
                    if (showAnswer) {
                      if (k === correct) cls = 'border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold';
                      else if (k === selected) cls = 'border-red-300 bg-red-50 text-red-700';
                    } else if (k === selected) cls = 'border-blue-400 bg-blue-50 text-blue-800';
                    return (
                      <button key={k} disabled={showAnswer} onClick={() => setAns(si, k)}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-[12px] transition-all text-left ${cls}`}>
                        <span className="font-bold">{k})</span> {sub.options?.[k]}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }
          return (
            <div key={si} className="pl-3 border-l-2 border-gray-200">
              <p className="text-[13px] font-semibold text-gray-700">({si + 1}) {sub.q} <span className="text-[11px] text-gray-400">[{sub.marks} marks]</span></p>
              {showAnswer && <p className="mt-1.5 text-[12px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">{sub.answer}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FillBlanksQuestion({ q, idx, showAnswer }) {
  const [val, setVal] = useState('');
  const [checked, setChecked] = useState(false);
  const correct = val.toLowerCase().trim() === q.answer?.toLowerCase().trim();
  return (
    <div className="space-y-2">
      <p className="text-[14px] font-semibold text-gray-800">{idx + 1}. {q.question}</p>
      <div className="flex items-center gap-2">
        <input value={val} onChange={e => setVal(e.target.value)} disabled={checked || showAnswer}
          placeholder="Type your answer…"
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-[13px] text-gray-800 focus:outline-none focus:border-blue-400 bg-gray-50" />
        {!checked && !showAnswer && (
          <button onClick={() => setChecked(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700 transition-colors">
            Check
          </button>
        )}
      </div>
      {(checked || showAnswer) && (
        <div className={`flex items-center gap-2 p-2.5 rounded-xl text-[13px] font-semibold ${correct ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {correct ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
          {correct ? 'Correct!' : `Answer: ${q.answer}`}
        </div>
      )}
    </div>
  );
}

function MatchFollowingQuestion({ q, idx, showAnswer }) {
  const [showKey, setShowKey] = useState(false);
  const colA = q.columnA || [];
  const colB = q.columnB || [];
  return (
    <div className="space-y-3">
      <p className="text-[14px] font-semibold text-gray-800">{idx + 1}. {q.instruction} <span className="text-[11px] text-gray-400">[{q.marks} marks]</span></p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Column A</p>
          {colA.map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-[12px] text-blue-800">
              <span className="font-bold shrink-0">{i + 1}.</span> {item}
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Column B</p>
          {colB.map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-50 border border-violet-200 text-[12px] text-violet-800">
              <span className="font-bold shrink-0">{String.fromCharCode(105 + i)}.</span> {item}
            </div>
          ))}
        </div>
      </div>
      {(showAnswer || showKey) ? (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5">Answer Key</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(q.correctMatch || {}).map(([a, b]) => (
              <span key={a} className="text-[12px] font-semibold text-emerald-700 bg-white border border-emerald-200 px-2 py-1 rounded-lg">
                {a} → {b}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <button onClick={() => setShowKey(true)} className="text-[12px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
          <ChevronDown size={14} /> Show answer key
        </button>
      )}
    </div>
  );
}

function TrueFalseQuestion({ q, idx, showAnswer, onAnswer, userAnswer }) {
  return (
    <div className="space-y-2">
      <p className="text-[14px] font-semibold text-gray-800">{idx + 1}. {q.question}</p>
      <div className="flex gap-2">
        {[true, false].map(val => {
          const selected = userAnswer === val;
          const correct = q.answer === val;
          let cls = 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100';
          if (showAnswer) {
            if (correct) cls = 'border-emerald-400 bg-emerald-50 text-emerald-700 font-semibold';
            else if (selected) cls = 'border-red-300 bg-red-50 text-red-700';
          } else if (selected) cls = 'border-blue-400 bg-blue-50 text-blue-800';
          return (
            <button key={String(val)} disabled={showAnswer} onClick={() => onAnswer(val)}
              className={`flex-1 py-2.5 rounded-xl border text-[13px] font-semibold transition-all ${cls}`}>
              {val ? 'True' : 'False'}
            </button>
          );
        })}
      </div>
      {showAnswer && !q.answer && q.correction && (
        <p className="text-[12px] text-gray-600 bg-amber-50 border border-amber-200 p-2 rounded-lg">
          <span className="font-bold">Correction: </span>{q.correction}
        </p>
      )}
    </div>
  );
}

// ── Question renderer ─────────────────────────────────────────────────────────

function QuestionCard({ q, idx, showAnswer, onAnswerChange, answers }) {
  const userAnswer = answers[idx];
  const setAnswer = (v) => onAnswerChange(idx, v);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      {q.type === 'mcq'             && <MCQQuestion q={q} idx={idx} showAnswer={showAnswer} onAnswer={setAnswer} userAnswer={userAnswer} />}
      {q.type === 'assertion_reason'&& <AssertionReasonQuestion q={q} idx={idx} showAnswer={showAnswer} onAnswer={setAnswer} userAnswer={userAnswer} />}
      {q.type === 'very_short'      && <WrittenQuestion q={q} idx={idx} showAnswer={showAnswer} type="very_short" />}
      {q.type === 'short_answer'    && <WrittenQuestion q={q} idx={idx} showAnswer={showAnswer} type="short_answer" />}
      {q.type === 'long_answer'     && <WrittenQuestion q={q} idx={idx} showAnswer={showAnswer} type="long_answer" />}
      {q.type === 'case_based'      && <CaseBasedQuestion q={q} idx={idx} showAnswer={showAnswer} />}
      {q.type === 'fill_blanks'     && <FillBlanksQuestion q={q} idx={idx} showAnswer={showAnswer} />}
      {q.type === 'match_following' && <MatchFollowingQuestion q={q} idx={idx} showAnswer={showAnswer} />}
      {q.type === 'true_false'      && <TrueFalseQuestion q={q} idx={idx} showAnswer={showAnswer} onAnswer={setAnswer} userAnswer={userAnswer} />}
    </div>
  );
}

// ── Score summary ─────────────────────────────────────────────────────────────

function ScoreSummary({ questions, answers }) {
  const autoScore = questions.filter((q, i) => {
    if (q.type === 'mcq' || q.type === 'assertion_reason') return answers[i] === q.answer;
    if (q.type === 'true_false') return answers[i] === q.answer;
    return false;
  }).length;
  const autoTotal = questions.filter(q => ['mcq', 'assertion_reason', 'true_false'].includes(q.type)).length;

  if (autoTotal === 0) return null;
  const pct = Math.round((autoScore / autoTotal) * 100);

  return (
    <div className={`rounded-2xl border p-4 flex items-center gap-4 ${pct >= 70 ? 'bg-emerald-50 border-emerald-200' : pct >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[20px] font-black shrink-0 ${pct >= 70 ? 'bg-emerald-100 text-emerald-700' : pct >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
        {pct}%
      </div>
      <div>
        <p className="font-bold text-gray-800">{autoScore}/{autoTotal} auto-graded correct</p>
        <p className="text-[12px] text-gray-500">{pct >= 70 ? '🎉 Excellent! Keep it up.' : pct >= 40 ? '📚 Good effort — review the answers.' : '💪 Keep practicing — you\'ll get there!'}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">Written answers not included in auto-score</p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PracticePage() {
  const { user } = useAuth();
  const classLevel = parseInt(user?.profile?.class_name || user?.profile?.class_level || '10') || 10;
  const validClass = classLevel <= 9 ? 9 : 10;

  const [subject, setSubject]       = useState('');
  const [chapter, setChapter]       = useState('');
  const [qType, setQType]           = useState('');
  const [count, setCount]           = useState(5);
  const [difficulty, setDifficulty] = useState('medium');

  const [questions, setQuestions]   = useState([]);
  const [answers, setAnswers]       = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const chapters = CBSE_CHAPTERS[validClass]?.[subject] || [];
  const subjectObj = BOARD_SUBJECTS.find(s => s.slug === subject);

  const generate = async () => {
    if (!subject || !chapter || !qType) return;
    setLoading(true);
    setError('');
    setQuestions([]);
    setAnswers({});
    setShowAnswer(false);
    try {
      const res = await apiClient.post('/boards/practice/generate', {
        subject: subjectObj?.name || subject,
        chapter,
        classLevel: validClass,
        board: user?.profile?.board || 'CBSE',
        questionType: qType,
        count,
        difficulty,
      });
      setQuestions(res.data.questions || []);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setQuestions([]); setAnswers({}); setShowAnswer(false); };
  const setAnswer = (idx, val) => setAnswers(p => ({ ...p, [idx]: val }));

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/boards" className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 shadow-sm">
          <ArrowLeft size={16} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-[18px] font-extrabold text-gray-800 flex items-center gap-2">
            <Brain size={20} className="text-indigo-500" /> Practice Hub
          </h1>
          <p className="text-[11px] text-gray-400">CBSE Class {validClass} · Unlimited practice · All question types</p>
        </div>
      </div>

      {/* Config card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Configure your practice</p>

        {/* Subject */}
        <div>
          <label className="text-[12px] font-semibold text-gray-600 mb-2 block">Subject</label>
          <div className="flex flex-wrap gap-2">
            {BOARD_SUBJECTS.map(s => (
              <button key={s.slug} onClick={() => { setSubject(s.slug); setChapter(''); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold border transition-all ${subject === s.slug ? `${s.color} text-white border-transparent` : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                {s.emoji} {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Chapter */}
        {subject && (
          <div>
            <label className="text-[12px] font-semibold text-gray-600 mb-2 block">Chapter</label>
            <select value={chapter} onChange={e => setChapter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 bg-gray-50 focus:outline-none focus:border-indigo-400 transition-all">
              <option value="">Select a chapter…</option>
              {chapters.map(ch => <option key={ch} value={ch}>{ch}</option>)}
            </select>
          </div>
        )}

        {/* Question Type */}
        <div>
          <label className="text-[12px] font-semibold text-gray-600 mb-2 block">Question Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {QUESTION_TYPES.map(t => (
              <button key={t.key} onClick={() => setQType(t.key)}
                className={`flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl border text-left transition-all ${qType === t.key ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}>
                <span className="text-[14px]">{t.emoji} <span className="text-[12px] font-bold">{t.label}</span></span>
                <span className={`text-[10px] ${qType === t.key ? 'text-indigo-200' : 'text-gray-400'}`}>{t.marks} · {t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Count + Difficulty */}
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="text-[12px] font-semibold text-gray-600 mb-1 block">Questions</label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              {[3, 5, 10, 15].map(n => (
                <button key={n} onClick={() => setCount(n)}
                  className={`px-3 py-1.5 text-[12px] font-bold transition-colors ${count === n ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>{n}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[12px] font-semibold text-gray-600 mb-1 block">Difficulty</label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              {DIFFICULTY.map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`px-3 py-1.5 text-[12px] font-bold capitalize transition-colors ${difficulty === d ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>{d}</button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={generate} disabled={!subject || !chapter || !qType || loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[14px] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Generating with AI…</> : <><Sparkles size={16} /> Generate Questions</>}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-700">{error}</div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-bold text-gray-700">{questions.length} questions generated</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAnswer(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all ${showAnswer ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                <CheckCircle2 size={13} /> {showAnswer ? 'Answers shown' : 'Show answers'}
              </button>
              <button onClick={reset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">
                <RotateCcw size={13} /> New set
              </button>
            </div>
          </div>

          {showAnswer && <ScoreSummary questions={questions} answers={answers} />}

          <div className="space-y-3">
            {questions.map((q, i) => (
              <QuestionCard key={i} q={q} idx={i} showAnswer={showAnswer} answers={answers} onAnswerChange={setAnswer} />
            ))}
          </div>

          {!showAnswer && (
            <button onClick={() => setShowAnswer(true)}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[14px] transition-all flex items-center justify-center gap-2">
              <CheckCircle2 size={16} /> Submit & Check Answers
            </button>
          )}
        </div>
      )}
    </div>
  );
}
