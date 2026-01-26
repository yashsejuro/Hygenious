
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

        // Use MongoDB aggregation pipeline for efficient server-side processing
        // This is much more efficient than loading all audits into memory
        const rankingsPipeline = [
            { $match: query }, // Filter by user/organization
            {
                $group: {
                    _id: '$location',
                    facilityName: { $first: '$facilityName' },
                    scores: {
                        $push: {
                            $ifNull: ['$result.overallScore', 0]
                        }
                    },
                    createdAt: { $push: '$createdAt' },
                    auditCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    location: { $ifNull: ['$_id', 'Unknown Location'] },
                    facilityName: { $ifNull: ['$facilityName', '$_id'] },
                    avgScore: { $avg: '$scores' },
                    auditCount: 1,
                    scores: 1,
                    createdAt: 1
                }
            },
            { $sort: { avgScore: -1 } },
            { $limit: 10 } // Top 10 facilities
        ];

        const facilityRankings = await db.collection('audits')
            .aggregate(rankingsPipeline)
            .toArray();

        // Calculate rankings for each category
        // Note: Category filtering would require additional aggregation stages
        // For now, we return the same rankings for all categories
        // You can enhance this later to filter by location type if you add that field
        const createRankings = (category) => {
            return facilityRankings.map(f => {
                const avgScore = Math.round(f.avgScore || 0);
                
                // Calculate trend (comparing recent audits to older ones)
                // Sort scores by creation date for trend calculation
                const sortedScores = f.scores
                    .map((score, idx) => ({ score, date: f.createdAt[idx] }))
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map(item => item.score);
                
                const midPoint = Math.ceil(sortedScores.length / 2);
                const recentScores = sortedScores.slice(0, midPoint);
                const olderScores = sortedScores.slice(midPoint);
                
                const recentAvg = recentScores.length > 0
                    ? recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length
                    : avgScore;
                const olderAvg = olderScores.length > 0
                    ? olderScores.reduce((sum, s) => sum + s, 0) / olderScores.length
                    : avgScore;
                const trend = Math.round(recentAvg - olderAvg);

                return {
                    location: f.location,
                    facilityName: f.facilityName || f.location,
                    score: avgScore,
                    trend: trend,
                    audits: f.auditCount,
                    category: category
                };
            });
        };

        // Create rankings for different categories
        const categories = {
            all: createRankings('All Facilities'),
            kitchen: createRankings('Kitchen'),
            washroom: createRankings('Washroom'),
            storage: createRankings('Storage'),
            dining: createRankings('Dining Area'),
            office: createRankings('Office')
        };

        return NextResponse.json({
            success: true,
            data: categories
        });

    } catch (error) {
        console.error('Rankings Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
