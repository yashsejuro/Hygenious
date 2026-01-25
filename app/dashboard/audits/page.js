'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Plus,
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  MapPin,
  Trophy,
  Loader2,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';

export default function AuditsPage() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScore, setFilterScore] = useState('all');
  const { getToken } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/audits', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setAudits(data.data);
      }
    } catch (error) {
      console.error('Error fetching audits:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audits',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAudit = async (id, e) => {
    e.preventDefault(); // Prevent navigation if clicking card
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this audit?')) return;

    try {
      const token = await getToken();
      const response = await fetch(`/api/audits/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setAudits(prev => prev.filter(a => a.id !== id));
        toast({
          title: 'Audit deleted',
          description: 'The audit has been successfully removed.'
        });
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete audit',
        variant: 'destructive'
      });
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Excellent</Badge>;
    if (score >= 75) return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Good</Badge>;
    if (score >= 60) return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">Fair</Badge>;
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Critical</Badge>;
  };

  const filteredAudits = audits.filter(audit => {
    const matchesSearch =
      audit.facilityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const score = audit.result?.overallScore || 0;
    let matchesScore = true;
    if (filterScore === 'excellent') matchesScore = score >= 90;
    if (filterScore === 'good') matchesScore = score >= 75 && score < 90;
    if (filterScore === 'fair') matchesScore = score >= 60 && score < 75;
    if (filterScore === 'critical') matchesScore = score < 60;

    return matchesSearch && matchesScore;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold">Audit History</h1>
          </div>
          <p className="text-gray-500">View and manage all your past hygiene inspections</p>
        </div>
        <Link href="/dashboard/audits/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Audit
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-[1fr,200px] gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by facility or location..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterScore} onValueChange={setFilterScore}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Score" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Scores</SelectItem>
            <SelectItem value="excellent">Excellent (90+)</SelectItem>
            <SelectItem value="good">Good (75-89)</SelectItem>
            <SelectItem value="fair">Fair (60-74)</SelectItem>
            <SelectItem value="critical">Critical (&lt;60)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filteredAudits.length === 0 ? (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No audits found</h3>
            <p className="text-gray-500 max-w-sm mt-1 mb-4">
              {searchQuery || filterScore !== 'all'
                ? "Try adjusting your filters to see more results."
                : "You haven't conducted any audits yet. Start your first inspection now!"}
            </p>
            {(searchQuery || filterScore !== 'all') ? (
              <Button variant="outline" onClick={() => { setSearchQuery(''); setFilterScore('all'); }}>
                Clear Filters
              </Button>
            ) : (
              <Link href="/dashboard/audits/new">
                <Button>Start New Audit</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAudits.map((audit) => (
            <Link key={audit.id} href={`/dashboard/audits/${audit.id}`} className="block">
              <Card className="hover:shadow-md transition-shadow group relative">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Image Thumbnail */}
                    <div className="w-full md:w-48 h-32 md:h-auto relative bg-gray-100 shrink-0">
                      {audit.imageUrl ? (
                        <img
                          src={audit.imageUrl}
                          alt={audit.location}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <MapPin className="h-8 w-8 opacity-20" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 md:hidden">
                        {getScoreBadge(audit.result?.overallScore || 0)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                              {audit.facilityName || 'Unnamed Facility'}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 gap-3 mt-1">
                              <span className="flex items-center">
                                <MapPin className="h-3.5 w-3.5 mr-1" />
                                {audit.location}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {format(new Date(audit.createdAt), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                          <div className="hidden md:block">
                            {getScoreBadge(audit.result?.overallScore || 0)}
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                          {audit.result?.assessment || 'No assessment summary available.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex gap-4 text-sm">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Score</span>
                            <span className={`font-bold ${getScoreColor(audit.result?.overallScore || 0)}`}>
                              {audit.result?.overallScore}/100
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Issues</span>
                            <span className="font-medium text-gray-900">
                              {audit.result?.issues?.length || 0}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 -mr-2"
                          onClick={(e) => deleteAudit(audit.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}