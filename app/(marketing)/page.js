'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate, useInView } from 'framer-motion';
import { Camera, ArrowRight, Sparkles, ShieldCheck, Play, ScanLine, Activity, CheckCircle2, QrCode, TrendingUp, Download, Share2, UploadCloud, MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Lenis from 'lenis';

// ── Scroll-Triggered Section Reveal ──
const sectionRevealVariants = {
    hidden: { opacity: 0, y: 60, filter: 'blur(12px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
};

const SectionReveal = ({ children, className = '', delay = 0 }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <motion.div
            ref={ref}
            variants={sectionRevealVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            transition={{ delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// ── Cinematic Word-by-Word Text Reveal ──
const RevealText = ({ text, className = '' }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    // Split on <br/> markers first, then words
    const lines = text.split('|'); // use | as line break marker

    let wordIndex = 0;
    return (
        <h1 ref={ref} className={className}>
            {lines.map((line, lineIdx) => (
                <span key={lineIdx}>
                    {lineIdx > 0 && <br className="hidden md:block" />}
                    {line.trim().split(' ').map((word) => {
                        const idx = wordIndex++;
                        return (
                            <span key={idx} className="inline-block overflow-hidden mr-[0.25em] align-top">
                                <motion.span
                                    className="inline-block"
                                    initial={{ y: '120%', rotateX: 80 }}
                                    animate={isInView ? { y: 0, rotateX: 0 } : { y: '120%', rotateX: 80 }}
                                    transition={{
                                        delay: 0.3 + idx * 0.07,
                                        duration: 0.7,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                >
                                    {word}
                                </motion.span>
                            </span>
                        );
                    })}
                </span>
            ))}
        </h1>
    );
};

const Magnetic = ({ children }) => {
    const ref = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const mouseMove = (e) => {
        const { clientX, clientY } = e;
        const { width, height, left, top } = ref.current.getBoundingClientRect();
        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);
        setPosition({ x: x * 0.2, y: y * 0.2 });
    };

    const mouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={mouseMove}
            onMouseLeave={mouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className="inline-block"
        >
            {children}
        </motion.div>
    );
};

// 1. LUSION STYLE TILT CARD
const TiltCard = ({ children, className }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    // Convert mouse position to rotation values (max 10 degrees)
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

    // Dynamic glare effect based on mouse
    const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["100%", "0%"]);
    const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["100%", "0%"]);
    const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.4) 0%, transparent 60%)`;

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        // Get mouse position relative to card center from -0.5 to 0.5
        const mouseX = (e.clientX - rect.left) / width - 0.5;
        const mouseY = (e.clientY - rect.top) / height - 0.5;

        x.set(mouseX);
        y.set(mouseY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={`relative group perspective-1000 ${className}`}
        >
            <motion.div
                className="absolute inset-0 z-50 pointer-events-none rounded-[24px]"
                style={{ background: glareBackground }}
            />
            {children}
        </motion.div>
    );
};

const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
    const [isHovering, setIsHovering] = useState(false);
    const { scrollYProgress } = useScroll();

    useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e) => {
            const tag = e.target.tagName?.toLowerCase();
            const isClickable = ['button', 'a', 'input', 'select', 'textarea'].includes(tag) || e.target.closest('button') || e.target.closest('a') || e.target.closest('.magnetic');
            setIsHovering(!!isClickable);
        };
        window.addEventListener('mousemove', updateMousePosition, { passive: true });
        window.addEventListener('mouseover', handleMouseOver, { passive: true });

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    const size = isHovering ? 80 : 32;
    const offset = size / 2;

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:flex items-center justify-center mix-blend-difference"
            animate={{
                x: mousePosition.x - offset,
                y: mousePosition.y - offset,
                width: size,
                height: size,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.5 }}
        >
            <svg width={size} height={size} viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
                <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill={isHovering ? "rgba(255,255,255,1)" : "none"}
                    stroke={isHovering ? "none" : "rgba(255,255,255,0.3)"}
                    strokeWidth="4"
                    className="transition-all duration-300"
                />
                {!isHovering && (
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="none"
                        stroke="#00D4AA"
                        strokeWidth="4"
                        strokeDasharray="301"
                        style={{ pathLength: scrollYProgress }}
                    />
                )}
            </svg>
            <motion.div
                className="w-1 h-1 bg-[#00D4AA] rounded-full absolute"
                animate={{ scale: isHovering ? 0 : 1 }}
            />
        </motion.div>
    );
};

const AiCapabilitiesSection = () => {
    return (
        <section className="relative py-32 bg-slate-950 text-white overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-hygenious-teal/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-hygenious-cyan/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Intro Panel */}
                <div className="max-w-3xl mb-20 text-center mx-auto md:text-left md:mx-0">
                    <span className="inline-flex items-center gap-2 bg-hygenious-teal/10 border border-hygenious-teal/20 text-hygenious-teal font-mono px-4 py-2 rounded-full text-xs uppercase tracking-widest mb-6">
                        <Camera className="w-4 h-4" /> AI Diagnostics
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tighter mb-6">
                        HOW THE AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">SEES IT.</span>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed">
                        The moment you snap a photo, our system shreds the image into physical zones—detecting micro-residue, cross-contamination risks, and protocol violations invisible to the naked eye.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { step: "01", title: "Spatial Mapping", desc: "Recognizes sinks, floors, counters, and high-touch points instantly.", icon: ScanLine, color: "from-hygenious-teal/20 to-transparent" },
                        { step: "02", title: "Anomaly Detection", desc: "Flags water stains, grease buildup, and improper storage placement.", icon: Activity, color: "from-purple-500/20 to-transparent" },
                        { step: "03", title: "Risk Scoring", desc: "Cross-references findings against global health code databases.", icon: ShieldCheck, color: "from-hygenious-cyan/20 to-transparent" },
                    ].map((item, idx) => (
                        <div key={idx} className="h-[400px] md:h-[500px] rounded-[32px] overflow-hidden relative group border border-white/10 bg-black shadow-2xl flex flex-col justify-end p-8 hover:border-white/20 transition-all duration-500 hover:-translate-y-2">
                            <div className={`absolute inset-0 bg-gradient-to-b ${item.color} opacity-40 group-hover:opacity-60 transition-opacity`} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />

                            <img
                                src="/images/hero-image.png"
                                alt={item.title}
                                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 group-hover:opacity-40 transition-all duration-700 ease-out filter grayscale mix-blend-screen"
                            />

                            <div className="relative z-20">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-mono text-hygenious-teal font-bold">{item.step} //</span>
                                    <item.icon className="w-6 h-6 text-white/50" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">{item.title}</h3>
                                <p className="text-slate-300 text-base font-light leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default function HomePage() {
    const { isAuthenticated } = useAuth();

    // ── Lenis Smooth Scroll ──
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        return () => lenis.destroy();
    }, []);

    // 2. LUSION SCROLL EFFECTS
    const { scrollY, scrollYProgress } = useScroll();

    // Hero Elements
    const heroY = useTransform(scrollY, [0, 800], [0, 250]);
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const mockupScale = useTransform(scrollY, [0, 500], [1, 1.15]);
    const mockupRotate = useTransform(scrollYProgress, [0, 0.1], [0, 2]);

    // Background text parallax transforms removed — replaced by CSS marquee

    // Demo state
    const [demoState, setDemoState] = useState('idle'); // idle, scanning, result
    const [demoScore, setDemoScore] = useState(0);

    const runDemo = () => {
        setDemoState('scanning');
        setDemoScore(0);
        setTimeout(() => {
            setDemoState('result');
            let tempScore = 0;
            const interval = setInterval(() => {
                tempScore += 3;
                if (tempScore >= 94) {
                    tempScore = 94;
                    clearInterval(interval);
                }
                setDemoScore(tempScore);
            }, 30);
        }, 3000);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
        show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 100, damping: 20 } }
    };

    return (
        <div className="bg-white text-slate-900 min-h-screen selection:bg-hygenious-teal/20 selection:text-hygenious-teal font-sans">
            <CustomCursor />

            {/* HERO SECTION */}
            <section className="relative w-full min-h-screen flex flex-col items-center justify-start pt-32 lg:pt-40 px-6 overflow-hidden perspective-1000">
                {/* INFINITE MARQUEE BACKGROUND TEXT */}
                <div className="hero-marquee-wrapper">
                    <div className="hero-marquee-track">
                        CLEANLINESS • HYGIENE • CLEAN • CERTIFIED • CLEANLINESS • HYGIENE • CLEAN • CERTIFIED • CLEANLINESS • HYGIENE • CLEAN • CERTIFIED • CLEANLINESS • HYGIENE • CLEAN • CERTIFIED •&nbsp;
                    </div>
                </div>

                {/* Background Mesh */}
                <div className="absolute inset-0 z-0 bg-gradient-mesh opacity-70 animate-gradient-flow pointer-events-none" />

                <motion.div
                    className="relative z-10 w-full max-w-5xl mx-auto text-center flex flex-col items-center"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    style={{ y: heroY, opacity: heroOpacity }}
                >
                    <motion.div variants={itemVariants} className="mb-6">
                        <span className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md border border-slate-200/60 rounded-full px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                            <Sparkles className="w-4 h-4 text-hygenious-teal" />
                            Next-Generation Audits
                        </span>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <RevealText
                            text="AI That Sees|What You Miss."
                            className="text-6xl md:text-[80px] leading-[1.05] tracking-tight font-bold text-slate-900 mb-8 max-w-4xl"
                        />
                    </motion.div>

                    <motion.p
                        variants={itemVariants}
                        className="text-[20px] leading-[1.7] text-slate-500 mb-12 max-w-2xl"
                    >
                        Transform any space into a certified clean zone with instant, AI-powered hygiene audits. Trusted by forward-thinking businesses worldwide.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 items-center">
                        <Magnetic>
                            <Link href={isAuthenticated ? "/dashboard/audits/new" : "/register"} className="block magnetic">
                                <button className="bg-gradient-to-r from-hygenious-teal to-hygenious-cyan text-white text-[16px] font-semibold px-10 py-4 rounded-xl shadow-[0_8px_24px_rgba(0,212,170,0.3)] hover:shadow-[0_16px_40px_rgba(0,212,170,0.4)] hover:-translate-y-1 transition-all duration-300 active:scale-95 group flex items-center justify-center w-full">
                                    Start Free Trial
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                        </Magnetic>
                        <Magnetic>
                            <button className="magnetic bg-transparent border-2 border-hygenious-teal/30 text-hygenious-teal text-[16px] font-medium px-8 py-[14px] rounded-xl hover:bg-hygenious-teal/5 transition-all duration-300 flex items-center justify-center group w-full">
                                <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" />
                                See How It Works
                            </button>
                        </Magnetic>
                    </motion.div>
                </motion.div>

                {/* Dashboard Mockup - Now with 3D scroll rotate */}
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.8, type: 'spring', stiffness: 50, damping: 20 }}
                    style={{ scale: mockupScale, rotateX: mockupRotate, transformPerspective: 1200 }}
                    className="relative z-20 w-full max-w-5xl mx-auto mt-20"
                >
                    <div className="relative rounded-2xl md:rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.15)] border border-white/40 bg-white/20 backdrop-blur-2xl animate-[float_6s_ease-in-out_infinite]">
                        {/* Browser Chrome */}
                        <div className="h-12 border-b border-black/5 flex items-center px-6 gap-2 bg-gradient-premium">
                            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                        </div>
                        {/* Mockup Content */}
                        <div className="bg-slate-50 relative aspect-[16/9] md:aspect-[21/9] flex items-center justify-center">
                            <img src="/images/hero-image.png" alt="Dashboard" className="w-full h-full object-cover opacity-90 mix-blend-multiply" />
                        </div>
                    </div>
                </motion.div>

                {/* Trust Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="w-full max-w-5xl mx-auto mt-20 pb-10 border-t border-slate-100 pt-10"
                >
                    <p className="text-center text-sm font-medium text-slate-400 mb-8 uppercase tracking-widest">Trusted by industry leaders</p>
                    <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholder Logos (SVG) */}
                        <ShieldCheck className="w-10 h-10" />
                        <Activity className="w-10 h-10" />
                        <TrendingUp className="w-10 h-10" />
                        <CheckCircle2 className="w-10 h-10" />
                        <ScanLine className="w-10 h-10" />
                    </div>
                </motion.div>
            </section>

            {/* BENTO GRID FEATURES SECTION */}
            <section className="py-32 px-6 bg-slate-50 relative" id="features">
                <SectionReveal>
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-[56px] font-bold tracking-tight text-slate-900 mb-6">
                                Everything You Need <br /> for <span className="text-transparent bg-clip-text bg-gradient-success">Pristine Hygiene</span>
                            </h2>
                            <div className="w-20 h-1 bg-hygenious-teal rounded-full mx-auto"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">

                            {/* Card 1: Large - Now wrapped in TiltCard */}
                            <TiltCard className="md:col-span-2 md:row-span-2">
                                <div className="feature-card h-full w-full relative overflow-hidden group p-10 flex flex-col justify-between custom-glass">
                                    <div className="z-10 relative pointer-events-none">
                                        <div className="w-14 h-14 bg-hygenious-teal/10 rounded-2xl flex items-center justify-center mb-6">
                                            <ScanLine className="w-7 h-7 text-hygenious-teal" />
                                        </div>
                                        <h3 className="text-3xl font-semibold mb-3 tracking-tight">Instant AI Analysis</h3>
                                        <p className="text-slate-500 text-lg max-w-sm">Our dual-engine AI scans complex environments in under 3 seconds with 99.2% verified accuracy.</p>
                                    </div>
                                    <div className="absolute right-0 bottom-0 w-2/3 h-2/3 translate-x-10 translate-y-10 rounded-tl-2xl overflow-hidden shadow-2xl border-t border-l border-white/50 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-700 ease-out pointer-events-none">
                                        <div className="absolute inset-0 bg-hygenious-teal/10 animate-pulse z-20"></div>
                                        <div className="w-full h-full bg-slate-200">
                                            {/* Mock Image Content */}
                                            <div className="absolute inset-0 flex items-center justify-center border-4 border-hygenious-teal/40">
                                                <div className="border border-hygenious-teal bg-hygenious-teal/20 px-3 py-1 text-hygenious-teal font-bold text-sm absolute top-4 left-4 rounded">98% Match</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>

                            {/* Card 2: Medium */}
                            <TiltCard>
                                <div className="feature-card h-full w-full group p-8 flex flex-col items-center justify-center text-center custom-glass relative overflow-hidden pointer-events-none">
                                    <div className="absolute inset-0 bg-gradient-to-br from-hygenious-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative z-10 w-full flex flex-col items-center">
                                        <Activity className="w-10 h-10 text-hygenious-cyan mb-6" />
                                        <h3 className="text-2xl font-semibold mb-2 tracking-tight">Instant Score</h3>
                                        <div className="w-32 h-32 rounded-full border-[8px] border-slate-100 flex items-center justify-center relative mt-6 group-hover:border-hygenious-teal/20 transition-colors">
                                            <span className="text-5xl font-bold text-slate-900 group-hover:scale-110 transition-transform">A</span>
                                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                                <circle cx="50%" cy="50%" r="46%" fill="none" stroke="#00D4AA" strokeWidth="8" strokeDasharray="100 100" className="opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-100 ease-out" strokeDashoffset="0"></circle>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>

                            {/* Card 3: Medium */}
                            <TiltCard>
                                <div className="feature-card h-full w-full p-8 flex flex-col custom-glass group pointer-events-none">
                                    <ShieldCheck className="w-8 h-8 text-hygenious-blue mb-6 group-hover:scale-110 transition-transform" />
                                    <h3 className="text-2xl font-semibold mb-2 tracking-tight">Detailed Breakdown</h3>
                                    <p className="text-slate-500 mb-6">Every issue identified with severity and confidence levels.</p>
                                    <div className="space-y-3 w-full mt-auto">
                                        <div className="bg-white/60 p-3 rounded-lg flex items-center justify-between border border-slate-100 group-hover:-translate-y-1 transition-transform shadow-sm">
                                            <span className="text-sm font-medium">Surface Cleanliness</span>
                                            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Critical</span>
                                        </div>
                                        <div className="bg-white/60 p-3 rounded-lg flex items-center justify-between border border-slate-100 group-hover:-translate-y-1 transition-transform delay-75 shadow-sm">
                                            <span className="text-sm font-medium">Organization</span>
                                            <span className="text-xs font-bold text-hygenious-teal bg-hygenious-teal/10 px-2 py-1 rounded">Perfect</span>
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>

                            {/* Card 4: Small */}
                            <TiltCard>
                                <div className="feature-card h-full w-full p-8 flex flex-col justify-center items-center text-center custom-glass group pointer-events-none">
                                    <div className="w-16 h-16 bg-white shadow-sm rounded-xl mb-4 border border-slate-100 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all">
                                        <QrCode className="w-8 h-8 text-slate-800" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-1 tracking-tight">Public Trust Badges</h3>
                                    <p className="text-slate-500 text-sm">Live verifiable QR certificates.</p>
                                </div>
                            </TiltCard>

                            {/* Card 5: Small */}
                            <TiltCard className="md:col-span-2">
                                <div className="feature-card h-full w-full p-8 flex flex-col md:flex-row items-center gap-8 custom-glass overflow-hidden group pointer-events-none">
                                    <div className="flex-1">
                                        <TrendingUp className="w-8 h-8 text-purple-500 mb-4 group-hover:-translate-y-1 transition-transform" />
                                        <h3 className="text-2xl font-semibold mb-2 tracking-tight">Smart Analytics</h3>
                                        <p className="text-slate-500">Track your hygiene performance over time and benchmark across locations.</p>
                                    </div>
                                    <div className="w-full md:w-1/2 h-32 bg-gradient-to-r from-hygenious-teal/10 to-hygenious-cyan/10 rounded-xl relative overflow-hidden">
                                        {/* Simulated chart line */}
                                        <svg className="absolute w-full h-full" preserveAspectRatio="none" viewBox="0 -10 100 120">
                                            <path d="M0,80 Q20,60 40,70 T80,40 T100,20" fill="none" stroke="url(#grad)" strokeWidth="4" strokeLinecap="round" className="opacity-70 group-hover:opacity-100 group-hover:scale-y-110 transition-all origin-bottom" />
                                            <defs>
                                                <linearGradient id="grad">
                                                    <stop offset="0%" stopColor="#06B6D4" />
                                                    <stop offset="100%" stopColor="#00D4AA" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                </div>
                            </TiltCard>

                        </div>
                    </div>
                </SectionReveal>
            </section>

            {/* INTERACTIVE DEMO SECTION */}
            <section className="py-32 px-6 relative overflow-hidden bg-white">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

                <SectionReveal>
                    <div className="max-w-5xl mx-auto text-center">
                        <h2 className="text-4xl md:text-[56px] font-bold tracking-tight mb-6">See It In Action</h2>
                        <p className="text-xl text-slate-500 mb-16 max-w-2xl mx-auto">Experience the power of our vision model instantly. No credit card required.</p>

                        <div className="relative w-full max-w-3xl mx-auto h-[450px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] overflow-hidden group hover:border-hygenious-teal/50 transition-colors duration-300">

                            <AnimatePresence mode="wait">
                                {demoState === 'idle' && (
                                    <motion.div
                                        key="idle"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center p-10 cursor-pointer"
                                        onClick={runDemo}
                                    >
                                        <div className="w-20 h-20 bg-hygenious-teal/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-hygenious-teal/20 transition-all duration-300">
                                            <UploadCloud className="w-8 h-8 text-hygenious-teal" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">Click to Run Demo Scan</h3>
                                        <p className="text-slate-400">Watch the AI analyze a sample environment</p>
                                    </motion.div>
                                )}

                                {demoState === 'scanning' && (
                                    <motion.div
                                        key="scanning"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-slate-900 overflow-hidden"
                                    >
                                        {/* Simulated Image */}
                                        <img src="/images/hero-image.png" alt="Scanning" className="w-full h-full object-cover opacity-40 blur-sm" />

                                        {/* Scanning Beam */}
                                        <motion.div
                                            className="absolute left-0 w-full h-1 bg-hygenious-teal shadow-[0_0_20px_#00D4AA]"
                                            initial={{ top: 0 }}
                                            animate={{ top: "100%" }}
                                            transition={{ duration: 2.5, ease: "linear", repeat: Infinity }}
                                        />

                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 border-4 border-white/20 border-t-hygenious-teal rounded-full animate-spin mb-4"></div>
                                            <p className="text-white text-lg font-medium tracking-wide">Analyzing Surfaces...</p>
                                        </div>
                                    </motion.div>
                                )}

                                {demoState === 'result' && (
                                    <motion.div
                                        key="result"
                                        initial={{ opacity: 0, scale: 1.05 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute inset-0 bg-white"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90 z-10 pointer-events-none"></div>
                                        <img src="/images/hero-image.png" alt="Result" className="absolute top-0 w-full h-1/2 object-cover opacity-60" />

                                        <div className="relative z-20 h-full flex flex-col items-center justify-end pb-12">
                                            <motion.div
                                                initial={{ y: 50, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className="bg-white p-8 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] text-center w-[90%] max-w-md border border-slate-100"
                                            >
                                                <p className="text-slate-500 font-medium uppercase tracking-wider mb-2">Final Score</p>
                                                <div className="text-[80px] font-bold leading-none text-slate-900 mb-4 bg-clip-text text-transparent bg-gradient-success">
                                                    {demoScore}
                                                </div>
                                                <div className="flex gap-4 justify-center">
                                                    <Button className="rounded-full bg-slate-900 text-white hover:bg-slate-800" onClick={() => setDemoState('idle')}>Reset Demo</Button>
                                                    <Link href="/register">
                                                        <Button variant="outline" className="rounded-full text-hygenious-teal border-hygenious-teal hover:bg-hygenious-teal/5">Register Now</Button>
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </SectionReveal>
            </section>

            {/* MARQUEE STATS SECTION */}
            <section className="py-20 bg-slate-50 border-y border-slate-100 overflow-hidden flex">
                <motion.div
                    className="flex items-center whitespace-nowrap w-max"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ ease: "linear", duration: 30, repeat: Infinity }}
                >
                    {/* Quadruple the content to ensure it never detaches mid-screen */}
                    {[...Array(4)].map((_, idx) => (
                        <div key={idx} className="flex gap-20 px-10 items-center">
                            <div className="flex flex-col items-center"><span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-success">Real-Time</span><span className="text-slate-500 text-sm mt-1">Instant Results</span></div>
                            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                            <div className="flex flex-col items-center"><span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">99.2%</span><span className="text-slate-500 text-sm mt-1">AI Accuracy</span></div>
                            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                            <div className="flex flex-col items-center"><span className="text-4xl font-bold text-slate-900">2.5s</span><span className="text-slate-500 text-sm mt-1">Avg Analysis Time</span></div>
                            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                            <div className="flex flex-col items-center"><span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-success">24/7</span><span className="text-slate-500 text-sm mt-1">Always Available</span></div>
                            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* AI CAPABILITIES SECTION */}
            <AiCapabilitiesSection />

            {/* CTA SECTION */}
            <section className="relative py-32 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-hero mix-blend-multiply"></div>
                <SectionReveal>
                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <span className="inline-block py-1 px-4 rounded-full bg-hygenious-teal/10 text-hygenious-teal font-semibold text-sm mb-6 animate-pulse border border-hygenious-teal/20">
                            Limited Time Offer
                        </span>
                        <h2 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-8">
                            Elevate Your Standard.
                        </h2>
                        <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
                            Join the growing number of forward-thinking facilities using Hygenious to automate their hygiene audits. No credit card required. 50 free scans included.
                        </p>
                        <Link href="/register">
                            <button className="bg-gradient-to-r from-hygenious-teal to-hygenious-cyan text-white text-[18px] font-bold px-12 py-5 rounded-full shadow-[0_12px_40px_rgba(0,212,170,0.35)] hover:shadow-[0_24px_64px_rgba(0,212,170,0.5)] hover:-translate-y-2 transition-all duration-300 active:scale-95 group">
                                Start Your Free Trial
                            </button>
                        </Link>
                    </div>
                </SectionReveal>
            </section>

            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .custom-glass {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(0, 0, 0, 0.04);
                    border-radius: 24px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8);
                    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .custom-glass:hover {
                    transform: translateY(-8px) scale(1.01);
                    border-color: rgba(0, 212, 170, 0.3);
                    box-shadow: 0 20px 60px rgba(0, 212, 170, 0.12), 0 0 0 1px rgba(0, 212, 170, 0.1);
                    background: white;
                }

                /* ── Hero Marquee ── */
                @keyframes marquee {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-50%); }
                }
                .hero-marquee-wrapper {
                    position: absolute;
                    top: 22%;
                    left: 0;
                    width: 100%;
                    overflow: hidden;
                    pointer-events: none;
                    z-index: 0;
                    opacity: 0.06;
                    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
                    mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
                }
                .hero-marquee-track {
                    display: inline-block;
                    white-space: nowrap;
                    font-size: clamp(8rem, 15vw, 14rem);
                    font-weight: 900;
                    line-height: 1;
                    letter-spacing: -0.04em;
                    color: #0f172a;
                    will-change: transform;
                    transform: translateZ(0);
                    animation: marquee 25s linear infinite;
                }
                .hero-marquee-wrapper:hover .hero-marquee-track {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}
