
import { MongoClient } from 'mongodb';

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || 'smart_hygiene_audit';

/**
 * Global MongoDB caching to prevent connection exhaustion in development
 * due to Hot Module Replacement (HMR).
 * 
 * Production-ready connection pooling configuration:
 * - maxPoolSize: Maximum connections in pool (50 handles ~100 concurrent users)
 * - minPoolSize: Minimum connections to maintain (5 for faster initial requests)
 * - Connection timeouts and retries configured for reliability
 */
let cached = global.mongo;

if (!cached) {
    cached = global.mongo = { client: null, db: null, promise: null };
}

export async function connectToDatabase() {
    if (cached.client && cached.db) {
        return { client: cached.client, db: cached.db };
    }

    if (!MONGO_URL) {
        throw new Error('MONGO_URL is not defined');
    }

    // Prevent multiple simultaneous connection attempts
    if (!cached.promise) {
        cached.promise = (async () => {
            try {
                const client = new MongoClient(MONGO_URL, {
                    // Connection Pool Configuration
                    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '50'), // Max connections in pool
                    minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '5'), // Min connections to maintain
                    maxIdleTimeMS: 30000, // Close idle connections after 30s
                    
                    // Connection Timeouts
                    serverSelectionTimeoutMS: 10000, // Wait up to 10s for server selection
                    socketTimeoutMS: 45000, // Socket timeout after 45s
                    connectTimeoutMS: 10000, // Connection timeout after 10s
                    
                    // Retry Configuration
                    retryWrites: true, // Retry write operations on network errors
                    retryReads: true, // Retry read operations on network errors
                    
                    // Heartbeat Configuration
                    heartbeatFrequencyMS: 10000, // Check server health every 10s
                });

                await client.connect();
                console.log('✅ Connected to MongoDB with connection pooling enabled');

                const db = client.db(DB_NAME);
                cached.client = client;
                cached.db = db;

                // Initialize database indexes on first connection
                await initializeIndexes(db);

                return { client, db };
            } catch (error) {
                console.error('❌ MongoDB connection error:', error.message);
                cached.promise = null; // Reset promise on error to allow retry
                throw new Error(`Failed to connect to MongoDB: ${error.message}`);
            }
        })();
    }

    return cached.promise;
}

/**
 * Initialize database indexes for optimal query performance
 * Called once on first database connection
 */
async function initializeIndexes(db) {
    try {
        // Users collection indexes
        await db.collection('users').createIndex({ uid: 1 }, { unique: true, background: true });
        await db.collection('users').createIndex({ email: 1 }, { unique: true, background: true });
        await db.collection('users').createIndex({ organizationId: 1 }, { background: true });

        // Audits collection indexes (critical for dashboard performance)
        await db.collection('audits').createIndex({ userId: 1, createdAt: -1 }, { background: true });
        await db.collection('audits').createIndex({ organizationId: 1, createdAt: -1 }, { background: true });
        await db.collection('audits').createIndex({ location: 1 }, { background: true });
        await db.collection('audits').createIndex({ createdAt: -1 }, { background: true });
        await db.collection('audits').createIndex({ id: 1 }, { unique: true, background: true });

        // Feedback collection indexes
        await db.collection('feedback').createIndex({ scanId: 1 }, { background: true });
        await db.collection('feedback').createIndex({ userId: 1 }, { background: true });
        await db.collection('feedback').createIndex({ timestamp: -1 }, { background: true });

        console.log('✅ Database indexes initialized');
    } catch (error) {
        // Don't fail if indexes already exist
        if (!error.message.includes('already exists')) {
            console.warn('⚠️ Index initialization warning:', error.message);
        }
    }
}
