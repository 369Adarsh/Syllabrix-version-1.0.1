'use client';
import { Shield, Lock, Eye, Bell, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const FEATURES = [
  { icon: Eye,  title: 'Screen Time Monitor',    desc: 'Track daily usage patterns and set healthy limits for your child.' },
  { icon: Lock, title: 'Content Filters',        desc: 'Block inappropriate content and restrict access to specific sections.' },
  { icon: Bell, title: 'Activity Alerts',         desc: 'Get notified when your child completes lessons or earns achievements.' },
];

export default function SafetyPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <Shield size={20} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Safety Monitor</h1>
          <p className="text-xs text-gray-400 font-medium">Parental controls &amp; oversight</p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-[28px] border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5">
          <Shield size={28} className="text-emerald-500" />
        </div>
        <h2 className="text-lg font-black text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8">
          Full parental oversight tools are being built. Track screen time, set content filters, and get real-time alerts.
        </p>

        <div className="space-y-3 text-left mb-8">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={15} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/parent-dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
        >
          Go to Parent Analytics <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
