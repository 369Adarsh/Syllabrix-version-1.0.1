'use client';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, Building2, Users, BarChart3, BookOpen, Shield, Sparkles,
  Target, TrendingUp, Award, CheckCircle, Zap, Globe, Brain, Video,
  Briefcase, GraduationCap, Layout, PieChart, Clock, Star, ChevronRight,
  Monitor, Layers, Settings, Lock, MessageCircle, LineChart
} from 'lucide-react';

const METRICS = [
  { num: '40%', label: 'Faster Onboarding', icon: Clock },
  { num: '3x', label: 'Employee Engagement', icon: TrendingUp },
  { num: '92%', label: 'Completion Rate', icon: Target },
  { num: '60%', label: 'Cost Reduction', icon: PieChart },
];

const MODULES = [
  {
    icon: BookOpen, title: 'Learning Paths',
    desc: 'Create role-specific learning journeys with AI-curated content. Auto-assign courses by department, seniority, or skill gap.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Brain, title: 'AI Skill Assessment',
    desc: 'Adaptive quizzes and simulations that identify skill gaps in real-time. AI generates personalized upskilling recommendations.',
    color: 'from-purple-500 to-violet-600',
  },
  {
    icon: Video, title: 'Live Training Studio',
    desc: 'Zoom-quality live sessions with screen sharing, whiteboard, and breakout rooms. Record and reuse for async learning.',
    color: 'from-rose-500 to-red-600',
  },
  {
    icon: BarChart3, title: 'Analytics Dashboard',
    desc: 'Track completion rates, engagement scores, skill progression, and ROI metrics. Export C-suite ready reports instantly.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Award, title: 'Certifications Engine',
    desc: 'Issue QR-verified certificates for internal courses. Employees build a verifiable Skills Passport.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Users, title: 'Team Collaboration',
    desc: 'Discussion forums, peer learning groups, and mentor matching. Build a culture of continuous learning.',
    color: 'from-cyan-500 to-blue-600',
  },
];

const INDUSTRIES = [
  { emoji: '🏦', name: 'Banking & Finance', focus: 'Compliance, Risk, SEBI/RBI regulations' },
  { emoji: '💊', name: 'Pharma & Healthcare', focus: 'GMP, FDA training, patient safety' },
  { emoji: '🏭', name: 'Manufacturing', focus: 'Safety protocols, quality assurance' },
  { emoji: '💻', name: 'IT & Technology', focus: 'Tech stacks, certifications, agile' },
  { emoji: '🛒', name: 'Retail & FMCG', focus: 'Product knowledge, customer service' },
  { emoji: '🏗️', name: 'Infrastructure', focus: 'Project management, compliance' },
];

const COMPARISON = [
  { feature: 'AI-Powered Skill Gap Analysis', us: true, others: false },
  { feature: 'Live Classes + Recording', us: true, others: true },
  { feature: '574+ Profession Simulations', us: true, others: false },
  { feature: 'QR-Verified Certificates', us: true, others: false },
  { feature: 'Built-in Analytics Dashboard', us: true, others: true },
  { feature: 'Mentor Matching System', us: true, others: false },
  { feature: 'Gamified Learning Paths', us: true, others: false },
  { feature: 'Content Moderation (15-Layer)', us: true, others: false },
];

export default function CorporateLandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed top-0 w-full z-50">
        <div className="mx-3 sm:mx-4 mt-3">
          <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-lg shadow-black/[0.04] border border-gray-100/50">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/images/logo/syllabrix-logo.png" alt="Syllabrix" width={160} height={45} className="h-9 w-auto object-contain" priority />
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase">Enterprise</span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <a href="#modules" className="hover:text-gray-900 transition-colors">Modules</a>
              <a href="#industries" className="hover:text-gray-900 transition-colors">Industries</a>
              <a href="#comparison" className="hover:text-gray-900 transition-colors">Why Us</a>
              <Link href="/" className="hover:text-gray-900 transition-colors">For Students</Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/corporate/sign-in" className="inline-flex px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all">Sign In</Link>
              <Link href="/corporate/sign-up" className="px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-200/40 hover:from-amber-600 transition-all flex items-center gap-1.5">
                Get Started Free <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-slate-900 to-amber-950" />
        <div className="absolute top-20 left-[10%] w-64 h-64 bg-amber-500/15 rounded-full blur-[80px]" />
        <div className="absolute bottom-20 right-[10%] w-80 h-80 bg-orange-600/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'24px 24px'}} />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-sm font-medium mb-6">
                <Building2 size={14} /> Syllabrix for Enterprise
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.1] tracking-tight">
                <span className="text-white">Transform Your</span><br />
                <span className="text-white">Workforce With</span><br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">AI-Powered L&D.</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-gray-400 leading-relaxed max-w-xl">
                The same AI engine that helps students discover their superpowers — now built for corporate training, compliance, upskilling, and leadership development. <strong className="text-gray-300">Enterprise-grade. India-first.</strong>
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/corporate/sign-up" className="px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:from-amber-600 transition-all flex items-center gap-2">
                  Start Free <ArrowRight size={15} />
                </Link>
                <Link href="/corporate/sign-in" className="px-6 py-3.5 rounded-xl text-sm font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all">
                  Sign In to Dashboard
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {METRICS.map((m, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                    <m.icon size={16} className="text-amber-400 mx-auto mb-1" />
                    <p className="text-2xl font-extrabold text-white">{m.num}</p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side — Enterprise visual */}
            <div className="hidden lg:block relative">
              <div className="relative w-full max-w-md mx-auto">
                <div className="absolute -top-4 -left-4 w-56 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 shadow-xl z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"><BarChart3 size={18} className="text-white" /></div>
                    <div><p className="text-white font-bold text-sm">Team Analytics</p><p className="text-gray-400 text-[10px]">Real-time dashboard</p></div>
                  </div>
                  <div className="flex gap-1">{[60,80,45,90,70].map((v,i)=><div key={i} className="flex-1 bg-amber-400/20 rounded-sm" style={{height: v*0.4}}><div className="bg-amber-400 rounded-sm" style={{height:'60%'}} /></div>)}</div>
                </div>

                <div className="absolute top-24 -right-6 w-52 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 shadow-xl z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"><Award size={18} className="text-white" /></div>
                    <div><p className="text-white font-bold text-sm">Certifications</p><p className="text-gray-400 text-[10px]">QR-verified</p></div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex -space-x-2">
                      {['bg-blue-500','bg-emerald-500','bg-purple-500'].map((c,i)=><div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-gray-900 flex items-center justify-center text-white text-[9px] font-bold`}>{['A','S','R'][i]}</div>)}
                    </div>
                    <span className="text-[10px] text-gray-400">+142 certified</span>
                  </div>
                </div>

                <div className="absolute top-52 left-4 w-60 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 shadow-xl z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"><Brain size={18} className="text-white" /></div>
                    <div><p className="text-white font-bold text-sm">AI Skill Engine</p><p className="text-gray-400 text-[10px]">Adaptive assessments</p></div>
                  </div>
                </div>

                <div className="absolute bottom-4 right-2 w-48 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 shadow-xl z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center"><Video size={18} className="text-white" /></div>
                    <div><p className="text-white font-bold text-sm">Live Training</p><p className="text-gray-400 text-[10px]">HD Broadcast</p></div>
                  </div>
                </div>

                <div className="w-full h-80 rounded-3xl bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-white/5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <section className="py-5 bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-100/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-gray-500 font-medium">
          <span className="flex items-center gap-1.5"><Shield size={16} className="text-emerald-500" /> SOC 2 Compliant</span>
          <span className="flex items-center gap-1.5"><Lock size={16} className="text-blue-500" /> Enterprise SSO</span>
          <span className="flex items-center gap-1.5"><Globe size={16} className="text-purple-500" /> Multi-Tenant Architecture</span>
          <span className="flex items-center gap-1.5"><Layers size={16} className="text-amber-500" /> API-First Platform</span>
          <span className="flex items-center gap-1.5"><Settings size={16} className="text-gray-500" /> White-Label Ready</span>
        </div>
      </section>

      {/* ═══ MODULES ═══ */}
      <section id="modules" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600 mb-3">Core Modules</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Everything Your L&D Team Needs</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">Six integrated modules that replace a dozen disconnected tools — all powered by Syllabrix AI.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map((m, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-4`}>
                  <m.icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-base mb-2">{m.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 mb-3">Implementation</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Live in 48 Hours. Not 48 Days.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Connect', desc: 'Integrate with your HRMS, SSO, and existing systems via our API', icon: Settings, color: 'from-blue-500 to-indigo-600' },
              { step: '02', title: 'Configure', desc: 'Set up departments, roles, learning paths, and compliance tracks', icon: Layout, color: 'from-purple-500 to-violet-600' },
              { step: '03', title: 'Launch', desc: 'Invite employees via bulk upload, SSO, or magic links', icon: Zap, color: 'from-amber-500 to-orange-600' },
              { step: '04', title: 'Scale', desc: 'Track ROI, iterate on content, and expand across the org', icon: LineChart, color: 'from-emerald-500 to-teal-600' },
            ].map((s, i) => (
              <div key={i} className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gray-900 text-white text-[10px] font-bold">{s.step}</div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mt-2 mb-4`}>
                  <s.icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-2">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ INDUSTRIES ═══ */}
      <section id="industries" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 mb-3">Industry Solutions</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Built For Every Industry</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">Pre-built compliance templates, role-specific paths, and industry knowledge bases.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INDUSTRIES.map((ind, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all group">
                <span className="text-3xl block mb-3">{ind.emoji}</span>
                <h3 className="font-bold text-gray-800 text-sm">{ind.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{ind.focus}</p>
                <div className="mt-3 flex items-center gap-1 text-[11px] text-amber-600 font-semibold group-hover:gap-2 transition-all">
                  See solutions <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMPARISON ═══ */}
      <section id="comparison" className="py-16 sm:py-20 bg-gradient-to-br from-slate-900 via-gray-900 to-amber-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'20px 20px'}} />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-3">Why Syllabrix</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">We&apos;re Not Just Another LMS</h2>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-0 px-6 py-3 border-b border-white/10">
              <p className="text-sm font-bold text-gray-400">Feature</p>
              <p className="text-sm font-bold text-amber-400 text-center">Syllabrix</p>
              <p className="text-sm font-bold text-gray-500 text-center">Others</p>
            </div>
            {COMPARISON.map((c, i) => (
              <div key={i} className={`grid grid-cols-3 gap-0 px-6 py-3 ${i < COMPARISON.length - 1 ? 'border-b border-white/5' : ''}`}>
                <p className="text-sm text-gray-300">{c.feature}</p>
                <p className="text-center">{c.us ? <CheckCircle size={18} className="text-emerald-400 inline" /> : <span className="text-gray-600">—</span>}</p>
                <p className="text-center">{c.others ? <CheckCircle size={18} className="text-gray-500 inline" /> : <span className="text-gray-600">—</span>}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONTACT / CTA ═══ */}
      <section id="contact" className="py-16 sm:py-20 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'16px 16px'}} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">Ready to Transform Your Corporate Training?</h2>
          <p className="text-orange-100/80 mb-8 max-w-lg mx-auto">Get a personalized demo for your organization. Our enterprise team will show you how Syllabrix can cut training costs by 60% while tripling engagement.</p>
          <div className="max-w-md mx-auto bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-4">
            <input placeholder="Work Email" className="w-full px-4 py-3 bg-white/20 border border-white/20 rounded-xl text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/30" />
            <input placeholder="Company Name" className="w-full px-4 py-3 bg-white/20 border border-white/20 rounded-xl text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/30" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Your Name" className="w-full px-4 py-3 bg-white/20 border border-white/20 rounded-xl text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/30" />
              <select className="w-full px-4 py-3 bg-white/20 border border-white/20 rounded-xl text-white/80 text-sm focus:outline-none appearance-none">
                <option value="">Team Size</option>
                <option value="10-50">10 – 50</option>
                <option value="50-200">50 – 200</option>
                <option value="200-1000">200 – 1,000</option>
                <option value="1000+">1,000+</option>
              </select>
            </div>
            <button className="w-full py-3.5 rounded-xl text-sm font-bold bg-white text-orange-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
              Book a Free Demo <ArrowRight size={15} />
            </button>
          </div>
          <p className="text-[11px] text-orange-200/60 mt-4">No credit card required · Setup in 48 hours · Cancel anytime</p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-gray-950 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <Image src="/images/logo/syllabrix-logo.png" alt="Syllabrix" width={140} height={40} className="h-8 w-auto brightness-200 mb-4" />
              <p className="text-sm text-gray-500 leading-relaxed">AI-powered corporate learning & development platform. Transform your workforce with intelligent upskilling.</p>
            </div>
            <div><h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Platform</h4><div className="space-y-2">{['Learning Paths','Skill Assessment','Live Training','Analytics','Certifications','Collaboration'].map(l=>(<p key={l} className="text-sm text-gray-500 hover:text-white cursor-pointer transition-colors">{l}</p>))}</div></div>
            <div><h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Industries</h4><div className="space-y-2">{['Banking','Healthcare','Manufacturing','Technology','Retail','Infrastructure'].map(l=>(<p key={l} className="text-sm text-gray-500 hover:text-white cursor-pointer transition-colors">{l}</p>))}</div></div>
            <div><h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Company</h4><div className="space-y-2">{['About Us','Privacy Policy','Terms of Service','Contact','Careers','For Students'].map(l=>(<p key={l} className="text-sm text-gray-500 hover:text-white cursor-pointer transition-colors">{l}</p>))}</div></div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">&copy; 2026 SyllabriX Network. All rights reserved.</p>
            <p className="text-xs text-gray-600">Enterprise Learning & Development Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
