'use client';
import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Loader2 } from 'lucide-react';

/**
 * SpeakButton — Text-to-Speech using Web Speech API (free, built into browser)
 * Upgrade path: Replace speechSynthesis with a paid API (Google Cloud TTS, ElevenLabs)
 * by changing the `speak` function internals. The component interface stays the same.
 *
 * Usage: <SpeakButton text="Hello world" lang="en-IN" />
 */
export default function SpeakButton({ text, lang = 'en-IN', size = 'sm', className = '' }) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const utterRef = useRef(null);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    return () => { if (typeof window !== 'undefined') window.speechSynthesis?.cancel(); };
  }, []);

  const speak = () => {
    if (!supported || !text) return;
    const synth = window.speechSynthesis;

    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }

    // Clean text for speech — remove markdown, code blocks, special chars
    const clean = text
      .replace(/```[\s\S]*?```/g, '') // code blocks
      .replace(/[#*_~`]/g, '') // markdown
      .replace(/\$\$[\s\S]*?\$\$/g, 'math formula') // LaTeX
      .replace(/\$[^$]+\$/g, 'math expression')
      .replace(/https?:\/\/\S+/g, 'link')
      .replace(/\n+/g, '. ')
      .trim();

    if (!clean) return;

    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = lang;
    utter.rate = 0.95;
    utter.pitch = 1.0;

    // Try to find Indian English voice
    const voices = synth.getVoices();
    const indianVoice = voices.find(v => v.lang === 'en-IN') || voices.find(v => v.lang.startsWith('en'));
    if (indianVoice) utter.voice = indianVoice;

    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);

    utterRef.current = utter;
    synth.speak(utter);
  };

  if (!supported) return null;

  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
  };

  return (
    <button onClick={speak} title={speaking ? 'Stop speaking' : 'Read aloud'}
      className={`${sizes[size] || sizes.sm} rounded-lg flex items-center justify-center transition-all ${
        speaking
          ? 'bg-blue-100 text-blue-600 animate-pulse'
          : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600'
      } ${className}`}>
      {speaking ? <Pause size={size === 'xs' ? 10 : 14} /> : <Volume2 size={size === 'xs' ? 10 : 14} />}
    </button>
  );
}
