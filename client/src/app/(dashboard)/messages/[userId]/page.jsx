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
import { motion } from 'motion/react';

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
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100dvh-130px)] md:h-[calc(100vh-140px)] bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] overflow-hidden transition-all">
      {/* Dynamic Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 md:px-5 md:py-3 border-b border-gray-100 bg-gradient-to-r from-violet-50/80 to-purple-50/60 shrink-0">
        <Link href="/messages" className="p-2 rounded-xl hover:bg-white transition-all active:scale-90"><ArrowLeft size={16} className="text-gray-500" /></Link>
        {otherUser && (
          <div className="flex items-center gap-3">
            <Avatar src={otherUser.profile_photo_url} size="sm" className="ring-2 ring-white shadow-sm" />
            <div>
              <p className="text-[13px] md:text-sm font-black text-gray-800 uppercase tracking-tight leading-none mb-1">{otherUser.username}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[9px] font-black text-gray-400 capitalize flex items-center gap-1 tracking-widest">{otherUser.user_type}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages Zone */}
      <div className="flex-1 overflow-y-auto px-4 md:px-5 py-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white scrollbar-hide">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
             <Loader2 size={24} className="animate-spin text-violet-500" />
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Synchronizing Stream...</p>
          </div>
        ) : (
          <>
            {messages.map((m, i) => {
              const isMe = m.sender_id === user?.id;
              return (
                <motion.div 
                  initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-[24px] text-[13px] md:text-sm shadow-sm transition-all ${
                    isMe 
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-lg' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-lg'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    <p className={`text-[9px] mt-1.5 font-bold uppercase tracking-widest ${isMe ? 'text-violet-200' : 'text-gray-400'}`}>
                      {timeAgo(m.created_at)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            {/* Safe area padding for the floating input */}
            <div className="h-4" />
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Zone — Calibrated for Mobile Navigation */}
      <div className="px-3 py-3 md:px-4 md:py-4 border-t border-gray-100 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.02)] shrink-0">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMsg())}
            placeholder="Type a strategic message..." 
            className="flex-1 px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-[20px] text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-300 transition-all placeholder:text-gray-300" 
          />
          <button 
            onClick={sendMsg} 
            disabled={!input.trim() || sending}
            className="w-12 h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xl shadow-purple-100 flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:grayscale"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={20} strokeWidth={2.5} />}
          </button>
        </div>
      </div>
    </div>
  );
}
