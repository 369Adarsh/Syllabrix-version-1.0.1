'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import LD_API from '@/lib/api/ld.api';
import {
  Building2, Users, BookOpen, Brain, BarChart3, Target, Award, Zap,
  Sparkles, ChevronRight, ChevronDown, Plus, TrendingUp, GraduationCap, Shield,
  ArrowRight, Briefcase, PieChart, Settings, FileText, Video,
  Search, Bell, Layers, Clock, CheckCircle, Map, Lightbulb
} from 'lucide-react';

export default function CorporateDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [orgs, setOrgs] = useState([]);
  const [activeOrg, setActiveOrg] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', slug: '', industry: '', size_band: '51-200' });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadOrgs();
  }, []);

  const loadOrgs = async () => {
    try {
      const res = await LD_API.getMyOrgs();
      const orgList = res.data?.data || [];
      setOrgs(orgList);
      if (orgList.length > 0) {
        setActiveOrg(orgList[0]);
        const statsRes = await LD_API.getOrg(orgList[0].id);
        setStats(statsRes.data?.data?.stats);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    try {
      const res = await LD_API.createOrg(newOrg);
      setShowCreate(false);
      loadOrgs();
    } catch (e) { alert(e.response?.data?.error || 'Failed'); }
  };

  const QUICK_ACTIONS = [
    { icon: Brain, title: 'Skill Taxonomy', desc: 'Define roles & skills', href: '/corporate/skills', color: 'from-blue-500 to-indigo-600' },
    { icon: Sparkles, title: 'AI Content Studio', desc: 'Generate & Review content', href: '/corporate/studio', color: 'from-purple-500 to-violet-600' },
    { icon: Users, title: 'Manager Suite', desc: 'Team gaps & 1:1 Agendas', href: '/corporate/manager', color: 'from-cyan-500 to-blue-600' },
    { icon: Lightbulb, title: 'Knowledge Hub', desc: 'Tribal knowledge & tips', href: '/corporate/dashboard/knowledge', color: 'from-orange-500 to-amber-600' },
    { icon: Map, title: 'Career Pathing', desc: 'AI-generated growth roadmaps', href: '/corporate/skills?tab=career', color: 'from-emerald-500 to-teal-600' },
    { icon: TrendingUp, title: 'Impact & ROI', desc: 'L1-L4 Kirkpatrick Analytics', href: '/corporate/impact', color: 'from-rose-500 to-pink-600' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center"><div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-gray-500 text-sm">Loading workspace...</p></div>
    </div>
  );

  // No org yet — onboarding
  if (!activeOrg && !showCreate) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-amber-950 flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20">
          <Building2 size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-3">Welcome to Syllabrix L&D</h1>
        <p className="text-gray-400 mb-8">Create your organization workspace to start building AI-powered learning & development programs for your team.</p>
        <button onClick={() => setShowCreate(true)} className="px-8 py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:from-amber-600 transition-all flex items-center gap-2 mx-auto">
          <Plus size={16} /> Create Organization <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );

  // Create org form
  if (showCreate) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-amber-950 flex items-center justify-center p-6">
      <form onSubmit={handleCreateOrg} className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
        <h2 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2"><Building2 size={20} /> Create Organization</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 font-semibold mb-1 block">Organization Name</label>
            <input value={newOrg.name} onChange={e => setNewOrg({ ...newOrg, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })} placeholder="Acme Corporation" required className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-semibold mb-1 block">URL Slug</label>
            <input value={newOrg.slug} onChange={e => setNewOrg({ ...newOrg, slug: e.target.value })} placeholder="acme-corp" required className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1 block">Industry</label>
              <div className="relative">
                <select value={newOrg.industry} onChange={e => setNewOrg({ ...newOrg, industry: e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white/80 text-sm focus:outline-none appearance-none cursor-pointer">
                  <option value="" className="bg-[#1A1B23]">Select</option>
                  <option value="Technology" className="bg-[#1A1B23]">Technology</option>
                  <option value="Banking" className="bg-[#1A1B23]">Banking & Finance</option>
                  <option value="Healthcare" className="bg-[#1A1B23]">Healthcare</option>
                  <option value="Manufacturing" className="bg-[#1A1B23]">Manufacturing</option>
                  <option value="Retail" className="bg-[#1A1B23]">Retail</option>
                  <option value="Education" className="bg-[#1A1B23]">Education</option>
                  <option value="Consulting" className="bg-[#1A1B23]">Consulting</option>
                  <option value="Other" className="bg-[#1A1B23]">Other</option>
                </select>
                <ChevronDown className="absolute right-4 top-3.5 text-gray-500 pointer-events-none" size={16} />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1 block">Team Size</label>
              <div className="relative">
                <select value={newOrg.size_band} onChange={e => setNewOrg({ ...newOrg, size_band: e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white/80 text-sm focus:outline-none appearance-none cursor-pointer">
                  <option value="1-50" className="bg-[#1A1B23]">1 – 50</option>
                  <option value="51-200" className="bg-[#1A1B23]">51 – 200</option>
                  <option value="201-500" className="bg-[#1A1B23]">201 – 500</option>
                  <option value="501-1000" className="bg-[#1A1B23]">501 – 1,000</option>
                  <option value="1000+" className="bg-[#1A1B23]">1,000+</option>
                </select>
                <ChevronDown className="absolute right-4 top-3.5 text-gray-500 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold bg-white/10 border border-white/15 text-white hover:bg-white/20 transition-all">Cancel</button>
          <button type="submit" className="flex-1 px-4 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:from-amber-600 transition-all flex items-center justify-center gap-2">Create <ArrowRight size={14} /></button>
        </div>
      </form>
    </div>
  );

  // Main dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/images/logo/syllabrix-logo.png" alt="Syllabrix" width={130} height={36} className="h-8 w-auto object-contain" />
            </Link>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase">L&D</span>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-sm font-semibold text-gray-800">{activeOrg.name}</span>
          </div>
          <div className="flex items-center gap-3 relative">
            {showSearch && (
              <input 
                type="text" autoFocus 
                className="absolute right-full mr-4 w-64 px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 animate-in slide-in-from-right-2"
                placeholder="Search resources, employees..."
                onBlur={() => setShowSearch(false)}
              />
            )}
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Search size={16} className="text-gray-500" />
            </button>
            
            <button 
              onClick={() => toast('No new notifications', { icon: '🔔' })}
              className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Bell size={16} className="text-gray-500" />
            </button>
            
            <button 
              onClick={() => toast.success('Settings page coming soon!')}
              className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Settings size={16} className="text-gray-500" />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-transparent hover:ring-amber-200 transition-all"
              >
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-150 z-50">
                   <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Signed in as</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.full_name || user?.username}</p>
                   </div>
                   <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                     <Users size={14}/> Team Profile
                   </button>
                   <button 
                    onClick={() => {
                        logout();
                        router.push('/login');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold"
                   >
                     Logout
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-slate-800 to-amber-900 p-8 mb-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10">
            <h1 className="text-2xl font-extrabold text-white mb-2">
              Welcome back, {user?.username || 'Admin'} 👋
            </h1>
            <p className="text-gray-400 text-sm mb-6 max-w-xl">Your L&D command center. Build skill taxonomies, generate courses with AI, and track learning impact across your organization.</p>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Team Members', value: stats?.members || 0, icon: Users, color: 'text-blue-400' },
                { label: 'Job Roles', value: stats?.roles || 0, icon: Briefcase, color: 'text-purple-400' },
                { label: 'Skills Mapped', value: stats?.skills || 0, icon: Target, color: 'text-amber-400' },
                { label: 'Programs', value: stats?.programs || 0, icon: BookOpen, color: 'text-emerald-400' },
              ].map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <s.icon size={16} className={`${s.color} mb-2`} />
                  <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Zap size={18} className="text-amber-500" /> Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {QUICK_ACTIONS.map((a, i) => (
            <Link key={i} href={`${a.href}${a.href.includes('?') ? '&' : '?'}orgId=${activeOrg.id}`} className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-3`}>
                <a.icon size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">{a.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{a.desc}</p>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-amber-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ChevronRight size={12} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* Getting Started Guide */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Layers size={18} className="text-indigo-500" /> Getting Started</h2>
          <div className="space-y-3">
            {[
              { step: 1, title: 'Define Your Skill Taxonomy', desc: 'Import job descriptions and let AI extract required skills for each role', done: (stats?.skills || 0) > 0, href: '/corporate/skills' },
              { step: 2, title: 'Build Learning Programs', desc: 'Use AI Content Studio to generate courses from skill gaps in under 60 seconds', done: (stats?.programs || 0) > 0, href: '/corporate/studio' },
              { step: 3, title: 'Enroll Your Team', desc: 'Add team members and assign them to learning paths', done: (stats?.members || 0) > 1, href: '/corporate/skills?tab=members' },
              { step: 4, title: 'Track Impact & ROI', desc: 'Monitor skill growth, completion rates, and business impact KPIs', done: false, href: '/corporate/learn' },
            ].map((s, i) => (
              <Link key={i} href={`${s.href}?orgId=${activeOrg.id}`} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.done ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400 group-hover:bg-amber-100 group-hover:text-amber-600'} transition-colors`}>
                  {s.done ? <CheckCircle size={18} /> : <span className="text-sm font-bold">{s.step}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${s.done ? 'text-emerald-700' : 'text-gray-800'}`}>{s.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-amber-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
