'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const LottiePlayer = dynamic(() => import('lottie-react'), { ssr: false });

export default function LottieAnimation({ src, className = '', style = {}, loop = true, autoplay = true }) {
  const [animData, setAnimData] = useState(null);

  useEffect(() => {
    if (typeof src === 'string') {
      fetch(src).then(r => r.json()).then(setAnimData).catch(() => {});
    } else {
      setAnimData(src);
    }
  }, [src]);

  if (!animData) return null;

  return (
    <div className={className} style={style}>
      <LottiePlayer animationData={animData} loop={loop} autoplay={autoplay} />
    </div>
  );
}
