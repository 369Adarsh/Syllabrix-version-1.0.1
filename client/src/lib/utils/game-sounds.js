/**
 * GameSounds — Generate game sound effects using Web Audio API
 * Zero dependencies, zero cost, works in all browsers.
 *
 * Usage:
 *   import { playCorrect, playWrong, playClick, playWin, playTick, playLevelUp } from '@/lib/utils/game-sounds';
 *   playCorrect(); // plays a "ding!" sound
 */

let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx && typeof window !== 'undefined') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(frequency, duration = 0.15, type = 'sine', volume = 0.3) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

// ═══ GAME SOUNDS ═══

/** Correct answer — cheerful ascending ding */
export function playCorrect() {
  const ctx = getAudioCtx(); if (!ctx) return;
  playTone(523, 0.1, 'sine', 0.3); // C5
  setTimeout(() => playTone(659, 0.1, 'sine', 0.3), 80); // E5
  setTimeout(() => playTone(784, 0.15, 'sine', 0.3), 160); // G5
}

/** Wrong answer — descending buzz */
export function playWrong() {
  playTone(300, 0.2, 'sawtooth', 0.15);
  setTimeout(() => playTone(200, 0.25, 'sawtooth', 0.1), 100);
}

/** Button click — soft tap */
export function playClick() {
  playTone(800, 0.05, 'sine', 0.15);
}

/** Win / Level complete — victory fanfare */
export function playWin() {
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'sine', 0.25), i * 120);
  });
}

/** Tick / Timer — clock tick */
export function playTick() {
  playTone(1000, 0.03, 'square', 0.1);
}

/** Level up — rising sweep */
export function playLevelUp() {
  const ctx = getAudioCtx(); if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.35);
}

/** Countdown beep — for timer warnings */
export function playCountdown() {
  playTone(880, 0.08, 'sine', 0.2);
}

/** Game over — sad trombone */
export function playGameOver() {
  const notes = [392, 370, 349, 330]; // G4 descending
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, 'triangle', 0.2), i * 200);
  });
}

/** Bonus / Power-up — sparkle */
export function playBonus() {
  [1047, 1319, 1568, 2093].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.1, 'sine', 0.15), i * 50);
  });
}

/** Confetti trigger — uses canvas-confetti if available, or just plays sound */
export function triggerConfetti() {
  playWin();
  // If canvas-confetti is loaded (can be added via CDN)
  if (typeof window !== 'undefined' && window.confetti) {
    window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }
}

export default {
  playCorrect, playWrong, playClick, playWin, playTick,
  playLevelUp, playCountdown, playGameOver, playBonus, triggerConfetti,
};
