'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, BookOpen, Layers, Settings, FileText, ChevronRight } from 'lucide-react';
import { studyTableApi } from '@/lib/api/study-table.api';

export default function StudyTableDashboard() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const res = await studyTableApi.getWorkspaces();
      setWorkspaces(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const res = await studyTableApi.createWorkspace({
        title: newTitle, description: newDesc, color: '#4F46E5', icon: 'BookOpen'
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      router.push(`/ai-study-table/${res.data.data.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Study Copilot</span>
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-bold uppercase tracking-wider">Beta</span>
            </h1>
            <p className="text-slate-500 mt-2 max-w-2xl text-[15px] leading-relaxed">
              Your intelligent, document-grounded AI tutor. Create a workspace for your class, upload your syllabus and notes, and generate tailored study materials instantly.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Plus size={18} strokeWidth={2.5} />
            New Workspace
          </button>
        </div>

        {/* Workspaces Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-2xl border border-slate-200" />
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center max-w-2xl mx-auto mt-12">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Layers className="text-indigo-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No workspaces yet</h3>
            <p className="text-slate-500 mb-6">Create your first class workspace to start uploading documents and generating notes.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Create your first Workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {workspaces.map((ws) => (
              <div 
                key={ws.id}
                onClick={() => router.push(`/ai-study-table/${ws.id}`)}
                className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 cursor-pointer hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col h-56"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner mb-4">
                  <BookOpen className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {ws.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-auto break-words">
                  {ws.description || 'No description provided.'}
                </p>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[13px] font-medium text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <span className="flex items-center gap-1.5"><FileText size={14}/> Open Workspace</span>
                  <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-800 mb-1">Create Workspace</h2>
            <p className="text-slate-500 text-sm mb-6">E.g., "Physics 101" or "History Midterm"</p>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Class / Topic Name</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Biology 101..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Description (optional)</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none h-24"
                  placeholder="Materials for the upcoming midterm..."
                />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-200"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
