'use client';
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/lib/api/admin.api';
import { ShieldAlert, CheckCircle, XCircle, Clock, AlertTriangle, Flame } from 'lucide-react';
import { toast } from 'sonner';

const REASON_CONFIG = {
  hate_speech:    { label: 'Hate Speech',   color: 'bg-red-100 text-red-700 border-red-200',         urgent: true },
  self_harm:      { label: 'Self Harm',     color: 'bg-red-200 text-red-800 border-red-300',          urgent: true },
  harassment:     { label: 'Harassment',    color: 'bg-orange-100 text-orange-700 border-orange-200', urgent: true },
  bullying:       { label: 'Bullying',      color: 'bg-orange-50 text-orange-600 border-orange-200',  urgent: false },
  spam:           { label: 'Spam',          color: 'bg-amber-100 text-amber-700 border-amber-200',    urgent: false },
  inappropriate:  { label: 'Inappropriate', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', urgent: false },
  misinformation: { label: 'Misinfo',       color: 'bg-blue-100 text-blue-700 border-blue-200',       urgent: false },
  impersonation:  { label: 'Impersonation', color: 'bg-violet-100 text-violet-700 border-violet-200', urgent: false },
  other:          { label: 'Other',         color: 'bg-gray-100 text-gray-600 border-gray-200',       urgent: false },
};

function ReportCard({ report, onAction }) {
  const config = REASON_CONFIG[report.reason] || REASON_CONFIG.other;

  return (
    <div className={`rounded-2xl border p-5 space-y-4 bg-white shadow-sm transition-all ${
      config.urgent ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {config.urgent && <Flame size={16} className="text-red-500 animate-pulse shrink-0" />}
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${config.color} ${config.urgent ? 'animate-pulse' : ''}`}>
            {config.label}
          </span>
        </div>
        <span className="text-gray-400 text-xs flex items-center gap-1 shrink-0">
          <Clock size={11} />
          {new Date(report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Reporter</p>
          <p className="text-gray-800 text-sm font-semibold">@{report.reporter_name || 'unknown'}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Reported User</p>
          <p className={`text-sm font-semibold ${config.urgent ? 'text-red-700' : 'text-gray-800'}`}>@{report.reported_username || '—'}</p>
        </div>
      </div>

      {report.description && (
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Reporter's Note</p>
          <p className="text-gray-600 text-sm leading-relaxed italic">"{report.description}"</p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onAction(report.id, 'action_taken')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all"
        >
          <XCircle size={14} /> Take Action
        </button>
        <button
          onClick={() => onAction(report.id, 'dismissed')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all"
        >
          <CheckCircle size={14} /> Dismiss
        </button>
      </div>
    </div>
  );
}

export default function AdminModerationPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getReports({ page, limit: 12 });
      setReports(res.data || []);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const urgentReports = reports.filter(r => REASON_CONFIG[r.reason]?.urgent);
  const normalReports = reports.filter(r => !REASON_CONFIG[r.reason]?.urgent);

  const handleAction = async (reportId, action) => {
    const note = prompt('Enter resolution note for this action:');
    if (note === null) return;
    const status = action === 'dismissed' ? 'dismissed' : 'action_taken';
    try {
      await adminAPI.updateReport(reportId, status, note);
      toast.success(action === 'action_taken' ? 'Action recorded. User will be notified.' : 'Report dismissed.');
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch {
      toast.error('Failed to update report status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200">
          <AlertTriangle size={14} className="text-red-600" />
          <span className="text-red-700 text-sm font-bold">{urgentReports.length} Urgent</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200">
          <ShieldAlert size={14} className="text-gray-500" />
          <span className="text-gray-600 text-sm font-semibold">{normalReports.length} Standard Pending</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 h-52 animate-pulse shadow-sm" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <CheckCircle size={28} className="text-emerald-500" />
          </div>
          <p className="text-gray-600 text-base font-semibold">All Clear</p>
          <p className="text-gray-400 text-sm">No pending reports. Syllabrix is clean ✅</p>
        </div>
      ) : (
        <>
          {urgentReports.length > 0 && (
            <section>
              <h2 className="text-red-600 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-3">
                <Flame size={13} /> Urgent — Requires Immediate Action
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {urgentReports.map(r => <ReportCard key={r.id} report={r} onAction={handleAction} />)}
              </div>
            </section>
          )}
          {normalReports.length > 0 && (
            <section>
              <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Standard Reports</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {normalReports.map(r => <ReportCard key={r.id} report={r} onAction={handleAction} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
