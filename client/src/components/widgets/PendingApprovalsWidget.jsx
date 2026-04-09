'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, ClipboardList, Loader2 } from 'lucide-react';
import { parentAPI } from '@/lib/api/parent.api';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function PendingApprovalsWidget() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const load = () => {
    parentAPI.getPendingApprovals()
      .then(r => setApprovals(r.data?.data || r.data || []))
      .catch(() => setApprovals([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handle = async (id, action) => {
    setActing(id + action);
    try {
      if (action === 'approve') await parentAPI.approveRequest(id);
      else await parentAPI.denyRequest(id);
      toast.success(action === 'approve' ? 'Approved!' : 'Denied');
      setApprovals(prev => prev.filter(a => a.id !== id));
    } catch { toast.error('Action failed'); }
    finally { setActing(null); }
  };

  const top = approvals[0];
  const extra = approvals.length - 1;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pending Approvals</p>
        {approvals.length > 0 && (
          <span className="min-w-[18px] h-[18px] rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
            {approvals.length}
          </span>
        )}
      </div>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-gray-100 rounded w-4/5" />
          <div className="h-3 bg-gray-100 rounded w-3/5" />
        </div>
      ) : !top ? (
        <div className="flex items-center gap-2 py-1">
          <ClipboardList size={15} className="text-gray-300" />
          <p className="text-[12px] text-gray-400">No pending approvals</p>
        </div>
      ) : (
        <div>
          <p className="text-[12px] text-gray-700 leading-snug mb-2">
            <span className="font-semibold">{top.child_name || 'Your child'}</span>{' '}
            {top.description || `wants to ${top.request_type || 'perform an action'}`}
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => handle(top.id, 'approve')}
              disabled={!!acting}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              {acting === top.id + 'approve' ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle size={11} />}
              Approve
            </button>
            <button
              onClick={() => handle(top.id, 'deny')}
              disabled={!!acting}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {acting === top.id + 'deny' ? <Loader2 size={10} className="animate-spin" /> : <XCircle size={11} />}
              Deny
            </button>
          </div>
          {extra > 0 && (
            <Link href="/parent-dashboard/approvals" className="block mt-2 text-[11px] text-blue-500 font-medium">
              +{extra} more approval{extra > 1 ? 's' : ''} →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
