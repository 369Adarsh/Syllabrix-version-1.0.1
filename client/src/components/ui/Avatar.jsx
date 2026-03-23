'use client';
import { User } from 'lucide-react';
const sizes = {xs:'w-7 h-7',sm:'w-9 h-9',md:'w-11 h-11',lg:'w-14 h-14',xl:'w-20 h-20'};
export default function Avatar({ src, alt, size='md', className='' }) {
  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden bg-blue-50 flex items-center justify-center flex-shrink-0 border-2 border-blue-100 ${className}`}>
      {src && !src.includes('PASTE') ? <img src={src} alt={alt||'Avatar'} className="w-full h-full object-cover" /> : <User className="w-1/2 h-1/2 text-blue-300" />}
    </div>
  );
}
