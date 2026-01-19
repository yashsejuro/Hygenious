'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
    const { isAuthenticated } = useAuth();

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20"
        >
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/">
                        <motion.div
                            className="flex items-center space-x-2 cursor-pointer"
                            whileHover={{ scale: 1.03 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Shield className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                                Hygenious
                            </span>
                        </motion.div>
                    </Link>

                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/features" className="text-gray-600 hover:text-blue-600 transition-colors">
                            Features
                        </Link>
                        <Link href="/how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">
                            How It Works
                        </Link>
                        <Link href="/dashboard/upgrade" className="text-gray-600 hover:text-blue-600 transition-colors">
                            Pricing
                        </Link>
                        <Link href="/benefits" className="text-gray-600 hover:text-blue-600 transition-colors">
                            Benefits
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link href="/dashboard">
                                    <Button variant="outline" className="hover:scale-105 transition-transform">
                                        Dashboard
                                    </Button>
                                </Link>
                                <Link href="/dashboard/audits/new">
                                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-transform">
                                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="outline" className="hover:scale-105 transition-transform">
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-transform">
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
