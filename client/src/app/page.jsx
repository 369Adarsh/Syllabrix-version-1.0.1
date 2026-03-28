'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Brain, FlaskConical, GraduationCap, Shield, Users, Sparkles, BookOpen, Map, Play, Star, Zap, Globe, Award, Heart, CheckCircle, Gamepad2, Newspaper, MessageCircle, TrendingUp, Target, Mic, UserCheck } from 'lucide-react';

const STATS = [
  { num: '30+', label: 'AI Features' },
  { num: '574+', label: 'Professions' },
  { num: '15+', label: 'Games' },
  { num: '54', label: 'News Sources' },
];

const PILLARS = [
  { icon: Users, name: 'Connect', desc: 'Social feed, groups, messaging — safe space to learn together', color: 'from-blue-500 to-blue-600' },
  { icon: BookOpen, name: 'Learn', desc: 'Live classes, virtual labs, AI tutor, doubt solving', color: 'from-emerald-500 to-teal-600' },
  { icon: Gamepad2, name: 'Play', desc: '15 educational games + micro-learning clips', color: 'from-purple-500 to-fuchsia-600' },
  { icon: FlaskConical, name: 'Experience', desc: '574+ profession simulations — doctor to shopkeeper', color: 'from-amber-500 to-orange-600' },
  { icon: GraduationCap, name: 'Prepare', desc: 'AI newsroom, daily quizzes, exam prep hub', color: 'from-rose-500 to-red-600' },
  { icon: Brain, name: 'AI Powered', desc: 'Mind maps, career explorer, mock interviews, debates', color: 'from-indigo-500 to-violet-600' },
  { icon: Award, name: 'Grow', desc: 'Certificates, Skills Passport, Score, leaderboards', color: 'from-cyan-500 to-blue-600' },
];

const FEATURES = [
  { emoji: '🧪', title: 'Virtual Science Lab', desc: 'Chemistry, Physics, Biology, Math experiments — safe and virtual' },
  { emoji: '🎤', title: 'AI Mock Interview', desc: 'Practice UPSC, Banking, Campus, SSB interviews with real-time feedback' },
  { emoji: '🗣️', title: 'AI Debate Arena', desc: 'Sharpen arguments, prepare for GD rounds, get scored instantly' },
  { emoji: '🗺️', title: 'AI Mind Maps', desc: 'Visual mind maps for any topic — NCERT-aligned, exam-ready' },
  { emoji: '📰', title: 'Smart Newsroom', desc: '54 verified sources, AI summaries, exam-relevant current affairs' },
  { emoji: '🎮', title: 'Educational Arcade', desc: 'Math Sprint, Memory Matrix, Quiz Rush, Word Wizard + more' },
  { emoji: '🎓', title: 'Career Explorer', desc: 'Aptitude test, parent-child alignment, full career roadmaps' },
  { emoji: '📜', title: 'Skills Passport', desc: 'QR-verified certificates for admissions and scholarships' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed top-0 w-full z-50">
        <div className="mx-3 sm:mx-4 mt-3">
          <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-lg shadow-black/[0.04] border border-gray-100/50">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/images/logo/syllabrix-logo.png" alt="Syllabrix" width={160} height={45} className="h-9 w-auto object-contain" priority />
            </Link>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <a href="#features" className="hover:text-blue-700 transition-colors">Features</a>
              <a href="#pillars" className="hover:text-blue-700 transition-colors">Platform</a>
              <a href="#mentors" className="hover:text-blue-700 transition-colors">Mentors</a>
              <a href="#who" className="hover:text-blue-700 transition-colors">Who It&apos;s For</a>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/sign-in" className="inline-flex px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all">Sign In</Link>
              <Link href="/sign-up" className="px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200/40 hover:from-blue-700 transition-all flex items-center gap-1.5">
                Get Started <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══ HERO — with right side visual ═══ */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950" />
        <div className="absolute top-20 left-[10%] w-64 h-64 bg-cyan-500/15 rounded-full blur-[80px]" />
        <div className="absolute bottom-20 right-[10%] w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'24px 24px'}} />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-cyan-300 text-sm font-medium mb-6">
                <Sparkles size={14} className="animate-pulse" /> India&apos;s First Complete Education Ecosystem
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
                <span className="text-white">Where Every Child</span><br />
                <span className="text-white">Discovers Their</span><br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Superpower.</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-blue-200/70 leading-relaxed max-w-xl">
                The platform where a 7-year-old plays math games, a 15-year-old practices mock interviews, and a parent watches it all from a safety dashboard. <strong className="text-blue-200">Free to start. Built for India.</strong>
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/sign-up" className="px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:from-cyan-600 transition-all flex items-center gap-2">
                  Start Free <ArrowRight size={15} />
                </Link>
                <a href="#features" className="px-6 py-3.5 rounded-xl text-sm font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all">
                  Explore Features
                </a>
              </div>
              <div className="mt-10 flex flex-wrap gap-6 sm:gap-10">
                {STATS.map((s, i) => (
                  <div key={i}><p className="text-2xl sm:text-3xl font-extrabold text-white">{s.num}</p><p className="text-xs text-blue-300/50 font-medium uppercase tracking-wider">{s.label}</p></div>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE — Feature showcase cards */}
            <div className="hidden lg:block relative">
              <div className="relative w-full max-w-md mx-auto">
                {/* Floating cards */}
                <div className="absolute -top-4 -left-4 w-56 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 shadow-xl animate-float z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center"><Brain size={18} className="text-white" /></div>
                    <div><p className="text-white font-bold text-sm">AI Mind Map</p><p className="text-blue-300/50 text-[10px]">Any topic → visual map</p></div>
                  </div>
                  <div className="flex gap-1">{[1,2,3,4,5].map(i=><div key={i} className="flex-1 h-1 rounded-full bg-purple-400/40" />)}</div>
                </div>

                <div className="absolute top-24 -right-6 w-52 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 shadow-xl z-10" style={{animationDelay:'0.5s'}}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"><FlaskConical size={18} className="text-white" /></div>
                    <div><p className="text-white font-bold text-sm">Virtual Lab</p><p className="text-blue-300/50 text-[10px]">Safe experiments</p></div>
                  </div>
                  <div className="flex gap-1">{[1,2,3].map(i=><div key={i} className="w-8 h-8 rounded-lg bg-emerald-400/20" />)}</div>
                </div>

                <div className="absolute top-52 left-4 w-60 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 shadow-xl z-10" style={{animationDelay:'1s'}}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"><Gamepad2 size={18} className="text-white" /></div>
                    <div><p className="text-white font-bold text-sm">15 Games</p><p className="text-blue-300/50 text-[10px]">Math, Logic, Language, GK</p></div>
                  </div>
                </div>

                <div className="absolute bottom-4 right-2 w-48 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 shadow-xl z-10" style={{animationDelay:'1.5s'}}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center"><Award size={18} className="text-white" /></div>
                    <div><p className="text-white font-bold text-sm">Certificates</p><p className="text-blue-300/50 text-[10px]">QR-verified</p></div>
                  </div>
                </div>

                {/* Central glow */}
                <div className="w-full h-80 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUST BAR — no AI names ═══ */}
      <section className="py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-y border-blue-100/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-gray-500 font-medium">
          <span className="flex items-center gap-1.5"><Shield size={16} className="text-emerald-500" /> 15-Layer Safety</span>
          <span className="flex items-center gap-1.5"><Sparkles size={16} className="text-blue-500" /> AI-Powered Intelligence</span>
          <span className="flex items-center gap-1.5"><Globe size={16} className="text-purple-500" /> Built for India</span>
          <span className="flex items-center gap-1.5"><Heart size={16} className="text-rose-500" /> Positivity-First</span>
          <span className="flex items-center gap-1.5"><Award size={16} className="text-amber-500" /> QR-Verified Certificates</span>
        </div>
      </section>

      {/* ═══ 7 PILLARS ═══ */}
      <section id="pillars" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">The 7 Pillars</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">One Platform. Everything Education.</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">Connect, Learn, Play, Experience, Prepare, Think, Grow — all in one place.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PILLARS.map((p, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-3`}>
                  <p.icon size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{p.name}</h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VIRTUAL WORLD EXPERIENCE ═══ */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 mb-3">Virtual World Experience</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Real-World Scenarios.<br /><span className="text-purple-600">Virtual Safety.</span></h2>
              <p className="text-gray-500 mt-4 leading-relaxed">Students explore 574+ professions in a safe virtual environment. Be a shopkeeper for a day, manage a restaurant, run a startup — all with AI-guided challenges, interactive simulations, and instant feedback.</p>
              <div className="mt-6 space-y-3">
                {[
                  { icon: '🏪', text: 'Run a virtual shop — manage inventory, customers, and profits' },
                  { icon: '🔬', text: 'Conduct chemistry experiments without any real chemicals' },
                  { icon: '🎤', text: 'Practice job interviews with AI that adapts to your answers' },
                  { icon: '🗣️', text: 'Debate current topics and get scored on argument quality' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                    <p className="text-sm text-gray-600">{item.text}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-amber-600 mt-4 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100 inline-block">
                ⚠️ Sensitive professions (Medical, Electrical, etc.) include knowledge-only modules — no practical simulations for safety.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { emoji: '👨‍🍳', title: 'Be a Chef', desc: 'Plan a menu, manage kitchen', color: 'from-orange-100 to-amber-100', border: 'border-orange-200' },
                { emoji: '💼', title: 'Run a Startup', desc: 'Build a business plan', color: 'from-blue-100 to-indigo-100', border: 'border-blue-200' },
                { emoji: '🎭', title: 'Be an Actor', desc: 'Script reading, auditions', color: 'from-rose-100 to-pink-100', border: 'border-rose-200' },
                { emoji: '📸', title: 'Photographer', desc: 'Composition, lighting', color: 'from-purple-100 to-violet-100', border: 'border-purple-200' },
                { emoji: '✈️', title: 'Pilot Training', desc: 'Pre-flight checks, navigation', color: 'from-cyan-100 to-blue-100', border: 'border-cyan-200' },
                { emoji: '🧘', title: 'Wellness Coach', desc: 'Meditation, healing arts', color: 'from-emerald-100 to-teal-100', border: 'border-emerald-200' },
              ].map((card, i) => (
                <div key={i} className={`bg-gradient-to-br ${card.color} border ${card.border} rounded-2xl p-4 text-center hover:shadow-md transition-all`}>
                  <span className="text-3xl block mb-2">{card.emoji}</span>
                  <h4 className="font-bold text-gray-800 text-xs">{card.title}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES GRID ═══ */}
      <section id="features" className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 mb-3">Flagship Features</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">No Other Platform Has All This</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all">
                <span className="text-3xl block mb-3">{f.emoji}</span>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MENTORSHIP SECTION ═══ */}
      <section id="mentors" className="py-16 sm:py-20 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'20px 20px'}} />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 mb-3">Mentorship That Matters</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Learn From People Who&apos;ve <span className="text-cyan-400">Been There.</span></h2>
              <p className="text-blue-200/60 mt-4 leading-relaxed">Real professionals. Real guidance. Real impact. Our mentors are engineers at ISRO, doctors at AIIMS, IAS officers, entrepreneurs, artists — people who turned their dreams into reality.</p>
              <div className="mt-6 space-y-4">
                {[
                  { icon: UserCheck, title: 'Verified Mentors', desc: 'Every mentor is verified — real professionals from real companies' },
                  { icon: MessageCircle, title: 'Live Workshops', desc: 'Weekly workshops on career guidance, exam prep, skill building' },
                  { icon: Target, title: 'Goal Alignment', desc: 'Mentor matches your dream career and creates a personalized roadmap' },
                  { icon: TrendingUp, title: '5-Stage Pipeline', desc: 'Explorer → Enthusiast → Dedicated → Mentee → Champion progression' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0"><item.icon size={16} className="text-cyan-400" /></div>
                    <div><h4 className="text-white font-bold text-sm">{item.title}</h4><p className="text-blue-200/50 text-xs mt-0.5">{item.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { emoji: '👨‍💻', name: 'Software Architect', company: 'Ex-Google', mentees: 24 },
                { emoji: '👩‍⚕️', name: 'Cardiologist', company: 'AIIMS Delhi', mentees: 18 },
                { emoji: '🎖️', name: 'IAS Officer', company: 'Govt. of India', mentees: 42 },
                { emoji: '🚀', name: 'Space Scientist', company: 'ISRO', mentees: 31 },
              ].map((m, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center backdrop-blur-sm">
                  <span className="text-3xl block mb-2">{m.emoji}</span>
                  <h4 className="text-white font-bold text-sm">{m.name}</h4>
                  <p className="text-blue-300/50 text-[10px]">{m.company}</p>
                  <p className="text-cyan-400 text-xs font-bold mt-2">{m.mentees} students guided</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHO IT'S FOR ═══ */}
      <section id="who" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 mb-3">Built For Everyone</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Age 5 to 75+. Every Learner Welcome.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { emoji: '🎒', title: 'Students (5-18+)', points: ['Learn any subject with AI', 'Play 15+ educational games', 'Explore 574+ careers', 'Earn verified certificates'] },
              { emoji: '👩‍🏫', title: 'Teachers', points: ['Host online classes', 'Manage your classroom', 'Find teaching jobs', 'Build your brand'] },
              { emoji: '👨‍👩‍👧', title: 'Parents', points: ['Monitor child activity', 'Learning reports', 'Career alignment', 'Safe environment'] },
              { emoji: '🏫', title: 'Institutes', points: ['Manage students', 'Post opportunities', 'Analytics dashboard', 'Brand visibility'] },
            ].map((w, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <span className="text-3xl block mb-3">{w.emoji}</span>
                <h3 className="font-bold text-gray-800 text-sm mb-3">{w.title}</h3>
                <div className="space-y-2">{w.points.map((p, j) => (
                  <p key={j} className="flex items-start gap-2 text-xs text-gray-600"><CheckCircle size={13} className="text-emerald-500 mt-0.5 flex-shrink-0" />{p}</p>
                ))}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'16px 16px'}} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">Ready to Transform Your Learning?</h2>
          <p className="text-blue-100/70 mb-8 max-w-lg mx-auto">Join students, teachers, and parents already on Syllabrix. Free to start, powerful to grow.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/sign-up" className="px-8 py-4 rounded-xl text-base font-bold bg-white text-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">Create Free Account <ArrowRight size={16} /></Link>
            <Link href="/sign-in" className="px-8 py-4 rounded-xl text-base font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all">Sign In</Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-gray-950 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <Image src="/images/logo/syllabrix-logo.png" alt="Syllabrix" width={140} height={40} className="h-8 w-auto brightness-200 mb-4" />
              <p className="text-sm text-gray-500 leading-relaxed">India&apos;s first complete education ecosystem. Learn, play, explore, prepare — all powered by AI.</p>
            </div>
            <div><h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Platform</h4><div className="space-y-2">{['AI Buddy','Mind Maps','Virtual Lab','Arcade','Newsroom','Career Explorer'].map(l=>(<p key={l} className="text-sm text-gray-500 hover:text-white cursor-pointer transition-colors">{l}</p>))}</div></div>
            <div><h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">For</h4><div className="space-y-2">{['Students','Teachers','Parents','Institutes','Mentors'].map(l=>(<p key={l} className="text-sm text-gray-500 hover:text-white cursor-pointer transition-colors">{l}</p>))}</div></div>
            <div><h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Company</h4><div className="space-y-2">{['About Us','Privacy Policy','Terms of Service','Contact','Careers'].map(l=>(<p key={l} className="text-sm text-gray-500 hover:text-white cursor-pointer transition-colors">{l}</p>))}</div></div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">&copy; 2026 SyllabriX Network. All rights reserved.</p>
            <p className="text-xs text-gray-600">Made with ❤️ for Indian students</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
