'use client';

import { motion } from 'framer-motion';

export function AnimatedBackground({ variant = 'default', children }) {
  const variants = {
    default: 'from-blue-50 via-white to-purple-50',
    gradient: 'from-violet-50 via-purple-50 to-fuchsia-50',
    dark: 'from-slate-900 via-purple-900 to-slate-900',
    hero: 'from-indigo-500 via-purple-500 to-pink-500',
  };

  return (
    <div className={`relative min-h-screen bg-gradient-to-br ${variants[variant]} overflow-hidden`}>
      {/* Subtle animated orbs - slower and smoother */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            repeatType: "reverse"
          }}
        />
        <motion.div
          className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
            repeatType: "reverse"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear",
            repeatType: "reverse"
          }}
        />
      </div>

      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export function GlassCard({ children, className = '', hover = true }) {
  return (
    <motion.div
      whileHover={hover ? { y: -8, transition: { duration: 0.3, ease: "easeOut" } } : {}}
      className={`bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/30 dark:border-slate-700/40 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}
