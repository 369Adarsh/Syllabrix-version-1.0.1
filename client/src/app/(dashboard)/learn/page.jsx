'use client';
import { motion } from 'motion/react';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/Animate';
import Link from 'next/link';
import {
  GraduationCap, Trophy, Beaker, Mic, MessageSquare, Brain, Code, ChevronRight, Home, BookOpen
} from 'lucide-react';

const TOOLS = [
  {
    name: 'AI Study Table',
    description: 'Collaborative AI study sessions for deeper understanding.',
    icon: GraduationCap,
    color: 'blue',
    href: '/ai-study-table',
  },
  {
    name: 'Exam Prep',
    description: 'AI-powered exam preparation tailored to your syllabus and goals.',
    icon: Trophy,
    color: 'orange',
    href: '/prep',
  },
  {
    name: 'Virtual Lab',
    description: 'Hands-on simulated science experiments and lab procedures.',
    icon: Beaker,
    color: 'teal',
    href: '/virtual-lab',
  },
  {
    name: 'Mock Interview',
    description: 'Practice real-world interviews with industry-specific AI personas.',
    icon: Mic,
    color: 'purple',
    href: '/mock-interview',
  },
  {
    name: 'Debate Arena',
    description: 'Hone your argumentation skills against intelligent AI opponents.',
    icon: MessageSquare,
    color: 'rose',
    href: '/debate-arena',
  },
  {
    name: 'Mind Map',
    description: 'Visualise ideas and concepts with AI-powered mind mapping.',
    icon: Brain,
    color: 'indigo',
    href: '/mindmap',
  },
  {
    name: 'Code Lab',
    description: 'Interactive coding environments with AI-guided tutoring.',
    icon: Code,
    color: 'slate',
    href: '/code-lab',
  },
];

const COLOR = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-500',   border: 'hover:border-blue-300',   link: 'text-blue-600'   },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-500', border: 'hover:border-purple-300', link: 'text-purple-600' },
  teal:   { bg: 'bg-teal-50',   icon: 'text-teal-500',   border: 'hover:border-teal-300',   link: 'text-teal-600'   },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-500', border: 'hover:border-orange-300', link: 'text-orange-600' },
  rose:   { bg: 'bg-rose-50',   icon: 'text-rose-500',   border: 'hover:border-rose-300',   link: 'text-rose-600'   },
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-500', border: 'hover:border-indigo-300', link: 'text-indigo-600' },
  slate:  { bg: 'bg-slate-50',  icon: 'text-slate-500',  border: 'hover:border-slate-300',  link: 'text-slate-600'  },
};

export default function LearnHubPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-4">
        <Link href="/home" className="flex items-center gap-1 hover:text-gray-600 transition-colors">
          <Home size={11} /> Home
        </Link>
        <ChevronRight size={11} />
        <span className="text-gray-600 font-medium">Learn</span>
      </div>

      {/* Page header */}
      <FadeIn className="mb-8">
        <h1 className="flex items-center gap-2.5 text-[26px] font-extrabold text-gray-900 leading-tight">
          <BookOpen size={26} className="text-indigo-500" />
          Learn
        </h1>
        <p className="text-[14px] text-gray-500 mt-1">
          Master new skills with AI-powered interactive learning tracks
        </p>
      </FadeIn>

      {/* Cards grid */}
      <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.06}>
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
    </div>
  );
}
