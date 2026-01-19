'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Briefcase, UserCheck, Heart, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/animated-background';

export default function BenefitsClient() {
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

    const benefits = [
        {
            title: 'For Businesses & Facility Managers',
            desc: 'Maintain consistent hygiene standards across all your locations.',
            icon: Briefcase,
            list: [
                'Ensure compliance with health and safety regulations',
                'Reduce risk of fines and closures',
                'Standardize inspections across multiple branches',
                'Train staff effectively with visual feedback',
                'Save time on manual reporting and documentation'
            ]
        },
        {
            title: 'For Inspectors & Auditors',
            desc: 'Supercharge your auditing process with AI assistance.',
            icon: UserCheck,
            list: [
                'Complete audits 5x faster than manual methods',
                'Eliminate subjectivity and bias from scores',
                'Automatically generate detailed, professional reports',
                'Focus on complex issues while AI handles the routine checks',
                'Keep a secure digital trail of all inspections'
            ]
        },
        {
            title: 'For Customers & Public Safety',
            desc: 'Promoting a cleaner, safer environment for everyone.',
            icon: Heart,
            list: [
                'Confidence in the cleanliness of visited establishments',
                'Reduced spread of illness and contaminants',
                'Transparency in hygiene standards',
                'Better overall customer experience',
                'Peace of mind knowing standards are verified'
            ]
        }
    ];

    return (
        <motion.section
            className="container mx-auto px-4 py-20"
            initial="hidden"
            animate="show"
            variants={containerVariants}
        >
            <motion.div variants={itemVariants} className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900">
                    Benefits for Everyone
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Improved hygiene isn't just about cleanliness—it's about safety, efficiency, and trust. see how Hygenious delivers value across the board.
                </p>
            </motion.div>

            <div className="space-y-12">
                {benefits.map((section, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.3 }}
                    >
                        <GlassCard hover={false} className="h-full overflow-hidden">
                            <div className="grid md:grid-cols-4 gap-6 p-2">
                                <div className="md:col-span-1 flex flex-col items-center justify-center p-6 bg-blue-50/50 rounded-xl">
                                    <div className="p-4 bg-white rounded-full shadow-md mb-4">
                                        <section.icon className="h-10 w-10 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-center text-gray-900">{section.title}</h3>
                                </div>
                                <div className="md:col-span-3 p-4">
                                    <p className="text-lg text-gray-700 mb-6 font-medium border-b pb-4 border-gray-100">
                                        {section.desc}
                                    </p>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {section.list.map((item, i) => (
                                            <motion.div
                                                key={i}
                                                className="flex items-start"
                                                initial={{ opacity: 0, x: -10 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.1 }}
                                            >
                                                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-600">{item}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            <motion.div
                variants={itemVariants}
                className="mt-20 grid md:grid-cols-3 gap-8 text-center"
            >
                <div className="p-6">
                    <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Save Time</h3>
                    <p className="text-gray-600">Reduce audit time by up to 70% with instant AI analysis.</p>
                </div>
                <div className="p-6">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Reduce Risk</h3>
                    <p className="text-gray-600">Catch issues early before they become compliance violations.</p>
                </div>
                <div className="p-6">
                    <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Improve Quality</h3>
                    <p className="text-gray-600">Consistent scoring leads to measurable improvements over time.</p>
                </div>
            </motion.div>
        </motion.section>
    );
}
