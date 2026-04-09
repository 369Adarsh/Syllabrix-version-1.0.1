'use client';
import { Lock, Star, Zap, ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function UpgradePrompt({ feature, title = "Unlock Premium Content" }) {
  const features = {
    books: [
      "HC Verma - Physics Vol 1 & 2",
      "DC Pandey - Mechanics",
      "IE Irodov - Advanced Practice",
      "Step-by-step solution derivation"
    ],
    pyq_archive: [
      "Complete 30-Year JEE Archive (1995-2024)",
      "Daily unlimited AI variations",
      "Topic-wise weightage analytics"
    ],
    teacher_doubt: [
      "Direct escalation to Human Teachers",
      "10 Expert Solved doubts per month",
      "24/7 dedicated support"
    ]
  };

  const currentFeatures = features[feature] || features.books;

  return (
    <div className="bg-white rounded-[40px] border border-gray-100 p-8 md:p-12 text-center shadow-2xl shadow-blue-100/50 max-w-4xl mx-auto my-10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600" />
      
      <div className="w-20 h-20 bg-yellow-400 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-yellow-100 animate-bounce">
        <Lock size={32} />
      </div>

      <h2 className="text-[32px] font-extrabold text-gray-900 mb-4 tracking-tight">{title}</h2>
      <p className="text-gray-500 text-[16px] mb-10 max-w-lg mx-auto leading-relaxed">
        This resource is part of the Syllabrix Pro library. Upgrade now to get unlimited access to the world's best JEE materials.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-10 max-w-2xl mx-auto">
        {currentFeatures.map((f, i) => (
          <div key={i} className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={14} />
            </div>
            <span className="text-[13px] font-bold text-gray-700">{f}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/jee-command/subscription" className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white rounded-2xl text-[15px] font-bold hover:bg-black transition-all shadow-2xl shadow-gray-200 flex items-center justify-center gap-2">
          <Zap size={18} className="text-yellow-400" /> Upgrade to Pro
        </Link>
        <Link href="/jee-command" className="w-full sm:w-auto px-10 py-4 bg-white text-gray-600 border border-gray-100 rounded-2xl text-[15px] font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
          Not Now
        </Link>
      </div>

      <div className="mt-8 text-[12px] text-gray-400 flex items-center justify-center gap-6">
        <span className="flex items-center gap-1.5"><Star size={12} fill="currentColor" className="text-yellow-400" /> Trusted by 50k+ Toppers</span>
        <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-blue-400" /> Secure Checkout</span>
      </div>
    </div>
  );
}

function ShieldCheck({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
