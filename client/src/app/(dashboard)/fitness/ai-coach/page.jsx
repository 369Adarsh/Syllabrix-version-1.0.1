'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { fitnessAPI } from '@/lib/api/fitness.api';
import { Send, Sparkles, Loader2, User, Bot, Dumbbell, Utensils, Heart, RotateCcw } from 'lucide-react';

export default function AICoachPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: `Hey ${user?.username || 'there'}! 👋 I'm your AI Fitness Coach. I can help you with:\n\n🏋️ **Workout plans** — personalized routines\n🥗 **Diet advice** — meal plans & nutrition\n🧘 **Yoga guidance** — poses & breathing\n💪 **Exercise tips** — form, benefits, safety\n😴 **Recovery** — rest, stretching, sleep\n\nWhat would you like to work on today?`
    }]);
  }, [user?.username]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', content: m.content }));
      const res = await fitnessAPI.chatWithCoach({ history, message: msg });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data?.data?.response || 'I\'m thinking...' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble processing that. Please try again! 🙏' }]);
    } finally { setLoading(false); }
  };

  const quickQuestions = [
    { icon: Dumbbell, text: 'Suggest a quick 20-min workout' },
    { icon: Utensils, text: 'What should I eat for breakfast?' },
    { icon: Heart, text: 'How to improve my flexibility?' },
    { icon: RotateCcw, text: 'Recovery tips after leg day' },
  ];

  return (
    <div className="max-w-[700px] mx-auto flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-extrabold text-gray-800">AI Fitness Coach</h1>
            <p className="text-[11px] text-emerald-500 font-medium">● Online — Powered by AI</p>
          </div>
        </div>
      </motion.div>

      {/* Chat Area */}
      <div ref={chatRef} className="flex-1 overflow-y-auto space-y-3 mb-3 px-1" style={{ scrollbarWidth: 'thin' }}>
        {messages.map((msg, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-blue-500' : 'bg-gradient-to-br from-emerald-500 to-teal-600'
            }`}>
              {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-500 text-white rounded-tr-sm'
                : 'bg-white border border-gray-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.06)] text-gray-700 rounded-tl-sm'
            }`}>
              <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                __html: msg.content
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br/>')
              }} />
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-white border border-gray-200/60 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3 px-1">
          {quickQuestions.map((q, i) => (
            <button key={i} onClick={() => { setInput(q.text); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-[11px] font-medium text-gray-600 hover:border-emerald-300 hover:text-emerald-600 transition-colors">
              <q.icon size={12} /> {q.text}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask your AI coach anything..."
          className="flex-1 text-[13px] outline-none bg-transparent placeholder-gray-400"
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}
          className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors disabled:opacity-40">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
