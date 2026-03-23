'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export default function Page() {
  const { user } = useAuth();
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/materials" className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><ArrowLeft size={16} className="text-gray-500" /></Link>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-sm"><FileText size={20} className="text-white" /></div>
        <div><h1 className="font-bold text-lg text-gray-800">Upload Material</h1><p className="text-[11px] text-gray-400">Share study materials with your students.</p></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-cyan-100 flex items-center justify-center mx-auto mb-4"><FileText size={28} className="text-cyan-400" /></div>
        <h2 className="font-bold text-gray-700 mb-2">Coming Soon</h2>
        <p className="text-sm text-gray-400">Share study materials with your students.</p>
      </div>
    </div>
  );
}
