'use client';
import { useEffect, useRef, useState } from 'react';
import { jeeAPI } from '@/lib/api/jee.api';
import { useJee } from '../layout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send, Camera, Mic, BookOpen, Loader2, Bot, User, X, Upload,
  ChevronDown, Sparkles, Lightbulb, ArrowRight, MessageSquare, Users
} from 'lucide-react';

const MODES = [
  { id: 'text',    icon: Send,          label: 'Type Doubt',     desc: 'Type your JEE question' },
  { id: 'photo',   icon: Camera,        label: 'Photo Doubt',    desc: 'Upload a problem image'  },
  { id: 'concept', icon: BookOpen,      label: 'Explain Concept',desc: 'Deep-dive any topic'     },
  { id: 'community', icon: Users,       label: 'Community',      desc: 'Ask our Warrior Groups'  },
];

const DEPTH_LABELS = [
  { value: 1, label: 'Simple (ELI5)'       },
  { value: 2, label: 'Basic (Class 11)'     },
  { value: 3, label: 'Intermediate'         },
  { value: 4, label: 'Advanced (Coaching)'  },
  { value: 5, label: 'JEE Level (Tricks)'   },
];

const QUICK_PROMPTS = [
  'Explain Newton\'s laws with JEE examples',
  'Derive the equation of motion for SHM',
  'What is the trick for organic reactions?',
  'Common integration tricks for JEE Maths',
  'How to solve circuit problems quickly?',
  'Explain Bayes theorem with an example',
];

const SUBJECTS = [
  { slug: 'physics',     label: 'Physics'     },
  { slug: 'chemistry',   label: 'Chemistry'   },
  { slug: 'mathematics', label: 'Mathematics' },
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-blue-600' : 'bg-gradient-to-br from-indigo-500 to-blue-600'
      }`}>
        {isUser ? <User size={13} className="text-white" /> : <Bot size={13} className="text-white" />}
      </div>
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {msg.imagePreview && (
          <img src={msg.imagePreview} alt="uploaded" className="rounded-lg mb-1.5 max-h-40 object-contain border border-gray-200" />
        )}
        <div className={`px-4 py-3 rounded-2xl text-[13px] ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          )}
          {!isUser && !msg.thinking && msg.role === 'assistant' && msg.content && (
            <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex items-center gap-3">
              <button 
                onClick={() => window.location.href = `/community?post=${encodeURIComponent(msg.content)}`}
                className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-2 py-1 rounded-md"
              >
                <Users size={10} /> Post to Community
              </button>
              <button 
                className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => window.dispatchEvent(new CustomEvent('escalate-doubt', { detail: msg }))}
              >
                <MessageSquare size={10} /> Not helpful? Ask Teacher
              </button>
            </div>
          )}
        </div>
        {msg.thinking && (
          <div className="flex items-center gap-1.5 mt-1 px-2">
            <Loader2 size={11} className="animate-spin text-gray-400" />
            <span className="text-[10px] text-gray-400">Solving step by step...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AITutorPage() {
  const { examType } = useJee();
  const [mode, setMode] = useState('text');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `**Hey! I'm your JEE AI Tutor** 🚀\n\nI can help you with:\n- **Physics, Chemistry, Mathematics** — any topic\n- **Step-by-step solutions** with detailed reasoning\n- **Photo doubts** — just upload a problem image\n- **Concept explanations** at 5 different depth levels\n- **JEE tricks & shortcuts** to save time in the exam\n\nWhat would you like to learn today?`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [conceptTopic, setConceptTopic] = useState('');
  const [conceptSubject, setConceptSubject] = useState('physics');
  const [conceptDepth, setConceptDepth] = useState(3);
  const [showQuick, setShowQuick] = useState(true);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMsg = (role, content, extra = {}) =>
    setMessages(prev => [...prev, { role, content, ...extra }]);

  const sendDoubt = async () => {
    if (!input.trim() && !imageFile) return;
    setShowQuick(false);
    const userContent = input.trim();
    const preview = imagePreview;
    addMsg('user', userContent || '(Image question)', { imagePreview: preview });
    setInput('');
    setImageFile(null);
    setImagePreview(null);
    setLoading(true);
    addMsg('assistant', '', { thinking: true });

    try {
      const payload = { doubt: userContent, subject: 'auto', exam_type: examType };
      if (imageFile) {
        const reader = new FileReader();
        const b64 = await new Promise(res => { reader.onload = e => res(e.target.result.split(',')[1]); reader.readAsDataURL(imageFile); });
        payload.image_base64 = b64;
        payload.image_mime = imageFile.type;
      }
      const r = await jeeAPI.solveDoubt(payload);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: r.data?.data?.solution || 'Sorry, I couldn\'t solve this. Please try rephrasing.' };
        return updated;
      });
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: 'Something went wrong. Please try again.' };
        return updated;
      });
    }
    setLoading(false);
  };

  const explainConcept = async () => {
    if (!conceptTopic.trim()) return;
    setShowQuick(false);
    addMsg('user', `Explain "${conceptTopic}" (${SUBJECTS.find(s=>s.slug===conceptSubject)?.label}, Level ${conceptDepth})`);
    setConceptTopic('');
    setLoading(true);
    addMsg('assistant', '', { thinking: true });

    try {
      const r = await jeeAPI.explainConcept({ topic: conceptTopic, subject: conceptSubject, depth: conceptDepth, exam_type: examType });
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: r.data?.data?.explanation || 'No explanation available.' };
        return updated;
      });
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: 'Something went wrong. Please try again.' };
        return updated;
      });
    }
    setLoading(false);
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    setMode('photo');
  };

  const { isElite } = useJeeAccess();

  useEffect(() => {
    const handler = async (e) => {
      const msg = e.detail;
      if (!isElite) {
        alert("Teacher Doubt Backup is an ELITE feature. Please upgrade to continue.");
        return;
      }
      if (confirm("Escalate this doubt to a human teacher for manual review?")) {
        try {
          await jeeAPI.escalateToTeacher({ 
            doubt_text: messages[messages.length - 2]?.content || "Unknown",
            ai_answer: msg.content,
            subject: 'auto'
          });
          alert("Doubt escalated! You will be notified when a teacher answers.");
        } catch (err) {
          alert("Failed to escalate: " + (err.response?.data?.message || err.message));
        }
      }
    };
    window.addEventListener('escalate-doubt', handler);
    return () => window.removeEventListener('escalate-doubt', handler);
  }, [messages, isElite]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendDoubt(); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] min-h-[400px]">
      {/* Mode tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
              mode === m.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            <m.icon size={12} /> {m.label}
          </button>
        ))}
      </div>

      {/* Concept explainer controls (shown above chat when concept mode) */}
      {mode === 'concept' && (
        <div className="bg-white rounded-xl border border-gray-100 p-3 mb-3 space-y-2.5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex gap-2 flex-wrap">
            {SUBJECTS.map(s => (
              <button key={s.slug} onClick={() => setConceptSubject(s.slug)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                  conceptSubject === s.slug ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>{s.label}</button>
            ))}
          </div>
          <input
            value={conceptTopic} onChange={e => setConceptTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && explainConcept()}
            placeholder="Enter topic (e.g. Rotational Kinetic Energy, Le Chatelier's Principle)"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500">Depth:</span>
              {DEPTH_LABELS.map(d => (
                <button key={d.value} onClick={() => setConceptDepth(d.value)}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                    conceptDepth === d.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>{d.value}</button>
              ))}
              <span className="text-[10px] text-gray-400">— {DEPTH_LABELS.find(d => d.value === conceptDepth)?.label}</span>
            </div>
            <button onClick={explainConcept} disabled={loading || !conceptTopic.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-[12px] font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50">
              <Sparkles size={12} /> Explain
            </button>
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-3 pr-0.5">
        {/* Quick prompts */}
        {showQuick && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUICK_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => { setInput(p); setMode('text'); textRef.current?.focus(); }}
                className="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-xl text-[12px] text-gray-600 hover:border-blue-200 hover:bg-blue-50 transition-all text-left"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                <Lightbulb size={13} className="text-amber-400 flex-shrink-0" />
                {p}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {(mode === 'text' || mode === 'photo') && (
        <div className="bg-white border border-gray-200 rounded-2xl p-3" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {imagePreview && (
            <div className="relative inline-block mb-2">
              <img src={imagePreview} alt="preview" className="h-20 rounded-lg border border-gray-200 object-contain" />
              <button onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <X size={10} className="text-white" />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              ref={textRef}
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={imageFile ? 'Describe the problem or ask a question about the image...' : 'Type your JEE doubt here (Press Enter to send)...'}
              rows={1}
              style={{ minHeight: 36, maxHeight: 120, resize: 'none', overflowY: 'auto' }}
              className="flex-1 text-[13px] outline-none text-gray-800 placeholder-gray-400 bg-transparent"
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
            />
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
              <button onClick={() => fileRef.current?.click()}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors" title="Upload image">
                <Upload size={16} className="text-gray-400" />
              </button>
              <button onClick={sendDoubt} disabled={loading || (!input.trim() && !imageFile)}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50">
                {loading ? <Loader2 size={16} className="text-white animate-spin" /> : <Send size={16} className="text-white" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
