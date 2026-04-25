'use client';
import { useState, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, BookOpen, ListChecks, ClipboardList,
  MessageSquare, BarChart2, FlaskConical, CalendarDays, Zap, Video
} from 'lucide-react';

export const JeeContext = createContext({
  selectedClass: 11,
  setSelectedClass: () => {},
  examType: 'jee',       // 'jee' | 'neet'
  setExamType: () => {},
  jeeMode: 'main',       // 'main' | 'advanced'  (only when examType === 'jee')
  setJeeMode: () => {},
});
export const useJee = () => useContext(JeeContext);

const TABS = [
  { id: 'dashboard',      label: 'Dashboard',      href: '/jee-command',                icon: LayoutDashboard },
  { id: 'syllabus',       label: 'Syllabus',        href: '/jee-command/syllabus',        icon: BookOpen        },
  { id: 'videos',         label: 'Video Lectures',  href: '/jee-command/videos',          icon: Video           },
  { id: 'ncert',          label: 'NCERT',           href: '/jee-command/ncert',           icon: BookOpen        },
  { id: 'books',          label: 'Ref Books',       href: '/jee-command/books',           icon: BookOpen        },
  { id: 'pyq',            label: 'PYQ Bank',        href: '/jee-command/pyq',             icon: ListChecks      },
  { id: 'mock-tests',     label: 'Mock Tests',      href: '/jee-command/mock-tests',      icon: ClipboardList   },
  { id: 'ai-tutor',       label: 'AI Tutor',        href: '/jee-command/ai-tutor',        icon: MessageSquare   },
  { id: 'analytics',      label: 'Analytics',       href: '/jee-command/analytics',       icon: BarChart2       },
  { id: 'formula-sheets', label: 'Formulas',        href: '/jee-command/formula-sheets',  icon: FlaskConical    },
  { id: 'study-plan',     label: 'Study Plan',      href: '/jee-command/study-plan',      icon: CalendarDays    },
];

export default function JeeCommandLayout({ children }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState(11);
  const [examType, setExamType] = useState('jee');
  const [jeeMode, setJeeMode] = useState('main');

  const isExamPlayer = pathname.includes('/mock-tests/') && !pathname.endsWith('/mock-tests') && !pathname.includes('/result');

  if (isExamPlayer) {
    return (
      <JeeContext.Provider value={{ selectedClass, setSelectedClass, examType, setExamType, jeeMode, setJeeMode }}>
        <div className="min-h-screen bg-[#F0F2F5]">{children}</div>
      </JeeContext.Provider>
    );
  }

  const isNeet = examType === 'neet';

  return (
    <JeeContext.Provider value={{ selectedClass, setSelectedClass, examType, setExamType, jeeMode, setJeeMode }}>
      <div className="min-h-screen">
        {/* ── Header ── */}
        <div
          className="rounded-xl overflow-hidden mb-0"
          style={{ background: isNeet ? 'linear-gradient(135deg, #065f46, #0f766e)' : 'linear-gradient(135deg, #042C53, #185FA5)' }}
        >
          <div className="flex items-center justify-between px-4 py-3 flex-wrap gap-2">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Zap size={16} className="text-yellow-300" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-[15px] leading-tight">Exam Command</h1>
                  <p className="text-white/50 text-[10px]">
                    {isNeet ? 'NEET — Physics · Chemistry · Biology' : 'JEE — Physics · Chemistry · Maths'}
                  </p>
                </div>
              </div>

              {/* Class switcher */}
              <div className="hidden sm:flex bg-white/10 rounded-full p-0.5">
                {[11, 12].map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedClass(c)}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                      selectedClass === c ? 'bg-white/25 text-white' : 'text-white/50 hover:text-white/75'
                    }`}
                  >
                    Class {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* JEE Main / Advanced — only when JEE is active */}
              {!isNeet && (
                <div className="hidden sm:flex bg-white/10 rounded-full p-0.5">
                  {[{ id: 'main', label: 'JEE Main' }, { id: 'advanced', label: 'Advanced' }].map(e => (
                    <button
                      key={e.id}
                      onClick={() => setJeeMode(e.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                        jeeMode === e.id ? 'bg-white/25 text-white' : 'text-white/50 hover:text-white/75'
                      }`}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              )}

              {/* JEE / NEET primary toggle */}
              <div className="flex bg-white/15 rounded-full p-0.5">
                {[{ id: 'jee', label: 'JEE' }, { id: 'neet', label: 'NEET' }].map(e => (
                  <button
                    key={e.id}
                    onClick={() => setExamType(e.id)}
                    className={`px-4 py-1 rounded-full text-[11px] font-bold transition-all ${
                      examType === e.id ? 'bg-white text-gray-800 shadow-sm' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto border-t border-white/10" style={{ scrollbarWidth: 'none' }}>
            {TABS.map(tab => {
              const active = pathname === tab.href || (tab.href !== '/jee-command' && pathname.startsWith(tab.href));
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium whitespace-nowrap flex-shrink-0 transition-colors relative ${
                    active ? 'text-white' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <Icon size={13} />
                  {tab.label}
                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-yellow-300 rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Page content */}
        <div className="mt-3">{children}</div>
      </div>
    </JeeContext.Provider>
  );
}
