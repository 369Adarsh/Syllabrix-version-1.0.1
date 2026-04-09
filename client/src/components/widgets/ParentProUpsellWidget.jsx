'use client';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ParentProUpsellWidget() {
  return (
    <div
      className="rounded-xl border border-indigo-200 p-4"
      style={{ background: 'linear-gradient(135deg, #EEF2FF, #EFF6FF)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center flex-shrink-0">
          <Sparkles size={12} className="text-white" />
        </div>
        <p className="text-[12px] font-bold text-indigo-800">Parent Pro</p>
      </div>
      <p className="text-[11px] text-indigo-600 leading-relaxed mb-2.5">
        AI insights, real-time safety alerts, detailed analytics &amp; PDF reports.
      </p>
      <Link
        href="/settings/subscription"
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:opacity-90 transition-opacity"
      >
        Try free · 7 days <ArrowRight size={11} />
      </Link>
      <p className="text-[10px] text-indigo-400 mt-1.5">₹199/month after trial</p>
    </div>
  );
}
