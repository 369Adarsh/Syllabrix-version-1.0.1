'use client';
import { motion } from 'motion/react';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/Animate';
import Link from 'next/link';
import {
  Gamepad2, Play, Film, ChevronRight, Home
} from 'lucide-react';
import LottieAnimation from '@/components/ui/LottieAnimation';

const TOOLS = [
  {
    name: 'Arcade',
    description: 'Play educational games that boost cognitive skills.',
    icon: Gamepad2,
    color: 'purple',
    href: '/arcade',
  },
  {
    name: 'Shorts & Clips',
    description: 'Bite-sized educational video content for quick learning.',
    icon: Play,
    color: 'rose',
    href: '/clips',
  },
  {
    name: 'Reels',
    description: 'Engaging, interactive stories explaining complex topics.',
    icon: Film,
    color: 'emerald',
    href: '/reels',
  },
];

const COLOR = {
  purple:  { bg: 'bg-purple-50',  icon: 'text-purple-500',  border: 'hover:border-purple-300',  link: 'text-purple-600' },
  rose:    { bg: 'bg-rose-50',    icon: 'text-rose-500',    border: 'hover:border-rose-300',    link: 'text-rose-600'   },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-500', border: 'hover:border-emerald-300', link: 'text-emerald-600' },
};

export default function PlayHubPage() {
  const RECENTLY_PLAYED = [
    { name: 'Word Genesis', category: 'Arcade', time: '2h ago', icon: '🔤' },
    { name: 'Quantum Leap Shorts', category: 'Clips', time: 'Yesterday', icon: '⚛️' },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-4">
        <Link href="/home" className="flex items-center gap-1 hover:text-gray-600 transition-colors">
          <Home size={11} /> Home
        </Link>
        <ChevronRight size={11} />
        <span className="text-gray-600 font-medium">Play</span>
      </div>

      {/* Page header */}
      <FadeIn className="mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 p-6 shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <LottieAnimation src="/animations/rocket-launch.json" className="w-20 h-20 hidden sm:block" />
              <div>
                <h1 className="text-[24px] font-extrabold text-white leading-tight">Play & Unwind</h1>
                <p className="text-[14px] text-pink-200/80 mt-1">Take a break with gamified learning and immersive mini-content</p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Cards grid */}
      <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10" stagger={0.06}>
        {TOOLS.map((tool) => {
          const c = COLOR[tool.color];
          const Icon = tool.icon;
          return (
            <StaggerItem key={tool.name}>
              <motion.div whileHover={{ y: -4, scale: 1.02, boxShadow: '0 8px 28px rgba(0,0,0,0.10)', transition: { duration: 0.18 } }}>
                <Link
                  href={tool.href}
                  className={`group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 transition-colors ${c.border}`}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={24} className={c.icon} strokeWidth={1.8} />
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <p className="text-[15px] font-bold text-gray-900 mb-1">{tool.name}</p>
                    <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">{tool.description}</p>
                  </div>

                  {/* CTA */}
                  <div className={`flex items-center gap-1 text-[12px] font-semibold ${c.link}`}>
                    Open <ChevronRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            </StaggerItem>
          );
        })}
      </StaggerChildren>

      {/* Recently Played */}
      <FadeIn delay={0.2}>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Gamepad2 size={18} className="text-purple-500" />
              <h2 className="text-[16px] font-bold text-gray-800">Recently Played</h2>
            </div>
            <button className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider hover:underline">View All</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {RECENTLY_PLAYED.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 hover:border-indigo-100 bg-gray-50/30 transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                  <p className="text-[11px] text-gray-400">{item.category} • {item.time}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-indigo-600 shadow-sm transition-opacity">
                  <Play size={12} fill="currentColor" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

