'use client';
import { ShieldCheck, Info, Sparkles, CheckCircle2 } from 'lucide-react';

export default function TrustBadge({ verified, source = 'ai_generated', reporterCount = 0 }) {
  const getBadge = () => {
    if (verified) {
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black tracking-widest shadow-sm">
          <CheckCircle2 size={10} className="stroke-[3]" /> EXPERT VERIFIED
        </div>
      );
    }
    
    switch(source) {
      case 'real_pyq':
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-black tracking-widest">
            <ShieldCheck size={10} /> AUTHENTIC PYQ
          </div>
        );
      case 'ai_generated':
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-bold tracking-tight">
            <Sparkles size={10} /> AI GENERATED
          </div>
        );
      case 'expert_curated':
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-black tracking-widest">
            <Info size={10} /> CURATED CONTENT
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {getBadge()}
      {reporterCount > 0 && (
        <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full">
           {reporterCount} Reported
        </span>
      )}
    </div>
  );
}
