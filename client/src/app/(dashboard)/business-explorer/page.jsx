'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { aiAPI } from '@/lib/api/ai.api';
import Link from 'next/link';
import {
  Store, TrendingUp, IndianRupee, Lightbulb, Loader2, Sparkles,
  ArrowRight, BarChart3, Globe, ShoppingCart, Briefcase, Target,
  CheckCircle, Star, Zap, Download
} from 'lucide-react';
import toast from 'react-hot-toast';

const MODULES = [
  { id: 'basics', emoji: '📚', title: 'Business Basics', desc: 'Supply, demand, profit, marketing fundamentals', color: 'from-blue-500 to-indigo-600' },
  { id: 'currency', emoji: '💰', title: 'Currency & Money', desc: 'How money works, exchange rates, banking, stocks', color: 'from-emerald-500 to-teal-600' },
  { id: 'shopkeeper', emoji: '🏪', title: 'Be a Shopkeeper', desc: 'Run a virtual shop — inventory, pricing, customers', color: 'from-amber-500 to-orange-600' },
  { id: 'startup', emoji: '🚀', title: 'Startup Simulator', desc: 'Build a startup from idea to funding', color: 'from-purple-500 to-fuchsia-600' },
  { id: 'ideas', emoji: '💡', title: 'Business Ideas', desc: 'AI generates unique business ideas for you', color: 'from-rose-500 to-pink-600' },
  { id: 'challenge', emoji: '🏆', title: 'Business Challenge', desc: '₹10,000 challenge — build the best business plan', color: 'from-cyan-500 to-blue-600' },
];

export default function BusinessExplorerPage() {
  const { user } = useAuth();
  const [activeModule, setActiveModule] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState(null);

  const loadModule = async (mod) => {
    setActiveModule(mod); setLoading(true); setContent(null);
    try {
      const classLevel = user?.class_name?.toString().replace(/\D/g, '') || '10';
      const prompt = mod.id === 'basics' ? `Explain business fundamentals for a Class ${classLevel} Indian student. Cover: what is business, supply & demand, profit & loss, marketing basics, types of businesses in India. Return JSON: { "title": "Business Basics", "sections": [{ "heading": "Topic", "content": "3-4 sentence explanation", "example": "Real Indian example", "key_term": "Important term — definition" }], "quiz": [{ "q": "Question?", "options": ["A","B","C","D"], "correct": 0 }], "activity": "A simple activity to try" }`
        : mod.id === 'currency' ? `Explain currency and money for a Class ${classLevel} Indian student. Cover: what is currency, Indian Rupee history, exchange rates, how banks work, basics of stock market, UPI/digital payments. Return JSON: { "title": "Currency & Money", "sections": [{ "heading": "Topic", "content": "explanation", "example": "Indian example", "fun_fact": "interesting fact" }], "quiz": [{ "q": "?", "options": ["A","B","C","D"], "correct": 0 }] }`
        : mod.id === 'shopkeeper' ? `Create a virtual shopkeeper simulation for a student. They have ₹50,000 to open a small shop. Return JSON: { "title": "Your Virtual Shop", "scenario": "You are opening a...", "starting_capital": 50000, "decisions": [{ "question": "What type of shop?", "options": [{ "choice": "Grocery Store", "cost": 30000, "monthly_revenue": 15000, "risk": "low" }, { "choice": "Mobile Accessories", "cost": 25000, "monthly_revenue": 20000, "risk": "medium" }] }], "tips": ["Tip 1"], "success_metrics": ["Monthly profit", "Customer satisfaction"] }`
        : mod.id === 'startup' ? `Create a startup simulation. Student has an idea and ₹1 lakh. Return JSON: { "title": "Startup Simulator", "stages": [{ "stage": "Idea Validation", "description": "...", "tasks": ["Task 1"], "outcome": "What happens" }], "funding_stages": [{ "stage": "Bootstrapping", "amount": "₹1-5 lakh", "how": "Personal savings" }], "indian_startup_examples": [{ "name": "Zerodha", "founder": "Nithin Kamath", "started_with": "₹..." }] }`
        : mod.id === 'ideas' ? `Generate 5 unique business ideas for a young Indian student. Include both online and offline ideas. Return JSON: { "ideas": [{ "name": "Business Name", "description": "What it does", "investment": "₹X", "monthly_potential": "₹X", "difficulty": "easy|medium|hard", "skills_needed": ["Skill 1"], "steps_to_start": ["Step 1"] }] }`
        : `Create a business challenge: "You have ₹10,000. Build the most profitable business in 30 days." Return JSON: { "title": "₹10,000 Business Challenge", "rules": ["Rule 1"], "phases": [{ "week": 1, "focus": "Planning", "tasks": ["Task 1"], "deliverable": "Business plan" }], "scoring": { "revenue": "40%", "creativity": "30%", "execution": "30%" }, "bonus_challenges": ["Extra challenge"] }`;

      const res = await aiAPI.buddyChat(`As a business education expert, ${prompt}. ONLY valid JSON.`, null, { class_level: classLevel });
      const reply = res.data?.data?.reply || res.data?.data;
      try {
        const parsed = JSON.parse(typeof reply === 'string' ? reply.replace(/```json|```/g, '').trim() : JSON.stringify(reply));
        setContent(parsed);
      } catch { setContent({ raw: reply }); }
    } catch { toast.error('Could not load module'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500/15 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute top-5 right-10 text-3xl">💰</div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0">
            <Store size={24} className="text-amber-200" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Business Explorer</h1>
            <p className="text-amber-200/70 text-sm mt-0.5">Learn business in the real world — currency, startups, challenges</p>
          </div>
        </div>
      </div>

      {!activeModule ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map(mod => (
            <button key={mod.id} onClick={() => loadModule(mod)}
              className="text-left bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all group">
              <span className="text-3xl block mb-3">{mod.emoji}</span>
              <h3 className="font-bold text-gray-800 text-sm group-hover:text-orange-600 transition-colors">{mod.title}</h3>
              <p className="text-[11px] text-gray-400 mt-1">{mod.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-[10px] font-semibold text-orange-500"><Zap size={10} /> Start Module</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={() => { setActiveModule(null); setContent(null); }}
            className="text-xs font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-1">← Back to modules</button>

          {loading ? (
            <div className="bg-white rounded-xl border border-gray-100 p-16 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-2xl">{activeModule.emoji}</span>
              </div>
              <p className="font-bold text-gray-700">AI is preparing your module...</p>
            </div>
          ) : content?.raw ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
              <h2 className="font-bold text-lg text-gray-800 mb-3">{activeModule.title}</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{content.raw}</p>
            </div>
          ) : content ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5 space-y-4">
              <h2 className="font-bold text-lg text-gray-800">{content.title || activeModule.title}</h2>

              {content.sections?.map((s, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h3 className="font-bold text-gray-800 text-sm mb-2">{s.heading}</h3>
                  <p className="text-[13px] text-gray-600 leading-relaxed">{s.content}</p>
                  {s.example && <p className="text-xs text-blue-600 mt-2 bg-blue-50 rounded-lg px-3 py-2">📌 {s.example}</p>}
                  {s.key_term && <p className="text-xs text-purple-600 mt-2 bg-purple-50 rounded-lg px-3 py-2">📖 {s.key_term}</p>}
                  {s.fun_fact && <p className="text-xs text-amber-600 mt-2 bg-amber-50 rounded-lg px-3 py-2">💡 {s.fun_fact}</p>}
                </div>
              ))}

              {content.ideas?.map((idea, i) => (
                <div key={i} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800 text-sm">{idea.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${idea.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' : idea.difficulty === 'hard' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{idea.difficulty}</span>
                  </div>
                  <p className="text-[12px] text-gray-600 mb-2">{idea.description}</p>
                  <div className="flex gap-3 text-[11px] text-gray-500">
                    <span>💰 {idea.investment}</span>
                    <span>📈 {idea.monthly_potential}/mo</span>
                  </div>
                  {idea.steps_to_start && (
                    <div className="mt-2 space-y-1">{idea.steps_to_start.map((s, j) => (
                      <p key={j} className="text-[11px] text-gray-500 flex items-start gap-1.5"><CheckCircle size={11} className="text-emerald-400 mt-0.5 flex-shrink-0" />{s}</p>
                    ))}</div>
                  )}
                </div>
              ))}

              {content.decisions?.map((d, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4">
                  <p className="font-bold text-sm text-gray-800 mb-3">{d.question}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {d.options?.map((o, j) => (
                      <div key={j} className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-amber-300 hover:bg-amber-50/30 cursor-pointer transition-all">
                        <p className="font-bold text-sm text-gray-800">{o.choice}</p>
                        <p className="text-[10px] text-gray-500">Cost: ₹{o.cost?.toLocaleString()} · Revenue: ₹{o.monthly_revenue?.toLocaleString()}/mo</p>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${o.risk === 'low' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{o.risk} risk</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {content.stages?.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">{i + 1}</div>
                    {i < content.stages.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <h3 className="font-bold text-sm text-gray-800">{s.stage}</h3>
                    <p className="text-[12px] text-gray-500 mt-1">{s.description}</p>
                    {s.tasks?.map((t, j) => <p key={j} className="text-[11px] text-gray-600 mt-1 flex items-start gap-1"><CheckCircle size={11} className="text-emerald-400 mt-0.5" />{t}</p>)}
                  </div>
                </div>
              ))}

              {content.phases?.map((p, i) => (
                <div key={i} className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200/50">
                  <div className="flex items-center gap-2 mb-2"><Target size={14} className="text-cyan-600" /><h3 className="font-bold text-sm text-gray-800">Week {p.week}: {p.focus}</h3></div>
                  {p.tasks?.map((t, j) => <p key={j} className="text-[11px] text-gray-600 ml-6 flex items-start gap-1"><CheckCircle size={11} className="text-cyan-400 mt-0.5" />{t}</p>)}
                  {p.deliverable && <p className="text-[10px] text-cyan-600 font-semibold mt-2 ml-6">📄 Deliverable: {p.deliverable}</p>}
                </div>
              ))}

              {content.quiz && (
                <div className="bg-purple-50/60 rounded-xl p-4 border border-purple-100/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500 mb-3">Quick Quiz</p>
                  {content.quiz.map((q, i) => (
                    <div key={i} className="mb-3">
                      <p className="text-sm font-semibold text-gray-800 mb-2">{q.q}</p>
                      <div className="grid grid-cols-2 gap-1.5">{q.options?.map((o, j) => (
                        <button key={j} className="px-3 py-2 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50 transition-all">{o}</button>
                      ))}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
