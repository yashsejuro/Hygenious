'use client';

import Link from 'next/link';
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

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                Hygenious - Smart Audit
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-blue-600">
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-blue-600"
              >
                How It Works
              </a>
              <a href="#benefits" className="text-gray-600 hover:text-blue-600">
                Benefits
              </a>
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                  <Link href="/dashboard/audits/new">
                    <Button>
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline">
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Hygiene Auditing
            <span className="block text-blue-600 mt-2">in Seconds</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Transform any smartphone into an instant, unbiased hygiene auditor.
            Get objective cleanliness scores and actionable insights powered by
            AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard/audits/new">
                  <Button size="lg" className="text-lg px-8">
                    Start Free Audit <Camera className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    View Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-6">
          See Your Hygiene Insights Clearly
        </h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
          Get real-time cleanliness scores, issue breakdowns, and improvement
          tracking right from your personalized dashboard.
        </p>
        <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
          <img
            src="/images/hero-image.jpg"
            alt="Dashboard Preview"
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose Hygenious?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Zap className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Instant AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Upload a photo and get a detailed hygiene score in under 10
                seconds. Our AI analyzes cleanliness, organization, and safety
                instantly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Objective Scoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                No human bias. Get consistent, data-driven cleanliness
                assessments based on industry standards and best practices.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-amber-600 mb-4" />
              <CardTitle>Track Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Monitor hygiene trends, track improvements, and identify
                recurring issues with comprehensive analytics and reporting.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
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
              <div key={step.num} className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <step.icon className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Who Benefits?</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>For Businesses</CardTitle>
              <CardDescription>
                Maintain consistent hygiene standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span>Real-time monitoring across multiple locations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span>Consistent standards without human bias</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span>Staff training with clear benchmarks</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span>Detailed audit trails for compliance</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Inspectors & Auditors</CardTitle>
              <CardDescription>
                Enhanced efficiency and accuracy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span>Instant scoring replaces manual checklists</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span>Visual evidence with every audit</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span>Comprehensive reports in seconds</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span>Historical trends and analytics</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Elevate Your Hygiene Standards?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start your first audit in seconds - no credit card required
          </p>
          <Link href="/dashboard/audits/new">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start Free Audit Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-6 w-6 text-blue-400" />
            <span className="text-lg font-semibold text-white">Hygenious</span>
          </div>
          <p className="mb-4">
            AI-powered cleanliness inspection for the modern world
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="#" className="hover:text-white">
              About
            </a>
            <a href="#" className="hover:text-white">
              Contact
            </a>
            <a href="#" className="hover:text-white">
              Privacy
            </a>
            <a href="#" className="hover:text-white">
              Terms
            </a>
          </div>
          <p className="mt-8 text-sm">© 2025 Hygenious. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
