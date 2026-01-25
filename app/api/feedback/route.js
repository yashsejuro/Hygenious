
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getFirebaseUID } from '@/lib/auth-server';

export async function POST(request) {
    try {
        const { db } = await connectToDatabase();
        const body = await request.json();
        const { scanId, accuracy, feedback, userId } = body;

        // Validation
        if (!scanId || accuracy === undefined) {
            return NextResponse.json(
                { success: false, error: 'Scan ID and accuracy are required' },
                { status: 400 }
            );
        }

        // Resolve User ID and Name
        let finalUserId = userId || 'anonymous';
        let finalUserName = 'Anonymous';

        try {
            // 1. Try to get UID from token
            const authHeader = request.headers.get('authorization');
            if (authHeader) {
                const tokenUid = await getFirebaseUID(authHeader);
                if (tokenUid) {
                    finalUserId = tokenUid;
                }
            }

            // 2. Look up user details in DB
            if (finalUserId !== 'anonymous') {
                const user = await db.collection('users').findOne({ uid: finalUserId });
                if (user && user.name) {
                    finalUserName = user.name;
                }
            }
        } catch (authError) {
            console.warn('Feedback auth resolution failed:', authError.message);
        }

        // Save to database
        const feedbackDoc = {
            scanId,
            accuracy: Number(accuracy),
            comments: feedback || '',
            userId: finalUserId,
            userName: finalUserName,
            timestamp: new Date().toISOString(),
            used_for_training: false
        };

        await db.collection('feedback').insertOne(feedbackDoc);

        // Log low accuracy for review
        if (accuracy < 50) {
            console.warn(`⚠️ Low accuracy feedback (${accuracy}%) received for scan: ${scanId}`);
        }

        return NextResponse.json({
            success: true,
            message: 'Feedback recorded',
            feedbackId: feedbackDoc._id
        });
    } catch (error) {
        console.error('Feedback Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
