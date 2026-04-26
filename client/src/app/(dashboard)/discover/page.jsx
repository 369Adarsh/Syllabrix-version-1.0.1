'use client';
import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
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
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)' }}>
        <div className="px-5 py-5 relative">
          <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[20px]">🔭</span>
              <span className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Discovery Hub</span>
            </div>
            <h1 className="text-white font-extrabold text-[20px] leading-tight">Hello, {name}!</h1>
            <p className="text-white/60 text-[12px] mt-1">Curiosity is a superpower. Explore yours.</p>
          </div>
        </div>
      </div>

      {/* Did You Know */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
            <span className="text-[14px]">💡</span>
          </div>
          <p className="text-[12px] font-extrabold text-gray-700">Did You Know? — Today</p>
          <span className={`ml-auto text-[9px] px-2 py-0.5 rounded-full font-bold border ${TAG_COLORS[fact.tag] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {fact.tag}
          </span>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-[30px] flex-shrink-0">{fact.emoji}</span>
          <p className="text-[13px] text-gray-700 leading-relaxed font-medium">{fact.fact}</p>
        </div>
      </div>

      {/* World of... */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Explore Worlds</p>
        <div className="space-y-3">
          {WORLDS.map(world => (
            <Link
              key={world.slug}
              href={`/discover/${world.slug}`}
              className="flex items-center gap-4 rounded-2xl overflow-hidden hover:shadow-md transition-all active:scale-[0.99]"
              style={{ background: world.gradient }}
            >
              <div className="px-5 py-4 flex-1">
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-0.5">{world.tagline}</p>
                <p className="text-white font-extrabold text-[16px]">{world.title}</p>
                <p className="text-white/60 text-[11px] mt-1">{world.sections.length} sections · {world.sections.reduce((a, s) => a + s.items.length, 0)} stories</p>
              </div>
              <div className="pr-4 flex flex-col items-center gap-1">
                <span className="text-[32px]">{world.emoji}</span>
                <ChevronRight size={14} className="text-white/60" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Inspiring Indians */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Inspiring Indians</p>
        <div className="grid grid-cols-2 gap-3">
          {INSPIRING_INDIANS.slice(0, 4).map(person => (
            <div key={person.name} className={`rounded-2xl border p-3.5 ${person.color}`}>
              <p className="text-[22px] mb-1.5">{person.emoji}</p>
              <p className="text-[12px] font-extrabold leading-snug">{person.name}</p>
              <p className="text-[10px] font-semibold opacity-70 mb-1.5">{person.field}</p>
              <p className="text-[10px] leading-relaxed opacity-80 line-clamp-3">{person.story}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {INSPIRING_INDIANS.slice(4, 6).map(person => (
            <div key={person.name} className={`rounded-2xl border p-3.5 ${person.color}`}>
              <p className="text-[22px] mb-1.5">{person.emoji}</p>
              <p className="text-[12px] font-extrabold leading-snug">{person.name}</p>
              <p className="text-[10px] font-semibold opacity-70 mb-1.5">{person.field}</p>
              <p className="text-[10px] leading-relaxed opacity-80 line-clamp-3">{person.story}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Quiz CTA */}
      <Link
        href="/discover/skill-quiz"
        className="flex items-center gap-4 rounded-2xl p-4 border-2 border-dashed border-violet-300 bg-violet-50 hover:bg-violet-100 transition-colors"
      >
        <div className="w-12 h-12 rounded-2xl bg-violet-200 flex items-center justify-center text-[24px] flex-shrink-0">🎯</div>
        <div className="flex-1">
          <p className="text-[14px] font-extrabold text-violet-800">What Kind of Thinker Are You?</p>
          <p className="text-[11px] text-violet-600 mt-0.5">Take the 2-minute skill quiz — Creative, Analytical, or Both?</p>
        </div>
        <ChevronRight size={16} className="text-violet-400 flex-shrink-0" />
      </Link>
    </div>
  );
}
