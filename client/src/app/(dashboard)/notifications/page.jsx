'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications, TYPE_META } from '@/contexts/NotificationContext';
import { getNotificationUrl, buildSections } from '@/lib/notification-utils';
import { timeAgo } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Bell, Loader2, CheckCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SECTION_COLOR = {
  'New':        'text-blue-600 bg-blue-50 border-blue-100',
  'Today':      'text-gray-600 bg-gray-100 border-gray-200',
  'Yesterday':  'text-gray-600 bg-gray-100 border-gray-200',
  'This Week':  'text-gray-500 bg-gray-50 border-gray-100',
  'Earlier':    'text-gray-400 bg-gray-50 border-gray-100',
};

function NotificationRow({ n, onRead, onDismiss }) {
  const router = useRouter();
  const meta = TYPE_META[n.type] || TYPE_META.system;
  const actorName = n.actor_full_name || n.actor_username;
  const avatar = n.actor_photo
    || (actorName ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(actorName)}` : null);

  const handleClick = () => {
    if (!n.is_read) onRead(n.id);
    const url = getNotificationUrl(n);
    if (url) router.push(url);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.18 }}
      onClick={handleClick}
      className={`relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors group border-b border-gray-50 last:border-0 ${
        !n.is_read ? 'bg-blue-50/50 hover:bg-blue-50/80' : 'hover:bg-gray-50'
      }`}
    >
      {/* Left: avatar + type badge */}
      <div className="relative flex-shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            onError={e => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=U`; }}
          />
        ) : (
          <div className={`w-12 h-12 rounded-full ${meta.color} flex items-center justify-center text-2xl`}>
            {meta.icon}
          </div>
        )}
        {/* Type icon badge overlay on avatar corner */}
        {avatar && (
          <span className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full ${meta.color} flex items-center justify-center text-[11px] ring-2 ring-white shadow-sm`}>
            {meta.icon}
          </span>
        )}
      </div>

      {/* Center: message + time */}
      <div className="flex-1 min-w-0 pt-0.5">
        {actorName ? (
          <p className="text-[13.5px] text-gray-800 leading-snug">
            <span className="font-bold">{actorName}</span>{' '}
            <span className="text-gray-600">{getActionText(n)}</span>
          </p>
        ) : (
          <p className="text-[13.5px] text-gray-800 leading-snug">{n.message}</p>
        )}
        <p className={`text-[11px] mt-1 font-medium ${!n.is_read ? 'text-blue-500' : 'text-gray-400'}`}>
          {timeAgo(n.created_at)}
        </p>
      </div>

      {/* Right: unread dot + dismiss */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0 self-center">
        {!n.is_read && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
        <button
          onClick={e => { e.stopPropagation(); onDismiss(n.id); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-200 transition-all"
          title="Remove"
        >
          <Trash2 size={12} className="text-gray-400" />
        </button>
      </div>
    </motion.div>
  );
}

// Extract the action part of the message (everything after the actor name)
function getActionText(n) {
  const actorName = n.actor_full_name || n.actor_username;
  if (!actorName) return n.message;
  const msg = n.message || '';
  // Try to strip actor name from the start
  if (msg.startsWith(actorName)) return msg.slice(actorName.length).trimStart();
  // If message has emoji prefix (achievement/system), return as is
  return msg;
}

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markRead, markAllRead, dismiss } = useNotifications();
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const handleMarkAllRead = async () => {
    await markAllRead();
    toast.success('All marked as read');
  };

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const sections = buildSections(filtered);
  const unreadFiltered = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-2xl mx-auto pb-10 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm">
            <Bell size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900">Notifications</h1>
            <p className="text-[11px] text-gray-400">
              {unreadCount > 0 ? `${unreadCount} unread` : 'You\'re all caught up'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-100 transition-colors"
          >
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {[
          { key: 'all',    label: 'All',    count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadFiltered },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${
              filter === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/40'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                filter === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {tab.count > 99 ? '99+' : tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 flex justify-center">
          <Loader2 size={28} className="animate-spin text-rose-400" />
        </div>
      ) : sections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-14 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <Bell size={28} className="text-rose-300" />
          </div>
          <h2 className="font-bold text-gray-700 mb-1">
            {filter === 'unread' ? 'No unread notifications' : 'All caught up!'}
          </h2>
          <p className="text-sm text-gray-400">
            {filter === 'unread' ? 'Everything has been read.' : 'New activity will appear here.'}
          </p>
          {filter === 'unread' && (
            <button
              onClick={() => setFilter('all')}
              className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
            >
              View all notifications →
            </button>
          )}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            {sections.map(section => (
              <div key={section.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Section header */}
                <div className={`px-4 py-2 border-b border-gray-50 flex items-center gap-2`}>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${SECTION_COLOR[section.label] || 'text-gray-500 bg-gray-50 border-gray-100'}`}>
                    {section.label}
                  </span>
                  <span className="text-[11px] text-gray-400">{section.items.length} notification{section.items.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Notifications in section */}
                <AnimatePresence>
                  {section.items.map(n => (
                    <NotificationRow
                      key={n.id}
                      n={n}
                      onRead={markRead}
                      onDismiss={dismiss}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
