const { MongoClient } = require('mongodb');

// This script promotes a user to ADMIN role by email.
// Usage: node scripts/promote-admin.js <user-email>

// Load environment variables (simple regex parser since we don't have dotenv installed globally usually)
// Assuming .env is in current directory
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
let env = {};
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            env[key.trim()] = value.trim();
        }
    });
}

const MONGO_URL = env.MONGO_URL;
const DB_NAME = env.DB_NAME || 'smart_hygiene_audit';

if (!MONGO_URL) {
    console.error("Error: MONGO_URL not found in .env file.");
    process.exit(1);
}

const email = process.argv[2];

if (!email) {
    console.error("Usage: node scripts/promote-admin.js <user-email>");
    process.exit(1);
}

async function promoteUser() {
    const client = new MongoClient(MONGO_URL);

    try {
        await client.connect();
        console.log("Connected to database...");

        const db = client.db(DB_NAME);
        const usersCollection = db.collection('users');

        const result = await usersCollection.updateOne(
            { email: email.toLowerCase() },
            { $set: { role: 'admin', updatedAt: new Date().toISOString() } }
        );

        if (result.matchedCount === 0) {
            console.log(`User with email '${email}' not found.`);
        } else if (result.modifiedCount === 0) {
            console.log(`User '${email}' is already an admin.`);
        } else {
            console.log(`Successfully promoted '${email}' to ADMIN.`);
        }

    } catch (error) {
        console.error("Error updating user:", error);
    } finally {
        await client.close();
    }
}

promoteUser();
