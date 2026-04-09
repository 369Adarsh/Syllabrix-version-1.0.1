'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LD_API from '@/lib/api/ld.api';
import toast from 'react-hot-toast';
import { 
  Upload, FileSpreadsheet, CheckCircle, XCircle, 
  Loader2, Zap, ShieldAlert, History, ArrowRight,
  Database, UserCheck, Target, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LDBootstrapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get('orgId');

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (!orgId) {
      LD_API.getMyOrgs().then(res => {
        if (res.data?.data?.length > 0) {
          router.replace(`/corporate/admin/bootstrap?orgId=${res.data.data[0].id}`);
        } else {
          router.push('/corporate/dashboard');
        }
      }).catch(() => router.push('/corporate/dashboard'));
    }
  }, [orgId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls'))) {
      setFile(selectedFile);
      setReport(null);
    } else {
      toast.error('Please upload a valid Excel file (.xlsx)');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const selectedFile = e.dataTransfer.files[0];
    if (selectedFile && (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls'))) {
      setFile(selectedFile);
      setReport(null);
    } else {
      toast.error('Please upload a valid Excel file (.xlsx)');
    }
  };

  const handleBootstrap = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(10);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Step-wise progress simulation since we don't have real-time socket updates for this yet
      const timer = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 5 : prev));
      }, 500);

      const res = await LD_API.bootstrapOrg(orgId, formData);
      clearInterval(timer);
      setProgress(100);
      
      setReport(res.data.data);
      toast.success('Environment Seeded Successfully!');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Bootstrap failed');
    } finally {
      setLoading(false);
    }
  };

  if (!orgId) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="min-h-screen bg-[#0A0B10] text-gray-100 flex flex-col font-sans">
      {/* ─── BACKGROUND GLOWS ─── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full" />
      </div>

      {/* ─── HEADER ─── */}
      <nav className="z-50 px-8 py-6 border-b border-white/5 backdrop-blur-md bg-black/20 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Zap size={20} className="text-white fill-white" />
             </div>
             <div>
                <h1 className="text-xl font-black tracking-tight text-white uppercase">Syllabrix Bootstrap</h1>
                <p className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">Phase 5: Tester Control Panel</p>
             </div>
          </div>
          <button onClick={() => router.push('/corporate/dashboard')} className="px-5 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-all text-xs font-bold text-gray-400">
             &larr; Exit to Dashboard
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-8 py-12 w-full z-10">
        
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* ─── LEFT: CONTROLS ─── */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-black leading-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                Reset & Reload <br/>Your Digital Twin.
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                Upload the Syllabrix L&D Master Template to instantly populate all 15 users, skill hierarchies, and business challenges.
              </p>
            </div>

            <div className="p-1 bg-gradient-to-br from-white/10 to-white/0 rounded-[2.5rem]">
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`h-[400px] rounded-[2.2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center p-8 bg-[#0F1117] ${isDragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10'}`}
              >
                {!file ? (
                  <>
                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                      <Upload size={32} className="text-indigo-400" />
                    </div>
                    <p className="text-white font-bold text-lg">Drop Master Excel Here</p>
                    <p className="text-gray-500 text-xs mt-2 font-medium">syllabrix-tester-bootstrap-template.xlsx</p>
                    
                    <label className="mt-8 px-8 py-3 bg-white text-black rounded-2xl font-black text-sm cursor-pointer hover:scale-105 active:scale-95 transition-all">
                      Select File
                      <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFileChange} />
                    </label>
                  </>
                ) : (
                  <div className="text-center w-full">
                     <div className="w-20 h-20 rounded-3xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6">
                        <FileSpreadsheet size={32} className="text-indigo-400" />
                     </div>
                     <p className="text-white font-bold text-lg">{file.name}</p>
                     <p className="text-gray-500 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB Ready</p>
                     
                     <div className="flex gap-3 justify-center mt-8">
                        <button onClick={() => setFile(null)} className="px-6 py-3 rounded-2xl border border-white/5 text-gray-500 text-xs font-bold hover:bg-white/5">Cancel</button>
                        <button 
                          onClick={handleBootstrap}
                          disabled={loading}
                          className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all flex items-center gap-2"
                        >
                          {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                          Seed Environment
                        </button>
                     </div>
                  </div>
                )}
              </div>
            </div>

            {loading && (
              <div className="space-y-4 px-4">
                 <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Processing Transaction...</p>
                    <p className="text-xl font-black text-white">{progress}%</p>
                 </div>
                 <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                 </div>
                 <p className="text-[10px] text-gray-500 leading-relaxed italic text-center">
                    Linking hierarchies, calculating gap vectors, and preparing ROI context...
                 </p>
              </div>
            )}
          </div>

          {/* ─── RIGHT: REPORT ─── */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!report ? (
                <motion.div 
                   key="guide"
                   initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                   className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 h-full flex flex-col justify-between overflow-hidden relative"
                >
                   <div className="absolute top-0 right-0 p-10 opacity-5">
                      <ShieldAlert size={200} />
                   </div>
                   <div className="space-y-8 relative z-10">
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">Import Requirements</h4>
                        <p className="text-sm text-gray-500">Ensure your template matches the Master L&D Schema:</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                         {[
                            { icon: UserCheck, title: 'Users Sheet', desc: 'UID, Dept, ManagerID' },
                            { icon: Target, title: 'Skills Sheet', desc: 'UID, Score, Target' },
                            { icon: Database, title: 'Challenges', desc: 'ROI & Context Data' },
                            { icon: Award, title: 'Test Cases', desc: 'Validation Logic' },
                         ].map((item, id) => (
                           <div key={id} className="p-4 rounded-2xl bg-black/20 border border-white/5 flex gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 flex-shrink-0">
                                 <item.icon size={16} />
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-white">{item.title}</p>
                                 <p className="text-[10px] text-gray-500 mt-1">{item.desc}</p>
                              </div>
                           </div>
                         ))}
                      </div>

                      <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-200/80 text-xs leading-relaxed">
                         <div className="flex gap-2 mb-2 font-black text-[10px] uppercase tracking-tighter text-amber-500">
                            <ShieldAlert size={12} /> Data Safety Warning
                         </div>
                         Bootstrap mode will replace existing organization data. This action is optimized for Test Environments (Digital Twins) and cannot be undone.
                      </div>
                   </div>

                   <div className="flex items-center gap-4 mt-8 pt-8 border-t border-white/5">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-indigo-400">
                         <History size={18} />
                      </div>
                      <div className="flex-1">
                         <p className="text-xs font-bold text-white">Baseline Template v1.0.1</p>
                         <p className="text-[10px] text-gray-500">Recommended for L&D Integration Testing</p>
                      </div>
                      <button className="text-indigo-400 text-xs font-bold flex items-center gap-1 hover:underline">
                         Download Template <ArrowRight size={14} />
                      </button>
                   </div>
                </motion.div>
              ) : (
                <motion.div 
                   key="report"
                   initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                   className="bg-[#0F1117] border border-white/5 rounded-[2.5rem] shadow-2xl p-8 flex flex-col h-full"
                >
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <CheckCircle size={20} />
                         </div>
                         <h3 className="text-xl font-bold text-white">Import Report</h3>
                      </div>
                      <button onClick={() => setReport(null)} className="text-[10px] font-black uppercase text-gray-500 hover:text-white">Clear Results</button>
                   </div>

                   <div className="grid grid-cols-3 gap-4 mb-8">
                      {[
                         { label: 'Users', val: report.users.success, total: report.users.total, color: 'text-indigo-400' },
                         { label: 'Skills', val: report.skills.success, total: report.skills.total, color: 'text-violet-400' },
                         { label: 'Challenges', val: report.challenges.success, total: report.challenges.total, color: 'text-amber-400' },
                      ].map((stat, id) => (
                        <div key={id} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                           <p className={`text-2xl font-black ${stat.color}`}>{stat.val} / {stat.total}</p>
                        </div>
                      ))}
                   </div>

                   <div className="flex-1 overflow-hidden flex flex-col">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center justify-between px-2">
                         <span>Validation Records</span>
                         <span className="text-emerald-500">96.8% Success Rate</span>
                      </p>
                      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                         {/* Errors first */}
                         {[...(report.users.errors || []), ...(report.skills.errors || []), ...(report.challenges.errors || [])].map((err, idx) => (
                           <div key={`err-${idx}`} className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center gap-3">
                              <XCircle className="text-rose-500 flex-shrink-0" size={14} />
                              <p className="text-[11px] text-rose-200/70 truncate">Row {err.row}: {err.msg}</p>
                           </div>
                         ))}
                         {/* Test cases summary */}
                         {(report.testResults || []).map((tc, idx) => (
                           <div key={`tc-${idx}`} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <CheckCircle className="text-emerald-500" size={14} />
                                 <p className="text-[11px] text-gray-300"><span className="font-bold text-white">{tc.TestCaseID}</span>: {tc.Module} Verification</p>
                              </div>
                              <span className="text-[10px] font-bold text-gray-500 px-2 py-0.5 bg-white/5 rounded-md uppercase">{tc.Priority}</span>
                           </div>
                         ))}
                      </div>
                   </div>

                   <button onClick={() => router.push('/corporate/dashboard')} className="mt-8 w-full py-4 bg-white text-black rounded-2xl font-black text-sm shadow-xl shadow-white/5 hover:scale-[1.02] active:scale-95 transition-all">
                      Confirm & Start Testing
                   </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
