'use client';
import Link from 'next/link';
import {
  Sparkles, Bot, Compass, Map, FlaskConical, BookOpenCheck,
  Newspaper, Dumbbell, LibraryBig, GraduationCap, ChevronRight, Home
} from 'lucide-react';

const TOOLS = [
  {
    name: 'AI Buddy',
    description: 'Your personal AI learning companion — ask anything, learn everything.',
    icon: Bot,
    color: 'blue',
    href: '/ai-buddy',
  },
  {
    name: 'Career Explorer',
    description: 'Explore 1000+ career paths with AI-guided insights and roadmaps.',
    icon: Compass,
    color: 'purple',
    href: '/career-explorer',
  },
  {
    name: 'Mind Map',
    description: 'Visualise ideas and concepts with AI-powered mind mapping.',
    icon: Map,
    color: 'teal',
    href: '/mindmap',
  },
  {
    name: 'Experience Lab',
    description: 'Hands-on simulated learning across 574+ profession scenarios.',
    icon: FlaskConical,
    color: 'orange',
    href: '/experience-lab',
  },
  {
    name: 'PrepSmart',
    description: 'AI-powered exam preparation tailored to your syllabus and goals.',
    icon: BookOpenCheck,
    color: 'green',
    href: '/prep',
  },
  {
    name: 'Newsroom',
    description: 'Curated educational news and updates delivered by AI.',
    icon: Newspaper,
    color: 'rose',
    href: '/newsroom',
  },
  {
    name: 'Fitness Coach',
    description: 'AI fitness and wellness guidance personalised for you.',
    icon: Dumbbell,
    color: 'amber',
    href: '/fitness-coach',
  },
  {
    name: 'AI Library',
    description: 'Smart resource discovery — books, papers and study material.',
    icon: LibraryBig,
    color: 'indigo',
    href: '/ai-library',
  },
  {
    name: 'AI Study Table',
    description: 'Collaborative AI study sessions for deeper understanding.',
    icon: GraduationCap,
    color: 'cyan',
    href: '/ai-study-table',
  },
];

// Tailwind color maps — must be full class names for JIT to include them
const COLOR = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-500',   border: 'hover:border-blue-300',   link: 'text-blue-600'   },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-500', border: 'hover:border-purple-300', link: 'text-purple-600' },
  teal:   { bg: 'bg-teal-50',   icon: 'text-teal-500',   border: 'hover:border-teal-300',   link: 'text-teal-600'   },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-500', border: 'hover:border-orange-300', link: 'text-orange-600' },
  green:  { bg: 'bg-green-50',  icon: 'text-green-500',  border: 'hover:border-green-300',  link: 'text-green-600'  },
  rose:   { bg: 'bg-rose-50',   icon: 'text-rose-500',   border: 'hover:border-rose-300',   link: 'text-rose-600'   },
  amber:  { bg: 'bg-amber-50',  icon: 'text-amber-500',  border: 'hover:border-amber-300',  link: 'text-amber-600'  },
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-500', border: 'hover:border-indigo-300', link: 'text-indigo-600' },
  cyan:   { bg: 'bg-cyan-50',   icon: 'text-cyan-500',   border: 'hover:border-cyan-300',   link: 'text-cyan-600'   },
};

export default function AIWorldPage() {
  return (
    <div className="max-w-5xl mx-auto">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-4">
        <Link href="/home" className="flex items-center gap-1 hover:text-gray-600 transition-colors">
          <Home size={11} /> Home
        </Link>
        <ChevronRight size={11} />
        <span className="text-gray-600 font-medium">AI World</span>
      </div>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-2.5 text-[26px] font-extrabold text-gray-900 leading-tight">
          <Sparkles size={26} className="text-blue-500" />
          AI World
        </h1>
        <p className="text-[14px] text-gray-500 mt-1">
          Your intelligent learning toolkit — powered by Syllabrix AI
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TOOLS.map((tool, i) => {
          const c = COLOR[tool.color];
          const Icon = tool.icon;
          return (
            <Link
              key={tool.name}
              href={tool.href}
              className={`opacity-0 group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 transition-all duration-200 hover:shadow-md hover:scale-[1.03] ${c.border}`}
              style={{ animation: 'flyIn 0.4s ease-out forwards', animationDelay: `${i * 80}ms` }}
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
                Open <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
