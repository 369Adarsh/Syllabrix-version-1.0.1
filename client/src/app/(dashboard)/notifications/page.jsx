'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsAPI } from '@/lib/api/notifications.api';
import Avatar from '@/components/ui/Avatar';
import { Bell, Loader2, CheckCheck } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { notificationsAPI.getAll({ limit: 50 }).then(r => setNotifs(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  const markAllRead = async () => {
    try { await notificationsAPI.markAllRead(); setNotifs(p => p.map(n => ({ ...n, is_read: 1 }))); toast.success('All marked as read'); } catch {}
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm"><Bell size={20} className="text-white" /></div>
          <div><h1 className="font-bold text-lg text-gray-800">Notifications</h1><p className="text-[11px] text-gray-400">{notifs.filter(n => !n.is_read).length} unread</p></div>
        </div>
        {notifs.some(n => !n.is_read) && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"><CheckCheck size={14} /> Mark all read</button>
        )}
      </div>

      {loading ? <div className="text-center py-16"><Loader2 size={28} className="animate-spin text-rose-500 mx-auto" /></div>
      : notifs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4"><Bell size={28} className="text-rose-400" /></div>
          <h2 className="font-bold text-gray-700 mb-2">All Caught Up!</h2>
          <p className="text-sm text-gray-400">No new notifications.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] overflow-hidden divide-y divide-gray-50">
          {notifs.map(n => (
            <div key={n.id} className={`flex items-start gap-3 p-4 transition-colors ${!n.is_read ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}>
              <Avatar src={n.actor_photo} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 leading-relaxed">{n.message}</p>
                <p className="text-[11px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
              </div>
              {!n.is_read && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
