'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { messagesAPI } from '@/lib/api/messages.api';
import Avatar from '@/components/ui/Avatar';
import { MessageSquare, Loader2 } from 'lucide-react';
import { timeAgo, truncate } from '@/lib/utils';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { messagesAPI.getConversations().then(r => setConversations(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm"><MessageSquare size={20} className="text-white" /></div>
        <div><h1 className="font-bold text-lg text-gray-800">Messages</h1><p className="text-[11px] text-gray-400">{conversations.length} conversations</p></div>
      </div>

      {loading ? <div className="text-center py-16"><Loader2 size={28} className="animate-spin text-violet-500 mx-auto" /></div>
      : conversations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4"><MessageSquare size={28} className="text-violet-400" /></div>
          <h2 className="font-bold text-gray-700 mb-2">No Messages Yet</h2>
          <p className="text-sm text-gray-400">Start a conversation by visiting someone&apos;s profile.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] overflow-hidden divide-y divide-gray-50">
          {conversations.map(c => (
            <Link key={c.other_user_id} href={`/messages/${c.other_user_id}`}
              className="flex items-center gap-3 p-4 hover:bg-violet-50/30 transition-colors">
              <div className="relative"><Avatar src={c.profile_photo_url} size="md" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">{c.username}</span>
                  <span className="text-[11px] text-gray-400">{timeAgo(c.last_message_at)}</span>
                </div>
                <p className="text-[12px] text-gray-500 truncate">{truncate(c.last_message, 50)}</p>
              </div>
              {c.unread_count > 0 && (
                <span className="bg-violet-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{c.unread_count}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
