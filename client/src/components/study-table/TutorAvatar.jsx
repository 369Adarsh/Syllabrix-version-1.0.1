'use client';
import { useCallback, useRef, useState, useEffect } from 'react';

// ─── useSpeech hook ─────────────────────────────────────────────────────────
// Wraps the browser speechSynthesis API.
// Returns { speak(text), stop(), speaking }
export function useSpeech(learnerProfile) {
  const [speaking, setSpeaking] = useState(false);
  const synthRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') synthRef.current = window.speechSynthesis;
    return () => { try { synthRef.current?.cancel(); } catch {} };
  }, []);

  const speak = useCallback((text) => {
    const synth = synthRef.current;
    if (!synth || !text?.trim()) return;
    try {
      synth.cancel();
      // Strip emoji so TTS doesn't read them aloud
      const clean = text.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').trim();
      const utt = new SpeechSynthesisUtterance(clean);
      const lang = learnerProfile?.tutorLanguage;
      utt.lang  = (lang === 'Hindi' || lang?.includes('Hinglish')) ? 'hi-IN' : 'en-IN';
      utt.rate  = 0.92;
      utt.pitch = 1.1;
      utt.onstart = () => setSpeaking(true);
      utt.onend   = () => setSpeaking(false);
      utt.onerror = () => setSpeaking(false);
      synth.speak(utt);
    } catch { setSpeaking(false); }
  }, [learnerProfile?.tutorLanguage]);

  const stop = useCallback(() => {
    try { synthRef.current?.cancel(); } catch {}
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking };
}

// ─── Mood face data ──────────────────────────────────────────────────────────
const BASE_FACE = {
  eyeWhiteL: { cx: 28, cy: 37, r: 7 },
  eyeWhiteR: { cx: 52, cy: 37, r: 7 },
  pupilL:    { cx: 30, cy: 37, r: 3.5 },
  pupilR:    { cx: 54, cy: 37, r: 3.5 },
  glintL:    { cx: 31, cy: 35.5, r: 1.2 },
  glintR:    { cx: 55, cy: 35.5, r: 1.2 },
  mouth:     'M 28 52 Q 40 58 52 52',
  brows:     null,
  extras:    null,
};

const MOOD_FACES = {
  idle:    BASE_FACE,
  default: BASE_FACE,  // alias for idle

  happy: {
    ...BASE_FACE,
    pupilL: { cx: 30, cy: 35, r: 3.5 },
    pupilR: { cx: 54, cy: 35, r: 3.5 },
    glintL: { cx: 31, cy: 33.5, r: 1.2 },
    glintR: { cx: 55, cy: 33.5, r: 1.2 },
    mouth:  'M 26 50 Q 40 64 54 50',
    brows:  ['M 22 28 Q 28 24 34 27', 'M 46 27 Q 52 24 58 28'],
  },

  thinking: {
    ...BASE_FACE,
    pupilL: { cx: 33, cy: 36, r: 3 },
    pupilR: { cx: 55, cy: 37, r: 3 },
    glintL: { cx: 34, cy: 35, r: 1 },
    glintR: { cx: 56, cy: 36, r: 1 },
    // wavy mouth = curious/pondering
    mouth:  'M 29 53 Q 34 50 39 53 Q 44 56 49 53 Q 52 51 53 53',
    brows:  [null, 'M 46 29 Q 52 25 57 28'],  // only right brow raised
  },

  excited: {
    ...BASE_FACE,
    eyeWhiteL: { cx: 28, cy: 36, r: 8 },
    eyeWhiteR: { cx: 52, cy: 36, r: 8 },
    pupilL:    { cx: 29, cy: 34, r: 4 },
    pupilR:    { cx: 53, cy: 34, r: 4 },
    glintL:    { cx: 30, cy: 32, r: 1.5 },
    glintR:    { cx: 54, cy: 32, r: 1.5 },
    mouth:     'M 23 49 Q 40 68 57 49',
    brows:     ['M 21 27 Q 28 22 35 26', 'M 45 26 Q 52 22 59 27'],
    extras:    'sparkles',
  },
  // "encouraging" is a gentler version of excited (warm smile, one raised brow)
  encouraging: {
    ...BASE_FACE,
    pupilL: { cx: 30, cy: 35, r: 3.5 },
    pupilR: { cx: 54, cy: 35, r: 3.5 },
    glintL: { cx: 31, cy: 33.5, r: 1.2 },
    glintR: { cx: 55, cy: 33.5, r: 1.2 },
    mouth:  'M 26 50 Q 40 62 54 50',
    brows:  ['M 22 29 Q 28 25 34 28', 'M 46 28 Q 52 25 58 29'],
  },

  concerned: {
    ...BASE_FACE,
    pupilL: { cx: 30, cy: 39, r: 3.5 },
    pupilR: { cx: 54, cy: 39, r: 3.5 },
    glintL: { cx: 31, cy: 38, r: 1.2 },
    glintR: { cx: 55, cy: 38, r: 1.2 },
    // frown
    mouth:  'M 28 57 Q 40 49 52 57',
    brows:  ['M 22 31 Q 28 28 34 31', 'M 46 31 Q 52 28 58 31'],
  },

  celebrating: {
    ...BASE_FACE,
    eyeWhiteL: { cx: 28, cy: 37, r: 7 },
    eyeWhiteR: { cx: 52, cy: 37, r: 7 },
    pupilL:    { cx: 30, cy: 35, r: 3.5 },
    pupilR:    { cx: 54, cy: 35, r: 3.5 },
    glintL:    { cx: 31, cy: 33.5, r: 1.2 },
    glintR:    { cx: 55, cy: 33.5, r: 1.2 },
    mouth:     'M 23 49 Q 40 68 57 49',
    brows:     ['M 22 28 Q 28 24 34 27', 'M 46 27 Q 52 24 58 28'],
    extras:    'confetti',
  },
};

// ─── TutorAvatar component ───────────────────────────────────────────────────
// Props:
//   mood     — 'idle'|'default'|'happy'|'thinking'|'excited'|'encouraging'|'concerned'|'celebrating'
//   size     — number (default 56)
//   speaking — boolean (shows pulsing green badge)
//   wiggle   — boolean (triggers wiggle animation; auto-clears after animation ends)
//   message  — string (renders an attached speech bubble to the right)
//   onClick  — function (makes the avatar clickable)
//   className — extra wrapper classes
export default function TutorAvatar({ mood = 'idle', size = 56, speaking = false, wiggle = false, message = null, onClick = null, className = '' }) {
  const face = MOOD_FACES[mood] || MOOD_FACES.idle;
  const { eyeWhiteL, eyeWhiteR, pupilL, pupilR, glintL, glintR, mouth, brows, extras } = face;

  const WrapTag = onClick ? 'button' : 'div';

  return (
    <div className={`inline-flex items-start gap-2 ${className}`}>
    <WrapTag
      onClick={onClick}
      className={`relative inline-flex flex-shrink-0 ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''} ${wiggle ? 'animate-wiggle' : ''}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true"
        style={{ filter: 'drop-shadow(0 2px 6px rgba(59,130,246,0.25))' }}
      >
        {/* ── Sparkle / confetti extras (behind head) ── */}
        {extras === 'sparkles' && (
          <>
            <text x="54" y="16" fill="#fbbf24" fontSize="9" fontFamily="serif">✦</text>
            <text x="18" y="18" fill="#a78bfa" fontSize="7" fontFamily="serif">✦</text>
            <text x="62" y="28" fill="#34d399" fontSize="6" fontFamily="serif">✦</text>
          </>
        )}
        {extras === 'confetti' && (
          <>
            <circle cx="16" cy="15" r="2.5" fill="#f472b6" />
            <circle cx="64" cy="13" r="2"   fill="#fbbf24" />
            <circle cx="70" cy="28" r="2.5" fill="#34d399" />
            <rect x="12" y="25" width="4" height="4" rx="1" fill="#818cf8" transform="rotate(20 14 27)" />
          </>
        )}

        {/* ── Head ── */}
        <rect x="14" y="20" width="52" height="46" rx="15"
          fill={mood === 'excited' || mood === 'celebrating' ? '#2563eb' : '#3b82f6'} />

        {/* ── Antenna ── */}
        <line x1="40" y1="20" x2="40" y2="7" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
        <circle cx="40" cy="5" r="4.5"
          fill={mood === 'excited' || mood === 'celebrating' ? '#fbbf24' : mood === 'concerned' ? '#94a3b8' : '#fbbf24'}
        />

        {/* ── Ear nodes ── */}
        <rect x="6"  y="29" width="8" height="14" rx="4" fill="#60a5fa" />
        <rect x="66" y="29" width="8" height="14" rx="4" fill="#60a5fa" />

        {/* ── Eye whites ── */}
        <circle {...eyeWhiteL} fill="white" />
        <circle {...eyeWhiteR} fill="white" />

        {/* ── Pupils ── */}
        <circle {...pupilL} fill="#1e40af" />
        <circle {...pupilR} fill="#1e40af" />

        {/* ── Glints ── */}
        <circle {...glintL} fill="white" />
        <circle {...glintR} fill="white" />

        {/* ── Eyebrows (mood-specific) ── */}
        {brows?.map((b, i) =>
          b ? <path key={i} d={b} stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" /> : null
        )}

        {/* ── Mouth ── */}
        <path d={mouth} stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* ── Thinking ellipsis dots ── */}
        {mood === 'thinking' && (
          <>
            <circle cx="34" cy="58" r="1.5" fill="white" opacity="0.7" />
            <circle cx="40" cy="59" r="1.5" fill="white" opacity="0.7" />
            <circle cx="46" cy="58" r="1.5" fill="white" opacity="0.7" />
          </>
        )}
      </svg>

      {/* ── Speaking badge ── */}
      {speaking && (
        <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
      )}
    </WrapTag>

    {/* ── Inline message bubble ── */}
    {message && (
      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[200px] animate-fade-in self-center">
        <span className="absolute -left-2 top-3 w-3 h-3 bg-blue-50 border-l border-b border-blue-200/60 rotate-45" />
        <p className="text-[12px] text-gray-700 leading-snug">{message}</p>
      </div>
    )}
    </div>
  );
}
