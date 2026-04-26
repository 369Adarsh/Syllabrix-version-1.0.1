'use client';
import Link from 'next/link';
import { ChevronRight, Sparkles, Brain, Compass } from 'lucide-react';
import { getTodayFact, WORLD_OF, INSPIRING_INDIANS } from '@/data/curious-mind';
import { useAuth } from '@/contexts/AuthContext';

const WORLDS = [WORLD_OF.science, WORLD_OF.maths, WORLD_OF.history];

const TAG_COLORS = {
  Science: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  Maths:   'bg-violet-100 text-violet-700 border-violet-200',
  History: 'bg-amber-100 text-amber-700 border-amber-200',
};

export default function DiscoverPage() {
  const { user } = useAuth();
  const name = user?.profile?.full_name?.split(' ')[0] || user?.username || 'Explorer';
  const fact = getTodayFact();

  return (
    <div className="space-y-6">

      {/* Hero — full width */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)' }}>
        <div className="px-6 py-7 md:px-10 md:py-10 relative">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-teal-500/10 translate-y-1/2 pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🔭</span>
                <span className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Discovery Hub</span>
              </div>
              <h1 className="text-white font-extrabold text-2xl md:text-3xl leading-tight">
                Hello, {name}!
              </h1>
              <p className="text-white/60 text-sm mt-1.5">Curiosity is a superpower. Keep exploring.</p>
            </div>
            <span className="text-6xl md:text-7xl flex-shrink-0 hidden sm:block">🌌</span>
          </div>
        </div>
      </div>

      {/* Two-column desktop layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — main content (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Explore Worlds */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Explore Worlds</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {WORLDS.map(world => (
                <Link
                  key={world.slug}
                  href={`/discover/${world.slug}`}
                  className="rounded-2xl overflow-hidden hover:shadow-xl transition-all active:scale-[0.98] group"
                  style={{ background: world.gradient }}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl group-hover:scale-110 transition-transform inline-block">{world.emoji}</span>
                      <ChevronRight size={16} className="text-white/60 group-hover:translate-x-1 transition-transform mt-1" />
                    </div>
                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">{world.tagline}</p>
                    <p className="text-white font-extrabold text-[16px] leading-snug">{world.title}</p>
                    <p className="text-white/50 text-[11px] mt-2">
                      {world.sections.length} sections · {world.sections.reduce((a, s) => a + s.items.length, 0)} stories
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Inspiring Indians */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Inspiring Indians</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {INSPIRING_INDIANS.map(person => (
                <div key={person.name} className={`rounded-2xl border p-4 ${person.color}`}>
                  <p className="text-[28px] mb-2">{person.emoji}</p>
                  <p className="text-[13px] font-extrabold leading-snug">{person.name}</p>
                  <p className="text-[11px] font-semibold opacity-70 mb-2">{person.field}</p>
                  <p className="text-[11px] leading-relaxed opacity-80 line-clamp-3">{person.story}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — sidebar (1/3) */}
        <div className="space-y-5">

          {/* Did You Know */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                  <span className="text-[15px]">💡</span>
                </div>
                <p className="text-sm font-extrabold text-gray-700">Did You Know?</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${TAG_COLORS[fact.tag] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {fact.tag}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[36px] flex-shrink-0">{fact.emoji}</span>
              <p className="text-[13px] text-gray-700 leading-relaxed font-medium">{fact.fact}</p>
            </div>
          </div>

          {/* Skill Quiz CTA */}
          <Link
            href="/discover/skill-quiz"
            className="flex flex-col gap-3 rounded-2xl p-5 border-2 border-dashed border-violet-300 bg-violet-50 hover:bg-violet-100 transition-colors group"
          >
            <div className="w-12 h-12 rounded-2xl bg-violet-200 flex items-center justify-center text-[26px] group-hover:scale-110 transition-transform">
              🎯
            </div>
            <div>
              <p className="text-[14px] font-extrabold text-violet-800">What Kind of Thinker Are You?</p>
              <p className="text-[12px] text-violet-600 mt-1 leading-relaxed">
                Take the 2-minute skill quiz — Creative, Analytical, or Both?
              </p>
            </div>
            <span className="text-[12px] font-bold text-violet-600 flex items-center gap-1">
              Start Quiz <ChevronRight size={13} />
            </span>
          </Link>

          {/* Quick explore links */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Jump To</p>
            {[
              { href: '/discover/science', emoji: '🔬', label: 'World of Science' },
              { href: '/discover/maths',   emoji: '📐', label: 'World of Maths'   },
              { href: '/discover/history', emoji: '🏺', label: 'World of History'  },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                <span className="text-lg w-7 text-center">{item.emoji}</span>
                <span className="text-[13px] font-semibold text-gray-700 flex-1">{item.label}</span>
                <ChevronRight size={12} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
