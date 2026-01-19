import React from 'react';
import Link from 'next/link';
import { hasPermission } from '@/lib/rbac';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Eye } from 'lucide-react';

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

export default function AuditCard({ audit, currentUser, onDelete }) {
    const canDelete = hasPermission(currentUser?.role, 'delete_audit');

    return (
        <Card className="hover:shadow-md transition-all duration-200 border-slate-200 mb-3">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-800">{audit.location || 'Unknown Location'}</h3>
                    <p className="text-sm text-slate-500">
                        {(audit.date || audit.createdAt) ? new Date(audit.date || audit.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : 'No Date'}
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Score */}
                    {audit.score !== undefined && (
                        <div className={`px-4 py-2 rounded-full ${getScoreBgColor(audit.score)}`}>
                            <span className={`font-bold ${getScoreColor(audit.score)} text-sm`}>
                                {audit.score}/100
                            </span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Link href={`/dashboard/audits/${audit.id}`}>
                            <Button variant="ghost" size="sm" className="gap-2 h-9">
                                <Eye className="w-4 h-4" />
                                <span className="hidden sm:inline">View</span>
                            </Button>
                        </Link>

                        {canDelete && (
                            <Button
                                variant="destructive"
                                size="sm"
                                className="gap-2 h-9"
                                onClick={() => onDelete?.(audit.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Delete</span>
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
