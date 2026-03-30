'use client';
import { motion } from 'motion/react';

export default function Card({ children, className = '', hover = false, animate = false, ...props }) {
  if (animate || hover) {
    return (
      <motion.div
        whileHover={hover ? { y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.09)', transition: { duration: 0.18 } } : undefined}
        className={`${hover ? 'card-hover' : 'card'} ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
}
