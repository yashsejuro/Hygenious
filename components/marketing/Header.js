'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll } from 'framer-motion';
import { Shield, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
    const { isAuthenticated } = useAuth();
    const { scrollY } = useScroll();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        return scrollY.onChange((latest) => {
            setScrolled(latest > 10);
        });
    }, [scrollY]);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/80 backdrop-blur-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-b border-hygenious-teal/10'
                : 'bg-transparent border-b border-transparent'
                }`}
        >
            <div className="container mx-auto px-6 h-[60px]">
                <div className="flex items-center justify-between h-full">
                    <Link href="/">
                        <motion.div
                            className="flex items-center space-x-2 cursor-pointer group"
                            whileHover={{ scale: 1.02 }}
                        >
                            <Shield className="h-6 w-6 text-hygenious-teal transition-transform group-hover:scale-110 duration-300" />
                            <span className="text-xl font-bold tracking-tight text-slate-900">
                                Hygenious
                            </span>
                        </motion.div>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        {[
                            { name: 'Features', href: '/features' },
                            { name: 'How It Works', href: '/how-it-works' },
                            { name: 'Pricing', href: '/dashboard/upgrade' },
                            { name: 'Benefits', href: '/benefits' }
                        ].map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors relative group"
                            >
                                {item.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-hygenious-teal transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100 rounded-full"></span>
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <Link href="/dashboard">
                                    <span className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors mr-4">
                                        Dashboard
                                    </span>
                                </Link>
                                <Link href="/dashboard/audits/new">
                                    <button className="bg-gradient-to-r from-hygenious-teal to-hygenious-cyan text-white text-[15px] font-semibold px-6 py-2 rounded-full shadow-[0_8px_24px_rgba(0,212,170,0.3)] hover:shadow-[0_16px_40px_rgba(0,212,170,0.4)] hover:-translate-y-0.5 transition-all duration-300 active:scale-95 flex items-center">
                                        Scan Now <ArrowRight className="ml-2 w-4 h-4" />
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <span className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors mr-2">
                                        Sign In
                                    </span>
                                </Link>
                                <Link href="/register">
                                    <button className="bg-gradient-to-r from-hygenious-teal to-hygenious-cyan text-white text-[15px] font-semibold px-6 py-2 rounded-full shadow-[0_8px_24px_rgba(0,212,170,0.3)] hover:shadow-[0_16px_40px_rgba(0,212,170,0.4)] hover:-translate-y-0.5 transition-all duration-300 active:scale-95 flex items-center">
                                        Start Free Trial
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
