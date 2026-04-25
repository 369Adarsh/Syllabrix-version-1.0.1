'use client';
import { useState, useEffect } from 'react';

const STATES = {
  idle:        { emoji: '🦜', bg: 'bg-amber-100', border: 'border-amber-200' },
  happy:       { emoji: '🦜', bg: 'bg-green-100',  border: 'border-green-300' },
  celebrating: { emoji: '🎉', bg: 'bg-yellow-100', border: 'border-yellow-300' },
  sad:         { emoji: '🦜', bg: 'bg-blue-100',   border: 'border-blue-200'  },
  thinking:    { emoji: '🦜', bg: 'bg-purple-100', border: 'border-purple-200'},
};

export default function Mascot({ message, state = 'idle', size = 'md' }) {
  const [visible, setVisible] = useState(false);
  const cfg = STATES[state] || STATES.idle;

  const sizes = {
    sm: { wrap: 'w-10 h-10 text-2xl', bubble: 'text-[11px] max-w-[160px]' },
    md: { wrap: 'w-14 h-14 text-3xl', bubble: 'text-[12px] max-w-[200px]' },
    lg: { wrap: 'w-20 h-20 text-5xl', bubble: 'text-[13px] max-w-[240px]' },
  };
  const s = sizes[size] || sizes.md;

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [message, state]);

  return (
    <div className="flex items-end gap-2">
      {/* Speech bubble */}
      {message && (
        <div
          className={`relative ${cfg.bg} border ${cfg.border} rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm transition-all duration-300 ${s.bubble} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
        >
          <p className="font-bold text-gray-700 leading-snug">{message}</p>
          {/* tail */}
          <span className={`absolute -bottom-[7px] left-3 w-3 h-3 ${cfg.bg} border-b border-r ${cfg.border} rotate-45`} />
        </div>
      )}

      {/* Mascot body */}
      <div
        className={`${s.wrap} rounded-2xl ${cfg.bg} border-2 ${cfg.border} flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-200 ${state === 'celebrating' ? 'animate-bounce' : state === 'happy' ? 'scale-110' : ''}`}
      >
        <span className="select-none">{cfg.emoji}</span>
      </div>
    </div>
  );
}
