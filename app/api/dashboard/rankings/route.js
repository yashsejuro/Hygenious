
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
            .toArray();

        // Group audits by facility/location and calculate averages
        const facilityMap = new Map();

        audits.forEach(audit => {
            const key = audit.location || 'Unknown Location';
            if (!facilityMap.has(key)) {
                facilityMap.set(key, {
                    location: key,
                    facilityName: audit.facilityName || key,
                    scores: [],
                    audits: 0
                });
            }

            const facility = facilityMap.get(key);
            if (audit.result?.overallScore) {
                facility.scores.push(audit.result.overallScore);
            }
            facility.audits++;
        });

        // Calculate rankings for each category
        const createRankings = (category) => {
            const facilities = Array.from(facilityMap.values())
                .filter(f => f.scores.length > 0)
                .map(f => {
                    const avgScore = Math.round(
                        f.scores.reduce((sum, s) => sum + s, 0) / f.scores.length
                    );

                    // Calculate trend (comparing recent audits to older ones)
                    const recentScores = f.scores.slice(0, Math.ceil(f.scores.length / 2));
                    const olderScores = f.scores.slice(Math.ceil(f.scores.length / 2));
                    const recentAvg = recentScores.length > 0
                        ? recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length
                        : avgScore;
                    const olderAvg = olderScores.length > 0
                        ? olderScores.reduce((sum, s) => sum + s, 0) / olderScores.length
                        : avgScore;
                    const trend = Math.round(recentAvg - olderAvg);

                    return {
                        location: f.location,
                        facilityName: f.facilityName,
                        score: avgScore,
                        trend: trend,
                        audits: f.audits,
                        category: category
                    };
                })
                .sort((a, b) => b.score - a.score)
                .slice(0, 10); // Top 10

            return facilities;
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
