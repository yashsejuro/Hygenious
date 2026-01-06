'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { getScoreTextClass, getScoreLabel, getScoreBadgeClass } from '@/lib/colors';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export default function AuditDetailPage() {
  const params = useParams();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [displayScore, setDisplayScore] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (params.id) {
      fetchAudit();
    }
  }, [params.id]);

  useEffect(() => {
    if (!audit) return;

    const score = audit.result?.overallScore || 0;
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    if (prefersReducedMotion) {
      setDisplayScore(score);
      return;
    }

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [audit, prefersReducedMotion]);

  const fetchAudit = async () => {
    try {
      const response = await fetch(`/api/audits/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setAudit(data.data);
      }
    } catch (error) {
      console.error('Error fetching audit:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading audit...</p>
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Audit Not Found</h2>
          <Link href="/dashboard/audits">
            <Button>Back to Audits</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-slate-900">Audit Details</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Audit Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-64 h-64 bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Image not available</span>
                  </div>
                </div>
                <div className="flex-1 space-y-6">
                  <motion.div
                    initial={!prefersReducedMotion ? { opacity: 0, y: -10 } : {}}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="text-xl font-semibold text-slate-900">{audit.location}</h3>
                    <p className="text-slate-600 text-sm mt-1">
                      {new Date(audit.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </motion.div>

                  <motion.div
                    className="text-center py-4 bg-slate-50 rounded-lg"
                    initial={!prefersReducedMotion ? { scale: 0.8, opacity: 0 } : {}}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
                  >
                    <div className={`text-6xl font-bold ${getScoreTextClass(displayScore)}`}>
                      {displayScore}
                    </div>
                    <div className={`text-sm font-semibold mt-3 px-3 py-1 rounded-full border inline-block ${getScoreBadgeClass(displayScore)}`}>
                      {getScoreLabel(displayScore)}
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Cleanliness', value: audit.result?.cleanliness || 0 },
                      { label: 'Organization', value: audit.result?.organization || 0 },
                      { label: 'Safety', value: audit.result?.safety || 0 }
                    ].map((item, idx) => (
                      <motion.div
                        key={item.label}
                        className="text-center p-3 bg-white border border-slate-200 rounded-lg"
                        initial={!prefersReducedMotion ? { opacity: 0 } : {}}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.1, duration: 0.3 }}
                      >
                        <div className={`text-2xl font-bold ${getScoreTextClass(item.value)}`}>
                          {item.value}
                        </div>
                        <div className="text-xs text-slate-600 mt-1">{item.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {audit.result?.assessment && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Overall Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">{audit.result.assessment}</p>
              </CardContent>
            </Card>
          )}

          {audit.result?.issues && audit.result.issues.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">
                  Detected Issues ({audit.result.issues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {audit.result.issues.map((issue, index) => (
                    <motion.div
                      key={index}
                      className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}
                      initial={!prefersReducedMotion ? { opacity: 0, x: -10 } : {}}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className={`h-5 w-5 ${getSeverityIcon(issue.severity)}`} />
                            <h4 className="font-semibold text-slate-900">{issue.type}</h4>
                          </div>
                          <p className="text-slate-700 text-sm">{issue.description}</p>
                        </div>
                        <Badge variant="outline" className={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                      </div>
                      {issue.confidence && (
                        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                            <span>Confidence</span>
                            <span className="font-medium">{issue.confidence}%</span>
                          </div>
                          <Progress value={issue.confidence} className="h-2" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {audit.result?.recommendations && audit.result.recommendations.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {audit.result.recommendations.map((rec, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-3"
                      initial={!prefersReducedMotion ? { opacity: 0, x: 10 } : {}}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{rec}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {audit.areaNotes && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Area Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">{audit.areaNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
