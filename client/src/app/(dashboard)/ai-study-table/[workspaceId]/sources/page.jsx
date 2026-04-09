'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { UploadCloud, File, FileText, CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';
import { studyTableApi } from '@/lib/api/study-table.api';

export default function Sources() {
  const router = useRouter();
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchWorkspace();
  }, [workspaceId]);

  const fetchWorkspace = async () => {
    try {
      const res = await studyTableApi.getWorkspaceDetails(workspaceId);
      setWorkspace(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    try {
      await studyTableApi.uploadDocument(workspaceId, formData);
      await fetchWorkspace();
      setFile(null);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Unknown error';
      const status = err.response?.status || 'Network Error';
      alert(`Upload failed! [Status: ${status}] Details: ${errMsg}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <button onClick={() => router.push(`/ai-study-table/${workspaceId}`)} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft size={16} /> Back to {workspace?.title}
        </button>

        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sources & Documents</h1>
          <p className="text-slate-500 mt-1 max-w-2xl text-[15px]">Upload syllabus, lecture PDFs, or raw text. The AI Copilot uses only these files to generate answers and study guides.</p>
        </div>

        {/* Upload Box */}
        <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-8 md:p-12 text-center relative hover:bg-slate-50 transition-colors">
          <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} accept=".pdf,.txt" />
          <UploadCloud className="mx-auto text-indigo-500 w-16 h-16 mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            {file ? file.name : 'Click to Upload Document'}
          </h3>
          <p className="text-slate-500 font-medium mb-6">
            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Supports PDF and TXT files. Maximum 10MB per file.'}
          </p>
          
          <button 
            disabled={!file || uploading}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpload(); }}
            className={`relative z-20 px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 mx-auto ${file && !uploading ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
          >
            {uploading ? <><Loader2 className="animate-spin" size={20} /> Processing...</> : 'Upload & Parse to Knowledge Base'}
          </button>
        </div>

        {/* Uploaded List */}
        <div>
          <h4 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
            <FileText size={20} className="text-indigo-600" />
            Knowledge Base ({workspace?.documents?.length || 0})
          </h4>
          <div className="space-y-3">
            {workspace?.documents?.length > 0 ? (
              workspace.documents.map(doc => (
                <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
                      <File size={24} className="text-rose-500" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 break-all w-48 sm:w-80 md:w-96 truncate">{doc.title}</h5>
                      <p className="text-[13px] text-slate-500 font-medium mt-0.5 uppercase tracking-wide">
                        {doc.file_type} • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-[13px] font-bold">
                    <CheckCircle2 size={16} /> Parsed
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-slate-500 font-medium">No sources uploaded yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
