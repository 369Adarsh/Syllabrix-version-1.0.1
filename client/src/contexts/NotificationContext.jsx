'use client';
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { notificationsAPI } from '@/lib/api/notifications.api';
import { connectSocket, disconnectSocket } from '@/lib/socket-client';
import { getNotificationUrl } from '@/lib/notification-utils';

const NotificationContext = createContext(null);

const TYPE_META = {
  like:         { icon: '❤️', color: 'bg-red-100'    },
  comment:      { icon: '💬', color: 'bg-blue-100'   },
  follow:       { icon: '👤', color: 'bg-indigo-100' },
  message:      { icon: '✉️', color: 'bg-sky-100'    },
  job_alert:    { icon: '💼', color: 'bg-amber-100'  },
  mentorship:   { icon: '🎓', color: 'bg-emerald-100'},
  achievement:  { icon: '🏆', color: 'bg-yellow-100' },
  live_class:   { icon: '📡', color: 'bg-purple-100' },
  system:       { icon: '🔔', color: 'bg-gray-100'   },
  group_invite: { icon: '👥', color: 'bg-teal-100'   },
  mention:      { icon: '@',  color: 'bg-pink-100'   },
};

export { TYPE_META };

export function NotificationProvider({ children, token }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);
  const mountedRef = useRef(true);
  const router = useRouter();

  const fetchAll = useCallback(async () => {
    try {
      const r = await notificationsAPI.getAll({ limit: 50 });
      const list = r.data?.data || [];
      if (!mountedRef.current) return;
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.is_read).length);
    } catch {}
    finally { if (mountedRef.current) setLoading(false); }
  }, []);

  const markRead = useCallback(async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(p => p.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(p => Math.max(0, p - 1));
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(p => p.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch {}
  }, []);

  const dismiss = useCallback(async (id) => {
    const notif = notifications.find(n => n.id === id);
    try {
      await notificationsAPI.dismiss(id);
      setNotifications(p => p.filter(n => n.id !== id));
      if (notif && !notif.is_read) setUnreadCount(p => Math.max(0, p - 1));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    mountedRef.current = true;
    fetchAll();
    return () => { mountedRef.current = false; };
  }, [fetchAll]);

  // Socket real-time listener
  useEffect(() => {
    if (!token) return;
    const sock = connectSocket(token);

    sock.on('notification:new', (notif) => {
      if (!mountedRef.current) return;
      setNotifications(p => [notif, ...p]);
      setUnreadCount(p => p + 1);

      const meta = TYPE_META[notif.type] || TYPE_META.system;
      const url  = getNotificationUrl(notif);
      const actorName = notif.actor_full_name || notif.actor_username || null;
      const avatar = notif.actor_photo
        || (actorName ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(actorName)}` : null);

      toast.custom((t) => (
        <div
          onClick={() => {
            toast.dismiss(t.id);
            markRead(notif.id);
            if (url) router.push(url);
          }}
          className={`flex items-center gap-3 bg-white border border-gray-200 rounded-2xl shadow-lg px-4 py-3 cursor-pointer hover:bg-gray-50 transition-all max-w-sm w-full ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
          style={{ transition: 'opacity 0.2s, transform 0.2s' }}
        >
          <div className="relative flex-shrink-0">
            {avatar ? (
              <img src={avatar} alt="" className="w-11 h-11 rounded-full object-cover border border-gray-100" />
            ) : (
              <div className={`w-11 h-11 rounded-full ${meta.color} flex items-center justify-center text-xl`}>
                {meta.icon}
              </div>
            )}
            {avatar && (
              <span className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full ${meta.color} flex items-center justify-center text-[10px] ring-2 ring-white`}>
                {meta.icon}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-gray-800 leading-snug line-clamp-2">{notif.message}</p>
            <p className="text-[11px] text-blue-500 mt-0.5 font-medium">{url ? 'Tap to view →' : 'Just now'}</p>
          </div>
        </div>
      ), { duration: 5000, position: 'top-right' });
    });

    return () => { sock.off('notification:new'); };
  }, [token, router, markRead]);

  useEffect(() => {
    return () => { if (!token) disconnectSocket(); };
  }, [token]);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading,
      markRead, markAllRead, dismiss, refresh: fetchAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
