'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { WORLD_OF } from '@/data/curious-mind';

function SectionCard({ section, accentHex }) {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">{section.title}</p>
      {section.items.map((item, i) => (
        <div key={i} className="border-t border-gray-50 first:border-0">
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <span className="text-[20px] flex-shrink-0">{item.emoji}</span>
            <span className="flex-1 text-[13px] font-bold text-gray-800">{item.title}</span>
            {openIdx === i
              ? <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
              : <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
            }
          </button>
          {openIdx === i && (
            <div className="px-4 pb-4 pt-0">
              <div className="pl-9">
                <div className="h-0.5 rounded-full mb-3 w-12" style={{ backgroundColor: accentHex }} />
                <p className="text-[13px] text-gray-600 leading-relaxed">{item.body}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function WorldOfPage() {
  const { slug } = useParams();
  const world = WORLD_OF[slug];

  if (!world) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-gray-400 text-[14px]">World not found.</p>
        <Link href="/discover" className="text-blue-500 text-[13px] mt-2 inline-block">← Back to Discover</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/discover" className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50">
          <ArrowLeft size={16} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-[16px] font-extrabold text-gray-800">{world.title}</h1>
          <p className="text-[11px] text-gray-400">{world.tagline}</p>
        </div>
      </div>

      {/* Banner */}
      <div className="rounded-2xl overflow-hidden" style={{ background: world.gradient }}>
        <div className="px-5 py-5 flex items-center gap-4 relative">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
          <span className="text-[48px] relative z-10">{world.emoji}</span>
          <div className="relative z-10">
            <p className="text-white font-extrabold text-[18px]">{world.title}</p>
            <p className="text-white/70 text-[12px] mt-0.5">{world.sections.reduce((a, s) => a + s.items.length, 0)} stories · Tap any card to explore</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      {world.sections.map((section, i) => (
        <SectionCard key={i} section={section} accentHex={world.hex} />
      ))}

      {/* More worlds */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Explore More</p>
        <div className="flex gap-3">
          {Object.values(WORLD_OF).filter(w => w.slug !== slug).map(w => (
            <Link
              key={w.slug}
              href={`/discover/${w.slug}`}
              className={`flex-1 rounded-2xl border p-3 text-center hover:shadow-md transition-all ${w.light} ${w.border}`}
            >
              <p className="text-[24px] mb-1">{w.emoji}</p>
              <p className={`text-[11px] font-extrabold ${w.text}`}>{w.title.replace('World of ', '')}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
