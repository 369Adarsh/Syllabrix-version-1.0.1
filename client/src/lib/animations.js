/**
 * Shared animation variants + easings for motion/react
 * Import in any 'use client' component
 */

// ─── Easings ─────────────────────────────────────────────────────────────────
export const ease = {
  smooth:  [0.25, 0.1, 0.25, 1],
  spring:  { type: 'spring', stiffness: 380, damping: 30 },
  snappy:  { type: 'spring', stiffness: 500, damping: 35 },
  gentle:  { type: 'spring', stiffness: 260, damping: 28 },
};

// ─── Variants ────────────────────────────────────────────────────────────────

export const fadeIn = {
  hidden:  { opacity: 0 },
  show:    { opacity: 1, transition: { duration: 0.25, ease: ease.smooth } },
};

export const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  show:    { opacity: 1, y: 0, transition: { duration: 0.3, ease: ease.smooth } },
};

export const fadeDown = {
  hidden:  { opacity: 0, y: -12 },
  show:    { opacity: 1, y: 0, transition: { duration: 0.25, ease: ease.smooth } },
};

export const slideInLeft = {
  hidden:  { opacity: 0, x: -18 },
  show:    { opacity: 1, x: 0, transition: { duration: 0.3, ease: ease.smooth } },
};

export const slideInRight = {
  hidden:  { opacity: 0, x: 18 },
  show:    { opacity: 1, x: 0, transition: { duration: 0.3, ease: ease.smooth } },
};

export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.95 },
  show:    { opacity: 1, scale: 1, transition: ease.snappy },
};

// ─── Page transition ──────────────────────────────────────────────────────────
export const pageVariants = {
  hidden:  { opacity: 0, y: 8 },
  show:    { opacity: 1, y: 0, transition: { duration: 0.22, ease: ease.smooth } },
  exit:    { opacity: 0,       transition: { duration: 0.15 } },
};

// ─── Stagger containers ────────────────────────────────────────────────────────
export const staggerContainer = (staggerChildren = 0.07, delayChildren = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
});

export const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 0.1, 0.25, 1] } },
};

// ─── Card hover ───────────────────────────────────────────────────────────────
export const cardHover = {
  rest:  { y: 0,  boxShadow: '0 1px 2px rgba(0,0,0,0.10)' },
  hover: { y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.10)', transition: { duration: 0.2, ease: ease.smooth } },
};

// ─── Button tap ───────────────────────────────────────────────────────────────
export const btnTap = { scale: 0.97 };
export const btnHover = { scale: 1.02 };
