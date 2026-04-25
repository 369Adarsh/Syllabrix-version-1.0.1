'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, Brain, FlaskConical, GraduationCap, Shield, Users, Sparkles,
  BookOpen, Award, Heart, CheckCircle, Gamepad2, MessageCircle,
  TrendingUp, Target, UserCheck, Building2, Trophy, Dumbbell, Video,
  BarChart3, Briefcase, Rocket, BookMarked, Clock, Globe, Zap, Star,
  Layers, PenTool, Wifi, ChevronRight, Medal, Flame, Play, Menu, X
} from 'lucide-react';

// ─── DATA ────────────────────────────────────────────────────────────────────

const STATS = [
  { num: '574+', label: 'Professions to Explore' },
  { num: '30+', label: 'AI-Powered Features' },
  { num: '15+', label: 'Educational Games' },
  { num: '54', label: 'Verified News Sources' },
  { num: '5', label: 'User Types Supported' },
  { num: '100%', label: 'Free to Start' },
];

const PILLARS = [
  { icon: Users, name: 'Connect', desc: 'Social feed, groups, messaging — safe space to learn together', color: 'from-blue-500 to-blue-600' },
  { icon: BookOpen, name: 'Learn', desc: 'Live classes, virtual labs, AI tutor, doubt solving', color: 'from-emerald-500 to-teal-600' },
  { icon: Gamepad2, name: 'Play', desc: '15 educational games + micro-learning clips', color: 'from-purple-500 to-fuchsia-600' },
  { icon: FlaskConical, name: 'Experience', desc: '574+ profession simulations — doctor to shopkeeper', color: 'from-amber-500 to-orange-600' },
  { icon: GraduationCap, name: 'Prepare', desc: 'AI newsroom, daily quizzes, JEE & exam prep', color: 'from-rose-500 to-red-600' },
  { icon: Brain, name: 'AI Powered', desc: 'Mind maps, career explorer, mock interviews, debates', color: 'from-indigo-500 to-violet-600' },
  { icon: Award, name: 'Grow', desc: 'Certificates, Skills Passport, Leaderboards, Badges', color: 'from-cyan-500 to-blue-600' },
];

const JEE_FEATURES = [
  { icon: BookMarked, label: 'Chapter-wise Syllabus', desc: 'Physics, Chemistry, Maths — every topic tracked', color: 'text-blue-600 bg-blue-50' },
  { icon: FlaskConical, label: 'NCERT + Reference Books', desc: 'HC Verma, RD Sharma, Irodov — all in one place', color: 'text-emerald-600 bg-emerald-50' },
  { icon: Target, label: 'Mock Tests', desc: 'Full JEE Mains & Advanced pattern with analytics', color: 'text-rose-600 bg-rose-50' },
  { icon: Clock, label: 'PYQ Practice', desc: 'Year-wise previous questions with solutions', color: 'text-amber-600 bg-amber-50' },
  { icon: Brain, label: 'AI Doubt Solver', desc: 'Get instant step-by-step solutions from AI', color: 'text-purple-600 bg-purple-50' },
  { icon: BarChart3, label: 'Progress Analytics', desc: 'Syllabus completion %, weak areas, time tracking', color: 'text-indigo-600 bg-indigo-50' },
  { icon: Layers, label: 'Formula Sheets', desc: 'Chapter-wise quick-revision formula library', color: 'text-teal-600 bg-teal-50' },
  { icon: Rocket, label: 'AI Study Plan', desc: 'Personalized daily schedule based on your target date', color: 'text-orange-600 bg-orange-50' },
];

const AI_FEATURES = [
  { emoji: '🧪', title: 'Virtual Science Lab', desc: 'Chemistry, Physics, Biology, Math — safe experiments with zero risk' },
  { emoji: '🎤', title: 'AI Mock Interview', desc: 'UPSC, Banking, Campus, SSB — real-time adaptive feedback' },
  { emoji: '🗣️', title: 'AI Debate Arena', desc: 'Sharpen arguments, prep for GD rounds, scored instantly' },
  { emoji: '🗺️', title: 'AI Mind Maps', desc: 'Visual mind maps for any topic — NCERT-aligned, exam-ready' },
  { emoji: '📰', title: 'Smart Newsroom', desc: '54 verified sources, AI summaries, exam-relevant current affairs' },
  { emoji: '💡', title: 'AI Study Table', desc: 'Collaborative AI workspace with chat, sources, and artifacts' },
  { emoji: '🎓', title: 'Career Explorer', desc: 'Aptitude test, parent-child alignment, full career roadmaps' },
  { emoji: '📜', title: 'Skills Passport', desc: 'QR-verified certificates for admissions and scholarships' },
  { emoji: '💻', title: 'Code Lab', desc: 'Browser-based coding practice environment for all levels' },
  { emoji: '🏥', title: 'Doubt Marketplace', desc: 'Post doubts, get answers from verified teachers instantly' },
  { emoji: '🎯', title: 'Daily Quiz', desc: 'Streaks, current affairs, subject quizzes — every day fresh' },
  { emoji: '🤝', title: 'Mentorship', desc: 'Match with verified professionals — IAS, doctors, engineers' },
];

const GAMES = [
  { emoji: '🔢', name: 'Math Sprint', tag: 'Speed' },
  { emoji: '🧠', name: 'Memory Matrix', tag: 'Memory' },
  { emoji: '⚡', name: 'Quiz Rush', tag: 'GK' },
  { emoji: '✍️', name: 'Word Wizard', tag: 'Language' },
  { emoji: '🔬', name: 'Science Quest', tag: 'Science' },
  { emoji: '🗺️', name: 'Map Explorer', tag: 'Geography' },
];

const FITNESS_FEATURES = [
  { icon: Dumbbell, title: 'Workout Library', desc: 'Strength, cardio, HIIT — for all fitness levels', color: 'from-red-500 to-rose-600' },
  { icon: Heart, title: 'Diet & Nutrition', desc: 'Calorie tracking, meal plans, healthy eating guides', color: 'from-pink-500 to-red-500' },
  { icon: Star, title: 'Yoga Classes', desc: 'Morning, evening, stress-relief yoga sessions', color: 'from-violet-500 to-purple-600' },
  { icon: Flame, title: 'Habit Tracker', desc: 'Build streaks, track daily wellness habits', color: 'from-orange-500 to-amber-500' },
  { icon: Brain, title: 'AI Fitness Coach', desc: 'Personalized plan based on your goals and schedule', color: 'from-indigo-500 to-blue-600' },
  { icon: UserCheck, title: 'Coach Directory', desc: 'Book verified fitness coaches for 1-on-1 sessions', color: 'from-emerald-500 to-teal-600' },
];

const WHO_FOR = [
  {
    emoji: '🎒', title: 'Students (5–18+)',
    points: ['Learn any subject with AI tutor', 'Play 15+ educational games', 'Explore 574+ careers', 'Prep for JEE, UPSC, Board exams', 'Earn QR-verified certificates'],
    cta: 'Start Learning', href: '/sign-up', color: 'border-blue-200 hover:border-blue-400',
  },
  {
    emoji: '👩‍🏫', title: 'Teachers',
    points: ['Host live classes with recording', 'Manage classroom & doubts', 'Find teaching job opportunities', 'Publish study materials', 'Build your personal brand'],
    cta: 'Start Teaching', href: '/sign-up', color: 'border-emerald-200 hover:border-emerald-400',
  },
  {
    emoji: '👨‍👩‍👧', title: 'Parents',
    points: ['Monitor child activity in real-time', 'Weekly learning reports', 'Career alignment with child', 'Safety dashboard with controls', 'Set screen time & content filters'],
    cta: 'Join as Parent', href: '/sign-up', color: 'border-rose-200 hover:border-rose-400',
  },
  {
    emoji: '🏫', title: 'Institutes',
    points: ['Manage entire student cohort', 'Post jobs & opportunities', 'Analytics & performance reports', 'Build brand visibility', 'Content management tools'],
    cta: 'Register Institute', href: '/sign-up', color: 'border-amber-200 hover:border-amber-400',
  },
  {
    emoji: '💼', title: 'Professionals',
    points: ['Upskill & reskill with AI courses', 'Career transition planning', 'Mock interviews & resume builder', 'Industry certifications', 'Mentor the next generation'],
    cta: 'Upskill Now', href: '/sign-up', color: 'border-purple-200 hover:border-purple-400',
  },
  {
    emoji: '🏢', title: 'Enterprises',
    points: ['Employee L&D programs', 'AI skill assessment at scale', 'Live training studio', 'ROI & impact analytics', 'Bulk onboarding & SSO'],
    cta: 'Corporate Demo', href: '/corporate', color: 'border-indigo-200 hover:border-indigo-400',
  },
];

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ══════════════ NAVBAR ══════════════ */}
      <nav className="fixed top-0 w-full z-50">
        <div className="mx-3 sm:mx-4 mt-3">
          <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl px-4 sm:px-6 py-3 shadow-lg shadow-black/[0.04] border border-gray-100/50">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/images/logo/syllabrix-logo.png" alt="Syllabrix" width={160} height={45} className="h-9 w-auto object-contain" priority />
              </Link>
              <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
                <a href="#features" className="hover:text-blue-700 transition-colors">Features</a>
                <a href="#jee" className="hover:text-blue-700 transition-colors">JEE Prep</a>
                <a href="#mentors" className="hover:text-blue-700 transition-colors">Mentors</a>
                <a href="#fitness" className="hover:text-blue-700 transition-colors">Fitness</a>
                <a href="#who" className="hover:text-blue-700 transition-colors">Who It&apos;s For</a>
                <Link href="/corporate" className="flex items-center gap-1 text-blue-700 font-bold hover:text-blue-800 transition-colors">
                  <Building2 size={14} /> For Business
                </Link>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/sign-in" className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all">Sign In</Link>
                <Link href="/sign-up" className="px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200/40 hover:from-blue-700 transition-all flex items-center gap-1.5">
                  Get Started <ArrowRight size={14} />
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(o => !o)}
                  className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
              <div className="md:hidden pt-3 pb-2 border-t border-gray-100 mt-3 flex flex-col gap-1">
                {[
                  { href: '#features', label: 'Features' },
                  { href: '#jee', label: 'JEE Prep' },
                  { href: '#mentors', label: 'Mentors' },
                  { href: '#fitness', label: 'Fitness' },
                  { href: '#who', label: "Who It's For" },
                ].map(item => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
                <Link
                  href="/corporate"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-bold text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                >
                  <Building2 size={14} /> For Business
                </Link>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative min-h-[92vh] flex items-center pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950" />
        <div className="absolute top-20 left-[8%] w-72 h-72 bg-cyan-500/15 rounded-full blur-[90px]" />
        <div className="absolute bottom-20 right-[8%] w-96 h-96 bg-purple-600/10 rounded-full blur-[110px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-cyan-300 text-sm font-medium mb-6">
                <Sparkles size={14} className="animate-pulse" /> India&apos;s First Complete Education Ecosystem
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
                <span className="text-white">Every Learner.</span><br />
                <span className="text-white">Every Goal.</span><br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">One Platform.</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-blue-200/70 leading-relaxed max-w-xl">
                A 7-year-old plays math games. A 16-year-old cracks JEE with AI. A teacher builds their brand. A parent monitors everything. A professional upskills on the go.{' '}
                <strong className="text-blue-200">One platform for all of them.</strong>
              </p>

              {/* Multi-audience CTAs */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/sign-up" className="px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:from-cyan-600 transition-all flex items-center gap-2">
                  Start Free <ArrowRight size={15} />
                </Link>
                <a href="#jee" className="px-6 py-3.5 rounded-xl text-sm font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all flex items-center gap-2">
                  <GraduationCap size={15} /> JEE Prep
                </a>
                <Link href="/corporate" className="px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:from-amber-600 transition-all flex items-center gap-2">
                  <Building2 size={15} /> Corporate L&D
                </Link>
              </div>

              {/* Stats row */}
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {STATS.slice(0, 6).map((s, i) => (
                  <div key={i}>
                    <p className="text-xl sm:text-2xl font-extrabold text-white">{s.num}</p>
                    <p className="text-[10px] text-blue-300/50 font-medium uppercase tracking-wider leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating feature cards */}
            <div className="hidden lg:block relative h-[480px]">
              <div className="absolute top-0 left-8 w-60 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center"><GraduationCap size={18} className="text-white" /></div>
                  <div><p className="text-white font-bold text-sm">JEE Command</p><p className="text-blue-300/50 text-[10px]">Complete exam prep hub</p></div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {['Syllabus', 'PYQ', 'Mock Tests', 'AI Tutor'].map(t => (
                    <span key={t} className="text-[9px] px-2 py-0.5 bg-rose-400/20 text-rose-200 rounded-full">{t}</span>
                  ))}
                </div>
              </div>

              <div className="absolute top-28 right-0 w-56 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center"><Brain size={18} className="text-white" /></div>
                  <div><p className="text-white font-bold text-sm">AI Mind Map</p><p className="text-blue-300/50 text-[10px]">Any topic → visual map</p></div>
                </div>
                <div className="flex gap-1">{[1, 2, 3, 4, 5].map(i => <div key={i} className="flex-1 h-1 rounded-full bg-purple-400/40" />)}</div>
              </div>

              <div className="absolute top-52 left-0 w-64 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"><FlaskConical size={18} className="text-white" /></div>
                  <div><p className="text-white font-bold text-sm">574+ Professions</p><p className="text-blue-300/50 text-[10px]">Virtual world simulations</p></div>
                </div>
                <div className="flex gap-1.5">{['👨‍🍳', '✈️', '💼', '🎭', '🔬'].map((e, i) => <span key={i} className="text-lg">{e}</span>)}</div>
              </div>

              <div className="absolute bottom-16 right-4 w-52 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"><Gamepad2 size={18} className="text-white" /></div>
                  <div><p className="text-white font-bold text-sm">15+ Games</p><p className="text-blue-300/50 text-[10px]">Math, Logic, GK, Language</p></div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 mt-1"><div className="bg-amber-400 h-1.5 rounded-full w-3/4" /></div>
              </div>

              <div className="absolute bottom-0 left-12 w-56 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center"><Dumbbell size={18} className="text-white" /></div>
                  <div><p className="text-white font-bold text-sm">Fitness Hub</p><p className="text-blue-300/50 text-[10px]">Workouts, yoga, AI coach</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ TRUST BAR ══════════════ */}
      <section className="py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-y border-blue-100/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-gray-500 font-medium">
          <span className="flex items-center gap-1.5"><Shield size={16} className="text-emerald-500" /> 15-Layer Safety</span>
          <span className="flex items-center gap-1.5"><Sparkles size={16} className="text-blue-500" /> AI-Powered Intelligence</span>
          <span className="flex items-center gap-1.5"><Globe size={16} className="text-purple-500" /> Built for India</span>
          <span className="flex items-center gap-1.5"><Heart size={16} className="text-rose-500" /> Positivity-First</span>
          <span className="flex items-center gap-1.5"><Award size={16} className="text-amber-500" /> QR-Verified Certificates</span>
          <span className="flex items-center gap-1.5"><Zap size={16} className="text-indigo-500" /> Free to Start</span>
        </div>
      </section>

      {/* ══════════════ 7 PILLARS ══════════════ */}
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

      {/* ══════════════ JEE COMMAND ══════════════ */}
      <section id="jee" className="py-16 sm:py-20 bg-gradient-to-br from-rose-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold mb-4">
                <Rocket size={12} /> India&apos;s Most Complete JEE Prep
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                JEE Command —<br /><span className="text-rose-600">Your Complete Exam HQ</span>
              </h2>
              <p className="text-gray-500 mt-4 leading-relaxed">
                Everything a JEE aspirant needs — in one command center. Syllabus tracker, NCERT + reference books, PYQs, mock tests, formula sheets, and an AI tutor that never sleeps.
              </p>
              <div className="mt-6 flex items-center gap-3 p-4 bg-rose-50 rounded-xl border border-rose-100">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <Brain size={18} className="text-rose-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">AI Study Plan Generator</p>
                  <p className="text-xs text-gray-500">Enter your target date → get a personalized day-by-day JEE prep schedule</p>
                </div>
              </div>
              <Link href="/sign-up" className="mt-6 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-200 hover:from-rose-700 transition-all">
                Start JEE Prep Free <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {JEE_FEATURES.map((f, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className={`w-9 h-9 rounded-lg ${f.color} flex items-center justify-center mb-3`}>
                    <f.icon size={16} />
                  </div>
                  <h4 className="font-bold text-gray-800 text-xs">{f.label}</h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ EXAM PREP HUB ══════════════ */}
      <section className="py-12 sm:py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 mb-3">Prep Hub</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Not Just JEE — All Major Exams Covered</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { emoji: '📐', name: 'JEE Mains & Advanced', color: 'bg-rose-50 border-rose-100' },
              { emoji: '🏛️', name: 'UPSC Civil Services', color: 'bg-indigo-50 border-indigo-100' },
              { emoji: '🏦', name: 'Banking (IBPS/SBI)', color: 'bg-emerald-50 border-emerald-100' },
              { emoji: '📋', name: 'Board Exams (10 & 12)', color: 'bg-blue-50 border-blue-100' },
              { emoji: '🩺', name: 'NEET Medical', color: 'bg-teal-50 border-teal-100' },
              { emoji: '⚖️', name: 'State PSC Exams', color: 'bg-amber-50 border-amber-100' },
            ].map((e, i) => (
              <div key={i} className={`${e.color} border rounded-xl p-4 text-center hover:shadow-md transition-all`}>
                <span className="text-2xl block mb-2">{e.emoji}</span>
                <p className="text-xs font-bold text-gray-700 leading-tight">{e.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ VIRTUAL WORLD EXPERIENCE ══════════════ */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 mb-3">Virtual World Experience</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Try 574+ Professions.<br /><span className="text-purple-600">Zero Risk.</span></h2>
              <p className="text-gray-500 mt-4 leading-relaxed">Students explore real-world careers in a safe virtual environment. Run a restaurant, manage a startup, practice surgery (knowledge-only), fly a plane — all with AI-guided challenges and instant feedback.</p>
              <div className="mt-6 space-y-3">
                {[
                  { icon: '🏪', text: 'Run a virtual shop — manage inventory, pricing, and profits' },
                  { icon: '🔬', text: 'Conduct chemistry experiments without any real chemicals' },
                  { icon: '🎤', text: 'Practice job interviews with AI that adapts to your answers' },
                  { icon: '🗣️', text: 'Debate current topics and get scored on argument quality' },
                  { icon: '💻', text: 'Code real projects in an in-browser development environment' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                    <p className="text-sm text-gray-600">{item.text}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-amber-600 mt-5 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100 inline-block">
                ⚠️ Sensitive professions (Medical, Electrical, etc.) include knowledge-only modules — no practical simulations for safety.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { emoji: '👨‍🍳', title: 'Be a Chef', color: 'from-orange-100 to-amber-100', border: 'border-orange-200' },
                { emoji: '💼', title: 'Run a Startup', color: 'from-blue-100 to-indigo-100', border: 'border-blue-200' },
                { emoji: '🎭', title: 'Be an Actor', color: 'from-rose-100 to-pink-100', border: 'border-rose-200' },
                { emoji: '📸', title: 'Photographer', color: 'from-purple-100 to-violet-100', border: 'border-purple-200' },
                { emoji: '✈️', title: 'Pilot Training', color: 'from-cyan-100 to-blue-100', border: 'border-cyan-200' },
                { emoji: '🧘', title: 'Wellness Coach', color: 'from-emerald-100 to-teal-100', border: 'border-emerald-200' },
                { emoji: '👨‍⚕️', title: 'Doctor (Know)', color: 'from-red-50 to-rose-100', border: 'border-red-200' },
                { emoji: '🚀', title: 'Space Scientist', color: 'from-indigo-100 to-blue-100', border: 'border-indigo-200' },
                { emoji: '🎵', title: 'Music Producer', color: 'from-pink-100 to-fuchsia-100', border: 'border-pink-200' },
              ].map((card, i) => (
                <div key={i} className={`bg-gradient-to-br ${card.color} border ${card.border} rounded-xl p-3 text-center hover:shadow-md transition-all`}>
                  <span className="text-2xl block mb-1.5">{card.emoji}</span>
                  <h4 className="font-bold text-gray-800 text-[10px] leading-tight">{card.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ AI & FLAGSHIP FEATURES ══════════════ */}
      <section id="features" className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 mb-3">30+ AI Features</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">No Other Platform Has All This</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">From doubt solving to mock interviews — every learning tool you need, powered by AI.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AI_FEATURES.map((f, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <span className="text-3xl block mb-3">{f.emoji}</span>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ LIVE LEARNING & TEACHER TOOLS ══════════════ */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-3">Live Learning</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Teach. Learn. Connect. Live.</h2>
            <p className="text-blue-200/60 mt-3 max-w-lg mx-auto">Real-time live classes, doubt sessions, and teacher tools — all in one platform.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Video, title: 'Live Class Hosting', desc: 'Host classes with screen sharing, whiteboard, breakout rooms and recording', tag: 'For Teachers', tagColor: 'text-emerald-400 bg-emerald-400/10' },
              { icon: Wifi, title: 'Live Tuition Classes', desc: 'Create and manage scheduled tuition batches with student enrollment', tag: 'For Teachers', tagColor: 'text-emerald-400 bg-emerald-400/10' },
              { icon: PenTool, title: 'Teacher Studio', desc: 'Create, upload and publish study materials, video lessons, and question papers', tag: 'For Teachers', tagColor: 'text-emerald-400 bg-emerald-400/10' },
              { icon: MessageCircle, title: 'Doubt Marketplace', desc: 'Post any doubt, get verified answers from teachers and experts — fast', tag: 'For Students', tagColor: 'text-cyan-400 bg-cyan-400/10' },
              { icon: Users, title: 'Study Groups', desc: 'Join or create topic-based study groups with live group chats', tag: 'For Students', tagColor: 'text-cyan-400 bg-cyan-400/10' },
              { icon: Play, title: 'Async Video Replay', desc: 'Missed a live class? Watch the recording with AI-generated chapter markers', tag: 'For Students', tagColor: 'text-cyan-400 bg-cyan-400/10' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <item.icon size={18} className="text-blue-300" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.tagColor}`}>{item.tag}</span>
                </div>
                <h3 className="font-bold text-white text-sm mb-1.5">{item.title}</h3>
                <p className="text-blue-200/50 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ GAMIFICATION ══════════════ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 mb-3">Gamification</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Learning That Feels Like<br /><span className="text-purple-600">Winning.</span></h2>
              <p className="text-gray-500 mt-4 leading-relaxed">
                Points, badges, leaderboards, streaks, and 15+ educational games — because the best learning happens when students forget they&apos;re studying.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { icon: Trophy, label: 'Leaderboards', desc: 'Compete with students nationwide', color: 'text-amber-600 bg-amber-50' },
                  { icon: Medal, label: 'Badge System', desc: '50+ achievement badges to unlock', color: 'text-indigo-600 bg-indigo-50' },
                  { icon: Flame, label: 'Streak Tracking', desc: 'Daily learning streaks & rewards', color: 'text-rose-600 bg-rose-50' },
                  { icon: Award, label: 'Certificates', desc: 'QR-verified, shareable credentials', color: 'text-emerald-600 bg-emerald-50' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}>
                      <item.icon size={15} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-xs">{item.label}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-700 mb-4">15+ Educational Games</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GAMES.map((g, i) => (
                  <div key={i} className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 rounded-xl p-4 text-center hover:shadow-md transition-all">
                    <span className="text-2xl block mb-2">{g.emoji}</span>
                    <p className="font-bold text-gray-800 text-xs">{g.name}</p>
                    <span className="text-[9px] px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full font-medium mt-1 inline-block">{g.tag}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">+ 9 more games in the Arcade</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ FITNESS & WELLNESS ══════════════ */}
      <section id="fitness" className="py-16 sm:py-20 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 mb-3">Fitness & Wellness</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">A Healthy Mind Needs a Healthy Body.</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">Syllabrix is the only education platform with a full fitness module — because student wellness matters too.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FITNESS_FEATURES.map((f, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{f.title}</h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CORPORATE L&D ══════════════ */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-900 to-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold mb-4">
                <Building2 size={12} /> Enterprise & Corporate
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Transform Your Workforce.<br /><span className="text-amber-400">Measure the ROI.</span>
              </h2>
              <p className="text-slate-400 mt-4 leading-relaxed">
                Syllabrix Corporate gives L&D teams a complete platform — from AI skill assessments and learning path creation to live training studios and C-suite analytics dashboards.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  'Bulk employee onboarding with SSO & HRMS integration',
                  'AI skill gap analysis for every team member',
                  'Custom learning paths by role, department, or level',
                  'Live training studio with recording & async replay',
                  'Certification engine — issue verified internal credentials',
                  'Real-time ROI & engagement analytics for leadership',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle size={14} className="text-amber-400 flex-shrink-0" />
                    <p className="text-slate-300 text-sm">{item}</p>
                  </div>
                ))}
              </div>
              <Link href="/corporate" className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:from-amber-600 transition-all">
                Explore Corporate L&D <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: BarChart3, label: 'Impact Analytics', desc: 'C-suite dashboards with engagement & completion data', color: 'from-amber-500 to-orange-500' },
                { icon: PenTool, label: 'Training Studio', desc: 'Create & publish internal courses and training content', color: 'from-blue-500 to-indigo-500' },
                { icon: Target, label: 'Skill Assessment', desc: 'AI-powered gap analysis for every employee', color: 'from-emerald-500 to-teal-500' },
                { icon: Briefcase, label: 'Learning Paths', desc: 'Role-specific upskilling journeys with milestones', color: 'from-purple-500 to-fuchsia-500' },
                { icon: Users, label: 'Team Management', desc: 'Bulk onboarding, cohort creation, progress tracking', color: 'from-rose-500 to-red-500' },
                { icon: Award, label: 'Certifications', desc: 'Issue and verify internal skill certificates at scale', color: 'from-cyan-500 to-blue-500' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
                    <item.icon size={16} className="text-white" />
                  </div>
                  <p className="font-bold text-white text-xs">{item.label}</p>
                  <p className="text-slate-400 text-[10px] mt-1 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ MENTORSHIP ══════════════ */}
      <section id="mentors" className="py-16 sm:py-20 bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
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
                  { icon: Target, title: 'Goal Alignment', desc: 'Mentor matches your dream career and builds a personalized roadmap' },
                  { icon: TrendingUp, title: '5-Stage Pipeline', desc: 'Explorer → Enthusiast → Dedicated → Mentee → Champion progression' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0"><item.icon size={16} className="text-cyan-400" /></div>
                    <div><h4 className="text-white font-bold text-sm">{item.title}</h4><p className="text-blue-200/50 text-xs mt-0.5">{item.desc}</p></div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex gap-3">
                <Link href="/sign-up" className="px-5 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 transition-all flex items-center gap-2">
                  Find a Mentor <ArrowRight size={14} />
                </Link>
                <Link href="/mentor-apply" className="px-5 py-3 rounded-xl text-sm font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all">
                  Become a Mentor
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { emoji: '👨‍💻', name: 'Software Architect', company: 'Ex-Google', mentees: 24 },
                { emoji: '👩‍⚕️', name: 'Cardiologist', company: 'AIIMS Delhi', mentees: 18 },
                { emoji: '🎖️', name: 'IAS Officer', company: 'Govt. of India', mentees: 42 },
                { emoji: '🚀', name: 'Space Scientist', company: 'ISRO', mentees: 31 },
              ].map((m, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center backdrop-blur-sm hover:bg-white/10 transition-all">
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

      {/* ══════════════ WHO IT'S FOR ══════════════ */}
      <section id="who" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 mb-3">Built For Everyone</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Age 5 to 75+. Every Learner Welcome.</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">Syllabrix adapts to who you are — student, teacher, parent, or professional.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHO_FOR.map((w, i) => (
              <div key={i} className={`bg-white border-2 ${w.color} rounded-2xl p-5 shadow-sm transition-all duration-300`}>
                <span className="text-3xl block mb-3">{w.emoji}</span>
                <h3 className="font-bold text-gray-800 text-sm mb-3">{w.title}</h3>
                <div className="space-y-2 mb-5">
                  {w.points.map((p, j) => (
                    <p key={j} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle size={13} className="text-emerald-500 mt-0.5 flex-shrink-0" />{p}
                    </p>
                  ))}
                </div>
                <Link href={w.href} className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  {w.cta} <ChevronRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ SAFETY CALLOUT ══════════════ */}
      <section className="py-12 bg-gradient-to-r from-emerald-50 to-teal-50 border-y border-emerald-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 w-14 h-14 rounded-2xl bg-emerald-100 justify-center mb-4 mx-auto">
            <Shield size={28} className="text-emerald-600" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mb-3">15-Layer Safety System</h3>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm leading-relaxed mb-6">
            Every piece of content is moderated. Every interaction is monitored. Parents have a dedicated dashboard to track activity, set filters, and receive weekly reports. Syllabrix is the safest learning environment in India.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Content Moderation', 'Parent Dashboard', 'Screen Time Controls', 'Safe Search', 'Positivity Filters', 'Verified Mentors', 'Anonymous Reporting'].map((item, i) => (
              <span key={i} className="text-xs font-medium px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 rounded-full">
                ✓ {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '16px 16px' }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">Ready to Transform Your Learning?</h2>
          <p className="text-blue-100/70 mb-8 max-w-xl mx-auto">Join students, teachers, parents, and professionals already on Syllabrix. Free to start, powerful to grow.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/sign-up" className="px-8 py-4 rounded-xl text-base font-bold bg-white text-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
              Create Free Account <ArrowRight size={16} />
            </Link>
            <Link href="/corporate" className="px-8 py-4 rounded-xl text-base font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all flex items-center gap-2">
              <Building2 size={16} /> Corporate Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="bg-gray-950 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            <div className="lg:col-span-2">
              <Image src="/images/logo/syllabrix-logo.png" alt="Syllabrix" width={140} height={40} className="h-8 w-auto brightness-200 mb-4" />
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">India&apos;s first complete education ecosystem. Learn, play, explore, prepare — for every type of learner, at every stage of life.</p>
              <p className="text-xs text-gray-600 mt-4">support@syllabrix.com</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Study</h4>
              <div className="space-y-2.5">
                {['JEE Command', 'Prep Hub', 'Virtual Lab', 'AI Mind Maps', 'Code Lab', 'Daily Quiz', 'Doubt Marketplace'].map(l => (
                  <p key={l} className="text-sm text-gray-500 hover:text-white cursor-pointer transition-colors">{l}</p>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Explore</h4>
              <div className="space-y-2.5">
                {['Experience Lab', 'Career Explorer', 'Arcade Games', 'Mentorship', 'Newsroom', 'Fitness Hub', 'Leaderboard'].map(l => (
                  <p key={l} className="text-sm text-gray-500 hover:text-white cursor-pointer transition-colors">{l}</p>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Platform</h4>
              <div className="space-y-2.5">
                {['For Students', 'For Teachers', 'For Parents', 'For Institutes', 'For Professionals', 'Corporate L&D'].map(l => (
                  <p key={l} className="text-sm text-gray-500 hover:text-white cursor-pointer transition-colors">{l}</p>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">&copy; 2026 SyllabriX Network. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-gray-600">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
            </div>
            <p className="text-xs text-gray-600">Made with ❤️ for Indian learners</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
