'use client';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Play, Sparkles, MessageCircle, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const NAV = [
  { href: '/home',      icon: Home,          label: 'Home' },
  { href: '/clips',     icon: Play,          label: 'Clips' },
  { href: '/ai-world',  icon: Sparkles,      label: 'AI World' },
  { href: '/messages',  icon: MessageCircle, label: 'Messages' },
  { href: '/profile',   icon: User,          label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <motion.nav
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-16">
        {NAV.map(({ href, icon: Icon, label }) => {
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
                className="w-full h-full flex flex-col items-center justify-center gap-0.5 relative"
              >
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
                <span className={`text-[10px] font-medium ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
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
