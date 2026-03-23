'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { aiAPI } from '@/lib/api/ai.api';
import Link from 'next/link';
import {
  Code, Play, Terminal, Send, Loader2, Sparkles, Copy, Download,
  Settings, ChevronRight, RotateCcw, Globe, CheckCircle, Zap, BookOpen, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { id: 'html', name: 'HTML/CSS/JS', ext: 'html', icon: '🌐', starter: '<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: sans-serif; text-align: center; padding: 40px; }\n    h1 { color: #4F46E5; }\n  </style>\n</head>\n<body>\n  <h1>Hello Syllabrix!</h1>\n  <p>Edit this code and click Run</p>\n  <script>\n    console.log("Welcome to Code Lab!");\n  </script>\n</body>\n</html>' },
  { id: 'javascript', name: 'JavaScript', ext: 'js', icon: '⚡', starter: '// Welcome to Syllabrix Code Lab!\n\nfunction greet(name) {\n  return `Hello, ${name}! Welcome to coding.`;\n}\n\nconsole.log(greet("Student"));\n\n// Try: loops, arrays, objects\nconst numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconsole.log("Doubled:", doubled);' },
  { id: 'python', name: 'Python', ext: 'py', icon: '🐍', starter: '# Welcome to Syllabrix Code Lab!\n\ndef greet(name):\n    return f"Hello, {name}! Welcome to coding."\n\nprint(greet("Student"))\n\n# Try: lists, loops, functions\nnumbers = [1, 2, 3, 4, 5]\ndoubled = [n * 2 for n in numbers]\nprint("Doubled:", doubled)' },
  { id: 'java', name: 'Java', ext: 'java', icon: '☕', starter: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello Syllabrix!");\n        \n        // Try: variables, loops, methods\n        for (int i = 1; i <= 5; i++) {\n            System.out.println("Count: " + i);\n        }\n    }\n}' },
  { id: 'cpp', name: 'C++', ext: 'cpp', icon: '⚙️', starter: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello Syllabrix!" << endl;\n    \n    // Try: variables, loops\n    for (int i = 1; i <= 5; i++) {\n        cout << "Count: " << i << endl;\n    }\n    return 0;\n}' },
];

const CHALLENGES = [
  { id: 1, title: 'Hello World', desc: 'Print "Hello, World!" in any language', difficulty: 'easy', lang: 'any' },
  { id: 2, title: 'Calculator', desc: 'Build a function that adds, subtracts, multiplies, divides', difficulty: 'easy', lang: 'any' },
  { id: 3, title: 'FizzBuzz', desc: 'Print 1-100, but multiples of 3="Fizz", 5="Buzz", both="FizzBuzz"', difficulty: 'medium', lang: 'any' },
  { id: 4, title: 'Palindrome Checker', desc: 'Check if a string reads the same forwards and backwards', difficulty: 'medium', lang: 'any' },
  { id: 5, title: 'Portfolio Page', desc: 'Create a personal portfolio webpage with HTML/CSS', difficulty: 'medium', lang: 'html' },
  { id: 6, title: 'Todo List', desc: 'Build an interactive todo list with add/delete', difficulty: 'hard', lang: 'html' },
  { id: 7, title: 'Sorting Algorithm', desc: 'Implement bubble sort and display each step', difficulty: 'hard', lang: 'any' },
  { id: 8, title: 'Weather Card', desc: 'Create a beautiful weather display card with CSS', difficulty: 'medium', lang: 'html' },
];

const DIFF_C = { easy: 'bg-emerald-100 text-emerald-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-red-100 text-red-700' };

export default function CodeLabPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('editor'); // editor | api-tester | challenges | learn
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].starter);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const iframeRef = useRef(null);

  // API Tester state
  const [apiUrl, setApiUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [apiMethod, setApiMethod] = useState('GET');
  const [apiHeaders, setApiHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [apiBody, setApiBody] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);

  const switchLanguage = (l) => { setLang(l); setCode(l.starter); setOutput(''); };

  // Run code — HTML runs in iframe, JS runs via eval, others show in output
  const runCode = () => {
    setRunning(true); setOutput('');
    try {
      if (lang.id === 'html') {
        if (iframeRef.current) {
          const doc = iframeRef.current.contentDocument;
          doc.open(); doc.write(code); doc.close();
          setOutput('✓ HTML rendered in preview below');
        }
      } else if (lang.id === 'javascript') {
        const logs = [];
        const fakeConsole = { log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')), error: (...args) => logs.push('ERROR: ' + args.join(' ')), warn: (...args) => logs.push('WARN: ' + args.join(' ')) };
        try {
          const fn = new Function('console', code);
          fn(fakeConsole);
          setOutput(logs.join('\n') || '(no output)');
        } catch (e) { setOutput('Error: ' + e.message); }
      } else {
        setOutput(`⚠ ${lang.name} execution requires a backend compiler.\n\nFor now, you can:\n• Write and practice code here\n• Ask AI to review your code\n• Copy and run in your local IDE\n\nTip: Use HTML/CSS/JS or JavaScript for instant execution!`);
      }
    } catch (e) { setOutput('Error: ' + e.message); }
    finally { setTimeout(() => setRunning(false), 300); }
  };

  // AI Code Helper
  const askAI = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
      const prompt = `You are a coding tutor on Syllabrix. The student is writing ${lang.name} code.\n\nTheir code:\n\`\`\`${lang.ext}\n${code}\n\`\`\`\n\nTheir question: "${aiQuery}"\n\nExplain clearly, give code examples. If they have a bug, fix it. Keep it simple for a student.`;
      const res = await aiAPI.buddyChat(prompt, null, {});
      setAiResponse(res.data?.data?.reply || res.data?.data || 'Could not get a response');
    } catch { setAiResponse('AI is busy, try again.'); }
    finally { setAiLoading(false); }
  };

  // API Tester
  const testAPI = async () => {
    setApiLoading(true); setApiResponse(null);
    try {
      let headers = {};
      try { headers = JSON.parse(apiHeaders); } catch {}
      const opts = { method: apiMethod, headers };
      if (['POST', 'PUT', 'PATCH'].includes(apiMethod) && apiBody.trim()) opts.body = apiBody;
      const start = Date.now();
      const res = await fetch(apiUrl, opts);
      const time = Date.now() - start;
      const text = await res.text();
      let json = null;
      try { json = JSON.parse(text); } catch {}
      setApiResponse({ status: res.status, statusText: res.statusText, time, headers: Object.fromEntries(res.headers), body: json || text });
    } catch (e) { setApiResponse({ status: 0, statusText: 'Error', body: e.message, time: 0 }); }
    finally { setApiLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-slate-900 to-gray-800 p-5">
        <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage:'radial-gradient(circle,#0f0 1px,transparent 1px)',backgroundSize:'16px 16px'}} />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-sm"><Code size={20} className="text-white" /></div>
          <div className="flex-1"><h1 className="text-lg font-extrabold text-white">Code Lab</h1>
          <p className="text-emerald-400/60 text-xs">Write, run, learn — AI-powered coding playground</p></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
        {[
          { k: 'editor', l: 'Code Editor', icon: Code },
          { k: 'api-tester', l: 'API Tester', icon: Globe },
          { k: 'challenges', l: 'Challenges', icon: Zap },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              tab === t.k ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}><t.icon size={13} /> {t.l}</button>
        ))}
      </div>

      {/* ═══ CODE EDITOR ═══ */}
      {tab === 'editor' && (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left — Editor */}
          <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
            {/* Language bar */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 border-b border-gray-700 overflow-x-auto">
              {LANGUAGES.map(l => (
                <button key={l.id} onClick={() => switchLanguage(l)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                    lang.id === l.id ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}>{l.icon} {l.name}</button>
              ))}
            </div>
            {/* Code area */}
            <div className="relative">
              <textarea value={code} onChange={e => setCode(e.target.value)}
                className="w-full min-h-[350px] bg-transparent text-emerald-300 font-mono text-sm p-4 resize-none focus:outline-none leading-relaxed"
                spellCheck={false} />
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={() => { navigator.clipboard.writeText(code); toast.success('Copied!'); }}
                  className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-400"><Copy size={12} /></button>
                <button onClick={() => setShowAI(!showAI)}
                  className={`p-1.5 rounded-lg ${showAI ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-400'}`}><Sparkles size={12} /></button>
              </div>
            </div>
            {/* Run button */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-t border-gray-700">
              <span className="text-[10px] text-gray-500 font-mono">{lang.name} · {code.split('\n').length} lines</span>
              <button onClick={runCode} disabled={running}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-all">
                {running ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} Run
              </button>
            </div>
          </div>

          {/* Right — Output + AI + Preview */}
          <div className="space-y-3">
            {/* Output */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              <div className="px-3 py-2 bg-gray-800 border-b border-gray-700 flex items-center gap-2">
                <Terminal size={12} className="text-gray-400" />
                <span className="text-[11px] font-mono text-gray-400">Output</span>
              </div>
              <pre className="p-4 text-sm text-gray-300 font-mono min-h-[120px] whitespace-pre-wrap overflow-auto max-h-[200px]">{output || 'Click "Run" to see output...'}</pre>
            </div>

            {/* HTML Preview */}
            {lang.id === 'html' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                  <Globe size={12} className="text-blue-500" />
                  <span className="text-[11px] font-medium text-gray-500">Preview</span>
                </div>
                <iframe ref={iframeRef} className="w-full bg-white" style={{ minHeight: '200px', border: 'none' }} sandbox="allow-scripts" title="preview" />
              </div>
            )}

            {/* AI Helper */}
            {showAI && (
              <div className="bg-purple-50/60 rounded-2xl border border-purple-100/50 p-4 space-y-3">
                <div className="flex items-center gap-2"><Sparkles size={14} className="text-purple-500" /><span className="text-xs font-bold text-purple-700">AI Code Tutor</span></div>
                <div className="flex gap-2">
                  <input value={aiQuery} onChange={e => setAiQuery(e.target.value)} placeholder="Ask anything... 'Fix my bug', 'Explain line 5', 'How do I add a button?'"
                    className="flex-1 px-3 py-2 bg-white border border-purple-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    onKeyDown={e => e.key === 'Enter' && askAI()} />
                  <button onClick={askAI} disabled={aiLoading}
                    className="px-3 py-2 rounded-xl bg-purple-600 text-white disabled:opacity-40"><Send size={14} /></button>
                </div>
                {aiLoading && <div className="text-center py-3"><Loader2 size={16} className="animate-spin text-purple-400 mx-auto" /></div>}
                {aiResponse && <div className="bg-white rounded-xl p-3 border border-purple-100 text-[13px] text-gray-700 whitespace-pre-wrap max-h-[200px] overflow-auto">{aiResponse}</div>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ API TESTER ═══ */}
      {tab === 'api-tester' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
            <div className="flex items-center gap-2 mb-4"><Globe size={16} className="text-blue-500" /><h2 className="font-bold text-gray-800 text-sm">API Tester</h2></div>
            <div className="flex gap-2 mb-3">
              <select value={apiMethod} onChange={e => setApiMethod(e.target.value)}
                className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-28">
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="https://api.example.com/endpoint"
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              <button onClick={testAPI} disabled={apiLoading}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                {apiLoading ? <Loader2 size={14} className="animate-spin" /> : 'Send'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Headers (JSON)</label>
                <textarea value={apiHeaders} onChange={e => setApiHeaders(e.target.value)} rows={3}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Body (JSON)</label>
                <textarea value={apiBody} onChange={e => setApiBody(e.target.value)} rows={3} placeholder='{ "key": "value" }'
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none" />
              </div>
            </div>
          </div>
          {apiResponse && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              <div className="px-4 py-2 bg-gray-800 flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${apiResponse.status >= 200 && apiResponse.status < 300 ? 'bg-emerald-600 text-white' : apiResponse.status >= 400 ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'}`}>{apiResponse.status} {apiResponse.statusText}</span>
                <span className="text-[10px] text-gray-400">{apiResponse.time}ms</span>
                <button onClick={() => { navigator.clipboard.writeText(typeof apiResponse.body === 'string' ? apiResponse.body : JSON.stringify(apiResponse.body, null, 2)); toast.success('Copied!'); }}
                  className="ml-auto p-1 rounded hover:bg-gray-700"><Copy size={12} className="text-gray-400" /></button>
              </div>
              <pre className="p-4 text-sm text-emerald-300 font-mono overflow-auto max-h-[300px] whitespace-pre-wrap">
                {typeof apiResponse.body === 'string' ? apiResponse.body : JSON.stringify(apiResponse.body, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ═══ CHALLENGES ═══ */}
      {tab === 'challenges' && (
        <div className="grid sm:grid-cols-2 gap-3">
          {CHALLENGES.map(c => (
            <button key={c.id} onClick={() => { setTab('editor'); if (c.lang !== 'any') switchLanguage(LANGUAGES.find(l => l.id === c.lang) || lang); toast(`Challenge: ${c.title}`); }}
              className="text-left bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-800 text-sm group-hover:text-emerald-600">#{c.id} {c.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${DIFF_C[c.difficulty]}`}>{c.difficulty}</span>
              </div>
              <p className="text-[11px] text-gray-400">{c.desc}</p>
              <p className="text-[10px] text-emerald-500 font-semibold mt-2 flex items-center gap-1"><Play size={10} /> Start Challenge</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
