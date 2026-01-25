
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getFirebaseUID } from '@/lib/auth-server';

export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { db } = await connectToDatabase();
        let query = {};
        try {
            const uid = await getFirebaseUID(authHeader);
            const currentUser = await db.collection('users').findOne({ uid });

            if (currentUser && currentUser.organizationId) {
                query.organizationId = currentUser.organizationId;
            } else {
                query.userId = uid;
            }
        } catch (e) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        const audits = await db.collection('audits')
            .find(query)
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray();

        const totalAudits = audits.length;
        const avgScore = totalAudits > 0
            ? Math.round(audits.reduce((sum, a) => sum + (a.result?.overallScore || 0), 0) / totalAudits)
            : 0;

        const criticalIssues = audits.reduce((count, a) => {
            const critical = (a.result?.issues || []).filter(i => i.severity === 'Critical').length;
            return count + critical;
        }, 0);

        const locations = [...new Set(audits.map(a => a.location).filter(Boolean))];

        const recentAudits = audits.slice(0, 5).map(a => ({
            id: a.id,
            location: a.location,
            score: a.result?.overallScore || 0,
            date: a.createdAt,
            status: 'Completed'
        }));

        const scoreTrend = audits.slice(0, 7).reverse().map(a => ({
            date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: a.result?.overallScore || 0
        }));

        return NextResponse.json({
            success: true,
            data: {
                totalAudits,
                avgScore,
                criticalIssues,
                locationsCount: locations.length,
                recentAudits,
                scoreTrend
            }
        });

    } catch (error) {
        console.error('Stats Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
