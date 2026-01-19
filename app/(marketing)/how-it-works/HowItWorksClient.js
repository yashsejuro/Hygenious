'use client';

import { motion } from 'framer-motion';
import { Camera, ArrowRight, BarChart3, CheckCircle, Upload, Smartphone, Search, FileBarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/animated-background';

export default function HowItWorksClient() {
    const steps = [
        {
            num: 1,
            icon: Smartphone,
            title: 'Capture the Scene',
            desc: 'Simply take a photo of any room, surface, or equipment using your smartphone camera. No special hardware required.',
            details: 'Ensure good lighting and capture the entire area you want to audit. Our AI is trained to recognize various environments from kitchens to restrooms.'
        },
        {
            num: 2,
            icon: Upload,
            title: 'Secure Upload',
            desc: 'Upload the image to our secure, compliant cloud platform instantly.',
            details: 'Your data is encrypted in transit and at rest. We support batch uploads for auditing larger facilities efficiently.'
        },
        {
            num: 3,
            icon: Search,
            title: 'AI Analysis',
            desc: 'Our advanced computer vision algorithms scan the image for dirt, clutter, safety hazards, and hygiene violations.',
            details: 'The AI identifies specific issues, categorizes them, and assigns a severity score based on industry standards.'
        },
        {
            num: 4,
            icon: FileBarChart,
            title: 'Get Results',
            desc: 'Receive an instant report with a hygiene score, annotated issues, and actionable recommendations.',
            details: 'Review the findings, assign tasks to your team for remediation, and track the resolution of identified issues.'
        },
    ];

    return (
        <div className="container mx-auto px-4 py-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
            >
                <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900">
                    How Hygenious Works
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    From photo to full audit report in seconds. Experience the seamless workflow of AI-powered hygiene inspection.
                </p>
            </motion.div>

            <div className="space-y-24">
                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7 }}
                        className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}
                    >
                        <div className="flex-1">
                            <GlassCard className="p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-[900] text-9xl text-blue-900 leading-none select-none z-0">
                                    {step.num}
                                </div>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                        <step.icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-gray-900">{step.title}</h3>
                                    <p className="text-lg text-gray-700 mb-4 font-medium">{step.desc}</p>
                                    <p className="text-gray-600 leading-relaxed">{step.details}</p>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Visual representation placeholder */}
                        <div className="flex-1 flex justify-center">
                            <div className="relative w-full max-w-md aspect-square rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 flex items-center justify-center p-8 animate-pulse-slow">
                                {/* This would ideally be an image or animation relevant to the step */}
                                <step.icon className="w-32 h-32 text-blue-200/50" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="mt-24 text-center"
            >
                <h2 className="text-3xl font-bold mb-8">Ready to try it yourself?</h2>
                <Link href="/dashboard/audits/new">
                    <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all">
                        Start Your First Audit Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
            </motion.div>
        </div>
    );
}
