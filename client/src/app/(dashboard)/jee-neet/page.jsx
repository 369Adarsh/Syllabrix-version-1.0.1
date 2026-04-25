'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function JeeNeetRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/jee-command/videos'); }, [router]);
  return null;
}
