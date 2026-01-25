
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getFirebaseUID } from '@/lib/auth-server';

export async function GET(request) {
    try {
        const { db } = await connectToDatabase();
        const authHeader = request.headers.get('authorization');
        const uid = await getFirebaseUID(authHeader);

        const user = await db.collection('users').findOne(
            { uid: uid },
            { projection: { password: 0 } }
        );

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 401 }
        );
    }
}
