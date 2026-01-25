
import { getAuth } from 'firebase-admin/auth';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let firebaseAdminInitialized = false;

try {
    // Check if required environment variables are present
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        console.warn(
            '⚠️ Missing Firebase Admin SDK environment variables. ' +
            'Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY. ' +
            'Token verification will use basic decoding.'
        );
        // We don't throw here to allow partial functionality, but we mark as not initialized
    } else {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
        }
        firebaseAdminInitialized = true;
    }
} catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
    console.warn('Firebase Admin SDK not available. Token verification will use basic decoding.');
}

// Helper function to get Firebase UID from Authorization header
export async function getFirebaseUID(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Authorization header is required');
    }

    const token = authHeader.substring(7);
    if (!token) {
        throw new Error('Token is required');
    }

    if (firebaseAdminInitialized) {
        try {
            // Verify the Firebase ID token using Firebase Admin SDK
            const decodedToken = await getAuth().verifyIdToken(token);
            return decodedToken.uid;
        } catch (error) {
            console.error('Firebase token verification failed:', error);
            throw new Error('Invalid or expired token');
        }
    } else {
        // Fallback to basic JWT decoding if Firebase Admin SDK is not available
        // This is less secure but allows the app to function without Firebase Admin config
        try {
            // Firebase ID tokens are JWTs, decode the payload
            const parts = token.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                return payload.user_id || payload.sub || payload.uid;
            }
            // If it's not a JWT, assume it's the UID directly (for development)
            return token;
        } catch (error) {
            // If decoding fails, assume the token is the UID (for development)
            return token;
        }
    }
}
