'use client';
import { useState } from 'react';
import { adminAPI } from '@/lib/api/admin.api';
import { 
  BarChart, Users, DollarSign, ShieldCheck, 
  Download, Clock, Calendar, ChevronRight, 
  ArrowRight, FileSpreadsheet, Layout
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const REPORTS_CONFIG = [
  {
    id: 'growth',
    title: 'User Growth Audit',
    description: 'Detailed signup analytics, demographic breakdown, and conversion rates across student, teacher, and institute tiers.',
    icon: Users,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20'
  },
  {
    id: 'finance',
    title: 'Financial Reconciliation',
    description: 'Complete transaction history, revenue by payment type, and payment status audit for accounting and tax purposes.',
    icon: DollarSign,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20'
  },
  {
    id: 'moderation',
    title: 'Community Health Hub',
    description: 'Moderation performance report including resolution times, flagged content accuracy, and user strike logs.',
    icon: ShieldCheck,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20'
  },
  {
    id: 'health',
    title: 'Platform Vital Signs',
    description: 'High-level system overview including total engagement, active user retention, and infrastructure health markers.',
    icon: Layout,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20'
  }
];

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(null);
  const [days, setDays] = useState(30);

  const handleExtract = async (reportId) => {
    setLoading(reportId);
    try {
      const res = await adminAPI.extractReport(reportId, { days });
      const data = res.data;

      if (!data || (Array.isArray(data) && data.length === 0)) {
        toast.error('No data found for the selected period.');
        return;
      }

      // Convert to Array if single object (for 'health' report)
      const exportData = Array.isArray(data) ? data : [data];

      // Export to Excel
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Syllabrix_Report");
      
      const fileName = `syllabrix_${reportId}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success(`${reportId.charAt(0).toUpperCase() + reportId.slice(1)} report generated!`);
    } catch (err) {
      toast.error('Extraction failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-violet-500/[0.03] border border-violet-500/10">
        <div>
          <h2 className="text-white font-bold text-xl tracking-tight leading-none mb-2">Automated Intelligence Suite</h2>
          <p className="text-white/40 text-sm">Select a specialized report module to extract high-fidelity platform data.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/[0.04] p-1.5 rounded-2xl border border-white/[0.06]">
          <div className="flex items-center gap-2 px-3 py-1.5">
             <Calendar size={14} className="text-violet-400" />
             <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Date Range</span>
          </div>
          <select 
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-[#1a1a2e] text-white/80 text-xs font-bold px-4 py-2 rounded-xl outline-none border border-white/5 focus:border-violet-500/30 transition-all cursor-pointer"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
            <option value={365}>Full Year</option>
          </select>
        </div>
      </div>

      {/* Grid of Report Modules */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {REPORTS_CONFIG.map((report) => (
          <div 
            key={report.id}
            className={`group relative overflow-hidden rounded-3xl border ${report.border} ${report.bg} p-6 transition-all hover:scale-[1.01] hover:shadow-2xl hover:shadow-black/20`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${report.color} bg-white/[0.06] border border-white/[0.08]`}>
                <report.icon size={24} />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] text-[10px] font-black uppercase tracking-[0.1em] text-white/30 border border-white/5">
                <FileSpreadsheet size={10} />
                Excel (.xlsx)
              </div>
            </div>

            <h3 className="text-white font-bold text-lg mb-2">{report.title}</h3>
            <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-md">
              {report.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 text-white/20 text-[10px] font-bold uppercase">
                <Clock size={12} />
                Extraction ready
              </div>
              <button
                onClick={() => handleExtract(report.id)}
                disabled={loading !== null}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                  loading === report.id
                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                    : 'bg-white text-[#0A0A0F] hover:bg-violet-400 hover:text-white shadow-xl shadow-black/20'
                }`}
              >
                {loading === report.id ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    Run Intelligence
                    <Download size={14} />
                  </>
                )}
              </button>
            </div>
            
            {/* Background design element */}
            <div className={`absolute -bottom-8 -right-8 w-32 h-32 blur-3xl opacity-10 transition-all group-hover:opacity-20 ${report.color.replace('text-', 'bg-')}`} />
          </div>
        ))}
      </div>

      {/* Audit Transparency Reminder */}
      <div className="flex items-center justify-center gap-4 py-8 opacity-20 hover:opacity-100 transition-opacity">
         <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20" />
         <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
            <ShieldCheck size={12} />
            Forensic Logging Active for all Extractions
         </div>
         <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20" />
      </div>

    </div>
  );
}

function RefreshCw(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
