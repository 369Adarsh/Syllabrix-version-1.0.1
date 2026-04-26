'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { aiAPI } from '@/lib/api/ai.api';
import { careerAPI } from '@/lib/api/career.api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  Send, Sparkles, Brain, GraduationCap, Briefcase, BookOpen, Mic, MicOff,
  Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight, Loader2, Clock,
  X, Target, FlaskConical, Map, Lightbulb, Zap, MoreHorizontal, PanelLeftClose, PanelLeftOpen,
  TrendingUp, Award, Globe, BarChart3, Bot, CheckCircle, CheckCircle2, Menu,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getPlatformMode } from '@/utils/platformMode';

// ════════════════════════════════════════════════════════════
//  MODE BUDDY CONFIG — personality per platform mode
// ════════════════════════════════════════════════════════════
const MODE_BUDDY = {
  young_explorer: {
    name: 'Boli',
    emoji: '🦜',
    subtitle: "Hi! I'm Boli, your learning buddy!",
    greeting: "Hi! I'm Boli! Shall we play a word game today? 🦜",
    avatarBg: 'bg-amber-500',
    headerGradient: 'from-amber-500 to-orange-500',
    newChatLabel: 'New Chat',
    prompts: [
      { icon: '🔤', text: 'Say the sound for the letter B', tag: 'Phonics' },
      { icon: '🌸', text: 'Help me build the word FLOWER', tag: 'Words' },
      { icon: '📖', text: 'Tell me a short story about a lion', tag: 'Stories' },
      { icon: '🔢', text: 'How do I count to 20 in Hindi?', tag: 'Hindi' },
      { icon: '🎵', text: 'Teach me a rhyme about animals', tag: 'Rhymes' },
      { icon: '✏️', text: 'How do I write the letter A nicely?', tag: 'Writing' },
    ],
    context: 'You are Boli, a friendly parrot mascot for young children (ages 5-10). Use simple words and very short sentences. Add lots of emojis. Be encouraging and playful. Help with reading, writing, phonics, and basic concepts. Celebrate small wins with excitement.',
  },
  curious_mind: {
    name: 'Spark',
    emoji: '🔭',
    subtitle: 'Your curiosity coach',
    greeting: "Hey! I found something cool about black holes. Want to know? 🔭",
    avatarBg: 'bg-teal-500',
    headerGradient: 'from-teal-500 to-cyan-600',
    newChatLabel: 'New Explore',
    prompts: [
      { icon: '🌌', text: 'Tell me something amazing about space', tag: 'Science' },
      { icon: '🧮', text: 'Why does Fibonacci appear in nature?', tag: 'Maths' },
      { icon: '🏛️', text: 'What was daily life like in ancient India?', tag: 'History' },
      { icon: '🔬', text: 'How do vaccines train your immune system?', tag: 'Biology' },
      { icon: '💡', text: 'Give me a mind-blowing physics fact', tag: 'Physics' },
      { icon: '🎯', text: 'What career suits a creative thinker?', tag: 'Career' },
    ],
    context: 'You are Spark, an enthusiastic discovery coach for Class 6-8 students. Make learning exciting. Share fascinating facts, ask curious questions back, and connect topics to real life. Use engaging, age-appropriate language. Spark wonder and curiosity in every response.',
  },
  board_warrior: {
    name: 'Coach',
    emoji: '🎯',
    subtitle: 'CBSE board exam coach',
    greeting: "Ready to ace your boards? Let's clear your doubts — ask me anything! 🎯",
    avatarBg: 'bg-emerald-600',
    headerGradient: 'from-emerald-600 to-green-600',
    newChatLabel: 'New Doubt',
    prompts: [
      { icon: '📐', text: 'Explain Pythagoras theorem with examples', tag: 'Maths' },
      { icon: '⚗️', text: 'What are the products of burning magnesium?', tag: 'Science' },
      { icon: '🌍', text: 'What caused the French Revolution?', tag: 'SST' },
      { icon: '📝', text: 'How to write a CBSE formal letter properly?', tag: 'English' },
      { icon: '🔋', text: 'Explain the working of an electric motor', tag: 'Physics' },
      { icon: '🧬', text: 'Difference between mitosis and meiosis?', tag: 'Biology' },
    ],
    context: 'You are Coach, a friendly CBSE board exam coach for Class 9-10 students. Give clear, exam-oriented explanations aligned to the NCERT curriculum. Suggest how to structure answers for board exams. Be encouraging. Highlight key points students should memorise.',
  },
  exam_command: {
    name: 'Commander',
    emoji: '⚡',
    subtitle: 'JEE / NEET command mode',
    greeting: "Let's command this exam. What concept shall we crack today? ⚡",
    avatarBg: 'bg-blue-700',
    headerGradient: 'from-blue-700 to-indigo-700',
    newChatLabel: 'New Session',
    prompts: [
      { icon: '⚛️', text: 'Derive the equations of motion (JEE Physics)', tag: 'Physics' },
      { icon: '🧪', text: 'Explain SN1 vs SN2 reactions with conditions', tag: 'Chemistry' },
      { icon: '📊', text: 'How to solve Integration by Parts for JEE?', tag: 'Maths' },
      { icon: '🧬', text: 'Explain cell division for NEET in detail', tag: 'Biology' },
      { icon: '🎯', text: 'What are the 5 highest-weightage NEET chapters?', tag: 'Strategy' },
      { icon: '💡', text: 'JEE 2023 PYQ — Explain Bernoulli\'s principle', tag: 'PYQ' },
    ],
    context: 'You are Commander, an expert JEE/NEET preparation coach. Explain concepts rigorously with formulas and derivations where needed. Give exam-focused answers with application tips. Mention which concepts are frequently tested in JEE/NEET. Be precise and thorough.',
  },
  upsc_aspirant: {
    name: 'Mentor',
    emoji: '🏛️',
    subtitle: 'UPSC civil services mentor',
    greeting: "Good morning. Ready for today's analysis? What shall we begin with? 🏛️",
    avatarBg: 'bg-sky-900',
    headerGradient: 'from-sky-900 to-blue-950',
    newChatLabel: 'New Session',
    prompts: [
      { icon: '📰', text: 'Summarise the most important current affairs for UPSC today', tag: 'Current Affairs' },
      { icon: '⚖️', text: 'Explain Article 356 — President\'s Rule in India', tag: 'Polity' },
      { icon: '💹', text: 'Key features of India\'s federal structure', tag: 'GS2' },
      { icon: '🌍', text: 'India\'s foreign policy: Non-Alignment to Strategic Autonomy', tag: 'IR' },
      { icon: '🧭', text: 'Civil servant dilemma: loyalty vs public good (ethics case)', tag: 'GS4' },
      { icon: '✍️', text: 'Write a 150-word model answer on India\'s water crisis', tag: 'Answer Writing' },
    ],
    context: 'You are Mentor, an expert UPSC civil services preparation guide. Give analytical, multi-dimensional answers. For GS questions: Introduction → Body (multiple perspectives with examples) → Conclusion. For ethics, discuss values and dilemmas. Cite government schemes, committees, and reports where relevant. Write in a Mains-exam style.',
  },
};

const DEFAULT_PROMPTS = [
  { icon: '📈', text: 'Recent industry shifts in Tech 2026', tag: 'Market' },
  { icon: '🎯', text: 'Mastery roadmap for Cloud Architecture', tag: 'Skills' },
  { icon: '💼', text: 'Salary negotiation strategy for Lead roles', tag: 'Career' },
  { icon: '🚀', text: 'Soft skills for first-time engineering managers', tag: 'Growth' },
  { icon: '🌍', text: 'Global demand for AI Research Scientists', tag: 'Demand' },
  { icon: '🧠', text: 'How to build domain authority in 6 months', tag: 'Personal' },
  { icon: '🔬', text: 'Explain RAG vs Fine-tuning in LLMs', tag: 'Tech' },
  { icon: '💡', text: 'Project ideas to showcase Senior expertise', tag: 'Portfolio' },
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
function SessionSidebar({ sessions, activeId, onSelect, onNew, onDelete, onClearAll, collapsed, onToggle, loading, isMobileOpen, onMobileClose, newChatLabel = 'New Chat' }) {
  const [showConfirm, setShowConfirm] = useState(false);

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

  const sidebarInner = collapsed ? (
    <div className="w-12 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col items-center py-3 gap-2">
      <button onClick={onToggle} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Show chats">
        <PanelLeftOpen size={16} className="text-gray-500" />
      </button>
      <button onClick={onNew} className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors" title="New chat">
        <Plus size={16} className="text-blue-600" />
      </button>
    </div>
  ) : (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="px-3 py-3 border-b border-gray-100 flex items-center justify-between">
        <button onClick={onNew}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-[0.98]">
          <Plus size={14} strokeWidth={3} /> {newChatLabel}
        </button>
        <button onClick={() => { onToggle(); onMobileClose?.(); }} className="ml-2 p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Hide sidebar">
          <PanelLeftClose size={14} className="text-gray-400" />
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 size={20} className="animate-spin text-blue-400 mx-auto" />
            <p className="text-xs text-gray-400 mt-2">Loading chats...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageSquare size={24} className="text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No conversations yet</p>
            <p className="text-[10px] text-gray-300 mt-1">Start chatting with your AI buddy!</p>
          </div>
        ) : (
          <>
            {sessions.map(s => (
              <div key={s.id}
                className={`group flex items-start gap-2 px-2.5 py-3 rounded-2xl cursor-pointer transition-all ${
                  activeId === s.id
                    ? 'bg-blue-50 border border-blue-100'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
                onClick={() => { onSelect(s); onMobileClose?.(); }}>
                <MessageSquare size={14} className={`mt-0.5 flex-shrink-0 ${activeId === s.id ? 'text-blue-500' : 'text-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] font-black tracking-tight truncate ${activeId === s.id ? 'text-blue-700' : 'text-gray-700'}`}>
                    {s.title || '{newChatLabel}'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 font-bold uppercase">
                    <Clock size={9} /> {formatTime(s.last_message_at || s.created_at)}
                    {s.message_count > 0 && <span>· {s.message_count} steps</span>}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 transition-all"
                  title="Delete chat">
                  <Trash2 size={12} className="text-red-400" />
                </button>
              </div>
            ))}

            <div className="pt-4 pb-2 px-2 mt-auto border-t border-gray-50">
               {!showConfirm ? (
                 <button
                  onClick={() => setShowConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-red-500 transition-all">
                   <Trash2 size={11} /> Clear All History
                 </button>
               ) : (
                 <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { onClearAll(); setShowConfirm(false); }}
                      className="flex-1 py-1.5 rounded-lg bg-red-50 text-red-600 text-[10px] font-bold hover:bg-red-100 transition-all">
                      Confirm Clear
                    </button>
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all">
                      <X size={12} />
                    </button>
                 </div>
               )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile backdrop ── */}
      <div
        onClick={onMobileClose}
        className={`md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* ── Sidebar panel ── */}
      {/* Desktop: static in-flow, width controlled by collapsed */}
      <div className={`hidden md:flex flex-shrink-0 bg-white border-r border-gray-100 flex-col ${collapsed ? 'w-12' : 'w-64'}`}>
        {sidebarInner}
      </div>

      {/* Mobile: fixed overlay drawer */}
      <div className={`md:hidden fixed top-0 left-0 h-full z-50 w-[280px] bg-white border-r border-gray-100 flex flex-col shadow-2xl transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Mobile close row */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">Chat History</p>
          <button onClick={onMobileClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-400" />
          </button>
        </div>
        <button onClick={() => { onNew(); onMobileClose?.(); }}
          className="mx-3 mt-3 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-[0.98]">
          <Plus size={14} strokeWidth={3} /> {newChatLabel}
        </button>
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 mt-1">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 size={20} className="animate-spin text-blue-400 mx-auto" />
              <p className="text-xs text-gray-400 mt-2">Loading chats...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No conversations yet</p>
            </div>
          ) : (
            sessions.map(s => (
              <div key={s.id}
                className={`flex items-start gap-2 px-2.5 py-3 rounded-2xl cursor-pointer transition-all ${
                  activeId === s.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50 border border-transparent'
                }`}
                onClick={() => { onSelect(s); onMobileClose?.(); }}>
                <MessageSquare size={14} className={`mt-0.5 flex-shrink-0 ${activeId === s.id ? 'text-blue-500' : 'text-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] font-black tracking-tight truncate ${activeId === s.id ? 'text-blue-700' : 'text-gray-700'}`}>
                    {s.title || '{newChatLabel}'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={9} /> {formatTime(s.last_message_at || s.created_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                  className="p-1 rounded-md hover:bg-red-50 transition-all">
                  <Trash2 size={12} className="text-red-400" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}


// ════════════════════════════════════════════════════════════
//  CHAT MESSAGE BUBBLE
// ════════════════════════════════════════════════════════════
function ChatBubble({ msg, isUser, avatarBg = 'bg-blue-600', emoji = null }) {
  const [copied, setCopied] = useState(false);

  const formatContent = (text) => {
    if (!text) return '';
    return text.split(/(`[^`]+`)/).map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-gray-100 text-blue-600 px-1.5 py-0.5 rounded text-[12px] font-mono">{part.slice(1, -1)}</code>;
      }
      return part.split(/(\*\*[^*]+\*\*)/).map((seg, j) => {
        if (seg.startsWith('**') && seg.endsWith('**')) {
          return <strong key={`${i}-${j}`} className="font-bold">{seg.slice(2, -2)}</strong>;
        }
        return seg;
      });
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in group/bubble`}>
      {!isUser && (
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-2xl ${avatarBg} flex items-center justify-center mr-2 md:mr-3 mt-1 flex-shrink-0 shadow-lg`}>
          {emoji ? (
            <span className="text-[13px] md:text-[16px]">{emoji}</span>
          ) : (
            <>
              <Bot size={15} className="text-white md:hidden" />
              <Bot size={18} className="text-white hidden md:block" />
            </>
          )}
        </div>
      )}
      <div className={`relative max-w-[85%] md:max-w-[80%] px-4 md:px-5 py-3 md:py-4 text-sm leading-relaxed ${
        isUser
          ? 'bg-blue-600 text-white rounded-[20px] md:rounded-[24px] rounded-br-lg shadow-xl shadow-blue-100 font-medium'
          : 'bg-white border border-gray-100 text-gray-800 rounded-[20px] md:rounded-[24px] rounded-bl-lg shadow-sm font-medium'
      }`}>
        <p className="whitespace-pre-wrap">{formatContent(msg.content)}</p>

        {!isUser && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-50 text-gray-400 opacity-0 group-hover/bubble:opacity-100 transition-all hover:bg-blue-50 hover:text-blue-600"
            title="Copy response">
            {copied ? <CheckCircle size={12} className="text-emerald-500" /> : <Plus size={12} className="rotate-45" />}
          </button>
        )}
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════════════════
export default function AIBuddyPage() {
  const { user } = useAuth();
  const mode = getPlatformMode(user);
  const buddy = MODE_BUDDY[mode] || null;
  const isStudentMode = !!buddy;
  const QUICK_PROMPTS = buddy?.prompts || DEFAULT_PROMPTS;
  const avatarBg = buddy?.avatarBg || 'bg-blue-600';
  const buddyName = buddy ? `${buddy.emoji} ${buddy.name}` : 'Professional AI Mentor';
  const buddySubtitle = buddy?.subtitle || 'Your professional trajectory companion';
  const newChatLabel = buddy?.newChatLabel || 'New Strategy';

  // Session state
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSessionOpen, setMobileSessionOpen] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Voice
  const [isListening, setIsListening] = useState(false);
  // Dashboard data (wiring)
  const [dashboardData, setDashboardData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  // ── Load data on mount ──
  useEffect(() => {
    loadSessions();
    if (!isStudentMode) loadDashboardFacts();
    else setDataLoading(false);
  }, [isStudentMode]);

  const loadDashboardFacts = async () => {
    setDataLoading(true);
    try {
      const res = await careerAPI.getDashboard();
      setDashboardData(res.data?.data || null);
    } catch (e) {
      console.error('[Buddy] Failed to load dashboard facts:', e);
    } finally {
      setDataLoading(false);
    }
  };

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

  const handleClearAll = async () => {
    try {
      await aiAPI.clearChatHistory('buddy');
      setSessions([]);
      setActiveSessionId(null);
      setMessages([]);
      toast.success('All history cleared');
    } catch {
      toast.error('Could not clear history');
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
        ...(buddy?.context ? { system_context: buddy.context } : {}),
      });
      const data = res.data?.data || res.data;
      const reply = data.reply;
      const newSessionId = data.session_id;

      // Add assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

      // If new session was created, update state
      if (newSessionId && !activeSessionId) {
        setActiveSessionId(newSessionId);
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
    <div className="flex flex-col md:flex-row md:h-[calc(100vh-80px)] max-w-6xl mx-auto md:rounded-2xl overflow-hidden md:border md:border-gray-100 md:shadow-[0_1px_2px_rgba(0,0,0,0.1)] bg-white -mx-4 md:mx-auto">
      {/* ═══ SESSION SIDEBAR ═══ */}
      <SessionSidebar
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={selectSession}
        onNew={startNewChat}
        onDelete={deleteSession}
        onClearAll={handleClearAll}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(p => !p)}
        loading={sessionsLoading}
        isMobileOpen={mobileSessionOpen}
        onMobileClose={() => setMobileSessionOpen(false)}
        newChatLabel={newChatLabel}
      />


      {/* ═══ CHAT AREA ═══ */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            {/* Mobile: sessions toggle */}
            <button
              onClick={() => setMobileSessionOpen(true)}
              className="md:hidden p-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all flex-shrink-0"
              title="Chat history"
            >
              <MessageSquare size={16} />
              {sessions.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full text-[8px] text-white font-black flex items-center justify-center">
                  {sessions.length > 9 ? '9+' : sessions.length}
                </span>
              )}
            </button>

            <div className={`w-9 h-9 md:w-11 md:h-11 rounded-2xl ${avatarBg} flex items-center justify-center shadow-xl flex-shrink-0`}>
              {buddy ? (
                <span className="text-[16px] md:text-[20px]">{buddy.emoji}</span>
              ) : (
                <>
                  <Bot size={18} className="text-white md:hidden" />
                  <Bot size={22} className="text-white hidden md:block" />
                </>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-black text-gray-900 text-sm md:text-lg tracking-tighter uppercase truncate">
                  {buddyName}
                </h1>
                {!isStudentMode && dashboardData?.marketFitScore && (
                  <div className="hidden sm:flex px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-lg items-center gap-1.5 animate-pulse flex-shrink-0">
                    <div className="w-1 h-1 rounded-full bg-blue-600" />
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{dashboardData.marketFitScore}% Match</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 truncate">
                {activeSessionId
                  ? sessions.find(s => s.id === activeSessionId)?.title || 'Active Session'
                  : buddySubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Link href="/career/skills" className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-all uppercase tracking-tight border border-transparent hover:border-blue-100">
              <Target size={12} /> Scanner
            </Link>
            <Link href="/home" className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-all uppercase tracking-tight border border-transparent hover:border-blue-100">
              <BarChart3 size={12} /> Dashboard
            </Link>
            {/* Mobile: new chat button */}
            <button
              onClick={startNewChat}
              className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold transition-all active:scale-[0.97]"
            >
              <Plus size={12} /> New
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-3 md:px-5 py-4 md:py-5 space-y-4 bg-gradient-to-b from-gray-50/30 to-white min-h-[300px]">
          {/* Loading messages for existing session */}
          {loadingMessages ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-blue-400 mb-3" />
              <p className="text-sm text-gray-400">Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-6 md:py-8">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[28px] md:rounded-[32px] ${avatarBg} flex items-center justify-center mb-4 md:mb-6 shadow-lg`}>
                {buddy ? (
                  <span className="text-[32px] md:text-[40px]">{buddy.emoji}</span>
                ) : (
                  <>
                    <Bot size={28} className="text-white md:hidden" />
                    <Bot size={32} className="text-white hidden md:block" />
                  </>
                )}
              </div>

              {buddy ? (
                <>
                  <h2 className="font-black text-gray-900 text-xl md:text-2xl mb-1 tracking-tighter">
                    {buddy.name}
                  </h2>
                  <p className="text-sm text-gray-500 mb-8 md:mb-10 text-center max-w-sm font-medium px-4">
                    {buddy.greeting}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-black text-gray-900 text-xl md:text-2xl mb-1 tracking-tighter uppercase">
                    Intelligence Pulse
                  </h2>
                  <p className="text-sm text-gray-400 mb-8 md:mb-10 text-center max-w-sm font-medium px-4">
                    Real-time professional facts and strategic gaps identified in your profile.
                  </p>

                  {/* Career data cards — only for professional/default modes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 w-full max-w-4xl mb-8 md:mb-12">
                    <div className="bg-white border border-gray-100 rounded-[24px] md:rounded-[32px] p-5 md:p-6 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 opacity-20 blur-3xl -mr-10 -mt-10" />
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Market Fit</p>
                        <TrendingUp size={14} className="text-blue-600" />
                      </div>
                      <p className="text-3xl font-black text-gray-900 leading-none">{dashboardData?.marketFitScore || 0}%</p>
                      <div className="mt-3 md:mt-4 space-y-2">
                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${dashboardData?.marketFitScore || 0}%` }} className="h-full bg-blue-600" />
                        </div>
                        <p className="text-[10px] text-blue-600 font-bold">TOP {dashboardData?.marketPercentile || '15'}% WORLDWIDE</p>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-[24px] md:rounded-[32px] p-5 md:p-6 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 opacity-20 blur-3xl -mr-10 -mt-10" />
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Critical Gaps</p>
                        <Award size={14} className="text-emerald-600" />
                      </div>
                      <p className="text-lg md:text-xl font-black text-gray-900 leading-tight">
                        {dashboardData?.skillGaps?.[0]?.skill_name || 'Alignment Peak'}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-2 font-medium">
                        {dashboardData?.skillGaps?.[0] ? `Expected Yield: ${dashboardData.skillGaps[0].salary_impact || '+₹3 LPA'}` : 'Profile perfectly matched to Tier-1 trends.'}
                      </p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-[24px] md:rounded-[32px] p-5 md:p-6 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 opacity-20 blur-3xl -mr-10 -mt-10" />
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Market Trends</p>
                        <Globe size={14} className="text-purple-600" />
                      </div>
                      <p className="text-lg md:text-xl font-black text-gray-900 leading-tight">
                        {dashboardData?.profile?.industry || 'Tech Innovation'}
                      </p>
                      <p className="text-[10px] text-purple-600 mt-2 font-bold uppercase tracking-tight">Rising +12% Demand</p>
                    </div>
                  </div>
                </>
              )}

              {/* Quick prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg w-full px-1">
                {QUICK_PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => sendMessage(p.text)}
                    className="text-left bg-white border border-gray-100 rounded-[20px] md:rounded-[24px] p-4 hover:shadow-xl hover:border-gray-200 transition-all active:scale-[0.98] group relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-1.5 relative z-10">
                      <span className="text-base md:text-lg">{p.icon}</span>
                      <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 group-hover:text-gray-600 transition-colors">{p.tag}</span>
                    </div>
                    <p className="text-[12px] md:text-[13px] text-gray-800 leading-snug font-bold relative z-10">{p.text}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <>
              {messages.map((msg, i) => (
                <ChatBubble key={i} msg={msg} isUser={msg.role === 'user'} avatarBg={avatarBg} emoji={buddy?.emoji || null} />
              ))}
            </>
          )}

          {/* Typing indicator */}
          {sending && (
            <div className="flex items-start gap-3 md:gap-4 animate-fade-in px-1 md:px-2">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-2xl ${avatarBg} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                {buddy ? (
                  <span className="text-[14px] animate-pulse">{buddy.emoji}</span>
                ) : (
                  <>
                    <Bot size={15} className="text-white md:hidden animate-pulse" />
                    <Bot size={18} className="text-white hidden md:block animate-pulse" />
                  </>
                )}
              </div>
              <div className="bg-white border border-gray-100 rounded-[20px] md:rounded-[24px] rounded-bl-lg px-4 md:px-5 py-3 md:py-4 shadow-sm">
                <div className="flex gap-2">
                  <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-blue-200 rounded-full animate-bounce" />
                  <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-blue-200 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-blue-200 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="px-3 md:px-4 py-3 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <button onClick={toggleListening}
              className={`p-2 md:p-2.5 rounded-xl transition-all flex-shrink-0 ${
                isListening
                  ? 'bg-red-100 text-red-500 animate-pulse shadow-sm'
                  : 'bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600'
              }`}
              title={isListening ? 'Stop listening' : 'Voice input'}>
              {isListening ? <MicOff size={17} /> : <Mic size={17} />}
            </button>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? '🎤 Listening...' : buddy ? `Ask ${buddy.name} anything...` : 'Ask me anything...'}
                className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all pr-10"
                disabled={sending}
              />
              {input.trim() && !sending && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 font-medium hidden sm:inline">
                  Enter ↵
                </span>
              )}
            </div>

            <button onClick={() => sendMessage()} disabled={!input.trim() || sending}
              className="p-3 md:p-3.5 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.95] disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>

          <p className="text-[10px] text-gray-300 text-center mt-2 hidden sm:block">
            AI Buddy uses Syllabrix&apos;s multi-provider AI. Responses are saved to your account.
          </p>
        </div>
      </div>
    </div>
  );
}
