'use client';
import Link from 'next/link';
import { BookOpen, ChevronRight, Sparkles } from 'lucide-react';

const COMING_SOON_STORIES = [
  { title: 'The Lion and the Mouse',    lang: 'English', emoji: '🦁', level: 'Beginner', tags: ['Panchatantra'] },
  { title: 'Tenali Raman and the Cats', lang: 'English', emoji: '🐱', level: 'Beginner', tags: ['Tenali Raman'] },
  { title: 'शेर और चूहा',               lang: 'हिंदी',   emoji: '🐭', level: 'Beginner', tags: ['पंचतंत्र']   },
  { title: 'The Clever Crow',           lang: 'English', emoji: '🦅', level: 'Starter',  tags: ['Folk Tale']  },
  { title: 'अकबर और बीरबल',            lang: 'हिंदी',   emoji: '👑', level: 'Beginner', tags: ['अकबर-बीरबल'] },
  { title: 'The Ant and the Grasshopper', lang: 'English', emoji: '🐜', level: 'Starter', tags: ['Aesop']   },
];

const LEVEL_COLOR = {
  'Starter':      'bg-green-50 text-green-700 border-green-200',
  'Beginner':     'bg-blue-50 text-blue-700 border-blue-200',
  'Intermediate': 'bg-amber-50 text-amber-700 border-amber-200',
  'Independent':  'bg-purple-50 text-purple-700 border-purple-200',
};

export default function StoriesPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D9488, #059669)' }}>
        <div className="px-5 py-5 relative">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-[18px]">📚</div>
              <div>
                <h1 className="text-white font-extrabold text-[18px] leading-tight">Story Library</h1>
                <p className="text-white/60 text-[11px]">Illustrated stories in English & Hindi</p>
              </div>
            </div>
            <p className="text-white/70 text-[12px] mt-2">
              Read stories with text highlighted word by word. Earn stars for every story you finish!
            </p>
          </div>
        </div>
      </div>

      {/* Coming soon banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-[18px] flex-shrink-0">🦜</div>
        <div>
          <p className="text-[13px] font-extrabold text-amber-800">Boli says: Stories coming very soon!</p>
          <p className="text-[12px] text-amber-700 mt-1 leading-relaxed">
            We're adding illustrated stories with audio narration and word-by-word highlighting.
            Here's a sneak peek at what's coming!
          </p>
        </div>
      </div>

      {/* Story preview cards */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Coming Soon</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COMING_SOON_STORIES.map((story, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-4 opacity-70"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[24px] flex-shrink-0">
                  {story.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-extrabold text-gray-800 leading-snug">{story.title}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${LEVEL_COLOR[story.level] || LEVEL_COLOR.Beginner}`}>
                      {story.level}
                    </span>
                    <span className="text-[9px] text-gray-400">{story.lang}</span>
                    {story.tags.map((t, j) => (
                      <span key={j} className="text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full border border-gray-100">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it will work */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <p className="text-[12px] font-extrabold text-gray-700 mb-4 flex items-center gap-2">
          <Sparkles size={14} className="text-teal-500" /> How Story Library will work
        </p>
        <div className="space-y-3">
          {[
            { icon: '🎧', text: 'Tap any word to hear it spoken aloud — perfect for new readers' },
            { icon: '✨', text: 'Text highlights word by word as the story narrates automatically' },
            { icon: '⭐', text: 'Earn 1–3 stars for each story based on how much you read yourself' },
            { icon: '🌍', text: 'Stories available in English, Hindi, and regional languages' },
            { icon: '📖', text: 'Levels: Pre-reader → Beginner → Intermediate → Independent' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-[18px] flex-shrink-0">{item.icon}</span>
              <p className="text-[12px] text-gray-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Back to games */}
      <Link
        href="/learn-play"
        className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-teal-500 text-white font-extrabold text-[14px] hover:bg-teal-600 transition-colors shadow-md"
      >
        <BookOpen size={16} /> Back to Learn & Play
      </Link>
    </div>
  );
}
