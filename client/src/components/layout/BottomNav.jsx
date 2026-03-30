'use client';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Sparkles, MessageCircle, Menu } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function BottomNav({ onMenuClick = () => {} }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const hasPhoto = user?.profile_photo_url && !user.profile_photo_url.includes('PASTE_');

  const NAV = [
    { href: '/home',        icon: Home,         label: 'Home' },
    { href: '/ai-library',  icon: BookOpen,     label: 'Library' },
    { href: '/ai-world',    icon: Sparkles,     label: 'AI World', center: true },
    { href: '/messages',    icon: MessageCircle, label: 'Messages' },
  ];

  return (
    <motion.nav
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-16">
        {/* 4 regular items */}
        {NAV.map(({ href, icon: Icon, label, center }) => {
          const isActive = pathname === href || pathname?.startsWith(href + '/');
          return (
            <motion.div
              key={href}
              className="flex-1"
              whileTap={{ scale: 0.88 }}
              transition={{ duration: 0.12 }}
            >
              <Link
                href={href}
                className={`w-full h-full flex flex-col items-center justify-center gap-0.5 relative ${
                  center ? 'pb-1' : ''
                }`}
              >
                {center ? (
                  // Center FAB-style button
                  <div className={`w-11 h-11 -mt-5 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600'
                      : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                  }`}>
                    <Icon size={20} className="text-white" strokeWidth={2} />
                  </div>
                ) : (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="bottom-nav-indicator"
                        className="absolute top-1 w-1 h-1 rounded-full bg-blue-600"
                      />
                    )}
                    <Icon
                      size={22}
                      className={isActive ? 'text-blue-600' : 'text-gray-400'}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </>
                )}
                <span className={`text-[10px] font-medium mt-0.5 ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {label}
                </span>
              </Link>
            </motion.div>
          );
        })}

        {/* Menu / Profile button */}
        <motion.div className="flex-1" whileTap={{ scale: 0.88 }} transition={{ duration: 0.12 }}>
          <button
            onClick={onMenuClick}
            className="w-full h-full flex flex-col items-center justify-center gap-0.5 relative"
            aria-label="Open menu"
          >
            {/* Avatar or menu icon */}
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
