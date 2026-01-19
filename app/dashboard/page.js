'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Plus,
  ArrowLeft,
  Trophy,
  Medal,
  Award,
  TrendingDown,
  ChefHat,
  Building2,
  Utensils,
  Bath,
  Store,
  Briefcase,
  Download,
  Search,
  Filter,
  X,
  Calendar,
  FileSpreadsheet,
  SlidersHorizontal,
  LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import AuditCard from '@/components/AuditCard';

function DashboardContent() {
  const [stats, setStats] = useState(null);
  const [rankings, setRankings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();
  const { user, logout, getToken } = useAuth();

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    location: 'all',
    scoreRange: 'all',
    dateRange: 'all',
    category: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredAudits, setFilteredAudits] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchRankings();
    fetchAllAudits();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, stats]);

  const fetchDashboardStats = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token expired or invalid, logout user
        toast({
          title: 'Session Expired',
          description: 'Please log in again',
          variant: 'destructive',
        });
        logout();
        return;
      }

      const data = await response.json();
      if (data && data.success && data.data) {
        setStats(data.data);
      } else {
        toast({
          title: 'Error',
          description: data?.error || 'Failed to fetch dashboard stats',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch dashboard stats',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRankings = async () => {
    try {
      const response = await fetch('/api/dashboard/rankings');
      const data = await response.json();
      if (data && data.success && data.data) {
        setRankings(data.data);
      }
    } catch (error) {
      console.error('Error fetching rankings:', error);
    }
  };

  const fetchAllAudits = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/audits', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token expired or invalid, logout user
        logout();
        return;
      }

      const data = await response.json();
      if (data && data.success && data.data) {
        setFilteredAudits(data.data);
      }
    } catch (error) {
      console.error('Error fetching audits:', error);
    }
  };

  // Delete Handler
  const handleDeleteAudit = async (auditId) => {
    if (!window.confirm('Are you sure you want to delete this audit?')) return;

    try {
      const token = await getToken();
      const response = await fetch(`/api/audits/${auditId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete');
      }

      toast({
        title: "Audit Deleted",
        description: "The audit has been removed from the list.",
      });

      // Optimistic update
      setFilteredAudits(prev => prev.filter(a => a.id !== auditId));
      // Optionally refresh stats
      fetchDashboardStats();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete audit.",
        variant: "destructive"
      });
    }
  };

  // Apply search and filters
  const applyFilters = () => {
    if (!stats?.recentAudits) {
      setFilteredAudits([]);
      return;
    }

    let filtered = [...stats.recentAudits];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(audit =>
        audit?.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter(audit =>
        audit?.location?.toLowerCase() === filters.location.toLowerCase()
      );
    }

    // Score range filter
    if (filters.scoreRange !== 'all') {
      filtered = filtered.filter(audit => {
        const score = audit?.score || 0;
        switch (filters.scoreRange) {
          case 'excellent': return score >= 85;
          case 'good': return score >= 70 && score < 85;
          case 'fair': return score >= 60 && score < 70;
          case 'poor': return score < 60;
          default: return true;
        }
      });
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(audit => {
        const auditDate = new Date(audit?.date || Date.now());
        const diffDays = Math.floor((now - auditDate) / (1000 * 60 * 60 * 24));

        switch (filters.dateRange) {
          case 'today': return diffDays === 0;
          case 'week': return diffDays <= 7;
          case 'month': return diffDays <= 30;
          case 'quarter': return diffDays <= 90;
          default: return true;
        }
      });
    }

    setFilteredAudits(filtered);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      location: 'all',
      scoreRange: 'all',
      dateRange: 'all',
      category: 'all'
    });
    toast({
      title: 'Filters cleared',
      description: 'All filters have been reset'
    });
  };

  // Export to CSV function
  const exportToCSV = async () => {
    try {
      // Fetch all audits for export
      const token = await getToken();
      const response = await fetch('/api/audits', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token expired or invalid, logout user
        toast({
          title: 'Session Expired',
          description: 'Please log in again',
          variant: 'destructive',
        });
        logout();
        return;
      }

      const data = await response.json();

      if (!data || !data.success || !data.data || data.data.length === 0) {
        toast({
          title: 'No data to export',
          description: data?.error || 'There are no audits to export',
          variant: 'destructive'
        });
        return;
      }

      const audits = data.data;

      // Prepare CSV headers
      const headers = [
        'Audit ID',
        'Location',
        'Facility Name',
        'Overall Score',
        'Cleanliness',
        'Organization',
        'Safety',
        'Status',
        'Critical Issues',
        'Total Issues',
        'Date',
        'Area Notes'
      ];

      // Prepare CSV rows
      const rows = audits.map(audit => [
        audit.id || 'N/A',
        audit.location || 'N/A',
        audit.facilityName || 'N/A',
        audit.result?.overallScore || 0,
        audit.result?.cleanliness || 0,
        audit.result?.organization || 0,
        audit.result?.safety || 0,
        audit.status || 'Completed',
        audit.result?.issues?.filter(i => i.severity === 'Critical').length || 0,
        audit.result?.issues?.length || 0,
        new Date(audit.createdAt).toLocaleString(),
        audit.areaNotes || 'N/A'
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row =>
          row.map(cell => {
            // Escape commas and quotes in cell content
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          }).join(',')
        )
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `hygiene-audits-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export successful!',
        description: `Exported ${audits.length} audits to CSV`
      });

    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Get unique locations for filter dropdown
  const getUniqueLocations = () => {
    if (!stats?.recentAudits) return [];
    const locations = stats.recentAudits
      .map(audit => audit?.location)
      .filter(location => Boolean(location));
    return [...new Set(locations)];
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 85) return 'bg-green-50';
    if (score >= 60) return 'bg-amber-50';
    return 'bg-red-50';
  };

  const getScoreBorderColor = (score) => {
    if (score >= 85) return 'border-green-200';
    if (score >= 60) return 'border-amber-200';
    return 'border-red-200';
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-gray-500 font-semibold">#{rank}</span>;
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      restaurant: <Utensils className="h-4 w-4" />,
      kitchen: <ChefHat className="h-4 w-4" />,
      hospital: <Building2 className="h-4 w-4" />,
      restroom: <Bath className="h-4 w-4" />,
      store: <Store className="h-4 w-4" />,
      office: <Briefcase className="h-4 w-4" />,
    };
    return icons[category] || <MapPin className="h-4 w-4" />;
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  // Mock ranking data structure (replace with actual API data)
  const mockRankings = {
    all: [
      { id: 1, name: 'Grand Plaza Hotel Restaurant', category: 'restaurant', score: 96, avgScore: 96, trend: 3, audits: 45, location: 'Mumbai, MH', lastAudit: '2025-11-08' },
      { id: 2, name: 'City General Hospital', category: 'hospital', score: 94, avgScore: 94, trend: 2, audits: 78, location: 'Bangalore, KA', lastAudit: '2025-11-07' },
      { id: 3, name: 'Tech Park Food Court', category: 'restaurant', score: 92, avgScore: 92, trend: -1, audits: 34, location: 'Pune, MH', lastAudit: '2025-11-08' },
      { id: 4, name: 'Central Mall Restrooms', category: 'restroom', score: 90, avgScore: 90, trend: 5, audits: 120, location: 'Delhi, DL', lastAudit: '2025-11-08' },
      { id: 5, name: 'StarTech Office Kitchen', category: 'kitchen', score: 89, avgScore: 89, trend: 0, audits: 56, location: 'Hyderabad, TG', lastAudit: '2025-11-06' },
    ],
    restaurant: [
      { id: 1, name: 'Grand Plaza Hotel Restaurant', category: 'restaurant', score: 96, avgScore: 96, trend: 3, audits: 45, location: 'Mumbai, MH', lastAudit: '2025-11-08' },
      { id: 3, name: 'Tech Park Food Court', category: 'restaurant', score: 92, avgScore: 92, trend: -1, audits: 34, location: 'Pune, MH', lastAudit: '2025-11-08' },
      { id: 6, name: 'Spice Garden Restaurant', category: 'restaurant', score: 88, avgScore: 88, trend: 2, audits: 67, location: 'Chennai, TN', lastAudit: '2025-11-07' },
    ],
    kitchen: [
      { id: 5, name: 'StarTech Office Kitchen', category: 'kitchen', score: 89, avgScore: 89, trend: 0, audits: 56, location: 'Hyderabad, TG', lastAudit: '2025-11-06' },
      { id: 7, name: 'Campus Cafeteria Kitchen', category: 'kitchen', score: 87, avgScore: 87, trend: 4, audits: 23, location: 'Bangalore, KA', lastAudit: '2025-11-08' },
      { id: 8, name: 'Hotel Royal Kitchen', category: 'kitchen', score: 85, avgScore: 85, trend: -2, audits: 89, location: 'Mumbai, MH', lastAudit: '2025-11-05' },
    ],
    hospital: [
      { id: 2, name: 'City General Hospital', category: 'hospital', score: 94, avgScore: 94, trend: 2, audits: 78, location: 'Bangalore, KA', lastAudit: '2025-11-07' },
      { id: 9, name: 'Apollo Medical Center', category: 'hospital', score: 91, avgScore: 91, trend: 1, audits: 102, location: 'Chennai, TN', lastAudit: '2025-11-08' },
      { id: 10, name: 'Sunrise Clinic', category: 'hospital', score: 86, avgScore: 86, trend: 0, audits: 45, location: 'Pune, MH', lastAudit: '2025-11-06' },
    ],
    restroom: [
      { id: 4, name: 'Central Mall Restrooms', category: 'restroom', score: 90, avgScore: 90, trend: 5, audits: 120, location: 'Delhi, DL', lastAudit: '2025-11-08' },
      { id: 11, name: 'Airport Terminal 2 Restrooms', category: 'restroom', score: 88, avgScore: 88, trend: 3, audits: 156, location: 'Mumbai, MH', lastAudit: '2025-11-08' },
      { id: 12, name: 'Metro Station Facilities', category: 'restroom', score: 82, avgScore: 82, trend: -3, audits: 89, location: 'Delhi, DL', lastAudit: '2025-11-07' },
    ],
    office: [
      { id: 13, name: 'TechCorp Headquarters', category: 'office', score: 93, avgScore: 93, trend: 2, audits: 67, location: 'Bangalore, KA', lastAudit: '2025-11-08' },
      { id: 14, name: 'Global Solutions Office', category: 'office', score: 89, avgScore: 89, trend: 1, audits: 45, location: 'Gurgaon, HR', lastAudit: '2025-11-07' },
      { id: 15, name: 'Startup Hub Coworking', category: 'office', score: 84, avgScore: 84, trend: -1, audits: 34, location: 'Pune, MH', lastAudit: '2025-11-06' },
    ],
  };

  const categories = [
    { id: 'all', name: 'All Facilities', icon: <Award className="h-4 w-4" /> },
    { id: 'restaurant', name: 'Restaurants', icon: <Utensils className="h-4 w-4" /> },
    { id: 'kitchen', name: 'Kitchens', icon: <ChefHat className="h-4 w-4" /> },
    { id: 'hospital', name: 'Hospitals', icon: <Building2 className="h-4 w-4" /> },
    { id: 'restroom', name: 'Restrooms', icon: <Bath className="h-4 w-4" /> },
    { id: 'office', name: 'Offices', icon: <Briefcase className="h-4 w-4" /> },
  ];

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(val => val !== 'all').length + (searchQuery ? 1 : 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2">
              {user && (
                <div className="flex items-center space-x-3 mr-2">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{user.name}</p>
                    <div className="flex items-center justify-end gap-1">
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                        {user.role || 'GUEST'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                onClick={exportToCSV}
                className="hidden sm:flex"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Link href="/dashboard">
                <Button variant="outline">History</Button>
              </Link>
              {user?.role === 'admin' && (
                <Link href="/dashboard/team">
                  <Button variant="outline">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Team
                  </Button>
                </Link>
              )}
              <Link href="/dashboard/audits/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Audit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalAudits || 0}</div>
              <p className="text-xs text-muted-foreground">All time audits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(stats?.avgScore || 0)}`}>
                {stats?.avgScore || 0}/100
              </div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.criticalIssues || 0}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Locations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.locationsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Active locations</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Trend Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Score Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.scoreTrend && stats.scoreTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.scoreTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p>No data available yet. Start your first audit!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/audits/new" className="block">
                <Button className="w-full" size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  New Audit
                </Button>
              </Link>
              <Button
                className="w-full"
                variant="outline"
                onClick={exportToCSV}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
              <Link href="/dashboard" className="block">
                <Button className="w-full" variant="outline">
                  View All Audits
                </Button>
              </Link>
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-sm mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Upload a photo of any kitchen, restroom, or facility space to get started.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Audit History</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={activeFilterCount > 0 ? "default" : "outline"}>
                  {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by location name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Location Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="location-filter">Location</Label>
                    <Select
                      value={filters.location}
                      onValueChange={(value) => setFilters({ ...filters, location: value })}
                    >
                      <SelectTrigger id="location-filter">
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {getUniqueLocations().map((loc, index) => (
                          <SelectItem key={index} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Score Range Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="score-filter">Score Range</Label>
                    <Select
                      value={filters.scoreRange}
                      onValueChange={(value) => setFilters({ ...filters, scoreRange: value })}
                    >
                      <SelectTrigger id="score-filter">
                        <SelectValue placeholder="All Scores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Scores</SelectItem>
                        <SelectItem value="excellent">Excellent (85-100)</SelectItem>
                        <SelectItem value="good">Good (70-84)</SelectItem>
                        <SelectItem value="fair">Fair (60-69)</SelectItem>
                        <SelectItem value="poor">Poor (&lt;60)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="date-filter">Date Range</Label>
                    <Select
                      value={filters.dateRange}
                      onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
                    >
                      <SelectTrigger id="date-filter">
                        <SelectValue placeholder="All Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">Last 7 Days</SelectItem>
                        <SelectItem value="month">Last 30 Days</SelectItem>
                        <SelectItem value="quarter">Last 90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear Filters Button */}
                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={clearFilters}
                      disabled={activeFilterCount === 0}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </div>

                {/* Active Filters Display */}
                {activeFilterCount > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <span className="text-sm text-gray-600 font-medium">Active filters:</span>
                    {searchQuery && (
                      <Badge variant="secondary">
                        Search: "{searchQuery}"
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => setSearchQuery('')}
                        />
                      </Badge>
                    )}
                    {filters.location !== 'all' && (
                      <Badge variant="secondary">
                        Location: {filters.location}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => setFilters({ ...filters, location: 'all' })}
                        />
                      </Badge>
                    )}
                    {filters.scoreRange !== 'all' && (
                      <Badge variant="secondary">
                        Score: {filters.scoreRange}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => setFilters({ ...filters, scoreRange: 'all' })}
                        />
                      </Badge>
                    )}
                    {filters.dateRange !== 'all' && (
                      <Badge variant="secondary">
                        Date: {filters.dateRange}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => setFilters({ ...filters, dateRange: 'all' })}
                        />
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredAudits.length} of {stats?.recentAudits?.length || 0} audits
              </p>
              {filteredAudits.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportToCSV}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export filtered results
                </Button>
              )}
            </div>

            {/* Audit List */}
            {filteredAudits.length > 0 ? (
              <div className="space-y-4">
                {filteredAudits.map((audit) => (
                  <AuditCard
                    key={audit.id}
                    audit={audit}
                    currentUser={user}
                    onDelete={handleDeleteAudit}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No audits found</h3>
                <p className="text-gray-600 mb-4">
                  {activeFilterCount > 0
                    ? 'Try adjusting your filters or search query'
                    : 'Get started by creating your first audit'}
                </p>
                {activeFilterCount > 0 ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                ) : (
                  <Link href="/dashboard/audits/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Audit
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rankings / Leaderboard Section */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <div>
                  <CardTitle>Hygiene Excellence Leaderboard</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Top-performing facilities ranked by hygiene scores
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                Updated Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Category Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-6">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex items-center space-x-1"
                  >
                    {category.icon}
                    <span className="hidden sm:inline">{category.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="space-y-4">
                  {/* Leaderboard Header */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-600">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-4">Facility Name</div>
                    <div className="col-span-2">Location</div>
                    <div className="col-span-2">Score</div>
                    <div className="col-span-1">Trend</div>
                    <div className="col-span-2">Audits</div>
                  </div>

                  {/* Leaderboard Items */}
                  <div className="space-y-3">
                    {mockRankings[category.id]?.map((facility, index) => (
                      <div
                        key={facility.id}
                        className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-2 rounded-lg hover:shadow-md transition-all ${index === 0 ? 'bg-gradient-to-r from-yellow-50 to-white border-yellow-300' :
                          index === 1 ? 'bg-gradient-to-r from-gray-50 to-white border-gray-300' :
                            index === 2 ? 'bg-gradient-to-r from-orange-50 to-white border-orange-300' :
                              'bg-white hover:border-blue-200'
                          }`}
                      >
                        {/* Rank */}
                        <div className="col-span-1 flex items-center justify-center md:justify-start">
                          <div className="flex items-center space-x-2">
                            {getRankBadge(index + 1)}
                            {index < 3 && (
                              <span className="hidden md:inline text-xs font-semibold">
                                {index === 0 ? 'Gold' : index === 1 ? 'Silver' : 'Bronze'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Facility Name */}
                        <div className="col-span-1 md:col-span-4">
                          <div className="flex items-start space-x-2">
                            <div className="mt-1">
                              {getCategoryIcon(facility.category)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{facility.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Last audit: {new Date(facility.lastAudit).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="col-span-1 md:col-span-2 flex items-center">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span>{facility.location}</span>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="col-span-1 md:col-span-2 flex items-center">
                          <div className={`px-4 py-2 rounded-full ${getScoreBgColor(facility.score)} border-2 ${getScoreBorderColor(facility.score)}`}>
                            <div className="text-center">
                              <p className={`text-2xl font-bold ${getScoreColor(facility.score)}`}>
                                {facility.score}
                              </p>
                              <p className="text-xs text-gray-600">/100</p>
                            </div>
                          </div>
                        </div>

                        {/* Trend */}
                        <div className="col-span-1 md:col-span-1 flex items-center justify-center">
                          <div className="flex items-center space-x-1">
                            {getTrendIcon(facility.trend)}
                            <span className={`text-sm font-semibold ${facility.trend > 0 ? 'text-green-600' :
                              facility.trend < 0 ? 'text-red-600' :
                                'text-gray-600'
                              }`}>
                              {facility.trend > 0 ? '+' : ''}{facility.trend}
                            </span>
                          </div>
                        </div>

                        {/* Audits Count */}
                        <div className="col-span-1 md:col-span-2 flex items-center justify-end">
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-900">{facility.audits}</p>
                            <p className="text-xs text-gray-500">audits</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* View More Button */}
                  <div className="pt-4 text-center">
                    <Button variant="outline" size="lg">
                      View Full Leaderboard
                      <TrendingUp className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Info Footer */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Award className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">About Rankings</h4>
                  <p className="text-sm text-blue-800">
                    Rankings are based on average hygiene scores from verified audits.
                    Facilities with higher scores and consistent performance rank higher.
                    Trends show score changes over the last 30 days.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}