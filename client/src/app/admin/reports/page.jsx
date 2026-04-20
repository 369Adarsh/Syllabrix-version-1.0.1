'use client';
import { useState } from 'react';
import { adminAPI } from '@/lib/api/admin.api';
import {
  Users, DollarSign, ShieldCheck,
  Download, Clock, Calendar,
  FileSpreadsheet, Layout, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const REPORTS_CONFIG = [
  {
    id: 'growth',
    title: 'User Growth Audit',
    description: 'Detailed signup analytics, demographic breakdown, and conversion rates across student, teacher, and institute tiers.',
    icon: Users,
    iconBg: 'bg-blue-100 text-blue-700',
    border: 'border-blue-200',
    accent: 'bg-blue-50',
  },
  {
    id: 'finance',
    title: 'Financial Reconciliation',
    description: 'Complete transaction history, revenue by payment type, and payment status audit for accounting and tax purposes.',
    icon: DollarSign,
    iconBg: 'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-200',
    accent: 'bg-emerald-50',
  },
  {
    id: 'moderation',
    title: 'Community Health Hub',
    description: 'Moderation performance report including resolution times, flagged content accuracy, and user strike logs.',
    icon: ShieldCheck,
    iconBg: 'bg-red-100 text-red-700',
    border: 'border-red-200',
    accent: 'bg-red-50',
  },
  {
    id: 'health',
    title: 'Platform Vital Signs',
    description: 'High-level system overview including total engagement, active user retention, and infrastructure health markers.',
    icon: Layout,
    iconBg: 'bg-violet-100 text-violet-700',
    border: 'border-violet-200',
    accent: 'bg-violet-50',
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

      const exportData = Array.isArray(data) ? data : [data];
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Syllabrix_Report');
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
    <div className="space-y-8">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-indigo-100 shadow-sm">
        <div>
          <h2 className="text-gray-900 font-bold text-xl tracking-tight leading-none mb-2">Automated Intelligence Suite</h2>
          <p className="text-gray-400 text-sm">Select a specialized report module to extract high-fidelity platform data.</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
          <div className="flex items-center gap-2 px-3 py-1.5">
            <Calendar size={14} className="text-indigo-500" />
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Date Range</span>
          </div>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-white text-gray-700 text-xs font-bold px-4 py-2 rounded-xl outline-none border border-gray-200 focus:border-indigo-400 transition-all cursor-pointer"
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
            className={`group relative overflow-hidden rounded-3xl border ${report.border} bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${report.iconBg}`}>
                <report.icon size={24} />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 border border-gray-200">
                <FileSpreadsheet size={10} />
                Excel (.xlsx)
              </div>
            </div>

            <h3 className="text-gray-900 font-bold text-lg mb-2">{report.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-md">{report.description}</p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-gray-300 text-[10px] font-bold uppercase">
                <Clock size={12} />
                Extraction ready
              </div>
              <button
                onClick={() => handleExtract(report.id)}
                disabled={loading !== null}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border ${
                  loading === report.id
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600 shadow-md shadow-indigo-200'
                }`}
              >
                {loading === report.id ? (
                  <><RefreshCw size={14} className="animate-spin" /> Extracting...</>
                ) : (
                  <>Run Intelligence <Download size={14} /></>
                )}
              </button>
            </div>

            {/* bg accent blob */}
            <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-30 transition-opacity group-hover:opacity-60 ${report.accent}`} />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 py-6 opacity-40 hover:opacity-100 transition-opacity">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200" />
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
          <ShieldCheck size={12} />
          Forensic Logging Active for all Extractions
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200" />
      </div>
    </div>
  );
}
