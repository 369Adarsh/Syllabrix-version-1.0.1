'use client';
import { useEffect, useState, useCallback } from 'react';
import { InlineMath } from 'react-katex';
import { jeeAPI } from '@/lib/api/jee.api';
import { useJee } from '../layout';
import { 
  Loader2, BookmarkPlus, CheckCircle2, XCircle, Eye, EyeOff, 
  ChevronDown, Filter, Sparkles, Layers, ShieldCheck, Flag, Lock 
} from 'lucide-react';
import TrustBadge from '../components/TrustBadge';
import ReportButton from '../components/ReportButton';
import UpgradePrompt from '@/app/(dashboard)/jee-command/components/UpgradePrompt';
import { useJeeAccess } from '@/lib/hooks/useJeeAccess';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const SUBJECTS = [
  { slug: 'physics',     label: 'Physics',     color: 'blue'   },
  { slug: 'chemistry',   label: 'Chemistry',   color: 'emerald'},
  { slug: 'mathematics', label: 'Mathematics', color: 'violet' },
];
const YEARS = Array.from({ length: 30 }, (_, i) => 2024 - i);
const DIFFICULTIES = ['easy','medium','hard','advanced'];

function QuestionCard({ q }) {
  const [showSolution, setShowSolution] = useState(false);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [generatingSimilar, setGeneratingSimilar] = useState(false);
  const [similarQuestions, setSimilarQuestions] = useState([]);
  const options = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : (q.options || []);
  const isCorrect = selected === q.correct_answer;

  const handleGenerateSimilar = async () => {
    setGeneratingSimilar(true);
    try {
      const r = await jeeAPI.generateSimilar({ question_id: q.id, count: 2, infinite: true });
      if (r.data?.data) setSimilarQuestions(prev => [...prev, ...r.data.data]);
    } catch {}
    finally { setGeneratingSimilar(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {q.source_year && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
              JEE {q.source_type === 'pyq_main' ? 'Main' : 'Advanced'} {q.source_year}
            </span>
          )}
          {q.source_session && (
            <span className="text-[10px] text-gray-400">{q.source_session}</span>
          )}
          <TrustBadge 
            verified={q.is_verified} 
            source={q.content_source} 
            reporterCount={q.report_count} 
          />
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            q.difficulty === 'easy' ? 'bg-green-50 text-green-700' :
            q.difficulty === 'medium' ? 'bg-amber-50 text-amber-700' :
            q.difficulty === 'hard' ? 'bg-red-50 text-red-700' : 'bg-purple-50 text-purple-700'
          }`}>{q.difficulty}</span>
          <span className="text-[10px] text-gray-400">{q.chapter_name}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <ReportButton contentId={q.id} contentType="question" name="Question" />
          <span className="text-[10px] text-emerald-600 font-medium">+{q.marks}</span>
          <span className="text-[10px] text-red-500 font-medium">{q.negative_marks}</span>
          <button onClick={() => jeeAPI.addBookmark({ bookmark_type: 'question', reference_id: q.id }).catch(()=>{})}
            className="p-1 rounded hover:bg-gray-100 transition-colors">
            <BookmarkPlus size={13} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Question text */}
      <div className="prose prose-sm max-w-none text-[13px] text-gray-800 mb-3">
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{q.question_text}</ReactMarkdown>
      </div>

      {/* Options */}
      {options.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {options.map(opt => {
            let cls = 'border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50';
            if (selected === opt.id) {
              cls = revealed
                ? isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-red-400 bg-red-50 text-red-800'
                : 'border-blue-500 bg-blue-50 text-blue-800';
            }
            if (revealed && opt.id === q.correct_answer && selected !== opt.id) {
              cls = 'border-emerald-400 bg-emerald-50 text-emerald-800';
            }
            return (
              <button key={opt.id} onClick={() => { setSelected(opt.id); setRevealed(false); }}
                className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border text-[12px] text-left transition-all ${cls}`}>
                <span className="font-bold flex-shrink-0">{opt.id}.</span>
                <span className="flex-1 text-wrap">
                  {opt.text.includes('$') ? <InlineMath math={opt.text.replace(/\$/g, '')} /> : opt.text}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {selected && !revealed && (
          <button onClick={() => setRevealed(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            <Eye size={12} /> Check Answer
          </button>
        )}
        {revealed && (
          <span className={`flex items-center gap-1 text-[12px] font-semibold ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
            {isCorrect ? <><CheckCircle2 size={13}/> Correct!</> : <><XCircle size={13}/> Wrong — Answer: {q.correct_answer}</>}
          </span>
        )}
        <button onClick={() => setShowSolution(v => !v)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors ml-auto">
          {showSolution ? <EyeOff size={12} /> : <Eye size={12} />}
          {showSolution ? 'Hide' : 'See'} Solution
        </button>
      </div>

      {/* Solution */}
      {showSolution && (
        <div className="mt-3 pt-3 border-t border-gray-100 bg-blue-50 rounded-lg p-3">
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

      {/* Similar Questions Section */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <button onClick={handleGenerateSimilar} disabled={generatingSimilar}
          className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
          {generatingSimilar ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          {generatingSimilar ? 'Generating variations...' : 'Powerhouse: Generate Similar Questions'}
        </button>
        {similarQuestions.length > 0 && (
          <div className="mt-3 space-y-4 pl-4 border-l-2 border-indigo-100">
            <p className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold mb-2">AI-Generated Variations</p>
            {similarQuestions.map((sq, idx) => (
              <QuestionCard key={`similar-${idx}`} q={{ ...sq, chapter_name: q.chapter_name, marks: 4, negative_marks: -1 }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PYQPage() {
  const { examType } = useJee();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ subject: '', year: '', difficulty: '' });
  const [showFilters, setShowFilters] = useState(false);

  const handleFetchArchive = async () => {
    if (!filters.year || !filters.subject) return;
    setExtracting(true);
    try {
      // Find a typical chapter from current list to use as context
      const chapter = questions[0]?.chapter_name || 'General';
      await jeeAPI.extractArchive({
        subject: filters.subject,
        chapter: chapter,
        year: parseInt(filters.year),
        count: 10
      }, true);
      // Reload current filters
      load(1, true);
    } catch {}
    finally { setExtracting(false); }
  };

  const load = useCallback(async (p = 1, reset = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params = { page: p, limit: 15, type: examType };
      if (filters.subject) params.subject = filters.subject;
      if (filters.year) params.year = filters.year;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      const r = await jeeAPI.getPYQs(params);
      const data = r.data?.data || [];
      if (reset || p === 1) setQuestions(data); else setQuestions(prev => [...prev, ...data]);
      setPage(p);
    } catch {}
    finally { setLoading(false); setLoadingMore(false); }
  }, [examType, filters]);

  useEffect(() => { load(1, true); }, [load]);


  const { isPro } = useJeeAccess();

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 mb-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-[12px] text-gray-600 hover:bg-gray-100 transition-colors">
            <Filter size={12} /> Filters <ChevronDown size={11} className={showFilters ? 'rotate-180' : ''} />
          </button>
          {/* Subject pills */}
          {SUBJECTS.map(s => (
            <button key={s.slug}
              onClick={() => setFilters(f => ({ ...f, subject: f.subject === s.slug ? '' : s.slug }))}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                filters.subject === s.slug ? 'bg-blue-600 text-white' : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}>
              {s.label}
            </button>
          ))}
          {(filters.subject || filters.year || filters.difficulty) && (
            <button onClick={() => setFilters({ subject: '', year: '', difficulty: '' })}
              className="text-[11px] text-red-500 font-medium hover:underline ml-auto">
              Clear filters
            </button>
          )}
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
            <div>
              <p className="text-[10px] text-gray-400 mb-1.5 font-semibold uppercase">Year</p>
              <div className="flex flex-wrap gap-1">
                {YEARS.map(y => {
                  const isRestricted = (2024 - y) >= 5 && !isPro;
                  return (
                    <button key={y}
                      onClick={() => !isRestricted && setFilters(f => ({ ...f, year: f.year === String(y) ? '' : String(y) }))}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                        filters.year === String(y) ? 'bg-blue-600 text-white' : 'bg-gray-50 border text-gray-600 hover:bg-gray-100'
                      } ${isRestricted ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {y} {isRestricted && <Lock size={10} />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 mb-1.5 font-semibold uppercase">Difficulty</p>
              <div className="flex gap-1">
                {DIFFICULTIES.map(d => (
                  <button key={d}
                    onClick={() => setFilters(f => ({ ...f, difficulty: f.difficulty === d ? '' : d }))}
                    className={`px-2 py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                      filters.difficulty === d ? 'bg-blue-600 text-white' : 'bg-gray-50 border text-gray-600 hover:bg-gray-100'
                    }`}>{d}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>


      {loading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="bg-white rounded-xl h-36 animate-pulse border border-gray-100" />)}</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Layers size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold text-[15px]">The 30-Year Archive is Deep...</p>
          <p className="text-[12px] text-gray-400 mt-1 mb-4">No local questions found for {filters.subject || 'this subject'} in {filters.year || 'this year'}.</p>
          {filters.year && filters.subject && (
            <button onClick={handleFetchArchive} disabled={extracting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-60">
              {extracting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {extracting ? 'Deep-Extracting from archive...' : `Extract ${filters.year} PYQs from AI Archive`}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map(q => <QuestionCard key={q.id} q={q} />)}
          <button onClick={() => load(page + 1)}
            disabled={loadingMore}
            className="w-full py-3 rounded-xl text-[13px] font-medium text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 bg-white border border-gray-100 disabled:opacity-60">
            {loadingMore ? <><Loader2 size={14} className="animate-spin" /> Loading...</> : 'Load more questions'}
          </button>
        </div>
      )}
    </div>
  );
}
