'use client';
import { useState } from 'react';
import { adminAPI } from '@/lib/api/admin.api';
import { 
  Terminal, Play, Download, AlertOctagon, 
  Database, Clock, CheckCircle2, XCircle,
  Maximize2, Minimize2, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function AdminConsolePage() {
  const [sql, setSql] = useState('-- Select all users to get started\nSELECT * FROM users LIMIT 10;');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const runQuery = async () => {
    if (!sql.trim()) return toast.error('Please enter a query');
    
    setLoading(true);
    try {
      const res = await adminAPI.runQuery(sql);
      setResults(res.data);
      toast.success('Query executed successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      toast.error('Query Failed: ' + errorMsg);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!results || !results.result || results.result.length === 0) {
      return toast.error('No data to export');
    }

    try {
      const ws = XLSX.utils.json_to_sheet(results.result);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Query_Results");
      
      const fileName = `syllabrix_export_${new Date().getTime()}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success('Excel file generated successfully');
    } catch (err) {
      toast.error('Export failed: ' + err.message);
    }
  };

  const clearConsole = () => {
    setSql('');
    setResults(null);
  };

  return (
    <div className="flex flex-col gap-5 md:h-[calc(100vh-120px)] animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Dangerous Access Banner */}
      <div className="group relative overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-4 flex items-center gap-4 transition-all hover:bg-red-500/[0.05]">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0 border border-red-500/20">
          <AlertOctagon size={20} className="animate-pulse" />
        </div>
        <div className="flex-1">
          <p className="text-red-400 text-xs font-black uppercase tracking-widest leading-none mb-1">Raw Intelligence Access — Super Admin Restricted</p>
          <p className="text-red-500/60 text-[11px] font-medium leading-relaxed">
            Every character typed here is permanently logged in the system audits. Use selective queries to maintain platform performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <span className="px-2 py-1 rounded bg-red-500/20 text-red-100 text-[10px] font-bold border border-red-500/40">FORENSICS ENABLED</span>
        </div>
      </div>

      <div className={`grid grid-cols-1 transition-all duration-500 gap-5 ${isExpanded ? 'h-full' : 'h-[600px]'}`}>
        
        {/* SQL Input Area */}
        <div className="flex flex-col rounded-2xl border border-white/[0.07] bg-[#0D0D14] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-violet-400" />
              <span className="text-white/60 text-[11px] font-bold uppercase tracking-widest">Query Console</span>
            </div>
            <div className="flex items-center gap-2">
               <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
                title={isExpanded ? "Collapse View" : "Expand View"}
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
               <button 
                onClick={clearConsole}
                className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Clear Console"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div className="flex-1 relative">
            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              className="w-full h-full bg-transparent p-5 text-violet-100/80 font-mono text-sm leading-relaxed focus:outline-none resize-none selection:bg-violet-500/30 selection:text-white"
              spellCheck="false"
              placeholder="Enter your MySQL query here..."
            />
            
            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              <button
                onClick={runQuery}
                disabled={loading}
                className="group flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50"
              >
                {loading ? <Clock size={14} className="animate-spin" /> : <Play size={14} className="group-hover:translate-x-0.5 transition-transform" />}
                {loading ? 'Synthesizing...' : 'Execute Query'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden min-h-[300px]">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Database size={14} className="text-white/40" />
              <span className="text-white/30 text-[11px] font-bold uppercase tracking-widest">Output Dataset</span>
            </div>
            
            {results && (
              <div className="flex items-center gap-4">
                <span className="text-white/20 text-[10px] font-bold uppercase">{results.result?.length || 0} Records Found</span>
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Download size={12} />
                  Download Excel
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            {!results ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 py-12">
                 <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center text-white/5 opacity-40">
                    <Database size={28} />
                 </div>
                 <p className="text-white/20 text-xs font-bold uppercase tracking-widest animate-pulse">Awaiting Query Execution</p>
              </div>
            ) : results.result?.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center gap-3 py-12">
                  <CheckCircle2 size={24} className="text-green-500/50" />
                  <p className="text-white/40 text-xs font-semibold">Query executed successfully, but returned no rows.</p>
               </div>
            ) : (
              <table className="w-full text-[11px] border-collapse">
                 <thead className="sticky top-0 bg-[#0A0A0F] z-10 shadow-md">
                    <tr className="border-b border-white/10 uppercase tracking-widest text-white/40">
                       {results.fields?.map(f => (
                         <th key={f} className="px-5 py-3 text-left font-black border-r border-white/5 whitespace-nowrap">{f}</th>
                       ))}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/[0.04]">
                    {results.result.map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.025] transition-colors">
                        {results.fields.map(f => (
                          <td key={f} className="px-5 py-2.5 text-white/60 font-medium border-r border-white/5 whitespace-nowrap">
                             {row[f] === null ? <em className="text-white/10 opacity-50">null</em> : String(row[f])}
                          </td>
                        ))}
                      </tr>
                    ))}
                 </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Persistence Note */}
      <div className="flex items-center justify-center gap-2 text-white/10 text-[9px] font-bold uppercase tracking-[0.2em] py-2">
         <XCircle size={10} /> Persistent System Integrity Protected By High-Level Encryption
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(124, 58, 237, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(124, 58, 237, 0.3); }
      `}</style>

    </div>
  );
}
