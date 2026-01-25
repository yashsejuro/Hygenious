
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getFirebaseUID } from '@/lib/auth-server';
import { hasPermission } from '@/lib/rbac';

export async function GET(request, { params }) {
    try {
        const { id: auditId } = params;
        const authHeader = request.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { db } = await connectToDatabase();

        try {
            const uid = await getFirebaseUID(authHeader);
            const currentUser = await db.collection('users').findOne({ uid });

            let query = { id: auditId };

            if (currentUser && currentUser.organizationId) {
                query.organizationId = currentUser.organizationId;
            } else {
                query.userId = uid;
            }

            const audit = await db.collection('audits').findOne(query);

            if (!audit) {
                return NextResponse.json(
                    { success: false, error: 'Audit not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ success: true, data: audit });
        } catch (e) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id: auditId } = params;
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, error: 'Unauthorized: No Auth Header' }, { status: 401 });
        }

        const { db } = await connectToDatabase();

        let userRole = 'staff';
        try {
            const uid = await getFirebaseUID(authHeader);
            const user = await db.collection('users').findOne({ uid });
            if (user && user.role) userRole = user.role;
        } catch (authError) {
            return NextResponse.json({ success: false, error: 'Invalid Token' }, { status: 401 });
        }

        // Check Permission
        const canDelete = hasPermission(userRole, 'delete_audit');

        if (!canDelete) {
            return NextResponse.json(
                { success: false, error: `Forbidden: Role '${userRole}' cannot delete audits.` },
                { status: 403 }
            );
        }

        const result = await db.collection('audits').deleteOne({ id: auditId });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { success: false, error: 'Audit not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: 'Audit deleted' });
    } catch (error) {
        console.error('DELETE Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
