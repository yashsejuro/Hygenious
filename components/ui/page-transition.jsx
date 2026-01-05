'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/**
 * Page Transition Wrapper - Framer Motion wrapper for page transitions
 * 
 * @param {ReactNode} children - Page content to animate
 * @param {string} className - Additional CSS classes
 * 
 * Animations: Fade in/out with slight slide up
 * Duration: 0.3s
 * Respects prefers-reduced-motion
 */
export function PageTransition({ children, className }) {
  const prefersReducedMotion = useReducedMotion();

  // If user prefers reduced motion, return children without animation
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: 'easeOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
