'use client';

import { motion } from 'framer-motion';
import { Zap, Shield, TrendingUp, Cpu, Smartphone, Cloud, Eye, FileText, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/animated-background';

export default function FeaturesClient() {
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

    const features = [
        {
            icon: Zap,
            color: 'text-blue-600',
            title: 'Instant AI Analysis',
            desc: 'Upload a photo and get a detailed hygiene score in under 10 seconds. Our AI analyzes cleanliness, organization, and safety instantly.'
        },
        {
            icon: Shield,
            color: 'text-green-600',
            title: 'Objective Scoring',
            desc: 'No human bias. Get consistent, data-driven cleanliness assessments based on industry standards and best practices.'
        },
        {
            icon: TrendingUp,
            color: 'text-amber-600',
            title: 'Track Over Time',
            desc: 'Monitor hygiene trends, track improvements, and identify recurring issues with comprehensive analytics and reporting.'
        },
        {
            icon: Cpu,
            color: 'text-purple-600',
            title: 'Advanced Computer Vision',
            desc: 'Leverages state-of-the-art deep learning models to detect even subtle hygiene issues that might be missed by the human eye.'
        },
        {
            icon: Smartphone,
            color: 'text-indigo-600',
            title: 'Mobile First Design',
            desc: 'Designed for on-the-go auditing. Use any smartphone to capture and audit environments without specialized hardware.'
        },
        {
            icon: Cloud,
            color: 'text-sky-600',
            title: 'Cloud Storage & Sync',
            desc: 'All your audit data is securely stored in the cloud, accessible from anywhere, and synchronized across your team devices.'
        },
        {
            icon: Eye,
            color: 'text-teal-600',
            title: 'Visual Evidence',
            desc: 'Every audit is backed by visual proof. Annotated images pinpoint exactly where issues are, making remediation clear.'
        },
        {
            icon: FileText,
            color: 'text-orange-600',
            title: 'Automated Reporting',
            desc: 'Generate professional PDF reports instantly to share with stakeholders, management, or compliance officers.'
        },
        {
            icon: Lock,
            color: 'text-red-600',
            title: 'Enterprise Security',
            desc: 'Your data is protected with enterprise-grade encryption and role-based access controls to ensure privacy and compliance.'
        }
    ];

    return (
        <motion.section
            className="container mx-auto px-4 py-20"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
        >
            <motion.div variants={itemVariants} className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900">
                    Powerful Features for Modern Hygiene
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Discover the tools that make Hygenious the smartest way to audit and maintain cleanliness standards.
                </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ y: -8, scale: 1.01 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <GlassCard hover={false} className="h-full">
                            <Card className="h-full border-0 bg-transparent shadow-none">
                                <CardHeader>
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                                    </motion.div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </CardContent>
                            </Card>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}
