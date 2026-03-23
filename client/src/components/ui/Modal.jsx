'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative ${widths[size]} w-full bg-dark-800 border border-dark-700 rounded-2xl shadow-xl animate-slide-up`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <h3 className="font-heading font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-dark-700 rounded-lg transition"><X size={20} className="text-dark-400" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
