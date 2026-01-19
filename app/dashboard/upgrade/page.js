'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Zap, Building, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function UpgradePage() {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    // Mock current plan - in a real app, this would come from a prop or context
    const currentPlan = 'free';

    const handleUpgradeClick = (plan) => {
        setSelectedPlan(plan);
        setShowUpgradeModal(true);
    };

    const handleContactClick = () => {
        setShowContactModal(true);
    };

    const plans = [
        {
            id: 'free',
            name: 'Free Starter',
            description: 'Essential tools for small spaces.',
            price: '$0',
            period: '/month',
            features: [
                '1 Admin User',
                '1 Branch / Location',
                'Basic Hygiene Audits',
                '7-Day History Retention',
                'Standard Email Support'
            ],
            cta: 'Current Plan',
            variant: 'outline',
            recommended: false
        },
        {
            id: 'pro',
            name: 'Pro',
            description: 'Perfect for growing businesses.',
            price: '$49',
            period: '/month',
            features: [
                'Up to 5 Team Members',
                'Up to 2 Branches',
                'Advanced Analytics & AI',
                'Unlimited History',
                'PDF Report Exports',
                'Priority Email Support',
                'Admin + Staff Roles'
            ],
            cta: 'Request Upgrade',
            variant: 'default',
            recommended: true
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            description: 'For large organizations.',
            price: 'Custom',
            period: '',
            features: [
                'Unlimited Users',
                'Unlimited Branches',
                'Custom AI Model Training',
                'API Access',
                'SSO & Advanced Security',
                'Dedicated Success Manager',
                'SLA Support'
            ],
            cta: 'Contact Sales',
            variant: 'secondary',
            recommended: false
        }
    ];

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
        <div className="container mx-auto p-6 max-w-7xl">
            <motion.div
                className="text-center mb-12 space-y-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Upgrade Your Plan
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Choose the perfect plan to streamline your hygiene auditing process.
                    Scale your team and unlock advanced insights.
                </p>
            </motion.div>

            <motion.div
                className="grid md:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {plans.map((plan) => (
                    <motion.div key={plan.id} variants={itemVariants} className="flex">
                        <Card
                            className={`flex flex-col w-full relative transition-all duration-300 hover:shadow-lg ${plan.recommended
                                    ? 'border-blue-600 shadow-blue-100 dark:shadow-blue-900/20 scale-105 z-10'
                                    : 'border-slate-200 dark:border-slate-800'
                                }`}
                        >
                            {plan.recommended && (
                                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-sm font-medium">
                                        Recommended
                                    </Badge>
                                </div>
                            )}

                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    {plan.name}
                                    {plan.id === 'pro' && <Zap className="h-5 w-5 text-blue-600" />}
                                    {plan.id === 'enterprise' && <Building className="h-5 w-5 text-slate-600" />}
                                </CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    <span className="text-slate-500 ml-1">{plan.period}</span>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-grow">
                                <Separator className="mb-6" />
                                <ul className="space-y-3">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                                            <span className="text-sm text-slate-600 dark:text-slate-300">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={plan.variant}
                                    disabled={plan.id === currentPlan}
                                    onClick={() => {
                                        if (plan.id === 'enterprise') {
                                            handleContactClick();
                                        } else if (plan.id !== currentPlan) {
                                            handleUpgradeClick(plan);
                                        }
                                    }}
                                >
                                    {plan.id === currentPlan ? 'Current Plan' : plan.cta}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Trust Section */}
            <motion.div
                className="mt-16 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <div className="flex items-center justify-center gap-2 text-slate-500 mb-4">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Secure & Trusted</span>
                </div>
                <p className="text-sm text-slate-400">
                    All plans include 24/7 data encryption and automated backups.
                </p>
            </motion.div>

            {/* Upgrade Modal */}
            <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Request {selectedPlan?.name} Plan</DialogTitle>
                        <DialogDescription>
                            Excellent choice! You're one step closer to unlocking full power.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                        <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <Zap className="h-8 w-8 text-blue-600" />
                        </div>
                        <p className="text-center text-slate-600 dark:text-slate-300">
                            We've noted your interest in the <strong>{selectedPlan?.name}</strong> plan.
                            <br /><br />
                            Our automated payment system is rolling out shortly.
                            We'll notify you as soon as it's live so you can complete your upgrade.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowUpgradeModal(false)} className="w-full sm:w-auto">
                            Got it, thanks
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Contact Sales Modal */}
            <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Contact Sales Team</DialogTitle>
                        <DialogDescription>
                            We'd love to tailor a solution for your organization.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Building className="h-4 w-4" /> Enterprise Solutions
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                For custom volume pricing, SSO integration, and dedicated support, please reach out to us directly.
                            </p>
                            <div className="text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center">
                                sales@hygenious.ai
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setShowContactModal(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// TODO: Integrate Stripe payment processing
// TODO: Connect 'currentPlan' to actual user subscription context
// TODO: Add 'billing-cycle' toggle (Monthly/Yearly)
