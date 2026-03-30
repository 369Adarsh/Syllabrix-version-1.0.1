'use client';
/**
 * Reusable animation wrappers — drop-in replacements for plain divs.
 * All use motion/react + react-intersection-observer for scroll-triggered animations.
 *
 * Usage:
 *   <FadeIn>content</FadeIn>
 *   <SlideUp delay={0.1}>content</SlideUp>
 *   <StaggerChildren><StaggerItem>A</StaggerItem><StaggerItem>B</StaggerItem></StaggerChildren>
 *   <ScaleIn>content</ScaleIn>
 */
import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { staggerContainer, staggerItem, ease } from '@/lib/animations';

// ─── Shared inView hook options ───────────────────────────────────────────────
const defaultInView = { triggerOnce: true, threshold: 0.08 };

// ─── FadeIn — opacity + subtle rise ──────────────────────────────────────────
export function FadeIn({ children, delay = 0, duration = 0.28, className = '', ...props }) {
  const { ref, inView } = useInView(defaultInView);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration, delay, ease: ease.smooth }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ─── SlideUp — stronger vertical rise ────────────────────────────────────────
export function SlideUp({ children, delay = 0, duration = 0.3, className = '', ...props }) {
  const { ref, inView } = useInView(defaultInView);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration, delay, ease: ease.smooth }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ─── SlideInLeft ──────────────────────────────────────────────────────────────
export function SlideInLeft({ children, delay = 0, className = '', ...props }) {
  const { ref, inView } = useInView(defaultInView);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.3, delay, ease: ease.smooth }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ─── SlideInRight ─────────────────────────────────────────────────────────────
export function SlideInRight({ children, delay = 0, className = '', ...props }) {
  const { ref, inView } = useInView(defaultInView);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.3, delay, ease: ease.smooth }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ─── ScaleIn — scale from 96% ─────────────────────────────────────────────────
export function ScaleIn({ children, delay = 0, className = '', ...props }) {
  const { ref, inView } = useInView(defaultInView);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ ...ease.snappy, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ─── StaggerChildren — animates children with stagger ────────────────────────
export function StaggerChildren({ children, className = '', stagger = 0.07, delay = 0, ...props }) {
  const { ref, inView } = useInView(defaultInView);
  return (
    <motion.div
      ref={ref}
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ─── StaggerItem — child for StaggerChildren ──────────────────────────────────
export function StaggerItem({ children, className = '', ...props }) {
  return (
    <motion.div variants={staggerItem} className={className} {...props}>
      {children}
    </motion.div>
  );
}

// ─── MotionCard — card with hover lift ───────────────────────────────────────
export function MotionCard({ children, className = '', ...props }) {
  const { ref, inView } = useInView(defaultInView);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.09)', transition: { duration: 0.18 } }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
