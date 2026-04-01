'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { fitnessAPI } from '@/lib/api/fitness.api';
import { Loader2, Sparkles, ChevronRight, Clock, Play, Heart } from 'lucide-react';

const yogaPoses = [
  { name: 'Surya Namaskar', sanskrit: 'Sun Salutation', duration: '5 min', level: 'Beginner', emoji: '☀️', benefits: 'Full body warmup, flexibility, cardio', color: 'from-amber-400 to-orange-500' },
  { name: 'Warrior I', sanskrit: 'Virabhadrasana I', duration: '30s each side', level: 'Beginner', emoji: '⚔️', benefits: 'Leg strength, balance, hip opening', color: 'from-red-400 to-rose-500' },
  { name: 'Warrior II', sanskrit: 'Virabhadrasana II', duration: '30s each side', level: 'Beginner', emoji: '🏹', benefits: 'Stamina, concentration, leg power', color: 'from-orange-400 to-red-500' },
  { name: 'Tree Pose', sanskrit: 'Vrikshasana', duration: '30s each side', level: 'Beginner', emoji: '🌳', benefits: 'Balance, focus, ankle stability', color: 'from-green-400 to-emerald-500' },
  { name: 'Downward Dog', sanskrit: 'Adho Mukha Svanasana', duration: '45s', level: 'Beginner', emoji: '🐕', benefits: 'Full body stretch, shoulder strength', color: 'from-blue-400 to-indigo-500' },
  { name: 'Cobra Pose', sanskrit: 'Bhujangasana', duration: '30s', level: 'Beginner', emoji: '🐍', benefits: 'Back flexibility, chest opening', color: 'from-teal-400 to-cyan-500' },
  { name: 'Child\'s Pose', sanskrit: 'Balasana', duration: '1 min', level: 'Beginner', emoji: '🧒', benefits: 'Relaxation, back stretch, stress relief', color: 'from-indigo-400 to-purple-500' },
  { name: 'Triangle Pose', sanskrit: 'Trikonasana', duration: '30s each side', level: 'Intermediate', emoji: '🔺', benefits: 'Side body stretch, balance, digestion', color: 'from-violet-400 to-purple-500' },
  { name: 'Bridge Pose', sanskrit: 'Setu Bandhasana', duration: '30s', level: 'Beginner', emoji: '🌉', benefits: 'Glute activation, chest and spine opening', color: 'from-pink-400 to-rose-500' },
  { name: 'Corpse Pose', sanskrit: 'Shavasana', duration: '5 min', level: 'Beginner', emoji: '🧘', benefits: 'Deep relaxation, nervous system reset', color: 'from-slate-400 to-gray-500' },
  { name: 'Pigeon Pose', sanskrit: 'Kapotasana', duration: '1 min each side', level: 'Intermediate', emoji: '🕊️', benefits: 'Deep hip opener, emotional release', color: 'from-fuchsia-400 to-pink-500' },
  { name: 'Headstand', sanskrit: 'Sirsasana', duration: '30s-2 min', level: 'Advanced', emoji: '🤸', benefits: 'Inversion benefits, core strength, focus', color: 'from-red-500 to-orange-600' },
];

const yogaSeries = [
  { name: 'Morning Energy Flow', duration: '15 min', poses: 6, level: 'Beginner', desc: 'Wake up your body and mind with gentle stretches and sun salutations', emoji: '🌅', gradient: 'from-amber-500 to-orange-500' },
  { name: 'Stress Relief Sequence', duration: '20 min', poses: 8, level: 'Beginner', desc: 'Release tension from neck, shoulders, and back with calming poses', emoji: '😌', gradient: 'from-indigo-500 to-purple-500' },
  { name: 'Flexibility Builder', duration: '25 min', poses: 10, level: 'Intermediate', desc: 'Progressive stretching to improve overall flexibility safely', emoji: '🤸', gradient: 'from-emerald-500 to-teal-500' },
  { name: 'Power Yoga', duration: '30 min', poses: 12, level: 'Advanced', desc: 'High-intensity flowing sequence for strength and cardio', emoji: '💪', gradient: 'from-red-500 to-pink-500' },
  { name: 'Bedtime Wind Down', duration: '10 min', poses: 5, level: 'Beginner', desc: 'Gentle sequences and breathing to prepare for restful sleep', emoji: '🌙', gradient: 'from-violet-500 to-indigo-600' },
  { name: 'Back Pain Relief', duration: '15 min', poses: 7, level: 'Beginner', desc: 'Targeted stretches to alleviate and prevent lower back pain', emoji: '🩹', gradient: 'from-cyan-500 to-blue-500' },
];

const breathingExercises = [
  { name: 'Anulom Vilom', desc: 'Alternate nostril breathing for balance and calm', duration: '5 min', emoji: '👃' },
  { name: 'Kapalbhati', desc: 'Skull-shining breath for energy and detox', duration: '3 min', emoji: '✨' },
  { name: 'Bhramari', desc: 'Bee breath for anxiety relief and sleep', duration: '5 min', emoji: '🐝' },
  { name: 'Box Breathing', desc: '4-4-4-4 pattern for stress management', duration: '5 min', emoji: '📦' },
];

export default function YogaPage() {
  const [articles, setArticles] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fitnessAPI.getExercises({ category: 'yoga' }).catch(() => ({ data: { data: [] } })),
      fitnessAPI.getArticles({ search: 'yoga', limit: 5 }).catch(() => ({ data: { data: [] } })),
    ]).then(([exRes, artRes]) => {
      setExercises(exRes.data?.data || []);
      setArticles(artRes.data?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const levelColors = {
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-amber-100 text-amber-700',
    Advanced: 'bg-red-100 text-red-700',
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-purple-500" /></div>;

  return (
    <div className="max-w-[900px] mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 md:p-8 mb-6 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoNnptMC0zMHY2aC02VjRoNnptMzAgMzB2NmgtNnYtNmg2em0wLTMwdjZoLTZWNGg2ek02IDM0djZIMHYtNmg2em0wLTMwdjZIMFY0aDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[20px]">🧘</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200">Yoga & Mindfulness</span>
          </div>
          <h1 className="text-[24px] md:text-[28px] font-extrabold leading-tight mb-2">
            Find Your Balance
          </h1>
          <p className="text-[14px] text-purple-100 max-w-[500px] mb-4">
            Explore yoga poses, breathing exercises, and guided sequences for mind-body wellness.
          </p>
          <Link href="/fitness/ai-coach"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-purple-700 text-[13px] font-bold hover:bg-purple-50 transition-colors shadow-lg">
            <Sparkles size={14} /> Ask AI Coach About Yoga
          </Link>
        </div>
        <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full bg-white/10 blur-xl" />
      </motion.div>

      {/* Guided Sequences */}
      <div className="mb-6">
        <h2 className="text-[16px] font-extrabold text-gray-800 mb-3 flex items-center gap-2">
          <Play size={18} className="text-purple-500" /> Guided Sequences
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {yogaSeries.map((series, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href="/fitness/ai-coach" className="group block">
                <div className="bg-white rounded-xl border border-gray-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${series.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <span className="text-[20px]">{series.emoji}</span>
                  </div>
                  <h3 className="text-[13px] font-bold text-gray-800 mb-0.5">{series.name}</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed mb-2">{series.desc}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Clock size={10} /> {series.duration}</span>
                    <span className="text-[10px] text-gray-400">•</span>
                    <span className="text-[10px] text-gray-400">{series.poses} poses</span>
                    <span className={`ml-auto px-1.5 py-0.5 rounded text-[8px] font-bold ${levelColors[series.level]}`}>{series.level}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pranayama / Breathing */}
      <div className="mb-6">
        <h2 className="text-[16px] font-extrabold text-gray-800 mb-3 flex items-center gap-2">
          <Heart size={18} className="text-pink-500" /> Pranayama & Breathing
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {breathingExercises.map((b, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
              className="bg-white rounded-xl border border-gray-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-4 text-center hover:shadow-md transition-all">
              <span className="text-[24px] block mb-2">{b.emoji}</span>
              <h3 className="text-[13px] font-bold text-gray-800 mb-0.5">{b.name}</h3>
              <p className="text-[10px] text-gray-500 mb-1.5">{b.desc}</p>
              <span className="text-[10px] text-purple-500 font-semibold">{b.duration}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Yoga Pose Reference */}
      <div className="mb-6">
        <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">
          🧘 Yoga Pose Reference
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {yogaPoses.map((pose, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.03 }}
              className="bg-white rounded-xl border border-gray-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-4 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pose.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-[18px]">{pose.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-bold text-gray-800">{pose.name}</h3>
                  <p className="text-[10px] text-gray-400 italic">{pose.sanskrit}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{pose.benefits}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] text-gray-400 flex items-center gap-0.5"><Clock size={9} /> {pose.duration}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${levelColors[pose.level]}`}>{pose.level}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Exercises from Library */}
      {exercises.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[16px] font-extrabold text-gray-800">From Exercise Library</h2>
            <Link href="/fitness/exercises" className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-0.5">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exercises.slice(0, 4).map((ex, i) => (
              <Link key={ex.id} href="/fitness/exercises"
                className="bg-white rounded-xl border border-gray-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-4 hover:shadow-md transition-all flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-[20px]">🧘</span>
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-gray-800">{ex.name}</h3>
                  <p className="text-[10px] text-gray-500">{ex.difficulty} • {ex.body_part?.replace(/_/g, ' ')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Yoga Articles */}
      {articles.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[16px] font-extrabold text-gray-800">Yoga Articles</h2>
            <Link href="/fitness/articles" className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-0.5">
              All Articles <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {articles.slice(0, 3).map((article, i) => (
              <Link key={article.id} href="/fitness/articles"
                className="block bg-white rounded-xl border border-gray-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-4 hover:shadow-md transition-all">
                <h3 className="text-[13px] font-bold text-gray-800 mb-0.5">{article.title}</h3>
                <p className="text-[11px] text-gray-500 line-clamp-1">{article.excerpt}</p>
                <span className="text-[10px] text-gray-400 mt-1 inline-block">{article.read_time_min} min read</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
