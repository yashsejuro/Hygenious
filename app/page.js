'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Camera,
  BarChart3,
  TrendingUp,
  CheckCircle,
  Shield,
  Zap,
  LogIn,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedBackground, GlassCard } from '@/components/ui/animated-background';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();

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
    <AnimatedBackground variant="gradient">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Hygenious - Smart Audit
              </span>
            </motion.div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                How It Works
              </a>
              <a href="#benefits" className="text-gray-600 hover:text-blue-600 transition-colors">
                Benefits
              </a>
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
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
                <Link href="/login">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" variant="outline" className="text-lg px-8">
                      Login
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
              src="/images/hero-image.jpg"
              alt="Dashboard Preview"
              className="w-full h-auto"
            />
          </GlassCard>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features" 
        className="container mx-auto px-4 py-20"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.h2 variants={itemVariants} className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
          Why Choose Hygenious?
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
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
            }
          ].map((feature, index) => (
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
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                    </motion.div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600"
          >
            How It Works
          </motion.h2>
          <motion.div 
            className="grid md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {[
              {
                num: 1,
                icon: Camera,
                title: 'Capture',
                desc: 'Take a photo of any space with your smartphone',
              },
              {
                num: 2,
                icon: ArrowRight,
                title: 'Upload',
                desc: 'Submit the image to our secure AI engine',
              },
              {
                num: 3,
                icon: BarChart3,
                title: 'Analyze',
                desc: 'AI detects issues and calculates hygiene scores',
              },
              {
                num: 4,
                icon: CheckCircle,
                title: 'Improve',
                desc: 'Get actionable insights and track progress',
              },
            ].map((step) => (
              <motion.div 
                key={step.num} 
                className="text-center"
                variants={itemVariants}
              >
                <motion.div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  {step.num}
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1, y: -3 }}
                  transition={{ duration: 0.3 }}
                >
                  <step.icon className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                </motion.div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <motion.section 
        id="benefits" 
        className="container mx-auto px-4 py-20"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.h2 variants={itemVariants} className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
          Who Benefits?
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              title: 'For Businesses',
              desc: 'Maintain consistent hygiene standards',
              benefits: [
                'Real-time monitoring across multiple locations',
                'Consistent standards without human bias',
                'Staff training with clear benchmarks',
                'Detailed audit trails for compliance'
              ]
            },
            {
              title: 'For Inspectors & Auditors',
              desc: 'Enhanced efficiency and accuracy',
              benefits: [
                'Instant scoring replaces manual checklists',
                'Visual evidence with every audit',
                'Comprehensive reports in seconds',
                'Historical trends and analytics'
              ]
            }
          ].map((section, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <GlassCard hover={false} className="h-full">
                <Card className="h-full border-0 bg-transparent shadow-none">
                  <CardHeader>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>{section.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.benefits.map((benefit, i) => (
                        <motion.li
                          key={i}
                          className="flex items-start"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="relative py-20 overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h2 
            className="text-4xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to Elevate Your Hygiene Standards?
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 text-white/90"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            Start your first audit in seconds - no credit card required
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link href="/dashboard/audits/new">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="secondary" className="text-lg px-8 bg-white text-blue-600 hover:bg-gray-100">
                  Start Free Audit Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
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
              <motion.a
                key={link}
                href="#"
                className="hover:text-white transition-colors"
                whileHover={{ y: -2 }}
              >
                {link}
              </motion.a>
            ))}
          </div>
          <p className="text-sm">© 2026 Hygenious. All rights reserved.</p>
        </div>
      </footer>
    </AnimatedBackground>
  );
}
