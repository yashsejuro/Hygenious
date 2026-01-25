
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export async function POST(request) {
    try {
        const { db } = await connectToDatabase();
        const body = await request.json();
        const { uid, email, name, companyName, emailVerified } = body;

        // Input validation
        if (!uid || !email) {
            return NextResponse.json(
                { success: false, error: 'UID and email are required' },
                { status: 400 }
            );
        }

        if (!validateEmail(email)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        if (name && typeof name !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Name must be a string' },
                { status: 400 }
            );
        }

        if (companyName && typeof companyName !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Company name must be a string' },
                { status: 400 }
            );
        }

        if (emailVerified !== undefined && typeof emailVerified !== 'boolean') {
            return NextResponse.json(
                { success: false, error: 'Email verified must be a boolean' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await db.collection('users').findOne({ uid: uid });

        if (existingUser) {
            // Update existing user
            await db.collection('users').updateOne(
                { uid: uid },
                {
                    $set: {
                        email: email.toLowerCase(),
                        name: name || existingUser.name,
                        companyName: companyName || existingUser.companyName,
                        emailVerified: emailVerified !== undefined ? emailVerified : existingUser.emailVerified,
                        updatedAt: new Date().toISOString(),
                    }
                }
            );

            const updatedUser = await db.collection('users').findOne(
                { uid: uid },
                { projection: { password: 0 } }
            );

            return NextResponse.json({
                success: true,
                data: updatedUser,
                message: 'User updated'
            });
        } else {
            // Create new user
            const user = {
                uid: uid,
                id: uid, // Keep id for backward compatibility
                email: email.toLowerCase(),
                name: name || '',
                companyName: companyName || null,
                emailVerified: emailVerified || false,

                // SaaS Defaults
                role: 'admin', // Everyone is an admin of their own org by default
                plan: 'free',
                organizationId: uid, // Self-hosted organization

                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await db.collection('users').insertOne(user);

            // Create index on uid for faster lookups
            await db.collection('users').createIndex({ uid: 1 }, { unique: true });

            const { password: _, ...userWithoutPassword } = user;

            return NextResponse.json({
                success: true,
                data: userWithoutPassword,
                message: 'User created'
            });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
