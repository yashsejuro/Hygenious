'use client';

import { useRouter } from 'next/navigation';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert, User, CheckCircle2, Crown, Plus, Lock, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProtectedRoute from '@/components/ProtectedRoute';

export default function TeamPage() {
    const { user, getToken } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = await getToken();
            const response = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                if (response.status === 403) throw new Error('You do not have permission to view users.');
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (targetUserId, newRole) => {
        try {
            const token = await getToken();
            const response = await fetch('/api/users/role', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: targetUserId, role: newRole })
            });

            const data = await response.json();
            if (data.success) {
                toast({
                    title: 'Role Updated',
                    description: `User role updated to ${newRole}`,
                });
                // Update local state
                setUsers(users.map(u => u.uid === targetUserId ? { ...u, role: newRole } : u));
            } else {
                throw new Error(data.error || 'Failed to update role');
            }
        } catch (error) {
            toast({
                title: 'Failed to update role',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleAddMember = () => {
        // Gated Feature: Only Pro users can add members
        const currentPlan = user?.plan || 'free';

        if (currentPlan === 'free') {
            setShowUpgradeDialog(true);
            return;
        }

        // Logic to invite a user would go here (e.g., opening another dialog with email input)
        toast({
            title: "Feature Available",
            description: "You are on the Pro plan! (Invitation logic to be implemented)",
        });
    };

    const handleUpgrade = () => {
        // Redirect to payment or change plan logic
        toast({ title: "Redirecting to Payment..." });
        setShowUpgradeDialog(false);
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    const isFreePlan = (user?.plan || 'free') === 'free';

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="pl-0 hover:pl-2 transition-all"
                        onClick={() => router.push('/dashboard')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Team Management</h1>
                        <p className="text-muted-foreground">Manage authorized users and their roles.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isFreePlan ? 'bg-slate-100 border-slate-200' : 'bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-200'}`}>
                            {isFreePlan ? <User className="w-4 h-4 text-slate-500" /> : <Crown className="w-4 h-4 text-amber-600" />}
                            <span className={`text-sm font-medium ${isFreePlan ? 'text-slate-700' : 'text-amber-800'}`}>
                                {isFreePlan ? 'Free Plan' : 'Pro Plan'}
                            </span>
                        </div>

                        <Button onClick={handleAddMember}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Member
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Users</CardTitle>
                        <CardDescription>
                            Currently registered users in your organization.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {users.map((u) => (
                            <div key={u.uid} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarFallback className="bg-slate-200 text-slate-700">
                                            {u.name?.charAt(0) || <User className="w-4 h-4" />}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            {u.name || 'Unknown'}
                                            {u.uid === user?.uid && <span className="ml-2 text-xs text-slate-500">(You)</span>}
                                        </p>
                                        <p className="text-sm text-slate-500">{u.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Select
                                        defaultValue={u.role || 'staff'}
                                        onValueChange={(val) => handleRoleChange(u.uid, val)}
                                        disabled={u.uid === user?.uid} // Prevent changing own role for safety in this demo
                                    >
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="staff">Staff</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Crown className="w-5 h-5 text-amber-500" />
                                Upgrade to Pro
                            </DialogTitle>
                            <DialogDescription>
                                Adding team members is a premium feature. Upgrade your plan to collaborate with your team.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span>Up to 5 Team Members</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span>Advanced Role Management</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span>Priority Support</span>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>Cancel</Button>
                            <Button className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 border-0" onClick={handleUpgrade}>
                                Upgrade Now
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ProtectedRoute>
    );
}
