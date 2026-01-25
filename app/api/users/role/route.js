
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getFirebaseUID } from '@/lib/auth-server';

export async function PUT(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { db } = await connectToDatabase();

        // 1. Check Admin
        try {
            const uid = await getFirebaseUID(authHeader);
            const currentUser = await db.collection('users').findOne({ uid });
            if (!currentUser || currentUser.role !== 'admin') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        } catch (e) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        // 2. Update Target User
        const body = await request.json();
        const { userId, role } = body;

        if (!['admin', 'manager', 'staff'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        await db.collection('users').updateOne(
            { uid: userId },
            { $set: { role: role, updatedAt: new Date().toISOString() } }
        );

        return NextResponse.json({ success: true, message: 'Role updated' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
