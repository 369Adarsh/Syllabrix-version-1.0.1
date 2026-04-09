'use client';
import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { jeeAPI } from '@/lib/api/jee.api';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { 
  ArrowLeft, CheckCircle2, ChevronRight, 
  MessageSquare, Share2, BookmarkPlus, BookOpen, Sparkles
} from 'lucide-react';

function NcertChapterContent() {
  const { subject, class: classLevel, chapter } = useParams();
  const searchParams = useSearchParams();
  const bookType = searchParams.get('type') || 'textbook';
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeExercise, setActiveExercise] = useState(null);

  useEffect(() => {
    jeeAPI.getNCERTExercises(subject, classLevel, chapter, bookType)
      .then(r => {
        const data = r.data?.data || [];
        setSolutions(data);
        if (data.length > 0) setActiveExercise(data[0].exercise_name);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subject, classLevel, chapter, bookType]);

  const exercises = [...new Set(solutions.map(s => s.exercise_name))];
  const filteredSolutions = solutions.filter(s => s.exercise_name === activeExercise);
  const chapterName = solutions[0]?.chapter_name || `Chapter ${chapter}`;

  if (loading) return (
    <div className="p-8 space-y-4">
      <div className="h-8 bg-gray-100 rounded-xl w-64 animate-pulse" />
      <div className="h-4 bg-gray-50 rounded-xl w-96 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {[1,2,4,4].map(i => <div key={i} className="h-40 bg-gray-50 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/jee-command/ncert" className="text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">NCERT Solutions</span>
        <span className="text-gray-300">/</span>
        <span className="text-[12px] font-bold text-gray-900 capitalize">{subject} Class {classLevel}</span>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                Chapter {chapter}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                {bookType === 'textbook' ? 'Textbook' : 'Exemplar'}
              </span>
            </div>
            <h1 className="text-[24px] font-bold text-gray-900">{chapterName}</h1>
            <p className="text-gray-500 text-[13px] mt-1">Detailed solutions for all exercise questions.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button className="p-2.5 rounded-xl border border-gray-100 text-gray-400 hover:text-blue-500 transition-all">
              <Share2 size={18} />
            </button>
            <button className="p-2.5 rounded-xl border border-gray-100 text-gray-400 hover:text-blue-500 transition-all">
              <BookmarkPlus size={18} />
            </button>
          </div>
        </div>

        {exercises.length > 1 && (
          <div className="flex gap-2 mt-8 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {exercises.map(ex => (
              <button
                key={ex}
                onClick={() => setActiveExercise(ex)}
                className={`px-4 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all ${
                  activeExercise === ex 
                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {filteredSolutions.map((sol, idx) => (
          <div key={sol.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[12px] font-bold text-gray-500">Question {sol.question_number}</span>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  sol.difficulty === 'easy' ? 'bg-green-50 text-green-600' : 
                  sol.difficulty === 'hard' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {sol.difficulty}
                </span>
                {sol.is_verified && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                    <CheckCircle2 size={12} /> VERIFIED
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-8">
                <div className="prose prose-sm max-w-none text-[15px] text-gray-800 leading-relaxed font-medium">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{sol.question_text}</ReactMarkdown>
                </div>
              </div>

              <div className="bg-blue-50/30 rounded-2xl p-6 border border-blue-100/50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">A</div>
                  <h4 className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">Detailed Solution</h4>
                </div>
                <div className="prose prose-sm max-w-none text-[14px] text-gray-700 leading-relaxed space-y-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{sol.solution_text}</ReactMarkdown>
                </div>
                
                {sol.key_concept && (
                  <div className="mt-6 pt-6 border-t border-blue-100/50">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Sparkles size={14} />
                      <span className="text-[11px] font-bold uppercase tracking-wider">JEE Strategy Note</span>
                    </div>
                    <p className="text-[12px] text-blue-600 mt-2 italic">"{sol.key_concept}"</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button className="flex items-center gap-2 text-[12px] font-bold text-gray-500 hover:text-blue-600 transition-colors">
                  <MessageSquare size={14} /> Ask AI to explain
                </button>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-gray-400">Found an error? <button className="text-red-500 hover:underline">Report</button></span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredSolutions.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <BookOpen size={48} className="text-gray-100 mx-auto mb-4" />
            <p className="text-gray-500">No questions found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NcertChapterPage() {
  return (
    <Suspense fallback={
      <div className="p-8 space-y-4">
        <div className="h-8 bg-gray-100 rounded-xl w-64 animate-pulse" />
        <div className="h-4 bg-gray-50 rounded-xl w-96 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {[1,2,4,4].map(i => <div key={i} className="h-40 bg-gray-50 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    }>
      <NcertChapterContent />
    </Suspense>
  );
}
