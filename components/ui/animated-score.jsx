'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

/**
 * Animated Score Component - Count-up animation for score reveals
 * 
 * @param {number} score - The final score to animate to (0-100)
 * @param {number} duration - Animation duration in milliseconds (default: 1500)
 * @param {string} className - Additional CSS classes
 */
export function AnimatedScore({ score, duration = 1500, className }) {
  const [displayScore, setDisplayScore] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
      setDisplayScore(score);
      return;
    }

    // Reset to 0 when score changes
    setDisplayScore(0);

    // Calculate steps and interval for smooth animation
    const steps = 60; // 60fps for smooth animation
    const stepDuration = duration / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      
      if (currentStep >= steps) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        // Easing function (ease-out)
        const progress = currentStep / steps;
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        setDisplayScore(Math.round(score * easedProgress));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [score, duration, prefersReducedMotion]);

  return (
    <span className={cn('tabular-nums', className)}>
      {displayScore}
    </span>
  );
}
