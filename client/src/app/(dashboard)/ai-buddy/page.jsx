'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { aiAPI } from '@/lib/api/ai.api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  Send, Sparkles, Brain, GraduationCap, Briefcase, BookOpen, Mic, MicOff,
  Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight, Loader2, Clock,
  X, Target, FlaskConical, Map, Lightbulb, Zap, MoreHorizontal, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

// ════════════════════════════════════════════════════════════
//  QUICK PROMPTS
// ════════════════════════════════════════════════════════════
const QUICK_PROMPTS = [
  { icon: '🎯', text: 'What should I choose — PCM or PCB?', tag: 'Career' },
  { icon: '📚', text: 'How to prepare for JEE Main in 6 months?', tag: 'Exam' },
  { icon: '🧬', text: 'Explain DNA replication step by step', tag: 'Science' },
  { icon: '💼', text: 'What does a software engineer actually do?', tag: 'Career' },
  { icon: '🧮', text: 'Solve: If 3x + 7 = 22, find x', tag: 'Math' },
  { icon: '🌍', text: 'Give me 5 important current affairs this week', tag: 'GK' },
  { icon: '🧠', text: 'Best study techniques for board exams?', tag: 'Tips' },
  { icon: '🔬', text: 'What happens during photosynthesis?', tag: 'Science' },
];

const INTENT_BADGES = {
  career: { label: 'Career', color: 'bg-blue-100 text-blue-600' },
  exam: { label: 'Exam Prep', color: 'bg-amber-100 text-amber-600' },
  motivation: { label: 'Motivation', color: 'bg-green-100 text-green-600' },
  problem_solving: { label: 'Problem', color: 'bg-purple-100 text-purple-600' },
  current_affairs: { label: 'Current Affairs', color: 'bg-rose-100 text-rose-600' },
  general: { label: 'General', color: 'bg-gray-100 text-gray-600' },
};

// ════════════════════════════════════════════════════════════
//  SESSION SIDEBAR
// ════════════════════════════════════════════════════════════
function SessionSidebar({ sessions, activeId, onSelect, onNew, onDelete, collapsed, onToggle, loading }) {
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (collapsed) {
    return (
      <div className="w-12 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col items-center py-3 gap-2">
        <button onClick={onToggle} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Show chats">
          <PanelLeftOpen size={16} className="text-gray-500" />
        </button>
        <button onClick={onNew} className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors" title="New chat">
          <Plus size={16} className="text-indigo-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
      {/* Header */}
      <div className="px-3 py-3 border-b border-gray-100 flex items-center justify-between">
        <button onClick={onNew}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-200/40 transition-all active:scale-[0.98]">
          <Plus size={14} /> New Chat
        </button>
        <button onClick={onToggle} className="ml-2 p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Hide sidebar">
          <PanelLeftClose size={14} className="text-gray-400" />
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 size={20} className="animate-spin text-indigo-400 mx-auto" />
            <p className="text-xs text-gray-400 mt-2">Loading chats...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageSquare size={24} className="text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No conversations yet</p>
            <p className="text-[10px] text-gray-300 mt-1">Start chatting with your AI buddy!</p>
          </div>
        ) : (
          sessions.map(s => (
            <div key={s.id}
              className={`group flex items-start gap-2 px-2.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                activeId === s.id
                  ? 'bg-indigo-50 border border-indigo-200/60'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
              onClick={() => onSelect(s)}>
              <MessageSquare size={14} className={`mt-0.5 flex-shrink-0 ${activeId === s.id ? 'text-indigo-500' : 'text-gray-400'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-[12px] font-medium truncate ${activeId === s.id ? 'text-indigo-700' : 'text-gray-700'}`}>
                  {s.title || 'New Chat'}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                  <Clock size={9} /> {formatTime(s.last_message_at || s.created_at)}
                  {s.message_count > 0 && <span>· {s.message_count} msgs</span>}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 transition-all"
                title="Delete chat">
                <Trash2 size={12} className="text-red-400" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  CHAT MESSAGE BUBBLE
// ════════════════════════════════════════════════════════════
function ChatBubble({ msg, isUser }) {
  // Simple markdown: **bold**, `code`, numbered lists
  const formatContent = (text) => {
    if (!text) return '';
    // Split by code blocks first
    return text.split(/(`[^`]+`)/).map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-gray-100 text-indigo-600 px-1.5 py-0.5 rounded text-[12px] font-mono">{part.slice(1, -1)}</code>;
      }
      // Bold
      return part.split(/(\*\*[^*]+\*\*)/).map((seg, j) => {
        if (seg.startsWith('**') && seg.endsWith('**')) {
          return <strong key={`${i}-${j}`} className="font-bold">{seg.slice(2, -2)}</strong>;
        }
        return seg;
      });
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-2.5 mt-1 flex-shrink-0 shadow-sm">
          <Sparkles size={14} className="text-white" />
        </div>
      )}
      <div className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl rounded-br-lg shadow-md shadow-indigo-200/30'
          : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-lg shadow-sm'
      }`}>
        <p className="whitespace-pre-wrap">{formatContent(msg.content)}</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════════════════
export default function AIBuddyPage() {
  const { user } = useAuth();

  // Session state
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Voice
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // ── Load sessions on mount ──
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await aiAPI.getChatSessions('buddy');
      const data = res.data?.data || res.data || [];
      setSessions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('[Buddy] Failed to load sessions:', e);
    } finally {
      setSessionsLoading(false);
    }
  };

  // ── Load messages when session changes ──
  const loadSessionMessages = useCallback(async (sessionId) => {
    if (!sessionId) return;
    setLoadingMessages(true);
    try {
      const res = await aiAPI.getChatMessages(sessionId);
      const data = res.data?.data || res.data || [];
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('[Buddy] Failed to load messages:', e);
      toast.error('Could not load chat history');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // ── Auto-scroll ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // ── Speech Recognition ──
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';
      recognitionRef.current.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false); };
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) { toast.error('Voice not supported in this browser'); return; }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  };

  // ── Select session ──
  const selectSession = (session) => {
    setActiveSessionId(session.id);
    setMessages([]);
    loadSessionMessages(session.id);
  };

  // ── New chat ──
  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInput('');
    inputRef.current?.focus();
  };

  // ── Delete session ──
  const deleteSession = async (sessionId) => {
    try {
      await aiAPI.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
      toast.success('Chat deleted');
    } catch {
      toast.error('Could not delete chat');
    }
  };

  // ── Send message ──
  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    setInput('');

    // Optimistic add user message
    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await aiAPI.buddyChat(msg, activeSessionId || undefined, {
        class_level: user?.class_name?.toString().replace(/\D/g, '') || undefined,
        board: user?.board || undefined,
      });
      const data = res.data?.data || res.data;
      const reply = data.reply;
      const newSessionId = data.session_id;

      // Add assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

      // If new session was created, update state
      if (newSessionId && !activeSessionId) {
        setActiveSessionId(newSessionId);
        // Refresh sessions list to show the new one
        loadSessions();
      }
    } catch (e) {
      console.error('[Buddy] Chat error:', e);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble thinking. Can you try asking again? If this keeps happening, the AI servers might be busy.',
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] max-w-6xl mx-auto rounded-2xl overflow-hidden border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] bg-white">
      {/* ═══ SESSION SIDEBAR ═══ */}
      <SessionSidebar
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={selectSession}
        onNew={startNewChat}
        onDelete={deleteSession}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(p => !p)}
        loading={sessionsLoading}
      />

      {/* ═══ CHAT AREA ═══ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50/80 to-purple-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-sm">AI Learning Buddy</h1>
              <p className="text-[11px] text-gray-400">
                {activeSessionId
                  ? sessions.find(s => s.id === activeSessionId)?.title || 'Continuing conversation...'
                  : 'Ask me anything — career, doubts, exam prep, or just chat!'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link href="/mindmap" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-gray-500 hover:bg-white hover:text-indigo-600 transition-all">
              <Brain size={12} /> Mind Map
            </Link>
            <Link href="/career-explorer" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-gray-500 hover:bg-white hover:text-indigo-600 transition-all">
              <Map size={12} /> Careers
            </Link>
            <Link href="/prep" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-gray-500 hover:bg-white hover:text-indigo-600 transition-all">
              <GraduationCap size={12} /> Prep
            </Link>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-gradient-to-b from-gray-50/30 to-white">
          {/* Loading messages for existing session */}
          {loadingMessages ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-indigo-400 mb-3" />
              <p className="text-sm text-gray-400">Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-5">
                <Sparkles size={32} className="text-indigo-500" />
              </div>
              <h2 className="font-extrabold text-gray-800 text-lg mb-1">
                Hi{user?.username ? ` ${user.username}` : ''}! 👋
              </h2>
              <p className="text-sm text-gray-400 mb-6 text-center max-w-sm">
                I&apos;m your AI learning buddy. I can help with doubts, career advice, exam prep, or anything you&apos;re curious about!
              </p>

              <div className="grid grid-cols-2 gap-2.5 max-w-lg w-full">
                {QUICK_PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => sendMessage(p.text)}
                    className="text-left bg-white border border-gray-100 rounded-xl p-3.5 hover:shadow-md hover:border-indigo-200 transition-all active:scale-[0.98] group">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">{p.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-indigo-500 transition-colors">{p.tag}</span>
                    </div>
                    <p className="text-[12.5px] text-gray-700 leading-relaxed">{p.text}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <>
              {messages.map((msg, i) => (
                <ChatBubble key={i} msg={msg} isUser={msg.role === 'user'} />
              ))}
            </>
          )}

          {/* Typing indicator */}
          {sending && (
            <div className="flex items-start gap-2.5 animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles size={14} className="text-white animate-pulse" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-lg px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="px-4 py-3 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <button onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
                isListening
                  ? 'bg-red-100 text-red-500 animate-pulse shadow-sm'
                  : 'bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-500'
              }`}
              title={isListening ? 'Stop listening' : 'Voice input'}>
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? '🎤 Listening...' : 'Ask me anything...'}
                className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all pr-12"
                disabled={sending}
              />
              {input.trim() && !sending && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 font-medium">
                  Enter ↵
                </span>
              )}
            </div>

            <button onClick={() => sendMessage()} disabled={!input.trim() || sending}
              className="p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200/40 hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-[0.95] disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>

          <p className="text-[10px] text-gray-300 text-center mt-2">
            AI Buddy uses Syllabrix&apos;s multi-provider AI. Responses are saved to your account.
          </p>
        </div>
      </div>
    </div>
  );
}
