'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { PageTransition } from '@/components/ui/page-transition';
import { AnimatedScore } from '@/components/ui/animated-score';
import { ScoreBadge } from '@/components/ui/score-badge';

export default function AuditDetailPage() {
  const params = useParams();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchAudit();
    }
  }, [params.id]);

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

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'Needs Improvement';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audit...</p>
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Audit Not Found</h2>
          <Link href="/dashboard/audits">
            <Button>Back to Audits</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/audits">
                <Button variant="ghost" size="sm" className="transition-all hover:scale-105">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to History
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Audit Details</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          {/* Score Display */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle>Audit Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <img
                    src={audit.imageData}
                    alt={audit.location}
                    className="w-64 h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{audit.location}</h3>
                    <p className="text-gray-600">
                      {new Date(audit.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${getScoreColor(audit.result?.overallScore || 0)}`}>
                      <AnimatedScore score={audit.result?.overallScore || 0} />
                      <span className="text-3xl">/100</span>
                    </div>
                    <div className="text-2xl font-semibold text-gray-600 mt-2">
                      {getScoreLabel(audit.result?.overallScore || 0)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center space-y-2">
                      <ScoreBadge score={audit.result?.cleanliness || 0} size="md" />
                      <div className="text-sm text-gray-600">Cleanliness</div>
                    </div>
                    <div className="text-center space-y-2">
                      <ScoreBadge score={audit.result?.organization || 0} size="md" />
                      <div className="text-sm text-gray-600">Organization</div>
                    </div>
                    <div className="text-center space-y-2">
                      <ScoreBadge score={audit.result?.safety || 0} size="md" />
                      <div className="text-sm text-gray-600">Safety</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment */}
          {audit.result?.assessment && (
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle>Overall Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{audit.result.assessment}</p>
              </CardContent>
            </Card>
          )}

          {/* Issues */}
          {audit.result?.issues && audit.result.issues.length > 0 && (
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle>Detected Issues ({audit.result.issues.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {audit.result.issues.map((issue, index) => (
                    <div key={index} className="border rounded-lg p-4 transition-all hover:shadow-md animate-pulse-subtle">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            <h4 className="font-semibold">{issue.type}</h4>
                          </div>
                          <p className="text-gray-700 text-sm">{issue.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                      </div>
                      {issue.confidence && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Confidence</span>
                            <span>{issue.confidence}%</span>
                          </div>
                          <Progress value={issue.confidence} className="h-1" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {audit.result?.recommendations && audit.result.recommendations.length > 0 && (
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {audit.result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Area Notes */}
          {audit.areaNotes && (
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle>Area Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{audit.areaNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
