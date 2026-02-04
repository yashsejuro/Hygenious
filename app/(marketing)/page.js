'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Camera, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/animated-background';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
    const { isAuthenticated } = useAuth();

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <>
            {/* Hero Section (landing page only) */}
            {/* Wrapper section is relative with overflow hidden so floating icons stay within the hero */}
            <section className="relative overflow-hidden container mx-auto px-4 py-20 text-center marketing-hero">
                {/* Subtle floating background icons – customize emojis/positions/animation speeds in globals.css */}
                <div className="marketing-hero-floating-icons pointer-events-none" aria-hidden="true">
                    {/* 🧠 AI Brain - top left */}
                    <span className="marketing-hero-icon marketing-hero-icon-1">🧠</span>
                    {/* 🛡️ Health Shield - top right */}
                    <span className="marketing-hero-icon marketing-hero-icon-2">🛡️</span>
                    {/* 📊 Analytics Chart - middle left */}
                    <span className="marketing-hero-icon marketing-hero-icon-3">📊</span>
                    {/* 🔬 Microscope - middle right */}
                    <span className="marketing-hero-icon marketing-hero-icon-4">🔬</span>
                    {/* ✨ Sparkles - bottom left */}
                    <span className="marketing-hero-icon marketing-hero-icon-5">✨</span>
                    {/* 🎯 Target - bottom right */}
                    <span className="marketing-hero-icon marketing-hero-icon-6">🎯</span>
                </div>

                <motion.div
                    className="max-w-4xl mx-auto"
                    initial="hidden"
                    animate="show"
                    variants={containerVariants}
                >
                    <motion.div
                        variants={itemVariants}
                        className="mb-6"
                    >
                        <motion.span
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-sm font-medium text-blue-700 mb-6"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Sparkles className="w-4 h-4" />
                            AI-Powered Technology
                        </motion.span>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-7xl font-bold mb-6"
                    >
                        <span
                            className="bg-clip-text text-transparent animate-gradient-flow"
                            style={{
                                background: 'linear-gradient(120deg, #1e293b, #3b82f6, #8b5cf6, #ec4899, #1e293b)',
                                backgroundSize: '300% 300%',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            AI-Powered Hygiene Auditing
                        </span>
                        <span
                            className="block bg-clip-text text-transparent animate-gradient-flow mt-2"
                            style={{
                                background: 'linear-gradient(120deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b, #3b82f6)',
                                backgroundSize: '300% 300%',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            in Seconds
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
                    >
                        Transform any smartphone into an instant, unbiased hygiene auditor.
                        Get objective cleanliness scores and actionable insights powered by
                        AI.
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        {isAuthenticated ? (
                            <>
                                <Link href="/dashboard/audits/new">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                            Start Free Audit <Camera className="ml-2 h-5 w-5" />
                                        </Button>
                                    </motion.div>
                                </Link>
                                <Link href="/dashboard">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button size="lg" variant="outline" className="text-lg px-8">
                                            View Dashboard
                                        </Button>
                                    </motion.div>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/register">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                            Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </motion.div>
                                </Link>
                                <Link href="/features">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button size="lg" variant="outline" className="text-lg px-8">
                                            Explore Features
                                        </Button>
                                    </motion.div>
                                </Link>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            </section>

            {/* Dashboard Preview Section */}
            <motion.section
                className="container mx-auto px-4 py-16"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                    See Your Hygiene Insights Clearly
                </h2>
                <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
                    Get real-time cleanliness scores, issue breakdowns, and improvement
                    tracking right from your personalized dashboard.
                </p>
                <motion.div
                    className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                >
                    <GlassCard className="p-0">
                        <img
                            src="/images/hero-image.png"
                            alt="Dashboard Preview"
                            className="w-full h-auto"
                        />
                    </GlassCard>
                </motion.div>
            </motion.section>
        </>
    );
}
