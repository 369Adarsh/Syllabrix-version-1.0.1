'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/admin-sign-in');
      return;
    }
    const isAdmin = user.user_type === 'syllabrix_admin' || user.admin_role;
    if (!isAdmin) {
      router.replace('/home');
      return;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-white/60 text-sm font-medium tracking-wider uppercase">Verifying Admin Access</p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.user_type === 'syllabrix_admin' || user?.admin_role;
  if (!isAdmin) return null;

  return <>{children}</>;
}
