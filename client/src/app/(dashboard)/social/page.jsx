'use client';
import { motion } from 'motion/react';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/Animate';
import Link from 'next/link';
import {
  Users, Briefcase, BookOpen, MessageSquare, ChevronRight, Home, Network
} from 'lucide-react';

const TOOLS = [
  {
    name: 'Groups',
    description: 'Join communities, find study groups and connect with peers.',
    icon: Users,
    color: 'blue',
    href: '/groups',
  },
  {
    name: 'Jobs',
    description: 'Explore tech jobs, internships, and entry-level roles.',
    icon: Briefcase,
    color: 'purple',
    href: '/jobs',
  },
  {
    name: 'Tuition',
    description: 'Find local tutors or list your own tutoring services.',
    icon: BookOpen,
    color: 'emerald',
    href: '/tuition',
  },
  {
    name: 'Messages',
    description: 'Chat directly with peers, coaches, and recruiters.',
    icon: MessageSquare,
    color: 'rose',
    href: '/messages',
  },
];

const COLOR = {
  blue:    { bg: 'bg-blue-50',    icon: 'text-blue-500',    border: 'hover:border-blue-300',    link: 'text-blue-600'   },
  purple:  { bg: 'bg-purple-50',  icon: 'text-purple-500',  border: 'hover:border-purple-300',  link: 'text-purple-600' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-500', border: 'hover:border-emerald-300', link: 'text-emerald-600' },
  rose:    { bg: 'bg-rose-50',    icon: 'text-rose-500',    border: 'hover:border-rose-300',    link: 'text-rose-600'   },
};

export default function SocialHubPage() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-12 pb-20 px-2 md:px-0">
      {/* Breadcrumb — Pro Calibration */}
      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 px-2">
        <Link href="/home" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
          <Home size={11} strokeWidth={3} /> Home
        </Link>
        <ChevronRight size={10} strokeWidth={3} />
        <span className="text-gray-900">Intelligence Hub</span>
      </div>

      {/* Page header — High Density */}
      <FadeIn className="mb-12 px-2">
        <div className="flex items-center gap-3 mb-4">
           <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-100">
              <Network size={20} className="text-white" strokeWidth={2.5} />
           </div>
           <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Network Institute</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-4">
          Social Syllabrix
        </h1>
        <p className="text-sm md:text-lg text-gray-400 font-medium max-w-2xl leading-relaxed">
          Navigate the specialist network. Connect with strategic peers, analyze job feeds, and deploy your career intelligence.
        </p>
      </FadeIn>

      {/* Cards grid — Strategic Module Layout */}
      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 px-2" stagger={0.06}>
        {TOOLS.map((tool) => {
          const c = COLOR[tool.color];
          const Icon = tool.icon;
          return (
            <StaggerItem key={tool.name}>
              <motion.div 
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={tool.href}
                  className={`group bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 flex flex-col h-full gap-8 transition-all hover:shadow-xl hover:shadow-gray-200/40 ${c.border}`}
                >
                  <div className="flex items-center justify-between">
                     <div className={`w-14 h-14 rounded-[22px] ${c.bg} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>
                       <Icon size={24} className={c.icon} strokeWidth={2.5} />
                     </div>
                     <div className="p-2 rounded-full bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight size={16} className="text-gray-400" />
                     </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{tool.name} Module</p>
                    <p className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none">{tool.name}</p>
                    <p className="text-[12px] font-medium text-gray-400 leading-relaxed pr-4">{tool.description}</p>
                  </div>

                  <div className={`mt-auto pt-6 border-t border-gray-50 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] ${c.link}`}>
                    <span>Strategic Access</span>
                    <ChevronRight size={14} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
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
