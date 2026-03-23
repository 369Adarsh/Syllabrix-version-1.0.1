'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StreamNavigatorRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/career-explorer'); }, [router]);
  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-sm text-gray-400">Redirecting to Career Explorer...</p>
    </div>
  );
}
