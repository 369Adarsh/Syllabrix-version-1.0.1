'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { messagesAPI } from '@/lib/api/messages.api';
import { profileAPI } from '@/lib/api/profile.api';
import Avatar from '@/components/ui/Avatar';
import Link from 'next/link';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

export default function ChatPage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    Promise.all([
      messagesAPI.getConversation(userId, { limit: 50 }),
      profileAPI.getById(userId),
    ]).then(([mRes, pRes]) => {
      setMessages(mRes.data?.data || []);
      setOtherUser(pRes.data?.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMsg = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim(); setInput(''); setSending(true);
    try {
      const res = await messagesAPI.send(userId, { content: text });
      setMessages(prev => [...prev, res.data?.data || { content: text, sender_id: user?.id, created_at: new Date().toISOString() }]);
    } catch { setMessages(prev => [...prev, { content: text, sender_id: user?.id, created_at: new Date().toISOString() }]); }
    finally { setSending(false); }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-80px)] bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-violet-50/80 to-purple-50/60">
        <Link href="/messages" className="p-2 rounded-lg hover:bg-white transition-colors"><ArrowLeft size={16} className="text-gray-500" /></Link>
        {otherUser && <><Avatar src={otherUser.profile_photo_url} size="sm" /><div><p className="text-sm font-bold text-gray-800">{otherUser.username}</p><p className="text-[10px] text-gray-400 capitalize">{otherUser.user_type}</p></div></>}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gradient-to-b from-gray-50/30 to-white">
        {loading ? <div className="text-center py-12"><Loader2 size={24} className="animate-spin text-violet-400 mx-auto" /></div>
        : messages.map((m, i) => {
          const isMe = m.sender_id === user?.id;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-lg' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-lg shadow-sm'}`}>
                <p className="whitespace-pre-wrap">{m.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-violet-200' : 'text-gray-400'}`}>{timeAgo(m.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMsg())}
          placeholder="Type a message..." className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all" />
        <button onClick={sendMsg} disabled={!input.trim() || sending}
          className="p-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-40">
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}
