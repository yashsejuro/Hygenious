'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
            <div className="container mx-auto px-4 text-center">
                <motion.div
                    className="flex items-center justify-center space-x-2 mb-4"
                    whileHover={{ scale: 1.05 }}
                >
                    <Shield className="h-6 w-6 text-blue-400" />
                    <span className="text-lg font-semibold text-white">Hygenious</span>
                </motion.div>
                <p className="mb-4">
                    AI-powered cleanliness inspection for the modern world
                </p>
                <div className="flex justify-center space-x-6 text-sm mb-8">
                    {['About', 'Contact', 'Privacy', 'Terms'].map((link) => (
                        <Link
                            key={link}
                            href={`/${link.toLowerCase()}`}
                            passHref
                        >
                            <motion.span
                                className="hover:text-white transition-colors cursor-pointer block"
                                whileHover={{ y: -2 }}
                            >
                                {link}
                            </motion.span>
                        </Link>
                    ))}
                </div>
                <p className="text-sm">© {new Date().getFullYear()} Hygenious. All rights reserved.</p>
            </div>
        </footer>
    );
}
