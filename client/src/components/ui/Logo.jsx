'use client';
import Link from 'next/link';

export default function Logo({ size = 'md', linkTo = '/', variant = 'default' }) {
  // Sizes are now MUCH bigger
  const heights = {
    sm: 'h-10',      // footer, mobile topbar
    md: 'h-16',      // sidebar (was h-14, now h-16)
    lg: 'h-20',      // auth panel
    xl: 'h-24',      // navbar landing
    hero: 'h-36',    // hero section — massive
  };
  const src = variant === 'white'
    ? '/images/logo/syllabrix-logo-white.png'
    : '/images/logo/syllabrix-logo.png';
  return (
    <Link href={linkTo} className="flex items-center hover:opacity-90 transition">
      <img src={src} alt="SyllabriX Network" className={`${heights[size]} object-contain`} />
    </Link>
  );
}
