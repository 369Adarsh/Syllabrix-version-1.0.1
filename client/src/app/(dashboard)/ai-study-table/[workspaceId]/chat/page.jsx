'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Send, User, Sparkles, Loader2, Mic, Volume2, VolumeX, SquareSquare } from 'lucide-react';
import { studyTableApi } from '@/lib/api/study-table.api';
import ReactMarkdown from 'react-markdown';

export default function WorkspaceChat() {
  const router = useRouter();
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your Syllabrix Study Copilot for this workspace. I've read all the uploaded sources. Ask me any question, test your knowledge, or paste a homework problem!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  // Voice features
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  
  useEffect(() => {
    // Initialize SpeechRecognition if available
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInput(currentTranscript);
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
    
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    fetchWorkspace();
  }, [workspaceId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchWorkspace = async () => {
    try {
      const res = await studyTableApi.getWorkspaceDetails(workspaceId);
      setWorkspace(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const stripMarkdown = (markdown) => {
    return markdown
      .replace(/[#*`_~[]()]/g, '')
      .replace(/\n+/g, ' ')
      .trim();
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window) || !voiceEnabled) return;
    
    window.speechSynthesis.cancel(); // Stop current
    
    const utterance = new SpeechSynthesisUtterance(stripMarkdown(text));
    
    // Attempt to pick a natural English voice
    const voices = window.speechSynthesis.getVoices();
    const humanVoice = voices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Samantha') || v.name.includes('Serena')) || voices.find(v => v.lang.startsWith('en'));
    
    if (humanVoice) utterance.voice = humanVoice;
    utterance.rate = 1.05; // Slightly faster for natural feel
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput(''); // clear input before talking
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    if (isListening) recognitionRef.current?.stop();
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const userMsg = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user', content: userMsg }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await studyTableApi.chat(workspaceId, { history: newHistory.slice(0, -1), message: userMsg });
      const reply = res.data.data.reply;
      setMessages([...newHistory, { role: 'assistant', content: reply }]);
      
      if (voiceEnabled) {
        speakText(reply);
      }
    } catch (err) {
      console.error(err);
      setMessages([...newHistory, { role: 'assistant', content: 'Sorry, I ran into an error trying to process that.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#F8FAFC]">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push(`/ai-study-table/${workspaceId}`)} className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 line-clamp-1">{workspace?.title || 'Loading...'} Copilot</h1>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <Sparkles size={12} /> Grounded in Sources
              {isSpeaking && <span className="flex items-center gap-1 ml-2 text-indigo-500"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" /><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" /><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" /> Speaking</span>}
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => {
            setVoiceEnabled(!voiceEnabled);
            if (voiceEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${voiceEnabled ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}
        >
          {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span className="hidden sm:inline">{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-4">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-inner'}`}>
                {m.role === 'user' ? <User size={20} /> : <Sparkles size={20} />}
              </div>
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 ${m.role === 'user' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-800 shadow-sm'}`}>
                {m.role === 'user' ? (
                  <p className="whitespace-pre-wrap font-medium">{m.content}</p>
                ) : (
                  <div className="prose prose-sm md:prose-base prose-slate max-w-none">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-inner shrink-0">
                <Sparkles size={20} />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm flex items-center gap-2 text-slate-500 font-medium tracking-wide">
                <Loader2 className="animate-spin" size={16} /> Thinking about {workspace?.title}...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="relative flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all shadow-inner">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder={isListening ? "Listening... Speak now." : "Ask a question, request a solution, or speak your doubt..."}
              className={`flex-1 max-h-48 min-h-[44px] bg-transparent border-none resize-none px-4 py-3 font-medium focus:ring-0 ${isListening ? 'text-indigo-600 placeholder:text-indigo-400' : 'text-slate-900 placeholder:text-slate-400'}`}
              rows={1}
            />
            <div className="flex gap-2 shrink-0 mb-1 mr-1">
              {recognitionRef.current && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white shadow-md shadow-red-200 animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
                >
                  <Mic size={20} />
                </button>
              )}
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-indigo-600 text-white rounded-xl w-12 h-12 flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-indigo-200"
              >
                <Send size={20} className={input.trim() && !loading ? 'translate-x-[1px] translate-y-[-1px]' : ''} />
              </button>
            </div>
          </form>
          <div className="text-center mt-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Responses are restricted to uploaded sources to prevent hallucinations.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
