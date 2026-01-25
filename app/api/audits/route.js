
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

        return NextResponse.json({
            success: true,
            data: audits,
            count: audits.length
        });
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
