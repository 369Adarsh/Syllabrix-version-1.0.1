'use client';
import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, RefreshCw } from 'lucide-react';
import { parentAPI } from '@/lib/api/parent.api';

export default function SafetyStatusWidget({ children = [] }) {
  const [approvals, setApprovals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  const fetch = () => {
    setLoading(true);
    parentAPI.getPendingApprovals()
      .then(r => { setApprovals(r.data?.data || r.data || []); setLastChecked(new Date()); })
      .catch(() => setApprovals([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const pendingCount = Array.isArray(approvals) ? approvals.length : 0;
  const status = pendingCount === 0 ? 'clear' : pendingCount <= 2 ? 'pending' : 'alert';

  const config = {
    clear:   { bg: 'bg-emerald-50 border-emerald-200', icon: ShieldCheck, iconColor: 'text-emerald-600', label: 'ALL CLEAR', labelColor: 'text-emerald-700', sub: 'No flags · all children safe' },
    pending: { bg: 'bg-amber-50 border-amber-200',    icon: ShieldAlert,  iconColor: 'text-amber-500',   label: 'REVIEW NEEDED', labelColor: 'text-amber-700', sub: `${pendingCount} approval${pendingCount > 1 ? 's' : ''} pending` },
    alert:   { bg: 'bg-red-50 border-red-200',        icon: ShieldX,      iconColor: 'text-red-500',     label: 'ACTION NEEDED', labelColor: 'text-red-700', sub: `${pendingCount} items need attention` },
  }[status];

  const Icon = config.icon;
  const ago = lastChecked ? `${Math.round((Date.now() - lastChecked) / 60000) || '<1'}m ago` : '';

  return (
    <div className={`rounded-xl border p-4 ${config.bg}`} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Safety Status</p>
        <button onClick={fetch} className="text-gray-400 hover:text-gray-600 transition-colors">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      {loading ? (
        <div className="space-y-1.5 animate-pulse">
          <div className="h-5 w-24 bg-white/70 rounded" />
          <div className="h-3 w-32 bg-white/70 rounded" />
        </div>
      ) : (
        <div className="flex items-center gap-2.5">
          <Icon size={22} className={config.iconColor} />
          <div>
            <p className={`text-[14px] font-extrabold leading-tight ${config.labelColor}`}>{config.label}</p>
            <p className="text-[11px] text-gray-500">{config.sub}{ago ? ` · ${ago}` : ''}</p>
          </div>
        </div>
      )}
    </div>
  );
}
