'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BookOpen, FileText, MessageSquare, Lightbulb, CheckSquare, UploadCloud, ChevronLeft } from 'lucide-react';
import { studyTableApi } from '@/lib/api/study-table.api';

export default function WorkspaceDetail() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId;

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkspace();
  }, [workspaceId]);

  const fetchWorkspace = async () => {
    try {
      const res = await studyTableApi.getWorkspaceDetails(workspaceId);
      setWorkspace(res.data.data);
    } catch (err) {
      console.error(err);
      router.push('/ai-study-table');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );
  if (!workspace) return null;

  const features = [
    { name: 'Upload Sources', icon: UploadCloud, path: `/ai-study-table/${workspaceId}/sources`, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', desc: `${workspace.documents?.length || 0} docs uploaded` },
    { name: 'Grounded Chat', icon: MessageSquare, path: `/ai-study-table/${workspaceId}/chat`, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', desc: 'Ask context-aware questions' },
    { name: 'Flashcards', icon: Lightbulb, path: `/ai-study-table/${workspaceId}/artifacts?type=flashcard_set`, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', desc: 'Study with AI-generated cards' },
    { name: 'Quizzes', icon: CheckSquare, path: `/ai-study-table/${workspaceId}/artifacts?type=quiz`, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', desc: 'Test yourself with MCQs' },
    { name: 'Study Guides', icon: FileText, path: `/ai-study-table/${workspaceId}/artifacts?type=study_guide`, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', desc: 'AI-summarized study notes' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb / Back */}
      <div className="mb-4">
        <button onClick={() => router.push('/ai-study-table')} 
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">
          <ChevronLeft size={14} /> Back to Dashboard
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center ring-1 ring-white/20 shadow-inner">
              <BookOpen className="text-white" size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight leading-none">{workspace.title}</h1>
              <p className="text-indigo-100 font-medium mt-2 max-w-lg opacity-80">{workspace.description || 'Elevate your learning with AI Study Copilot'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl ring-1 ring-white/20 font-bold text-sm">
            <Layers size={14} className="text-indigo-200" />
            <span>{workspace.documents?.length || 0} Sources</span>
          </div>
        </div>
      </div>

      {/* Interactive Tool Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, idx) => (
          <div key={idx} onClick={() => router.push(f.path)}
            className={`group bg-white rounded-2xl border-2 ${f.border} p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4 overflow-hidden relative`}>
            <div className={`absolute top-0 right-0 w-24 h-24 ${f.bg} rounded-full blur-2xl opacity-40 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform`} />
            
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.bg} ${f.color} group-hover:scale-110 transition-transform relative z-10`}>
              <f.icon size={22} strokeWidth={2.5} />
            </div>
            <div className="relative z-10">
              <h3 className="text-[17px] font-extrabold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{f.name}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
            </div>
            <div className={`mt-auto pt-4 border-t border-slate-100 flex items-center gap-2 text-[12px] font-bold ${f.color} opacity-0 group-hover:opacity-100 transition-all`}>
              Get Started <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Artifacts List Section */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles size={20} className="text-amber-500" />
            Generated Study Artifacts
          </h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{workspace.artifacts?.length || 0} Items</span>
        </div>

        {workspace.artifacts && workspace.artifacts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {workspace.artifacts.map(art => (
              <div key={art.id} onClick={() => router.push(`/ai-study-table/${workspaceId}/artifacts/${art.id}`)} 
                className="group p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center gap-4 cursor-pointer hover:bg-white hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:bg-indigo-50 transition-colors">
                  <FileText size={20} className="text-indigo-500" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-slate-800 truncate leading-tight group-hover:text-indigo-600 transition-colors">{art.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-wider rounded-md">{art.type.replace('_', ' ')}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Ready to study</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <FileText size={32} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-800 font-bold mb-2">Workspace Empty</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">No artifacts generated yet. Start by uploading documents and choosing a study method above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
