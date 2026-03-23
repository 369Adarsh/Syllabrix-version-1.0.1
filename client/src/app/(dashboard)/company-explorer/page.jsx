'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { aiAPI } from '@/lib/api/ai.api';
import Link from 'next/link';
import {
  Building2, Search, Loader2, Sparkles, ArrowLeft, Globe, Users,
  TrendingUp, Target, Lightbulb, BarChart3, Briefcase, Star, ChevronRight,
  DollarSign, Award, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const TOP_COMPANIES = [
  { name: 'Reliance Industries', emoji: '🛢️', sector: 'Conglomerate', hq: 'Mumbai' },
  { name: 'Tata Consultancy Services', emoji: '💻', sector: 'IT Services', hq: 'Mumbai' },
  { name: 'Infosys', emoji: '🖥️', sector: 'IT Services', hq: 'Bengaluru' },
  { name: 'HDFC Bank', emoji: '🏦', sector: 'Banking', hq: 'Mumbai' },
  { name: 'Wipro', emoji: '💡', sector: 'IT/Consulting', hq: 'Bengaluru' },
  { name: 'ISRO', emoji: '🚀', sector: 'Space Agency', hq: 'Bengaluru' },
  { name: 'Google India', emoji: '🔍', sector: 'Technology', hq: 'Hyderabad' },
  { name: 'Apple', emoji: '🍎', sector: 'Technology', hq: 'Cupertino, USA' },
  { name: 'Microsoft', emoji: '🪟', sector: 'Technology', hq: 'Redmond, USA' },
  { name: 'Amazon India', emoji: '📦', sector: 'E-Commerce', hq: 'Bengaluru' },
  { name: 'Flipkart', emoji: '🛒', sector: 'E-Commerce', hq: 'Bengaluru' },
  { name: 'Zomato', emoji: '🍕', sector: 'Food Tech', hq: 'Gurugram' },
  { name: 'Ola', emoji: '🚗', sector: 'Mobility', hq: 'Bengaluru' },
  { name: 'Adani Group', emoji: '⚡', sector: 'Conglomerate', hq: 'Ahmedabad' },
  { name: 'Mahindra Group', emoji: '🚜', sector: 'Auto/Conglomerate', hq: 'Mumbai' },
  { name: 'Bajaj Finance', emoji: '💳', sector: 'Finance', hq: 'Pune' },
  { name: 'ITC Limited', emoji: '🏨', sector: 'FMCG/Hotels', hq: 'Kolkata' },
  { name: 'Larsen & Toubro', emoji: '🏗️', sector: 'Engineering', hq: 'Mumbai' },
  { name: 'State Bank of India', emoji: '🏛️', sector: 'Banking', hq: 'Mumbai' },
  { name: 'Tesla', emoji: '🔋', sector: 'EV/Energy', hq: 'Austin, USA' },
];

const DEPARTMENTS = ['Engineering', 'Marketing', 'Finance', 'HR', 'Operations', 'R&D', 'Sales', 'Legal', 'Design', 'Data Science'];

export default function CompanyExplorerPage() {
  const { user } = useAuth();
  const [view, setView] = useState('list'); // list | company | department | challenge
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [deptData, setDeptData] = useState(null);
  const [challengeData, setChallengeData] = useState(null);
  const [solution, setSolution] = useState('');
  const [solutionFeedback, setSolutionFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const exploreCompany = async (company) => {
    setSelectedCompany(company); setLoading(true); setView('company');
    try {
      const prompt = `Provide a detailed business profile of "${company.name}" for an Indian student exploring careers. Return ONLY JSON:
{
  "name": "${company.name}",
  "overview": "3-4 sentence company overview",
  "founded": "Year",
  "founder": "Founder name",
  "headquarters": "${company.hq}",
  "revenue": "Annual revenue (latest)",
  "employees": "Employee count",
  "ceo": "Current CEO name",
  "business_model": "How they make money (2-3 sentences)",
  "departments": [
    { "name": "Engineering", "role": "What this dept does", "team_size": "Approx", "key_skills": ["Skill 1"] },
    { "name": "Marketing", "role": "...", "team_size": "...", "key_skills": ["..."] }
  ],
  "culture": "Company culture in 2-3 sentences",
  "career_entry": "How a fresher can join this company",
  "avg_salary_india": { "fresher": "₹X LPA", "mid": "₹X LPA", "senior": "₹X LPA" },
  "interview_process": ["Step 1", "Step 2", "Step 3"],
  "current_challenges": [
    { "challenge": "A real challenge they face", "context": "Why it matters" }
  ],
  "recent_news": ["Recent development 1", "Recent development 2"],
  "fun_fact": "One interesting fact about the company",
  "student_tip": "One tip for a student who wants to work here"
}
Be accurate with real data. ONLY valid JSON.`;

      const res = await aiAPI.buddyChat(prompt, null, {});
      const reply = res.data?.data?.reply || res.data?.data;
      try { setCompanyData(JSON.parse(typeof reply === 'string' ? reply.replace(/```json|```/g, '').trim() : JSON.stringify(reply))); }
      catch { setCompanyData({ raw: reply }); }
    } catch { toast.error('Could not load company data'); }
    finally { setLoading(false); }
  };

  const exploreDepartment = async (dept) => {
    setLoading(true);
    try {
      const prompt = `Explain the "${dept}" department at "${selectedCompany.name}" for a student. What do they do daily, what skills are needed, career path, salary range in India. Return JSON with: title, overview, daily_tasks, skills, career_path, salary, how_to_prepare. ONLY valid JSON.`;
      const res = await aiAPI.buddyChat(prompt, null, {});
      const reply = res.data?.data?.reply || res.data?.data;
      try { setDeptData(JSON.parse(typeof reply === 'string' ? reply.replace(/```json|```/g, '').trim() : JSON.stringify(reply))); }
      catch { setDeptData({ raw: reply }); }
      setView('department');
    } catch { toast.error('Could not load'); }
    finally { setLoading(false); }
  };

  const loadChallenge = async (challenge) => {
    setLoading(true); setSolutionFeedback(null); setSolution('');
    try {
      const prompt = `Expand this business challenge for "${selectedCompany.name}": "${challenge.challenge}". Provide context, what a good solution looks like, evaluation criteria. Return JSON with: challenge, context, constraints, evaluation_criteria, hints, example_approach. ONLY valid JSON.`;
      const res = await aiAPI.buddyChat(prompt, null, {});
      const reply = res.data?.data?.reply || res.data?.data;
      try { setChallengeData(JSON.parse(typeof reply === 'string' ? reply.replace(/```json|```/g, '').trim() : JSON.stringify(reply))); }
      catch { setChallengeData({ raw: reply, challenge: challenge.challenge }); }
      setView('challenge');
    } catch { toast.error('Could not load'); }
    finally { setLoading(false); }
  };

  const submitSolution = async () => {
    if (!solution.trim()) { toast.error('Write your solution'); return; }
    setLoading(true);
    try {
      const prompt = `A student submitted this solution for the "${selectedCompany.name}" challenge: "${challengeData?.challenge || ''}". Their solution: "${solution}". Evaluate it and give feedback. Return JSON: { "score": 1-100, "grade": "A/B/C/D", "strengths": ["..."], "weaknesses": ["..."], "improved_version": "How to make it better", "ceo_would_say": "What the CEO might think about this" }. ONLY valid JSON.`;
      const res = await aiAPI.buddyChat(prompt, null, {});
      const reply = res.data?.data?.reply || res.data?.data;
      try { setSolutionFeedback(JSON.parse(typeof reply === 'string' ? reply.replace(/```json|```/g, '').trim() : JSON.stringify(reply))); }
      catch { setSolutionFeedback({ raw: reply }); }
    } catch { toast.error('Could not evaluate'); }
    finally { setLoading(false); }
  };

  const filtered = searchQuery ? TOP_COMPANIES.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.sector.toLowerCase().includes(searchQuery.toLowerCase())) : TOP_COMPANIES;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 p-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute top-5 right-10 text-3xl">🏢</div>
        <div className="relative z-10 flex items-start gap-4">
          {view !== 'list' && <button onClick={() => { setView('list'); setCompanyData(null); setDeptData(null); setChallengeData(null); }} className="p-2 rounded-lg bg-white/10 hover:bg-white/20"><ArrowLeft size={16} className="text-white" /></button>}
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0"><Building2 size={24} className="text-blue-300" /></div>
          <div><h1 className="text-xl font-extrabold text-white tracking-tight">Fortune 500 Explorer</h1>
          <p className="text-blue-300/70 text-sm mt-0.5">Explore top companies — departments, strategy, challenges, give solutions</p></div>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center shadow-sm">
          <Loader2 size={28} className="animate-spin text-blue-500 mx-auto mb-3" />
          <p className="font-bold text-gray-700">AI is researching...</p>
        </div>
      )}

      {/* ═══ COMPANY LIST ═══ */}
      {view === 'list' && !loading && (
        <>
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search companies..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filtered.map((c, i) => (
              <button key={i} onClick={() => exploreCompany(c)}
                className="text-left bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                <span className="text-2xl block mb-2">{c.emoji}</span>
                <h3 className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">{c.name}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">{c.sector} · {c.hq}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ═══ COMPANY PROFILE ═══ */}
      {view === 'company' && !loading && companyData && (
        <div className="space-y-4">
          {companyData.raw ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{companyData.raw}</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{selectedCompany?.emoji}</span>
                  <div><h2 className="font-bold text-lg text-gray-800">{companyData.name}</h2>
                  <p className="text-xs text-gray-400">{companyData.headquarters} · Founded {companyData.founded} · CEO: {companyData.ceo}</p></div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{companyData.overview}</p>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-blue-50 rounded-xl p-3 text-center"><p className="text-xs font-bold text-blue-600">{companyData.revenue}</p><p className="text-[9px] text-gray-400">Revenue</p></div>
                  <div className="bg-emerald-50 rounded-xl p-3 text-center"><p className="text-xs font-bold text-emerald-600">{companyData.employees}</p><p className="text-[9px] text-gray-400">Employees</p></div>
                  <div className="bg-purple-50 rounded-xl p-3 text-center"><p className="text-xs font-bold text-purple-600">{companyData.founder}</p><p className="text-[9px] text-gray-400">Founder</p></div>
                </div>
              </div>

              {/* Departments */}
              {companyData.departments?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Explore Departments</p>
                  <div className="grid sm:grid-cols-2 gap-2">{companyData.departments.map((d, i) => (
                    <button key={i} onClick={() => exploreDepartment(d.name)}
                      className="text-left bg-gray-50 rounded-xl p-3 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                      <h4 className="font-bold text-sm text-gray-800 group-hover:text-blue-600">{d.name}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{d.role}</p>
                    </button>
                  ))}</div>
                </div>
              )}

              {/* Challenges — give solutions */}
              {companyData.current_challenges?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3 flex items-center gap-1.5"><Target size={11} className="text-red-500" /> Current Challenges — Give Your Solution!</p>
                  <div className="space-y-2">{companyData.current_challenges.map((c, i) => (
                    <button key={i} onClick={() => loadChallenge(c)}
                      className="w-full text-left bg-red-50/50 rounded-xl p-4 border border-red-100/50 hover:border-red-300 transition-all group">
                      <h4 className="font-bold text-sm text-gray-800 group-hover:text-red-600">{c.challenge}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{c.context}</p>
                      <span className="text-[10px] font-semibold text-red-500 mt-2 flex items-center gap-1"><Lightbulb size={10} /> Submit your solution →</span>
                    </button>
                  ))}</div>
                </div>
              )}

              {/* Career entry + Salary */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-2">How to Join</p>
                  <p className="text-[12px] text-gray-700">{companyData.career_entry}</p>
                  {companyData.interview_process && (
                    <div className="mt-2 space-y-1">{companyData.interview_process.map((s, i) => (
                      <p key={i} className="text-[11px] text-gray-600 flex items-start gap-1"><span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-700 text-[8px] font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>{s}</p>
                    ))}</div>
                  )}
                </div>
                {companyData.avg_salary_india && (
                  <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-2">Salary (India)</p>
                    <div className="space-y-2">
                      {Object.entries(companyData.avg_salary_india).map(([k, v]) => (
                        <div key={k} className="flex justify-between"><span className="text-xs text-gray-500 capitalize">{k}</span><span className="text-xs font-bold text-gray-800">{v}</span></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {companyData.student_tip && (
                <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-100/50">
                  <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1.5"><Lightbulb size={12} /> <strong>Pro Tip:</strong> {companyData.student_tip}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ═══ DEPARTMENT VIEW ═══ */}
      {view === 'department' && !loading && deptData && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5 space-y-3">
          {deptData.raw ? <p className="text-sm text-gray-600 whitespace-pre-wrap">{deptData.raw}</p> : (
            <>
              <h2 className="font-bold text-lg text-gray-800">{deptData.title || 'Department'}</h2>
              <p className="text-sm text-gray-600">{deptData.overview}</p>
              {deptData.daily_tasks && <div><p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Daily Tasks</p>{deptData.daily_tasks.map((t,i)=><p key={i} className="text-[12px] text-gray-600 mb-1 flex items-start gap-1"><CheckCircle size={12} className="text-blue-400 mt-0.5 flex-shrink-0"/>{typeof t==='string'?t:t.task||JSON.stringify(t)}</p>)}</div>}
              <button onClick={() => setView('company')} className="text-xs font-semibold text-blue-600 hover:text-blue-700">← Back to company</button>
            </>
          )}
        </div>
      )}

      {/* ═══ CHALLENGE VIEW ═══ */}
      {view === 'challenge' && !loading && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
            <h2 className="font-bold text-lg text-gray-800 mb-2">{challengeData?.challenge || 'Challenge'}</h2>
            <p className="text-sm text-gray-600 mb-4">{challengeData?.context || ''}</p>
            {challengeData?.hints && <div className="bg-amber-50 rounded-lg p-3 mb-4">{challengeData.hints.map((h,i)=><p key={i} className="text-[11px] text-amber-700">💡 {typeof h === 'string' ? h : JSON.stringify(h)}</p>)}</div>}
            <textarea value={solution} onChange={e => setSolution(e.target.value)} rows={5}
              placeholder="Write your solution here... Be creative, specific, and practical!"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            <button onClick={submitSolution} disabled={loading || !solution.trim()}
              className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md disabled:opacity-50">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Submit Solution for AI Review
            </button>
          </div>

          {solutionFeedback && (
            <div className={`rounded-2xl p-5 border ${(solutionFeedback.score||0) >= 70 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              {solutionFeedback.raw ? <p className="text-sm text-gray-700 whitespace-pre-wrap">{solutionFeedback.raw}</p> : (
                <>
                  <div className="text-center mb-4">
                    <p className="text-3xl font-extrabold text-gray-900">{solutionFeedback.score}/100</p>
                    <p className="text-sm font-bold text-gray-600">Grade: {solutionFeedback.grade}</p>
                  </div>
                  {solutionFeedback.strengths?.map((s,i) => <p key={i} className="text-[12px] text-emerald-600 flex items-start gap-1 mb-1"><Star size={12} className="mt-0.5" />{s}</p>)}
                  {solutionFeedback.weaknesses?.map((s,i) => <p key={i} className="text-[12px] text-amber-600 flex items-start gap-1 mb-1"><Target size={12} className="mt-0.5" />{s}</p>)}
                  {solutionFeedback.ceo_would_say && <p className="text-xs text-blue-600 mt-3 bg-blue-50 rounded-lg px-3 py-2">🎯 CEO says: &ldquo;{solutionFeedback.ceo_would_say}&rdquo;</p>}
                </>
              )}
            </div>
          )}
          <button onClick={() => setView('company')} className="text-xs font-semibold text-blue-600 hover:text-blue-700">← Back to company</button>
        </div>
      )}
    </div>
  );
}
