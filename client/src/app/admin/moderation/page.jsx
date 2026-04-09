'use client';
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/lib/api/admin.api';
import { ShieldAlert, CheckCircle, XCircle, Eye, Clock, AlertTriangle, Flame } from 'lucide-react';
import { toast } from 'sonner';

const REASON_CONFIG = {
  hate_speech:     { label: 'Hate Speech',     color: 'bg-red-500/20 text-red-400 border-red-500/30',       urgent: true },
  self_harm:       { label: 'Self Harm',        color: 'bg-red-600/30 text-red-300 border-red-600/40',       urgent: true },
  harassment:      { label: 'Harassment',       color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', urgent: true },
  bullying:        { label: 'Bullying',          color: 'bg-orange-400/20 text-orange-300 border-orange-400/30', urgent: false },
  spam:            { label: 'Spam',              color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', urgent: false },
  inappropriate:   { label: 'Inappropriate',    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',    urgent: false },
  misinformation:  { label: 'Misinfo',          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',      urgent: false },
  impersonation:   { label: 'Impersonation',    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', urgent: false },
  other:           { label: 'Other',             color: 'bg-white/10 text-white/40 border-white/10',           urgent: false },
};

function ReportCard({ report, onAction }) {
  const config = REASON_CONFIG[report.reason] || REASON_CONFIG.other;

  return (
    <div className={`rounded-2xl border p-5 space-y-4 transition-all ${
      config.urgent
        ? 'border-red-500/30 bg-red-500/[0.04]'
        : 'border-white/[0.07] bg-white/[0.02]'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {config.urgent && <Flame size={16} className="text-red-400 animate-pulse shrink-0" />}
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${config.color} ${config.urgent ? 'animate-pulse' : ''}`}>
            {config.label}
          </span>
        </div>
        <span className="text-white/25 text-xs flex items-center gap-1 shrink-0">
          <Clock size={11} />
          {new Date(report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Report Details */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
          <p className="text-white/35 text-[10px] font-semibold uppercase tracking-wider mb-1">Reporter</p>
          <p className="text-white/75 text-sm font-semibold">@{report.reporter_name || 'unknown'}</p>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
          <p className="text-white/35 text-[10px] font-semibold uppercase tracking-wider mb-1">Reported User</p>
          <p className={`text-sm font-semibold ${config.urgent ? 'text-red-300' : 'text-white/75'}`}>@{report.reported_username || '—'}</p>
        </div>
      </div>

      {report.description && (
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
          <p className="text-white/35 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Reporter's Note</p>
          <p className="text-white/60 text-sm leading-relaxed italic">"{report.description}"</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onAction(report.id, 'action_taken')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/25 rounded-xl text-xs font-bold transition-all"
        >
          <XCircle size={14} />
          Take Action
        </button>
        <button
          onClick={() => onAction(report.id, 'dismissed')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/25 rounded-xl text-xs font-bold transition-all"
        >
          <CheckCircle size={14} />
          Dismiss
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
    const status = action === 'dismissed' ? 'dismissed' : 'action_taken';
    const note = prompt(`Enter resolution note for this action:`);
    if (note === null) return;

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
      {/* Summary badges */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={14} className="text-red-400" />
          <span className="text-red-300 text-sm font-bold">{urgentReports.length} Urgent</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          <ShieldAlert size={14} className="text-white/40" />
          <span className="text-white/60 text-sm font-semibold">{normalReports.length} Standard Pending</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 h-52 animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <CheckCircle size={28} className="text-green-400" />
          </div>
          <p className="text-white/50 text-base font-semibold">All Clear</p>
          <p className="text-white/25 text-sm">No pending reports. Syllabrix is clean ✅</p>
        </div>
      ) : (
        <>
          {urgentReports.length > 0 && (
            <section>
              <h2 className="text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-3">
                <Flame size={13} /> Urgent — Requires Immediate Action
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {urgentReports.map(r => <ReportCard key={r.id} report={r} onAction={handleAction} />)}
              </div>
            </section>
          )}
          {normalReports.length > 0 && (
            <section>
              <h2 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Standard Reports</h2>
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
