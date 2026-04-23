'use client';
import { motion } from 'motion/react';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/Animate';
import { useNotifications } from '@/contexts/NotificationContext';
import Avatar from '@/components/ui/Avatar';
import { Bell, Loader2, CheckCheck, Trash2 } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

const TYPE_META = {
  like:         { icon: '❤️', color: 'bg-red-100 text-red-600' },
  comment:      { icon: '💬', color: 'bg-blue-100 text-blue-600' },
  follow:       { icon: '👤', color: 'bg-indigo-100 text-indigo-600' },
  message:      { icon: '✉️', color: 'bg-sky-100 text-sky-600' },
  job_alert:    { icon: '💼', color: 'bg-amber-100 text-amber-600' },
  mentorship:   { icon: '🎓', color: 'bg-emerald-100 text-emerald-600' },
  achievement:  { icon: '🏆', color: 'bg-yellow-100 text-yellow-600' },
  live_class:   { icon: '📡', color: 'bg-purple-100 text-purple-600' },
  system:       { icon: '🔔', color: 'bg-gray-100 text-gray-600' },
  group_invite: { icon: '👥', color: 'bg-teal-100 text-teal-600' },
  mention:      { icon: '@',  color: 'bg-pink-100 text-pink-600' },
};

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markRead, markAllRead, dismiss } = useNotifications();

  const handleMarkAllRead = async () => {
    await markAllRead();
    toast.success('All marked as read');
  };

  const handleClick = (n) => {
    if (!n.is_read) markRead(n.id);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <FadeIn className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm">
            <Bell size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-800">Notifications</h1>
            <p className="text-[11px] text-gray-400">{unreadCount} unread</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <CheckCheck size={14} /> Mark all read
          </motion.button>
        )}
      </FadeIn>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 size={28} className="animate-spin text-rose-500 mx-auto" />
        </div>
      ) : notifications.length === 0 ? (
        <FadeIn>
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <Bell size={28} className="text-rose-400" />
            </div>
            <h2 className="font-bold text-gray-700 mb-2">All Caught Up!</h2>
            <p className="text-sm text-gray-400">No new notifications.</p>
          </div>
        </FadeIn>
      ) : (
        <StaggerChildren
          className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] overflow-hidden divide-y divide-gray-50"
          stagger={0.04}
        >
          {notifications.map(n => {
            const meta = TYPE_META[n.type] || TYPE_META.system;
            return (
              <StaggerItem key={n.id}>
                <div
                  onClick={() => handleClick(n)}
                  className={`flex items-start gap-3 p-4 transition-colors cursor-pointer group ${!n.is_read ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-gray-50'}`}
                >
                  {/* Type icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${meta.color}`}>
                    {meta.icon}
                  </div>

                  {/* Actor avatar */}
                  {n.actor_photo || n.actor_username ? (
                    <Avatar src={n.actor_photo} name={n.actor_username} size="sm" className="flex-shrink-0" />
                  ) : null}

                  {/* Message */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-relaxed">{n.message}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(n.created_at)}</p>
                  </div>

                  {/* Unread dot + dismiss */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!n.is_read && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-all"
                    >
                      <Trash2 size={12} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      )}
    </div>
  );
}
