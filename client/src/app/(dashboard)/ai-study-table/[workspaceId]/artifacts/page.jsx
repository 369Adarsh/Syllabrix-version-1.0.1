'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Sparkles, ArrowLeft, Loader2, BookOpen, AlertTriangle } from 'lucide-react';
import { studyTableApi } from '@/lib/api/study-table.api';
import ReactMarkdown from 'react-markdown';

function ArtifactGenerationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { workspaceId } = useParams();
  const type = searchParams.get('type');
  
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!type) {
      router.push(`/ai-study-table/${workspaceId}`);
    }
  }, [type, workspaceId, router]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await studyTableApi.generateArtifact(workspaceId, { type, topic });
      router.push(`/ai-study-table/${workspaceId}/artifacts/${res.data.data.id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Generation failed. Make sure you have uploaded source documents.');
    } finally {
      setGenerating(false);
    }
  };

  const titles = {
    flashcard_set: 'Generate Flashcards',
    quiz: 'Generate Practice Quiz',
    study_guide: 'Generate Study Guide'
  };

  const desc = {
    flashcard_set: 'Extract key concepts and terms from your syllabus to study with spaced repetition.',
    quiz: 'Test your understanding with rigorous multiple-choice questions grounded in your course material.',
    study_guide: 'Get a comprehensive, well-structured summary of a specific topic from your uploaded PDFs.'
  };

  if (!type) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] p-4 lg:p-8 flex items-center justify-center">
      <div className="max-w-xl w-full">
        <button onClick={() => router.push(`/ai-study-table/${workspaceId}`)} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-50 to-purple-100 blur-3xl opacity-50 pointer-events-none" />
          <div className="relative z-10 text-center mb-8">
            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-inner mb-4 bg-gradient-to-br from-indigo-500 to-purple-600`}>
               <Sparkles className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">{titles[type] || 'Generate Artifact'}</h1>
            <p className="text-slate-500 font-medium">{desc[type] || 'Create a bespoke learning asset from your sources.'}</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Topic or Focus Area</label>
              <input
                type="text"
                required
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="E.g., Molecular Biology, Calculus..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>
            {error && (
              <div className="bg-rose-50 text-rose-700 p-4 rounded-xl flex items-start gap-3 text-sm font-medium">
                <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                <p>{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={!topic.trim() || generating}
              className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generating ? <><Loader2 className="animate-spin" size={20} /> Generating...</> : <><BookOpen size={20} /> Generate</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function WorkspaceArtifacts() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    }>
      <ArtifactGenerationContent />
    </Suspense>
  );
}
