
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getFirebaseUID } from '@/lib/auth-server';

export async function GET(request) {
    try {
        // 1. Authenticate
        const authHeader = request.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { db } = await connectToDatabase();

        // 2. Check Admin Role
        let currentUser;
        let uid;
        try {
            uid = await getFirebaseUID(authHeader);
            currentUser = await db.collection('users').findOne({ uid });

            if (!currentUser || currentUser.role !== 'admin') {
                return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
            }
        } catch (e) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        // 3. Fetch Users (Scoped to Organization)
        const query = {};
        if (currentUser.organizationId) {
            query.organizationId = currentUser.organizationId;
        } else {
            // Fallback for legacy admin
            query.uid = uid;
        }

        const users = await db.collection('users').find(query, { projection: { password: 0 } }).toArray();
        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        console.error('GET Users Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
