'use client';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Compass, Gamepad2, User, Sparkles, MessageCircle, Menu, ShieldCheck, Brain, Briefcase, GraduationCap, Users, Newspaper, Zap, Target } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { getPlatformMode } from '@/utils/platformMode';

// Student bottom nav — default (curious_mind, board_warrior, exam_command, skill_builder)
const STUDENT_NAV_DEFAULT = [
  { href: '/home',           icon: Home,     label: 'Home'    },
  { href: '/ai-buddy',       icon: Sparkles, label: 'Learn'   },
  { href: '/experience-lab', icon: Compass,  label: 'Explore' },
  { href: '/arcade',         icon: Gamepad2, label: 'Play'    },
  { href: '/profile',        icon: User,     label: 'Profile' },
];

// Young Explorer — age-appropriate bottom nav (no career explorer)
const STUDENT_NAV_YOUNG_EXPLORER = [
  { href: '/home',       icon: Home,     label: 'Home'    },
  { href: '/learn-play', icon: BookOpen, label: 'Learn'   },
  { href: '/stories',    icon: BookOpen, label: 'Stories' },
  { href: '/arcade',     icon: Gamepad2, label: 'Play'    },
  { href: '/profile',    icon: User,     label: 'Profile' },
];

// Curious Mind — discovery-focused bottom nav
const STUDENT_NAV_CURIOUS_MIND = [
  { href: '/home',     icon: Home,     label: 'Home'     },
  { href: '/discover', icon: Compass,  label: 'Discover' },
  { href: '/ai-buddy', icon: Sparkles, label: 'AI Buddy' },
  { href: '/arcade',   icon: Gamepad2, label: 'Play'     },
  { href: '/profile',  icon: User,     label: 'Profile'  },
];

// Board Warrior — board exam bottom nav
const STUDENT_NAV_BOARD = [
  { href: '/home',            icon: Home,        label: 'Home'    },
  { href: '/boards',          icon: Target,      label: 'Boards'  },
  { href: '/boards/chapters', icon: BookOpen,    label: 'Chapters'},
  { href: '/ai-buddy',        icon: Sparkles,    label: 'AI Buddy'},
  { href: '/profile',         icon: User,        label: 'Profile' },
];

// UPSC Aspirant — exam-focused bottom nav
const STUDENT_NAV_UPSC = [
  { href: '/home',                icon: Home,        label: 'Briefing' },
  { href: '/upsc',                icon: Zap,         label: 'UPSC'     },
  { href: '/prep/daily-quiz',     icon: Brain,       label: 'Quiz'     },
  { href: '/ai-buddy',            icon: Sparkles,    label: 'Mentor'   },
  { href: '/profile',             icon: User,        label: 'Profile'  },
];

// Parent-specific bottom nav tabs (per spec section 8)
const PARENT_NAV = [
  { href: '/home',             icon: Home,        label: 'Home'     },
  { href: '/parent-dashboard', icon: ShieldCheck, label: 'Children' },
  { href: '/home?tab=feed',    icon: MessageCircle, label: 'Feed'   },
  { href: '/ai-buddy',         icon: Brain,       label: 'Learn'    },
  { href: '/profile',          icon: User,        label: 'Profile', isProfile: true },
];

// Professional learner bottom nav
const PROFESSIONAL_NAV = [
  { href: '/home',            icon: Home,          label: 'Home'    },
  { href: '/career/jobs',     icon: Briefcase,     label: 'Jobs'    },
  { href: '/career/learning', icon: GraduationCap, label: 'Learn'   },
  { href: '/groups',          icon: Users,         label: 'Network' },
  { href: '/profile',         icon: User,          label: 'Profile', isProfile: true },
];

// Generic bottom nav for all other user types
const GENERIC_NAV = [
  { href: '/home',     icon: Home,          label: 'Home'     },
  { href: '/newsroom', icon: Newspaper,     label: 'News'     },
  { href: '/ai-world', icon: Sparkles,      label: 'AI Studio', center: true },
  { href: '/messages', icon: MessageCircle, label: 'Messages' },
];

export default function BottomNav({ onMenuClick = () => {} }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const hasPhoto = user?.profile_photo_url && !user.profile_photo_url.includes('PASTE_');
  const isStudent = user?.user_type === 'student';
  const isParent = user?.user_type === 'parent';
  const isProfessional = user?.user_type === 'professional_learner' || user?.user_type === 'organization';

  const studentMode = isStudent ? getPlatformMode(user) : null;
  const STUDENT_NAV = studentMode === 'young_explorer' ? STUDENT_NAV_YOUNG_EXPLORER
    : studentMode === 'upsc_aspirant' ? STUDENT_NAV_UPSC
    : studentMode === 'board_warrior' ? STUDENT_NAV_BOARD
    : studentMode === 'curious_mind' ? STUDENT_NAV_CURIOUS_MIND
    : STUDENT_NAV_DEFAULT;

  if (isProfessional) {
    return (
      <motion.nav
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex h-16">
          {PROFESSIONAL_NAV.map(({ href, icon: Icon, label, isProfile }) => {
            const isActive = pathname === href || pathname?.startsWith(href + '/');
            return (
              <motion.div key={href} className="flex-1" whileTap={{ scale: 0.88 }} transition={{ duration: 0.12 }}>
                <Link href={href} className="w-full h-full flex flex-col items-center justify-center gap-0.5 relative">
                  {isProfile && user ? (
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-[#534AB7] to-[#378ADD] flex items-center justify-center overflow-hidden ${isActive ? 'ring-2 ring-purple-500 ring-offset-1' : ''}`}>
                      {hasPhoto ? (
                        <Image src={user.profile_photo_url} alt="" width={28} height={28} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-[10px]">{user.username?.charAt(0)?.toUpperCase()}</span>
                      )}
                    </div>
                  ) : (
                    <>
                      {isActive && (
                        <motion.span layoutId="pro-bottom-indicator" className="absolute top-1.5 w-1 h-1 rounded-full bg-purple-600" />
                      )}
                      <Icon size={22} className={isActive ? 'text-purple-600' : 'text-gray-400'} strokeWidth={isActive ? 2.5 : 2} />
                    </>
                  )}
                  <span className={`text-[10px] font-medium mt-0.5 ${isActive ? 'text-purple-600' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.nav>
    );
  }

  if (isParent) {
    return (
      <motion.nav
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex h-16">
          {PARENT_NAV.map(({ href, icon: Icon, label, isProfile }) => {
            const isActive = pathname === href || pathname?.startsWith(href.split('?')[0] + '/');
            return (
              <motion.div key={href} className="flex-1" whileTap={{ scale: 0.88 }} transition={{ duration: 0.12 }}>
                <Link href={href} className="w-full h-full flex flex-col items-center justify-center gap-0.5 relative">
                  {isProfile && user ? (
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center overflow-hidden ${isActive ? 'ring-2 ring-emerald-500 ring-offset-1' : ''}`}>
                      {hasPhoto ? (
                        <Image src={user.profile_photo_url} alt="" width={28} height={28} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-[10px]">{user.username?.charAt(0)?.toUpperCase()}</span>
                      )}
                    </div>
                  ) : (
                    <>
                      {isActive && (
                        <motion.span layoutId="parent-bottom-indicator" className="absolute top-1.5 w-1 h-1 rounded-full bg-emerald-600" />
                      )}
                      <Icon size={22} className={isActive ? 'text-emerald-600' : 'text-gray-400'} strokeWidth={isActive ? 2.5 : 2} />
                    </>
                  )}
                  <span className={`text-[10px] font-medium mt-0.5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.nav>
    );
  }

  if (isStudent) {
    return (
      <motion.nav
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex h-16">
          {STUDENT_NAV.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || pathname?.startsWith(href + '/');
            const isProfile = href === '/profile';
            return (
              <motion.div key={href} className="flex-1" whileTap={{ scale: 0.88 }} transition={{ duration: 0.12 }}>
                <Link href={href} className="w-full h-full flex flex-col items-center justify-center gap-0.5 relative">
                  {isProfile && user ? (
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-[#378ADD] to-[#534AB7] flex items-center justify-center overflow-hidden ${isActive ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}>
                      {hasPhoto ? (
                        <Image src={user.profile_photo_url} alt="" width={28} height={28} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-[10px]">{user.username?.charAt(0)?.toUpperCase()}</span>
                      )}
                    </div>
                  ) : (
                    <>
                      {isActive && (
                        <motion.span layoutId="student-bottom-indicator" className="absolute top-1.5 w-1 h-1 rounded-full bg-blue-600" />
                      )}
                      <Icon size={22} className={isActive ? 'text-blue-600' : 'text-gray-400'} strokeWidth={isActive ? 2.5 : 2} />
                    </>
                  )}
                  <span className={`text-[10px] font-medium mt-0.5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.nav>
    );
  }

  // Generic nav for non-student user types
  return (
    <motion.nav
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-16">
        {GENERIC_NAV.map(({ href, icon: Icon, label, center }) => {
          const isActive = pathname === href || pathname?.startsWith(href + '/');
          return (
            <motion.div key={href} className="flex-1" whileTap={{ scale: 0.88 }} transition={{ duration: 0.12 }}>
              <Link href={href} className={`w-full h-full flex flex-col items-center justify-center gap-0.5 relative ${center ? 'pb-1' : ''}`}>
                {center ? (
                  <div className={`w-11 h-11 -mt-5 rounded-2xl flex items-center justify-center shadow-lg transition-all ${isActive ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}>
                    <Icon size={20} className="text-white" strokeWidth={2} />
                  </div>
                ) : (
                  <>
                    {isActive && <motion.span layoutId="generic-bottom-indicator" className="absolute top-1 w-1 h-1 rounded-full bg-blue-600" />}
                    <Icon size={22} className={isActive ? 'text-blue-600' : 'text-gray-400'} strokeWidth={isActive ? 2.5 : 2} />
                  </>
                )}
                <span className={`text-[10px] font-medium mt-0.5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
              </Link>
            </motion.div>
          );
        })}

        {/* Menu / Profile */}
        <motion.div className="flex-1" whileTap={{ scale: 0.88 }} transition={{ duration: 0.12 }}>
          <button onClick={onMenuClick} className="w-full h-full flex flex-col items-center justify-center gap-0.5">
            {user ? (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden ring-2 ring-white">
                {hasPhoto ? (
                  <Image src={user.profile_photo_url} alt="" width={28} height={28} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-[10px]">{user.username?.charAt(0)?.toUpperCase()}</span>
                )}
              </div>
            ) : (
              <Menu size={22} className="text-gray-400" strokeWidth={2} />
            )}
            <span className="text-[10px] font-medium text-gray-400 mt-0.5">More</span>
          </button>
        </motion.div>
      </div>
    </motion.nav>
  );
}
