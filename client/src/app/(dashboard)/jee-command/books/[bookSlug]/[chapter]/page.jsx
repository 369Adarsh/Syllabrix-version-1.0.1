'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { jeeAPI } from '@/lib/api/jee.api';
import { useJeeAccess } from '@/lib/hooks/useJeeAccess';
import UpgradePrompt from '../../components/UpgradePrompt';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { 
  ArrowLeft, CheckCircle2, Star, 
  MessageSquare, Share2, BookmarkPlus
} from 'lucide-react';

export default function BookSolutionPage() {
  const { bookSlug, chapter } = useParams();
  const { isPro, checkAccess } = useJeeAccess();
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeExercise, setActiveExercise] = useState(null);

  const hasAccess = checkAccess('books');

  useEffect(() => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }
    
    jeeAPI.getBookSolutions(bookSlug, chapter)
      .then(r => {
        const data = r.data?.data || [];
        setSolutions(data);
        if (data.length > 0) setActiveExercise(data[0].exercise_type);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookSlug, chapter, hasAccess]);

  if (!hasAccess) {
    return (
      <div className="py-12">
        <UpgradePrompt feature="books" title="Complete HC Verma Solutions" />
      </div>
    );
  }

  if (loading) return (
    <div className="p-8 space-y-4">
      <div className="h-8 bg-gray-100 rounded-xl w-64 animate-pulse" />
      <div className="h-4 bg-gray-50 rounded-xl w-96 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {[1,2,4,4].map(i => <div key={i} className="h-40 bg-gray-50 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  const exercises = [...new Set(solutions.map(s => s.exercise_type))];
  const filteredSolutions = solutions.filter(s => s.exercise_type === activeExercise);
  const bookName = solutions[0]?.book_name || 'Premium Book';
  const chapterName = solutions[0]?.chapter_name || `Chapter ${chapter}`;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/jee-command/books" className="text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Ref Books</span>
        <span className="text-gray-300">/</span>
        <span className="text-[12px] font-bold text-gray-900 capitalize">{bookSlug.replace(/-/g, ' ')}</span>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 p-8 mb-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Star size={120} fill="currentColor" className="text-yellow-400" />
        </div>
        
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-lg bg-yellow-400 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Star size={10} fill="currentColor" /> PRO SOLUTION
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wider">
                Chapter {chapter}
              </span>
            </div>
            <h1 className="text-[26px] font-extrabold text-gray-900 tracking-tight">{chapterName}</h1>
            <p className="text-gray-500 text-[14px] mt-1 font-medium">{bookName}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button className="p-3 rounded-2xl border border-gray-100 text-gray-400 hover:text-blue-500 transition-all bg-white shadow-sm">
              <Share2 size={20} />
            </button>
            <button className="p-3 rounded-2xl border border-gray-100 text-gray-400 hover:text-blue-500 transition-all bg-white shadow-sm">
              <BookmarkPlus size={20} />
            </button>
          </div>
        </div>

        {/* Exercise Tabs */}
        {exercises.length > 1 && (
          <div className="flex gap-2 mt-8 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {exercises.map(ex => (
              <button
                key={ex}
                onClick={() => setActiveExercise(ex)}
                className={`px-5 py-2.5 rounded-2xl text-[12px] font-bold whitespace-nowrap transition-all ${
                  activeExercise === ex 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Solutions List */}
      <div className="space-y-6">
        {filteredSolutions.map((sol, idx) => (
          <div key={sol.id} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300">
            <div className="px-8 py-5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[12px] font-black text-gray-900">
                   {sol.question_number}
                 </div>
                 <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Question</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-tight ${
                  sol.difficulty === 'easy' ? 'bg-green-50 text-green-600' : 
                  sol.difficulty === 'hard' ? 'bg-red-50 text-red-600' : 
                  sol.difficulty === 'advanced' ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {sol.difficulty}
                </span>
                {sol.is_verified && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black tracking-widest">
                    <CheckCircle2 size={12} /> VERIFIED
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-8">
              {/* Question */}
              <div className="mb-10">
                <div className="prose prose-sm max-w-none text-[16px] text-gray-800 leading-relaxed font-medium">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{sol.question_text}</ReactMarkdown>
                </div>
              </div>

              {/* Solution */}
              <div className="bg-blue-50/20 rounded-3xl p-8 border border-blue-100/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-[11px] font-black shadow-lg shadow-blue-100">SOL</div>
                  <h4 className="text-[12px] font-black text-blue-900 uppercase tracking-[0.2em]">Step-by-Step Derivation</h4>
                </div>
                <div className="prose prose-sm max-w-none text-[15px] text-gray-700 leading-relaxed space-y-5">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{sol.solution_text}</ReactMarkdown>
                </div>
                
                {/* Visual indicator of complexity */}
                {sol.difficulty === 'advanced' && (
                  <div className="mt-8 pt-8 border-t border-blue-100/30">
                    <div className="flex items-center gap-2 text-indigo-700">
                      <Star size={16} fill="currentColor" />
                      <span className="text-[12px] font-black uppercase tracking-widest">Advanced JEE Strategy</span>
                    </div>
                    <p className="text-[13px] text-indigo-600 mt-2 font-medium leading-relaxed">
                      This question requires integration of multiple concepts. Always draw the Free Body Diagram first and conserve energy across the entire system.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-50">
                <button className="px-5 py-2.5 rounded-2xl bg-white border border-gray-100 text-[12px] font-bold text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center gap-2 shadow-sm">
                  <MessageSquare size={16} /> Explain with AI Buddy
                </button>
                <div className="text-[11px] text-gray-400 font-medium">
                  Ref: {bookSlug === 'hc-verma-vol1' ? 'HCV Vol 1' : 'HCV Vol 2'}
                </div>
              </div>
            </div>
          </div>
        ))}

        {solutions.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <Star size={48} className="text-gray-100 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">Solutions for this chapter are currently being verified.</p>
            <p className="text-[12px] text-gray-400 mt-1">Check back in 24 hours.</p>
          </div>
        )}
      </div>
    </div>
  );
}
