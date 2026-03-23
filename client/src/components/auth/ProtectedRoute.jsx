'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Spinner from '@/components/ui/Spinner';
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(()=>{ if (!loading && !user) router.push('/sign-in'); },[user,loading,router]);
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><Spinner size="lg" /><p className="mt-4 text-gray-400">Loading Syllabrix...</p></div></div>;
  if (!user) return null;
  return children;
}
