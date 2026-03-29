import { Megaphone } from 'lucide-react';

const AD_SLOTS = 5;

export default function AdPanel() {
  return (
    <div className="bg-white rounded-xl border border-gray-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2 px-1">
        Sponsored
      </p>
      <div className="flex flex-col gap-2">
        {Array.from({ length: AD_SLOTS }).map((_, i) => (
          <div
            key={i}
            className="h-[100px] rounded-xl border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-1.5"
          >
            <Megaphone size={16} className="text-gray-300" />
            <span className="text-[10px] text-gray-400 font-medium">Advertisement</span>
          </div>
        ))}
      </div>
    </div>
  );
}
