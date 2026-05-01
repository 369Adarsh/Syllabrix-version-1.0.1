'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
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
  FlaskConical, Brain, AlertCircle, Layers, ChevronUp,
  RotateCcw, Globe, Zap
} from 'lucide-react';

// ── Markdown renderer with KaTeX ──────────────────────────────────────────────
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

// ── NOTES TAB ─────────────────────────────────────────────────────────────────
function NotesTab({ notes }) {
  return (
    <div className="space-y-5">
      {notes.summary && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1.5">Quick Summary</p>
          <p className="text-[14px] text-blue-900 leading-relaxed font-medium">{notes.summary}</p>
        </div>
      )}

      {notes.theory && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <MD className="text-gray-800 leading-relaxed text-[14px] [&_h1]:text-[18px] [&_h1]:font-extrabold [&_h1]:text-gray-900 [&_h1]:mb-4 [&_h2]:text-[15px] [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:mt-5 [&_h2]:mb-3 [&_p]:leading-7 [&_p]:mb-3">
            {notes.theory}
          </MD>
        </div>
      )}

      {notes.key_points?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Key Takeaways</p>
          <div className="grid grid-cols-1 gap-2">
            {notes.key_points.map((pt, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-[13px] text-gray-700 leading-snug">{pt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.fun_fact && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
          <Lightbulb size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Did You Know?</p>
            <p className="text-[13px] text-amber-800 leading-relaxed">{notes.fun_fact}</p>
          </div>
        </div>
      )}

      {notes.common_mistakes?.length > 0 && (
        <div className="bg-white rounded-2xl border border-red-100 p-5">
          <p className="text-[11px] font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <AlertCircle size={12} /> Common Mistakes to Avoid
          </p>
          <div className="space-y-2.5">
            {notes.common_mistakes.map((m, i) => (
              <div key={i} className="p-3.5 bg-red-50 rounded-xl text-[12px] space-y-1">
                <p className="font-semibold text-red-700">❌ {m.mistake}</p>
                {m.why_wrong  && <p className="text-red-600">{m.why_wrong}</p>}
                {m.correct_way && <p className="text-emerald-700 font-medium">✅ {m.correct_way}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── DERIVATIONS TAB ───────────────────────────────────────────────────────────
function DerivationsTab({ notes }) {
  const [open, setOpen] = useState(0);
  const items = notes.derivations || [];

  if (!items.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <FlaskConical size={36} className="text-gray-200 mb-3" />
      <p className="text-gray-400">No derivations for this section.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {items.map((d, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="text-[14px] font-bold text-gray-800">{d.name}</p>
              {d.why_we_derive && <p className="text-[11px] text-gray-400 mt-0.5">{d.why_we_derive}</p>}
            </div>
            {open === i
              ? <ChevronUp size={16} className="text-blue-500 flex-shrink-0" />
              : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
          </button>

          {open === i && (
            <div className="px-5 pb-5 border-t border-gray-50 space-y-4">
              {d.starting_point && (
                <div className="mt-4 p-3.5 bg-blue-50 rounded-xl text-[13px] text-blue-800">
                  <span className="font-bold">Starting point: </span>{d.starting_point}
                </div>
              )}
              {d.steps?.length > 0 && (
                <div className="space-y-2.5">
                  {d.steps.map((step, si) => (
                    <div key={si} className="flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 flex-shrink-0 mt-1">
                        {si + 1}
                      </span>
                      <div className="flex-1 text-[13px] text-gray-700 pt-0.5">
                        <MD>{step}</MD>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {d.final_result && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Result</p>
                  <MD className="text-emerald-900 font-semibold text-[15px]">{d.final_result}</MD>
                </div>
              )}
              {d.remember_as && (
                <div className="flex gap-2 p-3 bg-amber-50 rounded-xl">
                  <Lightbulb size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-amber-800"><span className="font-bold">Remember as: </span>{d.remember_as}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── FORMULAS TAB ──────────────────────────────────────────────────────────────
function FormulasTab({ notes }) {
  const items = notes.formulas || [];
  const ex    = notes.solved_example;

  if (!items.length && !ex) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Brain size={36} className="text-gray-200 mb-3" />
      <p className="text-gray-400">No formulas for this section.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {items.map((f, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[14px] font-bold text-gray-800">{f.name}</p>
            <span className="text-[9px] px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full font-bold flex-shrink-0">Formula</span>
          </div>

          <div className="p-4 bg-gray-900 rounded-xl text-center overflow-x-auto">
            <MD className="text-white [&_*]:text-white">{f.formula}</MD>
          </div>

          {f.variables && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Variables</p>
              <p className="text-[13px] text-gray-600">{f.variables}</p>
            </div>
          )}
          {f.trick && (
            <div className="flex gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
              <span className="text-[15px] flex-shrink-0">🔥</span>
              <p className="text-[12px] text-orange-800">{f.trick}</p>
            </div>
          )}
          {f.unit_check && (
            <div className="flex gap-2 p-2.5 bg-blue-50 rounded-xl">
              <span className="text-[13px] flex-shrink-0">📐</span>
              <p className="text-[11px] text-blue-700">{f.unit_check}</p>
            </div>
          )}
        </div>
      ))}

      {ex && (
        <div className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-sm">
          <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <CheckCircle2 size={12} /> Worked Example
          </p>
          <div className="space-y-3">
            <div className="p-4 bg-indigo-50 rounded-xl">
              <p className="text-[14px] font-semibold text-gray-900">{ex.problem}</p>
            </div>
            {ex.given && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Given</p>
                <MD className="text-[13px] text-gray-600">{ex.given}</MD>
              </div>
            )}
            {ex.to_find && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">To Find</p>
                <p className="text-[13px] text-gray-600">{ex.to_find}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Solution</p>
              <MD className="text-[13px] text-gray-700">{ex.solution}</MD>
            </div>
            {ex.answer && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <MD className="text-emerald-800 font-bold">{ex.answer}</MD>
              </div>
            )}
            {ex.key_insight && (
              <div className="flex gap-2 p-3 bg-amber-50 rounded-xl">
                <Lightbulb size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-amber-800">{ex.key_insight}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── PRACTICE TAB ──────────────────────────────────────────────────────────────
function PracticeQuestion({ q, index }) {
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState(null);

  const isMCQ        = q.type === 'mcq' && q.options?.length > 0;
  const correctLetter = isMCQ ? q.answer?.charAt(0)?.toUpperCase() : null;

  function optStyle(letter) {
    if (!revealed && selected !== letter) return 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50';
    if (!revealed && selected === letter) return 'border-blue-400 bg-blue-50';
    if (letter === correctLetter)          return 'border-emerald-400 bg-emerald-50';
    if (selected === letter)               return 'border-red-300 bg-red-50';
    return 'border-gray-100 bg-gray-50 opacity-60';
  }

  const diffColor = q.difficulty === 'hard'   ? 'bg-red-100 text-red-600'
                  : q.difficulty === 'medium' ? 'bg-amber-100 text-amber-700'
                  :                             'bg-emerald-100 text-emerald-700';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
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
        {isMCQ && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map((opt, oi) => {
              const letter = opt.charAt(0).toUpperCase();
              return (
                <button key={oi}
                  onClick={() => { if (!revealed) { setSelected(letter); setRevealed(true); } }}
                  className={`flex items-start gap-2 p-3 rounded-xl text-left text-[12px] border transition-all ${optStyle(letter)}`}
                >
                  <span className="font-bold flex-shrink-0 text-[11px]">{opt.slice(0, 2)}</span>
                  <span>{opt.slice(3)}</span>
                </button>
              );
            })}
          </div>
        )}

        {q.hint && !revealed && (
          <details className="group">
            <summary className="text-[11px] text-blue-500 cursor-pointer hover:text-blue-700 font-medium list-none flex items-center gap-1">
              <Lightbulb size={11} /> Show Hint
            </summary>
            <p className="mt-2 text-[11px] text-blue-600 bg-blue-50 p-2.5 rounded-xl">{q.hint}</p>
          </details>
        )}

        {(!isMCQ || revealed) && (
          <button
            onClick={() => setRevealed(v => !v)}
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-colors ${
              revealed ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {revealed ? <><ChevronUp size={12} /> Hide Solution</> : <><ChevronDown size={12} /> Show Solution</>}
          </button>
        )}

        {revealed && (
          <div className="space-y-2 border-t border-gray-100 pt-3">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Solution</p>
              <div className="text-[13px] text-gray-700"><MD>{q.solution}</MD></div>
            </div>
            {q.answer && (
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-0.5">Answer</p>
                <MD className="text-emerald-800 font-semibold text-[13px]">{q.answer}</MD>
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

function PracticeTab({ topicId }) {
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [difficulty, setDiff]     = useState('mixed');
  const [error,      setError]    = useState('');

  const generate = useCallback(async (reset = false) => {
    setLoading(true);
    setError('');
    const offset = reset ? 0 : questions.length;
    try {
      const r = await jeeAPI.generatePracticeQuestions(topicId, { count: 5, difficulty, offset });
      const fresh = r.data?.data || [];
      setQuestions(prev => reset ? fresh : [...prev, ...fresh]);
    } catch {
      setError('Could not generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [topicId, difficulty, questions.length]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-white border border-gray-200 rounded-full p-0.5">
          {['mixed', 'easy', 'medium', 'hard'].map(d => (
            <button key={d} onClick={() => setDiff(d)}
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

      {questions.map((q, i) => (
        <PracticeQuestion key={`${q.question?.slice(0,20)}_${i}`} q={q} index={i} />
      ))}

      {error && (
        <div className="flex gap-2 p-3 bg-red-50 rounded-xl border border-red-100 text-[12px] text-red-600">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <button
        onClick={() => generate(false)}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[13px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 transition-all shadow-sm"
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" /> Generating…</>
        ) : questions.length === 0 ? (
          <><Sparkles size={16} /> Generate Practice Questions</>
        ) : (
          <><Sparkles size={16} /> Generate More Questions</>
        )}
      </button>

      {questions.length > 0 && !loading && (
        <p className="text-center text-[10px] text-gray-400">{questions.length} questions · each batch is unique</p>
      )}
    </div>
  );
}

// ── GENERATING ANIMATION ──────────────────────────────────────────────────────
function GeneratingState() {
  const steps = [
    { icon: Globe,   label: 'Searching NCERT & web sources…'  },
    { icon: Brain,   label: 'Analysing chapter content…'       },
    { icon: Sparkles,label: 'Crafting your lesson…'            },
    { icon: Zap,     label: 'Formatting formulas & examples…'  },
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % steps.length), 2800);
    return () => clearInterval(id);
  }, []);

  const S = steps[step];
  const Icon = S.icon;

  return (
    <div className="bg-white rounded-2xl border border-blue-100 p-12 text-center shadow-sm">
      <div className="relative w-16 h-16 mx-auto mb-5">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-spin border-t-blue-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={24} className="text-blue-500" />
        </div>
      </div>
      <p className="text-[15px] font-bold text-gray-800 mb-1">{S.label}</p>
      <p className="text-[12px] text-gray-400">AI + web sources · usually 20–30 sec</p>
      <div className="flex justify-center gap-1.5 mt-4">
        {steps.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${
            i === step ? 'w-6 bg-blue-500' : 'w-1.5 bg-gray-200'
          }`} />
        ))}
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'notes',       label: '📖 Notes'      },
  { id: 'derivations', label: '📐 Derivations' },
  { id: 'formulas',    label: '🔢 Formulas'    },
  { id: 'practice',    label: '💡 Practice'    },
];

export default function ChapterStudyPage() {
  const params    = useParams();
  const chapterId = params.chapterId;

  const [chapter,      setChapter]      = useState(null);
  const [topics,       setTopics]       = useState([]);
  const [loadingChapter, setLoadingChapter] = useState(true);
  const [selectedTopic,  setSelectedTopic]  = useState(null);
  const [activeTab,    setActiveTab]    = useState('notes');
  const [notes,        setNotes]        = useState(null);
  const [generating,   setGenerating]   = useState(false);
  const [notesError,   setNotesError]   = useState('');
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  // Guard against stale async results when user clicks a different topic mid-flight
  const currentTopicIdRef = useRef(null);

  // Load chapter + topics on mount
  useEffect(() => {
    jeeAPI.getLibraryChapter(chapterId)
      .then(r => {
        setChapter(r.data.chapter);
        const ts = r.data.topics || [];
        setTopics(ts);
        if (ts.length) setSelectedTopic(ts[0]);
      })
      .catch(() => {})
      .finally(() => setLoadingChapter(false));
  }, [chapterId]);

  // When topic changes: check cache → auto-generate if no notes
  useEffect(() => {
    if (!selectedTopic) return;
    const topicId = selectedTopic.id;
    currentTopicIdRef.current = topicId;

    setNotes(null);
    setNotesError('');
    setGenerating(false);
    setActiveTab('notes');

    jeeAPI.getLibraryTopicContent(topicId)
      .then(r => {
        if (currentTopicIdRef.current !== topicId) return;
        if (r.data?.data) {
          setNotes(r.data.data);
          return;
        }
        // No cached notes → auto-generate immediately
        setGenerating(true);
        return jeeAPI.generateLibraryTopicNotes(topicId)
          .then(r2 => {
            if (currentTopicIdRef.current !== topicId) return;
            setNotes(r2.data.data);
            setTopics(prev => prev.map(t => t.id === topicId ? { ...t, has_notes: 1 } : t));
          })
          .catch(() => {
            if (currentTopicIdRef.current !== topicId) return;
            setNotesError('Generation failed. Please try again.');
          })
          .finally(() => {
            if (currentTopicIdRef.current !== topicId) return;
            setGenerating(false);
          });
      })
      .catch(() => {
        if (currentTopicIdRef.current !== topicId) return;
        setNotesError('Could not load notes. Please try again.');
      });
  }, [selectedTopic?.id]);

  // Manual regenerate (refresh button)
  const regenerate = async () => {
    if (!selectedTopic) return;
    const topicId = selectedTopic.id;
    currentTopicIdRef.current = topicId;
    setGenerating(true);
    setNotesError('');
    setNotes(null);
    try {
      const r = await jeeAPI.generateLibraryTopicNotes(topicId);
      if (currentTopicIdRef.current !== topicId) return;
      setNotes(r.data.data);
      setTopics(prev => prev.map(t => t.id === topicId ? { ...t, has_notes: 1 } : t));
    } catch {
      if (currentTopicIdRef.current !== topicId) return;
      setNotesError('Regeneration failed. Please try again.');
    } finally {
      if (currentTopicIdRef.current !== topicId) return;
      setGenerating(false);
    }
  };

  if (loadingChapter) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 size={28} className="text-blue-400 animate-spin" />
    </div>
  );

  if (!chapter) return (
    <div className="flex items-center gap-3 p-5 bg-red-50 rounded-2xl border border-red-100">
      <AlertCircle size={18} className="text-red-500" />
      <p className="text-red-700">Chapter not found.</p>
    </div>
  );

  const notesReady  = topics.filter(t => t.has_notes).length;
  const sectionNum  = selectedTopic ? `${chapter.chapter_number}.${selectedTopic.topic_order}` : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/jee-command/study"
          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0 shadow-sm">
          <ArrowLeft size={15} className="text-gray-600" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-gray-400 font-medium">{chapter.book_title}</span>
            <ChevronRight size={10} className="text-gray-300" />
            <span className="text-[10px] text-blue-600 font-bold">Chapter {chapter.chapter_number}</span>
          </div>
          <h1 className="text-[16px] font-extrabold text-gray-900 leading-tight">{chapter.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-[10px] text-gray-400">{chapter.subject_name} · Class {chapter.grade}</p>
            {notesReady > 0 && (
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 size={9} /> {notesReady}/{topics.length} sections ready
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(v => !v)}
          className="lg:hidden px-3 py-1.5 text-[11px] font-semibold bg-white border border-gray-200 rounded-full flex items-center gap-1.5 flex-shrink-0 shadow-sm"
        >
          <Layers size={11} /> Sections {sidebarOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
      </div>

      <div className="flex gap-5 items-start">
        {/* Sidebar — topics list */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 xl:w-72 flex-shrink-0`}>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {topics.length} Sections
              </p>
              {notesReady > 0 && (
                <span className="text-[9px] text-emerald-600 font-bold">{notesReady} ready</span>
              )}
            </div>
            {/* Mini progress bar */}
            {topics.length > 0 && (
              <div className="h-1 bg-gray-100">
                <div
                  className="h-1 bg-emerald-400 transition-all duration-500"
                  style={{ width: `${(notesReady / topics.length) * 100}%` }}
                />
              </div>
            )}
            <div className="max-h-[72vh] overflow-y-auto divide-y divide-gray-50">
              {topics.map(t => {
                const isActive = selectedTopic?.id === t.id;
                const secNum   = `${chapter.chapter_number}.${t.topic_order}`;
                return (
                  <button key={t.id}
                    onClick={() => { setSelectedTopic(t); setSidebarOpen(false); }}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                      isActive ? 'bg-blue-50 border-r-2 border-blue-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-[10px] font-bold mt-0.5 flex-shrink-0 min-w-[28px] ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                      {secNum}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-semibold leading-snug ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                        {t.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {t.has_notes
                          ? <span className="text-[9px] text-emerald-600 font-medium flex items-center gap-0.5"><CheckCircle2 size={9} /> Ready</span>
                          : <span className="text-[9px] text-gray-300">Not generated</span>
                        }
                        {isActive && generating && (
                          <span className="text-[9px] text-blue-500 flex items-center gap-0.5"><Loader2 size={9} className="animate-spin" /> Generating…</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {!selectedTopic ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-white rounded-2xl border border-gray-100 p-8">
              <BookOpen size={36} className="text-gray-200 mb-3" />
              <p className="text-gray-400">Select a section to start reading.</p>
            </div>
          ) : (
            <div>
              {/* Topic header */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 shadow-sm flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">
                    Section {sectionNum}
                  </p>
                  <h2 className="text-[16px] font-extrabold text-gray-900">{selectedTopic.title}</h2>
                </div>
                {notes && !generating && (
                  <button onClick={regenerate} title="Regenerate with latest AI + web"
                    className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-blue-600 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-colors flex-shrink-0 border border-gray-100">
                    <RefreshCw size={11} /> Regenerate
                  </button>
                )}
              </div>

              {/* Generating */}
              {generating && <GeneratingState />}

              {/* Error */}
              {notesError && !generating && (
                <div className="mb-4 flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[13px] text-red-700">{notesError}</p>
                  </div>
                  <button onClick={regenerate}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-[12px] font-bold hover:bg-red-700 flex-shrink-0">
                    Try Again
                  </button>
                </div>
              )}

              {/* Content */}
              {notes && !generating && (
                <>
                  {/* Grounding badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                      <Globe size={10} className="text-emerald-600" />
                      <span className="text-[10px] text-emerald-700 font-semibold">AI + Web Sources</span>
                    </div>
                    <div className="h-px flex-1 bg-gray-100" />
                  </div>

                  {/* Tab bar */}
                  <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 mb-5 overflow-x-auto shadow-sm" style={{ scrollbarWidth: 'none' }}>
                    {TABS.map(tab => (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-xl text-[12px] font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                          activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'notes'       && <NotesTab       notes={notes} />}
                  {activeTab === 'derivations' && <DerivationsTab notes={notes} />}
                  {activeTab === 'formulas'    && <FormulasTab    notes={notes} />}
                  {activeTab === 'practice'    && <PracticeTab    topicId={selectedTopic.id} />}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
