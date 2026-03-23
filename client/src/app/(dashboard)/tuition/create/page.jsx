'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export default function Page() {
  const { user } = useAuth();
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/tuition" className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><ArrowLeft size={16} className="text-gray-500" /></Link>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-sm"><GraduationCap size={20} className="text-white" /></div>
        <div><h1 className="font-bold text-lg text-gray-800">Post Tuition Ad</h1><p className="text-[11px] text-gray-400">Create a new tuition offering or request.</p></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center mx-auto mb-4"><GraduationCap size={28} className="text-teal-400" /></div>
        <h2 className="font-bold text-gray-700 mb-2">Coming Soon</h2>
        <p className="text-sm text-gray-400">Create a new tuition offering or request.</p>
      </div>
    </div>
  );
}
