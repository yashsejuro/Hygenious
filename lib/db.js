
import { MongoClient } from 'mongodb';

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || 'smart_hygiene_audit';

/**
 * Global MongoDB caching to prevent connection exhaustion in development
 * due to Hot Module Replacement (HMR).
 */
let cached = global.mongo;

if (!cached) {
    cached = global.mongo = { client: null, db: null };
}

export async function connectToDatabase() {
    if (cached.client && cached.db) {
        return { client: cached.client, db: cached.db };
    }

    if (!MONGO_URL) {
        throw new Error('MONGO_URL is not defined');
    }

    try {
        const client = new MongoClient(MONGO_URL, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db(DB_NAME);
        cached.client = client;
        cached.db = db;

        return { client, db };
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        throw new Error(`Failed to connect to MongoDB: ${error.message}`);
    }
}
