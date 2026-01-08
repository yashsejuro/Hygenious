'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Loader2, Mail, Lock, User, Building, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react';
import { AnimatedBackground, GlassCard } from '@/components/ui/animated-background';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

// Animation variants - defined outside component for performance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  },
  hover: {
    y: -5,
    transition: { duration: 0.3 }
  }
};

const buttonVariants = {
  hover: { 
    scale: 1.02,
    boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)"
  },
  tap: { scale: 0.98 }
};

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, loginWithGoogle, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const result = await register(email, password, name, companyName);
      
      if (result.success) {
        toast({
          title: 'Registration Successful!',
          description: result.message || 'Please check your email to verify your account.',
        });
        
        // Don't redirect immediately - user needs to verify email
        // Show message about email verification
      } else {
        toast({
          title: 'Registration Failed',
          description: result.error || 'Unable to create account',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedBackground variant="gradient">
      <Toaster />
      
      <motion.div 
        className="relative z-10 flex items-center justify-center min-h-screen p-4"
        variants={containerVariants}
        initial={prefersReducedMotion ? "visible" : "hidden"}
        animate="visible"
      >
        <motion.div
          variants={cardVariants}
          whileHover={prefersReducedMotion ? {} : "hover"}
          className="w-full max-w-md"
        >
          <GlassCard hover={!prefersReducedMotion} className="overflow-hidden">
            <Card className="border-0 bg-transparent shadow-none">
              <CardHeader className="space-y-4 text-center pb-8">
                <motion.div 
                  className="flex justify-center"
                  initial={prefersReducedMotion ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Create Account
                  </CardTitle>
                  <CardDescription className="text-base mt-2 text-gray-500">
                    Get started with Hygenious today
                  </CardDescription>
                </motion.div>
              </CardHeader>
              
              <CardContent className="space-y-6 px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <motion.div 
                    className="space-y-2"
                    variants={itemVariants}
                  >
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 bg-white/50 backdrop-blur-sm border-white/20 focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500/20"
                        disabled={loading}
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    variants={itemVariants}
                  >
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-white/50 backdrop-blur-sm border-white/20 focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500/20"
                        disabled={loading}
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    variants={itemVariants}
                  >
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-white/50 backdrop-blur-sm border-white/20 focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500/20"
                        disabled={loading}
                        required
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword ? 'true' : 'false'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </motion.button>
                    </div>
                    <p className="text-xs text-gray-500">Must be at least 6 characters</p>
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    variants={itemVariants}
                  >
                    <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">Company Name (Optional)</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="Your Company"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="pl-10 bg-white/50 backdrop-blur-sm border-white/20 focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500/20"
                        disabled={loading}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                  >
                    <motion.div 
                      whileHover={prefersReducedMotion ? {} : "hover"} 
                      whileTap={prefersReducedMotion ? {} : "tap"}
                      variants={buttonVariants}
                    >
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                        disabled={loading || googleLoading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>

                <motion.div 
                  className="relative my-6"
                  variants={itemVariants}
                >
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/70 backdrop-blur-sm px-2 text-gray-500">Or continue with</span>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <motion.div 
                    whileHover={prefersReducedMotion ? {} : "hover"} 
                    whileTap={prefersReducedMotion ? {} : "tap"}
                    variants={buttonVariants}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white/70 transition-all duration-300"
                      disabled={loading || googleLoading}
                      onClick={async () => {
                        setGoogleLoading(true);
                        try {
                          const result = await loginWithGoogle();
                          if (result.success) {
                            toast({
                              title: 'Registration Successful!',
                              description: 'Redirecting to dashboard...',
                            });
                            setTimeout(() => {
                              router.push('/dashboard');
                            }, 1000);
                          } else {
                            toast({
                              title: 'Registration Failed',
                              description: result.error || 'Google sign-up failed',
                              variant: 'destructive',
                            });
                          }
                        } catch (error) {
                          toast({
                            title: 'Error',
                            description: 'An unexpected error occurred',
                            variant: 'destructive',
                          });
                        } finally {
                          setGoogleLoading(false);
                        }
                      }}
                    >
                      {googleLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing up...
                        </>
                      ) : (
                        <>
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Sign up with Google
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-2">
                <motion.div 
                  className="text-sm text-center text-gray-600"
                  variants={itemVariants}
                >
                  Already have an account?{' '}
                  <Link 
                    href="/login" 
                    className="text-blue-600 hover:text-purple-600 font-medium transition-colors relative group"
                  >
                    Sign in
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </motion.div>
                
                <motion.div 
                  className="text-xs text-center text-gray-500"
                  variants={itemVariants}
                >
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-blue-600 hover:underline transition-all">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:underline transition-all">
                    Privacy Policy
                  </a>
                </motion.div>
              </CardFooter>
            </Card>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatedBackground>
  );
}
