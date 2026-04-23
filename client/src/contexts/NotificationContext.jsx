'use client';
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { notificationsAPI } from '@/lib/api/notifications.api';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket-client';

const NotificationContext = createContext(null);

const TYPE_ICONS = {
  like:        '❤️',
  comment:     '💬',
  follow:      '👤',
  message:     '✉️',
  job_alert:   '💼',
  mentorship:  '🎓',
  achievement: '🏆',
  live_class:  '📡',
  system:      '🔔',
  group_invite:'👥',
  mention:     '@',
};

export function NotificationProvider({ children, token }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);
  const mountedRef = useRef(true);

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

  // Initial load
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
      // Show toast
      const icon = TYPE_ICONS[notif.type] || '🔔';
      toast(notif.message, {
        icon,
        duration: 4000,
        style: { fontSize: '13px', maxWidth: '340px' },
      });
    });

    return () => {
      sock.off('notification:new');
    };
  }, [token]);

  // Cleanup socket on unmount
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
