'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { groupsAPI } from '@/lib/api/groups.api';
import Avatar from '@/components/ui/Avatar';
import Link from 'next/link';
import { Users, Send, ArrowLeft, Loader2, Shield, Settings } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('chat');
  const bottomRef = useRef(null);

  useEffect(() => {
    Promise.all([
      groupsAPI.getById(groupId),
      groupsAPI.getMessages(groupId, { limit: 50 }),
      groupsAPI.getMembers(groupId),
    ]).then(([gRes, mRes, memRes]) => {
      setGroup(gRes.data?.data);
      setMessages(mRes.data?.data || []);
      setMembers(memRes.data?.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [groupId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMsg = async () => {
    if (!input.trim()) return;
    const text = input.trim(); setInput('');
    try {
      await groupsAPI.sendMessage(groupId, { content: text });
      setMessages(prev => [...prev, { content: text, sender_id: user?.id, username: user?.username, created_at: new Date().toISOString() }]);
    } catch { toast.error('Failed to send'); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-blue-500" /></div>;
  if (!group) return <div className="text-center py-12"><p className="text-gray-400">Group not found</p></div>;

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-80px)]">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-t-2xl shadow-sm">
        <Link href="/groups" className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft size={16} className="text-gray-500" /></Link>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"><Users size={18} className="text-white" /></div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{group.name}</p>
          <p className="text-[10px] text-gray-400">{members.length} members</p>
        </div>
        <div className="flex gap-1">
          {['chat', 'members'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all ${tab === t ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>{t}</button>
          ))}
        </div>
      </div>

      {tab === 'chat' ? (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50 border-x border-gray-100">
            {messages.map((m, i) => {
              const isMe = m.sender_id === user?.id;
              return (
                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-white text-gray-800 rounded-bl-lg border border-gray-100'}`}>
                    {!isMe && <p className="text-[10px] font-bold text-blue-500 mb-0.5">{m.username}</p>}
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <div className="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-b-2xl">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), sendMsg())}
              placeholder="Type a message..." className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
            <button onClick={sendMsg} className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"><Send size={16} /></button>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto bg-white border-x border-b border-gray-100 rounded-b-2xl divide-y divide-gray-50">
          {members.map(m => (
            <div key={m.id || m.user_id} className="flex items-center gap-3 px-4 py-3">
              <Avatar src={m.profile_photo_url} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{m.username}</p>
                <p className="text-[10px] text-gray-400 capitalize">{m.role || 'member'}</p>
              </div>
              {m.role === 'admin' && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold"><Shield size={9} /> Admin</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
