'use client';
import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BOARD_SUBJECTS, CBSE_CHAPTERS } from '@/data/board-syllabus';
import apiClient from '@/lib/api-client';
import Link from 'next/link';
import {
  ArrowLeft, FileText, Sparkles, Printer, Download,
  Clock, Target, BookOpen, Loader2, CheckCircle2, ChevronDown,
  Plus, Minus, RotateCcw, PlayCircle
} from 'lucide-react';

// ── Section defaults ──────────────────────────────────────────────────────────

const DEFAULT_CONFIG = [
  { key: 'mcq',             label: 'Section A — MCQ',           count: 20, marks: 1, include: true },
  { key: 'assertion_reason',label: 'Section B — Assertion-Reason', count: 5, marks: 1, include: true },
  { key: 'very_short',      label: 'Section C — Very Short Answer', count: 5, marks: 2, include: true },
  { key: 'short_answer',    label: 'Section D — Short Answer',  count: 7, marks: 3, include: true },
  { key: 'long_answer',     label: 'Section E — Long Answer',   count: 3, marks: 5, include: true },
  { key: 'case_based',      label: 'Section F — Case-Based',    count: 2, marks: 5, include: true },
];

function totalMarks(config) {
  return config.filter(s => s.include).reduce((sum, s) => sum + s.count * s.marks, 0);
}

// ── Rendered question paper ───────────────────────────────────────────────────

function QuestionPaper({ paper, onTakeTest }) {
  if (!paper) return null;

  return (
    <div className="space-y-6">
      {/* Paper header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden" id="question-paper">
        {/* Title block */}
        <div className="p-6 border-b border-gray-100 text-center space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Syllabrix · AI Generated</p>
          <h2 className="text-[22px] font-black text-gray-800">{paper.title}</h2>
          <div className="flex items-center justify-center gap-4 text-[12px] text-gray-500 mt-2 flex-wrap">
            <span className="flex items-center gap-1"><Clock size={12} /> Time: {paper.duration} minutes</span>
            <span className="flex items-center gap-1"><Target size={12} /> Maximum Marks: {paper.totalMarks}</span>
            <span className="flex items-center gap-1"><BookOpen size={12} /> Class {paper.classLevel} · {paper.board}</span>
          </div>
        </div>

        {/* General instructions */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">General Instructions</p>
          <ol className="space-y-1">
            {(paper.generalInstructions || []).map((inst, i) => (
              <li key={i} className="text-[12px] text-gray-600 flex gap-2">
                <span className="font-bold shrink-0">{i + 1}.</span> {inst}
              </li>
            ))}
          </ol>
        </div>

        {/* Sections */}
        {(paper.sections || []).map((sec, si) => (
          <div key={si} className="px-6 py-5 border-b border-gray-100 last:border-0">
            <div className="mb-4">
              <h3 className="text-[15px] font-extrabold text-gray-800">{sec.sectionLabel}: {sec.sectionTitle}</h3>
              <p className="text-[12px] text-gray-500 mt-0.5">{sec.instructions}</p>
            </div>

            <div className="space-y-5">
              {(sec.questions || []).map((q, qi) => (
                <div key={qi} className="space-y-2">
                  {/* MCQ */}
                  {q.type === 'mcq' && (
                    <div>
                      <p className="text-[13px] text-gray-800 font-semibold leading-relaxed">
                        Q{q.qNo}. {q.question} <span className="font-normal text-gray-400">[{q.marks} mark]</span>
                      </p>
                      <div className="grid grid-cols-2 gap-1 mt-2 ml-4">
                        {['a', 'b', 'c', 'd'].map(k => q.options?.[k] && (
                          <p key={k} className="text-[12px] text-gray-700">({k}) {q.options[k]}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assertion-Reason */}
                  {q.type === 'assertion_reason' && (
                    <div>
                      <p className="text-[13px] text-gray-800 font-semibold">Q{q.qNo}. <span className="font-normal text-gray-400">[{q.marks} mark]</span></p>
                      <div className="ml-4 space-y-1 mt-1">
                        <p className="text-[12px] text-gray-700"><span className="font-semibold">Assertion (A):</span> {q.assertion}</p>
                        <p className="text-[12px] text-gray-700"><span className="font-semibold">Reason (R):</span> {q.reason}</p>
                        <div className="mt-1 text-[11px] text-gray-500 space-y-0.5">
                          <p>(A) Both A and R are true and R is the correct explanation of A</p>
                          <p>(B) Both A and R are true but R is not the correct explanation of A</p>
                          <p>(C) A is true but R is false</p>
                          <p>(D) A is false but R is true</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Written answer types */}
                  {['very_short', 'short_answer', 'long_answer'].includes(q.type) && (
                    <div>
                      <p className="text-[13px] text-gray-800 font-semibold leading-relaxed">
                        Q{q.qNo}. {q.question} <span className="font-normal text-gray-400">[{q.marks} marks]</span>
                      </p>
                      {q.type === 'long_answer' && q.diagramRequired && (
                        <p className="text-[11px] text-amber-600 ml-4 mt-0.5">✏️ Diagram required</p>
                      )}
                      {/* Answer lines */}
                      <div className="ml-4 mt-2 space-y-1">
                        {Array.from({ length: q.type === 'very_short' ? 2 : q.type === 'short_answer' ? 4 : 8 }).map((_, li) => (
                          <div key={li} className="border-b border-dashed border-gray-300 h-6" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Case-Based */}
                  {q.type === 'case_based' && (
                    <div>
                      <p className="text-[13px] text-gray-800 font-semibold">Q{q.qNo}. Case-Based Question <span className="font-normal text-gray-400">[{q.marks} marks]</span></p>
                      <div className="ml-4 mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-[12px] text-gray-700 leading-relaxed">{q.passage}</p>
                      </div>
                      <div className="ml-4 mt-2 space-y-3">
                        {(q.questions || []).map((sub, si) => (
                          <div key={si}>
                            <p className="text-[12px] text-gray-700 font-semibold">({si + 1}) {sub.q} <span className="font-normal text-gray-400">[{sub.marks} m]</span></p>
                            {sub.type === 'mcq' && sub.options && (
                              <div className="grid grid-cols-2 gap-1 ml-4 mt-1">
                                {['a', 'b', 'c', 'd'].map(k => sub.options[k] && (
                                  <p key={k} className="text-[11px] text-gray-600">({k}) {sub.options[k]}</p>
                                ))}
                              </div>
                            )}
                            {sub.type === 'short' && (
                              <div className="ml-4 mt-1 space-y-1">
                                {Array.from({ length: 3 }).map((_, li) => <div key={li} className="border-b border-dashed border-gray-300 h-5" />)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-bold text-[13px] transition-all">
          <Printer size={15} /> Print / Save PDF
        </button>
        <button onClick={onTakeTest}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] transition-all">
          <PlayCircle size={15} /> Take this test online
        </button>
      </div>
    </div>
  );
}

// ── Online test mode ──────────────────────────────────────────────────────────

function OnlineTestMode({ paper, onExit }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(paper.duration * 60);

  // Timer
  useState(() => {
    if (submitted) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); setSubmitted(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  });

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  const allMcqQuestions = (paper.sections || []).flatMap(s =>
    (s.questions || []).filter(q => q.type === 'mcq' || q.type === 'assertion_reason')
  );
  const correct = allMcqQuestions.filter(q => answers[q.qNo] === q.answer).length;
  const pct = allMcqQuestions.length ? Math.round((correct / allMcqQuestions.length) * 100) : 0;

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[28px] mx-auto">📊</div>
        <h2 className="text-[20px] font-extrabold text-gray-800">Test Submitted!</h2>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[18px] font-black ${pct >= 70 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : pct >= 40 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {pct}% — {correct}/{allMcqQuestions.length} auto-graded
        </div>
        <p className="text-[13px] text-gray-500">Written answers need manual checking. Upload to Answer Checker for AI evaluation.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onExit} className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-[13px] hover:bg-gray-200 transition-all">Back to Generator</button>
          <Link href="/boards/answer-checker" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-[13px] hover:bg-indigo-700 transition-all">Check Answer Sheet →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timer bar */}
      <div className={`sticky top-0 z-10 flex items-center justify-between px-5 py-3 rounded-2xl border shadow-sm ${timeLeft < 300 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
        <p className="font-bold text-gray-800">{paper.title}</p>
        <div className={`text-[18px] font-black font-mono ${timeLeft < 300 ? 'text-red-600' : 'text-gray-800'}`}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
        <button onClick={() => setSubmitted(true)} className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-[12px] font-bold hover:bg-indigo-700 transition-all">
          Submit
        </button>
      </div>

      {(paper.sections || []).map((sec, si) => (
        <div key={si} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-gray-800">{sec.sectionLabel}: {sec.sectionTitle}</h3>
            <p className="text-[12px] text-gray-500 mt-0.5">{sec.instructions}</p>
          </div>
          {(sec.questions || []).map((q, qi) => (
            <div key={qi} className="space-y-2 pt-2 border-t border-gray-50">
              <p className="text-[13px] font-semibold text-gray-800">Q{q.qNo}. {q.question || q.assertion ? `${q.assertion ? 'A: ' + q.assertion + ' | R: ' + q.reason : q.question}` : ''} <span className="text-gray-400 font-normal">[{q.marks}m]</span></p>

              {/* MCQ / AR options */}
              {(q.type === 'mcq' || q.type === 'assertion_reason') && (
                <div className="grid grid-cols-2 gap-2">
                  {(q.type === 'mcq' ? ['a', 'b', 'c', 'd'] : ['A', 'B', 'C', 'D']).map(k => {
                    const selected = answers[q.qNo] === k;
                    return (
                      <button key={k} onClick={() => setAnswers(p => ({ ...p, [q.qNo]: k }))}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] text-left transition-all ${selected ? 'border-indigo-400 bg-indigo-50 text-indigo-800 font-semibold' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                        <span className="font-bold shrink-0">({k})</span>
                        {q.type === 'mcq' ? q.options?.[k] : ['Both A&R true; R explains A', 'Both true; R doesn\'t explain', 'A true, R false', 'A false, R true'][['A','B','C','D'].indexOf(k)]}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Written answer textarea */}
              {['very_short', 'short_answer', 'long_answer'].includes(q.type) && (
                <textarea
                  value={answers[q.qNo] || ''}
                  onChange={e => setAnswers(p => ({ ...p, [q.qNo]: e.target.value }))}
                  rows={q.type === 'very_short' ? 2 : q.type === 'short_answer' ? 4 : 7}
                  placeholder="Write your answer here…"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[13px] text-gray-800 focus:outline-none focus:border-indigo-400 bg-gray-50 resize-none"
                />
              )}

              {/* Case-based */}
              {q.type === 'case_based' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[12px] text-gray-700">{q.passage}</div>
                  {(q.questions || []).map((sub, si) => (
                    <div key={si}>
                      <p className="text-[12px] font-semibold text-gray-700 mb-1">({si + 1}) {sub.q}</p>
                      {sub.type === 'mcq' ? (
                        <div className="grid grid-cols-2 gap-1.5">
                          {['a','b','c','d'].map(k => sub.options?.[k] && (
                            <button key={k} onClick={() => setAnswers(p => ({ ...p, [`${q.qNo}-${si}`]: k }))}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] text-left transition-all ${answers[`${q.qNo}-${si}`] === k ? 'border-indigo-400 bg-indigo-50 text-indigo-800 font-semibold' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                              ({k}) {sub.options[k]}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <textarea value={answers[`${q.qNo}-${si}`] || ''} onChange={e => setAnswers(p => ({ ...p, [`${q.qNo}-${si}`]: e.target.value }))} rows={2}
                          placeholder="Your answer…" className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-[12px] text-gray-800 focus:outline-none focus:border-indigo-300 bg-gray-50 resize-none" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TestGeneratorPage() {
  const { user } = useAuth();
  const classLevel = parseInt(user?.profile?.class_name || user?.profile?.class_level || '10') || 10;
  const validClass = classLevel <= 9 ? 9 : 10;
  const board = user?.profile?.board || 'CBSE';

  const [subject, setSubject]           = useState('');
  const [selectedChapters, setChapters] = useState([]);
  const [duration, setDuration]         = useState(180);
  const [sectionConfig, setConfig]      = useState(DEFAULT_CONFIG);
  const [paper, setPaper]               = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [testMode, setTestMode]         = useState(false);

  const chapters = CBSE_CHAPTERS[validClass]?.[subject] || [];
  const subjectObj = BOARD_SUBJECTS.find(s => s.slug === subject);
  const totalM = totalMarks(sectionConfig);

  const toggleChapter = (ch) => setChapters(p => p.includes(ch) ? p.filter(c => c !== ch) : [...p, ch]);
  const selectAll = () => setChapters(chapters);
  const clearAll  = () => setChapters([]);

  const updateSection = (key, field, val) => {
    setConfig(p => p.map(s => s.key === key ? { ...s, [field]: val } : s));
  };

  const generate = async () => {
    if (!subject || selectedChapters.length === 0) return;
    setLoading(true);
    setError('');
    setPaper(null);
    setTestMode(false);
    try {
      const questionConfig = {};
      sectionConfig.filter(s => s.include).forEach(s => {
        questionConfig[s.key] = { count: s.count, marks: s.marks };
      });
      const res = await apiClient.post('/boards/test/generate', {
        classLevel: validClass,
        board,
        subject: subjectObj?.name || subject,
        chapters: selectedChapters,
        duration,
        totalMarks: totalM,
        questionConfig,
      });
      setPaper(res.data.paper);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to generate test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (testMode && paper) {
    return <OnlineTestMode paper={paper} onExit={() => setTestMode(false)} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/boards" className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 shadow-sm">
          <ArrowLeft size={16} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-[18px] font-extrabold text-gray-800 flex items-center gap-2">
            <FileText size={20} className="text-violet-500" /> Test Generator
          </h1>
          <p className="text-[11px] text-gray-400">{board} Class {validClass} · AI-generated question papers · Print or take online</p>
        </div>
      </div>

      {!paper ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Config */}
          <div className="lg:col-span-2 space-y-4">

            {/* Subject */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Subject</p>
              <div className="flex flex-wrap gap-2">
                {BOARD_SUBJECTS.map(s => (
                  <button key={s.slug} onClick={() => { setSubject(s.slug); setChapters([]); }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold border transition-all ${subject === s.slug ? `${s.color} text-white border-transparent` : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                    {s.emoji} {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Chapters */}
            {subject && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Chapters ({selectedChapters.length}/{chapters.length})</p>
                  <div className="flex gap-2">
                    <button onClick={selectAll} className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700">Select all</button>
                    <span className="text-gray-300">·</span>
                    <button onClick={clearAll} className="text-[11px] font-semibold text-gray-400 hover:text-gray-600">Clear</button>
                  </div>
                </div>
                <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                  {chapters.map(ch => (
                    <button key={ch} onClick={() => toggleChapter(ch)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] text-left transition-all border ${selectedChapters.includes(ch) ? 'bg-indigo-50 border-indigo-200 text-indigo-800 font-semibold' : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100'}`}>
                      <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 ${selectedChapters.includes(ch) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                        {selectedChapters.includes(ch) && <CheckCircle2 size={10} className="text-white" />}
                      </div>
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Duration */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Duration</p>
              <div className="flex gap-2">
                {[60, 90, 120, 180].map(d => (
                  <button key={d} onClick={() => setDuration(d)}
                    className={`flex-1 py-2 rounded-xl text-[12px] font-bold border transition-all ${duration === d ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                    {d}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section config + summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Question Paper Structure</p>
              <div className="space-y-3">
                {sectionConfig.map(sec => (
                  <div key={sec.key} className={`rounded-xl border p-3 transition-all ${sec.include ? 'bg-gray-50 border-gray-200' : 'bg-gray-50/50 border-gray-100 opacity-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={sec.include} onChange={e => updateSection(sec.key, 'include', e.target.checked)}
                          className="w-3.5 h-3.5 rounded accent-indigo-600" />
                        <span className="text-[11px] font-semibold text-gray-700">{sec.label}</span>
                      </label>
                      <span className="text-[10px] font-bold text-gray-400">{sec.count * sec.marks}m</span>
                    </div>
                    {sec.include && (
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateSection(sec.key, 'count', Math.max(1, sec.count - 1))}
                            className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-all">
                            <Minus size={10} />
                          </button>
                          <span className="text-[12px] font-bold text-gray-800 w-8 text-center">{sec.count}</span>
                          <button onClick={() => updateSection(sec.key, 'count', Math.min(30, sec.count + 1))}
                            className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-all">
                            <Plus size={10} />
                          </button>
                          <span className="text-[10px] text-gray-400 ml-1">Qs</span>
                        </div>
                        <span className="text-[11px] text-gray-400">× {sec.marks}m each</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-gray-600">Total Marks</span>
                <span className="text-[18px] font-black text-indigo-600">{totalM}</span>
              </div>
            </div>

            <button onClick={generate} disabled={!subject || selectedChapters.length === 0 || loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-[14px] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Generating paper…</> : <><Sparkles size={16} /> Generate Question Paper</>}
            </button>

            {error && <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button onClick={() => setPaper(null)}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 hover:text-gray-700 transition-colors">
              <RotateCcw size={13} /> Generate new paper
            </button>
          </div>
          <QuestionPaper paper={paper} onTakeTest={() => setTestMode(true)} />
        </div>
      )}
    </div>
  );
}
