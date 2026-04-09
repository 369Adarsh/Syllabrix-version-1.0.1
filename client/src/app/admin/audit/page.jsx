'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api/admin.api';
import { Shield, Clock, Target, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const ACTION_STYLES = {
  user_ban:          'bg-red-500/15 text-red-400 border-red-500/25',
  user_unban:        'bg-green-500/15 text-green-400 border-green-500/25',
  report_dismissed:  'bg-blue-500/15 text-blue-400 border-blue-500/25',
  report_actioned:   'bg-orange-500/15 text-orange-400 border-orange-500/25',
  database_edit:      'bg-violet-500/15 text-violet-400 border-violet-500/25',
};

function timeAgo(dateString) {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs/24)}d ago`;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAuditLogs()
      .then(r => setLogs(r.data || []))
      .catch(() => toast.error('Failed to load audit trail'))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-violet-500/[0.06] border border-violet-500/20">
        <Shield size={18} className="text-violet-400" />
        <div>
          <p className="text-violet-300 text-sm font-semibold">All administrative actions are permanently recorded.</p>
          <p className="text-violet-400/60 text-xs">This log cannot be deleted or modified. It is your platform's accountability record.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Admin', 'Action', 'Target', 'Reason', 'IP Address', 'Time'].map(h => (
                <th key={h} className="text-left text-white/30 text-xs font-semibold uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-3"><div className="h-4 bg-white/[0.05] rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
               <tr><td colSpan={6} className="px-5 py-10 text-center text-white/20">No audit logs found.</td></tr>
            ) : logs.map(log => (
              <tr key={log.id} className="hover:bg-white/[0.025] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/50 to-purple-600/50 flex items-center justify-center text-white text-xs font-bold">
                      {log.admin_name?.[0] || 'A'}
                    </div>
                    <span className="text-white/75 font-medium text-xs">{log.admin_name || 'System'}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${ACTION_STYLES[log.action_type] || 'bg-white/10 text-white/40 border-white/10'}`}>
                    {log.action_type?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5 text-white/50 text-xs">
                    <Target size={12} className="text-white/25" />
                    {log.target_type} #{log.target_id}
                  </div>
                </td>
                <td className="px-5 py-3 text-white/40 text-xs max-w-[180px] truncate">
                  {log.new_value ? (JSON.parse(log.new_value).reason || log.new_value) : 'No detail'}
                </td>
                <td className="px-5 py-3 text-white/25 text-xs font-mono">{log.ip_address || '—'}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5 text-white/30 text-xs">
                    <Clock size={11} />
                    {timeAgo(log.created_at)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
