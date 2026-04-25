'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Mascot from '@/components/learn-play/Mascot';
import { Star, Lock, ChevronRight, BookOpen, Volume2 } from 'lucide-react';

const GAMES = [
  {
    id: 'sound-tap',
    title: 'Sound Tap',
    emoji: '🔤',
    desc: 'Does this word start with that letter?',
    lang: 'English',
    langEmoji: '🇬🇧',
    difficulty: 1,
    color: 'from-blue-400 to-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    href: '/learn-play/sound-tap',
    locked: false,
  },
  {
    id: 'rhyme-time',
    title: 'Rhyme Time',
    emoji: '🎵',
    desc: 'Find the words that rhyme!',
    lang: 'English',
    langEmoji: '🇬🇧',
    difficulty: 1,
    color: 'from-pink-400 to-rose-500',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    href: '/learn-play/rhyme-time',
    locked: false,
  },
  {
    id: 'word-builder',
    title: 'Word Builder',
    emoji: '🧩',
    desc: 'Rearrange the letters to build the word!',
    lang: 'English',
    langEmoji: '🇬🇧',
    difficulty: 2,
    color: 'from-violet-400 to-purple-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    href: '/learn-play/word-builder',
    locked: false,
  },
  {
    id: 'matra-match',
    title: 'Matra Match',
    emoji: '🪔',
    desc: 'Match the right matra to complete the syllable!',
    lang: 'हिंदी',
    langEmoji: '🇮🇳',
    difficulty: 1,
    color: 'from-orange-400 to-amber-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    href: '/learn-play/matra-match',
    locked: false,
  },
  {
    id: 'story-reader',
    title: 'Story Reader',
    emoji: '📖',
    desc: 'Read fun stories and earn stars!',
    lang: 'English + हिंदी',
    langEmoji: '🌍',
    difficulty: 2,
    color: 'from-teal-400 to-emerald-500',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    href: '/stories',
    locked: false,
  },
  {
    id: 'barakhadi',
    title: 'Barakhadi',
    emoji: '🪐',
    desc: 'Learn the full barakhadi — coming soon!',
    lang: 'हिंदी',
    langEmoji: '🇮🇳',
    difficulty: 3,
    color: 'from-gray-300 to-gray-400',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    href: '#',
    locked: true,
  },
];

function DifficultyDots({ level }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i <= level ? 'bg-amber-400' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default function LearnPlayPage() {
  const { user } = useAuth();
  const firstName = user?.profile?.full_name?.split(' ')[0] || user?.username || 'friend';
  const [lang, setLang] = useState('all');

  const filtered = lang === 'all'
    ? GAMES
    : lang === 'en'
      ? GAMES.filter(g => g.langEmoji === '🇬🇧')
      : GAMES.filter(g => g.langEmoji === '🇮🇳');

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}>
        <div className="px-5 pt-5 pb-4 relative">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="relative z-10 flex items-end justify-between gap-3">
            <div>
              <p className="text-white/70 text-[11px] font-semibold uppercase tracking-widest mb-1">Learn & Play</p>
              <h1 className="text-white font-extrabold text-[22px] leading-tight">
                Hi {firstName}! 👋
              </h1>
              <p className="text-white/70 text-[12px] mt-1">Choose a game and start learning!</p>
            </div>
            <Mascot message="Ready to play? 🌟" state="happy" size="md" />
          </div>
        </div>

        {/* Language filter tabs */}
        <div className="flex gap-1 px-4 pb-3">
          {[
            { id: 'all', label: '🌍 All' },
            { id: 'en',  label: '🇬🇧 English' },
            { id: 'hi',  label: '🇮🇳 हिंदी' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setLang(t.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                lang === t.id
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'bg-white/20 text-white/80 hover:bg-white/30'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Game Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(game => (
          <Link
            key={game.id}
            href={game.locked ? '#' : game.href}
            className={`relative block rounded-2xl border p-4 transition-all group ${game.bg} ${game.border} ${game.locked ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md hover:-translate-y-0.5'}`}
          >
            {game.locked && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <Lock size={12} className="text-gray-500" />
              </div>
            )}

            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center flex-shrink-0 shadow-sm text-[22px] ${!game.locked && 'group-hover:scale-105 transition-transform'}`}>
                {game.emoji}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-extrabold text-gray-800 text-[14px]">{game.title}</h3>
                  <span className="text-[10px] text-gray-400">{game.langEmoji} {game.lang}</span>
                </div>
                <p className="text-[12px] text-gray-500 leading-snug">{game.desc}</p>
                <div className="flex items-center justify-between mt-2">
                  <DifficultyDots level={game.difficulty} />
                  {!game.locked && (
                    <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                      Play <ChevronRight size={12} />
                    </span>
                  )}
                  {game.locked && (
                    <span className="text-[11px] text-gray-400">Coming soon</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Tip from Boli ── */}
      <div className="bg-white rounded-2xl border border-amber-100 p-4 flex items-start gap-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-[20px]">🦜</div>
        <div>
          <p className="text-[12px] font-extrabold text-amber-700 mb-0.5">Boli says:</p>
          <p className="text-[12px] text-gray-600 leading-relaxed">
            Play a game every day to earn stars! The more you play, the better reader you become.
            Start with <strong>Sound Tap</strong> if you're new! 🌟
          </p>
        </div>
      </div>

      {/* ── Stories shortcut ── */}
      <Link
        href="/stories"
        className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-[22px] shadow-sm group-hover:scale-105 transition-transform">
            📚
          </div>
          <div>
            <p className="font-extrabold text-gray-800 text-[14px]">Story Library</p>
            <p className="text-[11px] text-gray-500">Illustrated stories in English & Hindi</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-teal-400 group-hover:text-teal-600 transition-colors" />
      </Link>

    </div>
  );
}
