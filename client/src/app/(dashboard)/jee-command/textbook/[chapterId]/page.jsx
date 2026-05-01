'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { jeeAPI } from '@/lib/api/jee.api';
import {
  ArrowLeft, BookOpen, Sparkles, Loader2, ChevronDown,
  ChevronRight, CheckCircle2, RefreshCw, Lightbulb,
  FlaskConical, Brain, AlertCircle, Tag, Layers,
  ChevronUp, RotateCcw
} from 'lucide-react';

// ─── MARKDOWN RENDERER ────────────────────────────────────────────────────────
function MD({ children, className = '' }) {
  if (!children) return null;
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

// ─── NOTES TAB ────────────────────────────────────────────────────────────────
function NotesTab({ notes }) {
  return (
    <div className="space-y-6">
      {/* Summary banner */}
      {notes.summary && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-[12px] font-bold text-blue-700 mb-1 uppercase tracking-wide">Quick Summary</p>
          <p className="text-[13px] text-blue-800 leading-relaxed">{notes.summary}</p>
        </div>
      )}

      {/* Theory */}
      {notes.theory && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <MD className="text-gray-700 leading-relaxed">{notes.theory}</MD>
        </div>
      )}

      {/* Key points */}
      {notes.key_points?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Tag size={12} /> Key Takeaways
          </h3>
          <ul className="space-y-2">
            {notes.key_points.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-gray-700">
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fun fact */}
      {notes.fun_fact && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
          <Lightbulb size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide mb-1">Did You Know?</p>
            <p className="text-[13px] text-amber-800">{notes.fun_fact}</p>
          </div>
        </div>
      )}

      {/* Common mistakes */}
      {notes.common_mistakes?.length > 0 && (
        <div className="bg-white rounded-xl border border-red-100 p-5">
          <h3 className="text-[12px] font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertCircle size={12} /> Common Mistakes to Avoid
          </h3>
          <div className="space-y-3">
            {notes.common_mistakes.map((m, i) => (
              <div key={i} className="p-3 bg-red-50 rounded-lg text-[12px]">
                <p className="font-semibold text-red-700">❌ {m.mistake}</p>
                {m.why_wrong && <p className="text-red-600 mt-1">{m.why_wrong}</p>}
                {m.correct_way && <p className="text-emerald-700 mt-1">✅ {m.correct_way}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DERIVATIONS TAB ──────────────────────────────────────────────────────────
function DerivationsTab({ notes }) {
  const [open, setOpen] = useState(0);
  const items = notes.derivations || [];

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FlaskConical size={32} className="text-gray-200 mb-3" />
        <p className="text-gray-400 text-sm">No derivations for this section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((d, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="text-[13px] font-bold text-gray-800">{d.name}</p>
              {d.why_we_derive && <p className="text-[11px] text-gray-400 mt-0.5">{d.why_we_derive}</p>}
            </div>
            {open === i ? <ChevronUp size={15} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />}
          </button>

          {open === i && (
            <div className="px-5 pb-5 border-t border-gray-50 space-y-4">
              {d.starting_point && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-[12px] text-blue-800">
                  <span className="font-bold">Starting point: </span>{d.starting_point}
                </div>
              )}

              {d.steps?.length > 0 && (
                <div className="space-y-2">
                  {d.steps.map((step, si) => (
                    <div key={si} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0 mt-0.5">
                        {si + 1}
                      </span>
                      <div className="flex-1 text-[12px] text-gray-700">
                        <MD>{step}</MD>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {d.final_result && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Result</p>
                  <MD className="text-emerald-800 font-semibold">{d.final_result}</MD>
                </div>
              )}

              {d.remember_as && (
                <div className="flex gap-2 p-3 bg-amber-50 rounded-lg">
                  <Lightbulb size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800"><span className="font-bold">Remember as: </span>{d.remember_as}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── FORMULAS TAB ─────────────────────────────────────────────────────────────
function FormulasTab({ notes }) {
  const items = notes.formulas || [];

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Brain size={32} className="text-gray-200 mb-3" />
        <p className="text-gray-400 text-sm">No formulas for this section.</p>
      </div>
    );
  }

  // Solved example
  const ex = notes.solved_example;

  return (
    <div className="space-y-4">
      {items.map((f, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] font-bold text-gray-800">{f.name}</p>
            <span className="text-[9px] px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full font-bold flex-shrink-0">Formula</span>
          </div>

          <div className="p-4 bg-gray-900 rounded-xl text-center">
            <MD className="text-white">{f.formula}</MD>
          </div>

          {f.variables && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Variables</p>
              <p className="text-[12px] text-gray-600">{f.variables}</p>
            </div>
          )}

          {f.trick && (
            <div className="flex gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
              <span className="text-base flex-shrink-0">🔥</span>
              <p className="text-[12px] text-orange-800">{f.trick}</p>
            </div>
          )}

          {f.unit_check && (
            <div className="flex gap-2 p-2.5 bg-blue-50 rounded-lg">
              <span className="text-sm flex-shrink-0">📐</span>
              <p className="text-[11px] text-blue-700">{f.unit_check}</p>
            </div>
          )}
        </div>
      ))}

      {/* Solved example */}
      {ex && (
        <div className="bg-white rounded-xl border border-indigo-100 p-5">
          <h3 className="text-[12px] font-bold text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CheckCircle2 size={13} /> Worked Example
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <p className="text-[13px] font-semibold text-gray-800">{ex.problem}</p>
            </div>
            {ex.given && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Given</p>
                <MD className="text-[12px] text-gray-600">{ex.given}</MD>
              </div>
            )}
            {ex.to_find && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">To Find</p>
                <p className="text-[12px] text-gray-600">{ex.to_find}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Solution</p>
              <MD className="text-[12px] text-gray-700">{ex.solution}</MD>
            </div>
            {ex.answer && (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <MD className="text-emerald-800 font-bold">{ex.answer}</MD>
              </div>
            )}
            {ex.key_insight && (
              <div className="flex gap-2 p-3 bg-amber-50 rounded-lg">
                <Lightbulb size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800">{ex.key_insight}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PRACTICE TAB ─────────────────────────────────────────────────────────────
function PracticeQuestion({ q, index }) {
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState(null);

  const isMCQ = q.type === 'mcq' && q.options?.length > 0;
  const correctLetter = isMCQ ? q.answer?.charAt(0)?.toUpperCase() : null;

  function optionStyle(letter) {
    if (!revealed && selected !== letter) return 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50';
    if (!revealed && selected === letter) return 'border-blue-400 bg-blue-50';
    if (letter === correctLetter) return 'border-emerald-400 bg-emerald-50';
    if (selected === letter && letter !== correctLetter) return 'border-red-300 bg-red-50';
    return 'border-gray-100 bg-gray-50 opacity-60';
  }

  const diffColor = q.difficulty === 'hard' ? 'bg-red-100 text-red-600'
    : q.difficulty === 'medium' ? 'bg-amber-100 text-amber-700'
    : 'bg-emerald-100 text-emerald-700';

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-50">
        <div className="flex items-start gap-3">
          <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-500 flex-shrink-0">
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold capitalize ${diffColor}`}>{q.difficulty}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">{q.type?.replace('_', ' ')}</span>
            </div>
            <div className="text-[13px] text-gray-800 leading-relaxed">
              <MD>{q.question}</MD>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* MCQ options */}
        {isMCQ && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map((opt, oi) => {
              const letter = opt.charAt(0).toUpperCase();
              return (
                <button
                  key={oi}
                  onClick={() => { if (!revealed) { setSelected(letter); setRevealed(true); } }}
                  className={`flex items-start gap-2 p-3 rounded-lg text-left text-[12px] border transition-all ${optionStyle(letter)}`}
                >
                  <span className="font-bold flex-shrink-0 text-[11px]">{opt.slice(0, 2)}</span>
                  <span>{opt.slice(3)}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Hint */}
        {q.hint && !revealed && (
          <details className="group">
            <summary className="text-[11px] text-blue-500 cursor-pointer hover:text-blue-700 font-medium list-none flex items-center gap-1">
              <Lightbulb size={11} /> Show Hint
            </summary>
            <p className="mt-2 text-[11px] text-blue-600 bg-blue-50 p-2.5 rounded-lg">{q.hint}</p>
          </details>
        )}

        {/* Reveal solution button (for non-MCQ or after MCQ answered) */}
        {(!isMCQ || revealed) && (
          <button
            onClick={() => setRevealed(v => !v)}
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              revealed ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {revealed ? <><ChevronUp size={12} /> Hide Solution</> : <><ChevronDown size={12} /> Show Solution</>}
          </button>
        )}

        {/* Solution */}
        {revealed && (
          <div className="space-y-2 border-t border-gray-100 pt-3">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Solution</p>
              <div className="text-[12px] text-gray-700">
                <MD>{q.solution}</MD>
              </div>
            </div>
            {q.answer && (
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-0.5">Answer</p>
                <MD className="text-emerald-800 font-semibold text-[12px]">{q.answer}</MD>
              </div>
            )}
            {q.formula_used && (
              <p className="text-[10px] text-gray-400">
                <span className="font-bold">Formula used: </span>{q.formula_used}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PracticeTab({ topicId, topicTitle }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('mixed');
  const [error, setError] = useState('');

  const generate = useCallback(async (reset = false) => {
    setLoading(true);
    setError('');
    const offset = reset ? 0 : questions.length;
    try {
      const r = await jeeAPI.generatePracticeQuestions(topicId, {
        count: 5, difficulty, offset
      });
      const newQs = r.data?.data || [];
      setQuestions(prev => reset ? newQs : [...prev, ...newQs]);
    } catch {
      setError('Could not generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [topicId, difficulty, questions.length]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-white border border-gray-200 rounded-full p-0.5">
          {['mixed', 'easy', 'medium', 'hard'].map(d => (
            <button key={d} onClick={() => setDifficulty(d)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize transition-all ${
                difficulty === d ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >{d}</button>
          ))}
        </div>
        {questions.length > 0 && (
          <button onClick={() => generate(true)} disabled={loading}
            className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-700 px-3 py-1.5 bg-white border border-gray-200 rounded-full transition-colors">
            <RotateCcw size={11} /> Fresh Set
          </button>
        )}
      </div>

      {/* Questions */}
      {questions.map((q, i) => (
        <PracticeQuestion key={`${q.question?.slice(0, 20)}_${i}`} q={q} index={i} />
      ))}

      {/* Error */}
      {error && (
        <div className="flex gap-2 p-3 bg-red-50 rounded-xl border border-red-100 text-[12px] text-red-600">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={() => generate(false)}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-[13px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 transition-all shadow-sm"
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" /> Generating…</>
        ) : questions.length === 0 ? (
          <><Sparkles size={16} /> Generate Practice Questions</>
        ) : (
          <><Sparkles size={16} /> Generate {questions.length > 0 ? 'More' : ''} Questions</>
        )}
      </button>

      {questions.length > 0 && !loading && (
        <p className="text-center text-[10px] text-gray-400">
          {questions.length} questions generated · Each batch is unique
        </p>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'notes',       label: '📖 Notes',       icon: BookOpen    },
  { id: 'derivations', label: '📐 Derivations',  icon: FlaskConical},
  { id: 'formulas',    label: '🔢 Formulas',     icon: Brain       },
  { id: 'practice',    label: '💡 Practice',     icon: Sparkles    },
];

export default function ChapterStudyPage() {
  const params = useParams();
  const chapterId = params.chapterId;

  const [chapter, setChapter] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loadingChapter, setLoadingChapter] = useState(true);

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeTab, setActiveTab] = useState('notes');

  const [notes, setNotes] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [notesError, setNotesError] = useState('');

  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile

  // Load chapter + topics
  useEffect(() => {
    jeeAPI.getLibraryChapter(chapterId)
      .then(r => {
        setChapter(r.data.chapter);
        setTopics(r.data.topics || []);
        if (r.data.topics?.length) {
          setSelectedTopic(r.data.topics[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingChapter(false));
  }, [chapterId]);

  // Load notes when topic changes
  useEffect(() => {
    if (!selectedTopic) return;
    setNotes(null);
    setNotesError('');
    setLoadingNotes(true);
    setActiveTab('notes');

    jeeAPI.getLibraryTopicContent(selectedTopic.id)
      .then(r => {
        if (r.data?.data) setNotes(r.data.data);
      })
      .catch(() => {})
      .finally(() => setLoadingNotes(false));
  }, [selectedTopic?.id]);

  const generateNotes = async () => {
    if (!selectedTopic) return;
    setGenerating(true);
    setNotesError('');
    try {
      const r = await jeeAPI.generateLibraryTopicNotes(selectedTopic.id);
      setNotes(r.data.data);
      // Mark topic as having notes
      setTopics(prev => prev.map(t => t.id === selectedTopic.id ? { ...t, has_notes: 1 } : t));
    } catch (e) {
      setNotesError('Failed to generate notes. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loadingChapter) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={28} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex items-center gap-3 p-5 bg-red-50 rounded-xl border border-red-100">
        <AlertCircle size={18} className="text-red-500" />
        <p className="text-red-700 text-sm">Chapter not found.</p>
      </div>
    );
  }

  const sectionNum = selectedTopic
    ? `${chapter.chapter_number}.${selectedTopic.topic_order}`
    : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link href="/jee-command/textbook"
          className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0">
          <ArrowLeft size={14} className="text-gray-600" />
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-gray-400 font-medium">{chapter.book_title}</span>
            <ChevronRight size={10} className="text-gray-300" />
            <span className="text-[10px] text-blue-600 font-bold">Chapter {chapter.chapter_number}</span>
          </div>
          <h1 className="text-[15px] font-extrabold text-gray-900 leading-tight truncate">{chapter.title}</h1>
          <p className="text-[10px] text-gray-400 mt-0.5">{chapter.subject_name} · Class {chapter.grade} · {topics.length} sections</p>
        </div>
        {/* Mobile: topic picker toggle */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          className="lg:hidden ml-auto px-3 py-1.5 text-[11px] font-semibold bg-white border border-gray-200 rounded-full flex items-center gap-1 flex-shrink-0"
        >
          <Layers size={11} /> Sections {sidebarOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
      </div>

      <div className="flex gap-4 items-start">
        {/* ── LEFT: Topic list (desktop always visible, mobile collapsible) ─── */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 xl:w-72 flex-shrink-0`}>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Sections in this chapter
              </p>
            </div>
            <div className="max-h-[75vh] overflow-y-auto divide-y divide-gray-50">
              {topics.map(t => {
                const isActive = selectedTopic?.id === t.id;
                const secNum = `${chapter.chapter_number}.${t.topic_order}`;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTopic(t); setSidebarOpen(false); }}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors group ${
                      isActive ? 'bg-blue-50 border-r-2 border-blue-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-[10px] font-bold mt-0.5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                      {secNum}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-semibold leading-snug ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                        {t.title}
                      </p>
                      {t.has_notes ? (
                        <span className="text-[9px] text-emerald-600 font-medium flex items-center gap-0.5 mt-0.5">
                          <CheckCircle2 size={9} /> Notes ready
                        </span>
                      ) : (
                        <span className="text-[9px] text-gray-300 mt-0.5 block">Not generated yet</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Study content ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {!selectedTopic ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-white rounded-xl border border-gray-100 p-8">
              <BookOpen size={32} className="text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">Select a section from the list to start studying.</p>
            </div>
          ) : (
            <div>
              {/* Topic header */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">
                      Section {sectionNum}
                    </p>
                    <h2 className="text-[15px] font-extrabold text-gray-900">{selectedTopic.title}</h2>
                  </div>
                  {notes && (
                    <button
                      onClick={generateNotes}
                      disabled={generating}
                      title="Regenerate notes"
                      className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                    >
                      {generating ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                      {generating ? 'Updating…' : 'Regenerate'}
                    </button>
                  )}
                </div>
              </div>

              {/* No notes state */}
              {!notes && !loadingNotes && !generating && (
                <div className="bg-white rounded-xl border border-dashed border-blue-200 p-10 text-center mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={24} className="text-blue-500" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Notes not generated yet</h3>
                  <p className="text-[12px] text-gray-400 mb-5 max-w-xs mx-auto">
                    AI will create simplified, child-friendly notes with derivations, formulas, and examples for Section {sectionNum}.
                  </p>
                  <button
                    onClick={generateNotes}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-full text-[13px] font-bold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Generate Notes for this Section
                  </button>
                  {notesError && <p className="mt-3 text-[11px] text-red-500">{notesError}</p>}
                </div>
              )}

              {/* Generating spinner */}
              {(loadingNotes || generating) && (
                <div className="bg-white rounded-xl border border-blue-100 p-10 text-center mb-4">
                  <Loader2 size={28} className="text-blue-500 animate-spin mx-auto mb-3" />
                  <p className="text-[13px] font-semibold text-gray-700">
                    {generating ? 'Writing your notes…' : 'Loading…'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">This takes about 15–20 seconds</p>
                </div>
              )}

              {/* Content tabs */}
              {notes && !loadingNotes && !generating && (
                <>
                  {/* Tab bar */}
                  <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    {TABS.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-[12px] font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                          activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  {activeTab === 'notes'       && <NotesTab notes={notes} />}
                  {activeTab === 'derivations' && <DerivationsTab notes={notes} />}
                  {activeTab === 'formulas'    && <FormulasTab notes={notes} />}
                  {activeTab === 'practice'    && (
                    <PracticeTab topicId={selectedTopic.id} topicTitle={selectedTopic.title} />
                  )}
                </>
              )}

              {/* Practice always available even without notes */}
              {!notes && !loadingNotes && !generating && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-gray-100" />
                    <p className="text-[10px] text-gray-400 font-medium">Practice questions available without notes</p>
                    <div className="h-px flex-1 bg-gray-100" />
                  </div>
                  <PracticeTab topicId={selectedTopic.id} topicTitle={selectedTopic.title} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
