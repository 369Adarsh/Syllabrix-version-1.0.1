'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { fitnessAPI } from '@/lib/api/fitness.api';
import {
  Dumbbell, Utensils, Brain, Heart, Activity, BookOpen, Users,
  Newspaper, Target, Sparkles, ArrowRight, Trophy, Flame, Zap,
  TrendingUp, ChevronRight, Star, Shield, Loader2
} from 'lucide-react';

const FeatureCard = ({ href, icon: Icon, title, desc, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
  >
    <Link href={href} className="group block">
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
          <Icon size={22} className="text-white" />
        </div>
        <h3 className="text-[14px] font-bold text-gray-800 mb-1">{title}</h3>
        <p className="text-[12px] text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </Link>
  </motion.div>
);

export default function FitnessHubPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fitnessAPI.getProfile().then(r => setProfile(r.data?.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const features = [
    { href: '/fitness/dashboard', icon: Activity, title: 'My Dashboard', desc: 'Your daily fitness overview, habits, and progress', gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { href: '/fitness/ai-coach', icon: Sparkles, title: 'AI Coach', desc: 'Chat with your personal AI fitness coach', gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
    { href: '/fitness/workouts', icon: Dumbbell, title: 'Workouts', desc: 'AI-generated workout plans tailored to you', gradient: 'bg-gradient-to-br from-orange-500 to-red-600' },
    { href: '/fitness/diet', icon: Utensils, title: 'Diet Planner', desc: 'Personalized meal plans & nutrition tracking', gradient: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    { href: '/fitness/habits', icon: Target, title: 'Habits', desc: 'Build healthy habits with streak tracking', gradient: 'bg-gradient-to-br from-purple-500 to-violet-600' },
    { href: '/fitness/exercises', icon: Zap, title: 'Exercise Library', desc: 'Browse 100+ exercises with instructions', gradient: 'bg-gradient-to-br from-amber-500 to-orange-600' },
    { href: '/fitness/articles', icon: BookOpen, title: 'Articles', desc: 'Fitness tips, yoga guidance, and wellness', gradient: 'bg-gradient-to-br from-rose-500 to-pink-600' },
    { href: '/fitness/coaches', icon: Users, title: 'Find a Coach', desc: 'Connect with certified fitness coaches', gradient: 'bg-gradient-to-br from-cyan-500 to-blue-600' },
    { href: '/fitness/news', icon: Newspaper, title: 'Fitness News', desc: 'Latest health and fitness updates', gradient: 'bg-gradient-to-br from-gray-600 to-slate-700' },
  ];

  return (
    <div className="max-w-[900px] mx-auto">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 md:p-8 mb-6 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoNnptMC0zMHY2aC02VjRoNnptMzAgMzB2NmgtNnYtNmg2em0wLTMwdjZoLTZWNGg2ek02IDM0djZIMHYtNmg2em0wLTMwdjZIMFY0aDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={20} className="text-emerald-200" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">AI Fitness Coach</span>
          </div>
          <h1 className="text-[24px] md:text-[28px] font-extrabold leading-tight mb-2">
            Your Complete Fitness Journey Starts Here
          </h1>
          <p className="text-[14px] text-emerald-100 max-w-[500px] mb-4">
            AI-powered workouts, personalized diet plans, habit tracking, and real coaches — all in one place.
          </p>
          {!profile?.onboarding_complete ? (
            <Link href="/fitness/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-700 text-[13px] font-bold hover:bg-emerald-50 transition-colors shadow-lg">
              Get Started <ArrowRight size={14} />
            </Link>
          ) : (
            <Link href="/fitness/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-700 text-[13px] font-bold hover:bg-emerald-50 transition-colors shadow-lg">
              Go to Dashboard <ArrowRight size={14} />
            </Link>
          )}
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full bg-white/10 blur-xl" />
        <div className="absolute right-12 top-4 w-16 h-16 rounded-full bg-white/10 blur-lg" />
      </motion.div>

      {/* Quick Stats Bar */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
      >
        {[
          { icon: Flame, label: 'Active Users', value: '2.4K+', color: 'text-orange-500', bg: 'bg-orange-50' },
          { icon: Trophy, label: 'Workouts Done', value: '12K+', color: 'text-amber-500', bg: 'bg-amber-50' },
          { icon: TrendingUp, label: 'Goals Reached', value: '890+', color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { icon: Star, label: 'Coaches', value: '50+', color: 'text-blue-500', bg: 'bg-blue-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-3 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <div>
              <p className="text-[15px] font-extrabold text-gray-800">{stat.value}</p>
              <p className="text-[10px] text-gray-400 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {features.map((f, i) => (
          <FeatureCard key={f.href} {...f} delay={0.1 + i * 0.05} />
        ))}
      </div>

      {/* Coach & Admin Links */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
      >
        <Link href="/fitness/coach/apply" className="group block">
          <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-xl p-5 text-white hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-2">
              <Shield size={20} className="text-violet-200" />
              <h3 className="text-[14px] font-bold">Become a Coach</h3>
            </div>
            <p className="text-[12px] text-violet-200 mb-3">Share your expertise, build your brand, and earn</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-200 group-hover:text-white transition-colors">
              Apply Now <ChevronRight size={12} />
            </span>
          </div>
        </Link>
        <Link href="/fitness/coach/dashboard" className="group block">
          <div className="bg-gradient-to-r from-slate-700 to-gray-800 rounded-xl p-5 text-white hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-2">
              <Activity size={20} className="text-slate-300" />
              <h3 className="text-[14px] font-bold">Coach Dashboard</h3>
            </div>
            <p className="text-[12px] text-slate-300 mb-3">Manage clients, create plans, track performance</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 group-hover:text-white transition-colors">
              Open Dashboard <ChevronRight size={12} />
            </span>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
