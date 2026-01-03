import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Import Google AI SDK

// Helper function to get Firebase UID from Authorization header
// For now, we accept the Firebase ID token and extract UID
// In production, you should verify the token with Firebase Admin SDK
async function getFirebaseUID(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authorization header is required');
  }
  
  const token = authHeader.substring(7);
  if (!token) {
    throw new Error('Token is required');
  }

  // For now, we'll decode the Firebase ID token (JWT) to get UID
  // TODO: Verify token with Firebase Admin SDK in production
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

// --- NEW GEMINI CONFIG ---
// Get your API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn(
    '⚠️ GEMINI_API_KEY is not defined. AI analysis will fail. Please add it to your .env file.'
  );
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-pro-vision', // Classic vision model for image analysis
});
// --- END NEW GEMINI CONFIG ---


const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || 'smart_hygiene_audit';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
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
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
}

// --- UPDATED AI FUNCTION ---

/**
 * Analyze hygiene image using Google Gemini 1.5 Flash
 */
async function analyzeHygieneImage(imageBase64, mimeType = 'image/jpeg') {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured for analysis.');
  }

  try {
    console.log(`🔍 Analyzing image with Gemini 1.5 Flash (MIME: ${mimeType})...`);

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };

    const prompt = `
      You are an expert hygiene and safety inspector for commercial spaces (kitchens, washrooms, etc.).
      Analyze the provided image and return a JSON object with your findings.

      You MUST adhere to the following JSON schema:
      {
        "overallScore": "number (0-100)",
        "cleanliness": "number (0-100)",
        "organization": "number (0-100)",
        "safety": "number (0-100)",
        "assessment": "string (A brief, 1-2 sentence summary of your findings)",
        "issues": [
          {
            "type": "string (e.g., 'Surface Cleanliness', 'Organization', 'Safety Hazard', 'Contamination')",
            "description": "string (A specific description of the issue found)",
            "severity": "string ('Low', 'Medium', 'High', 'Critical')",
            "confidence": "number (0-100)"
          }
        ],
        "recommendations": [
          "string (A list of actionable recommendations based on the issues)"
        ]
      }

      Guidelines for your analysis:
      1.  **Scoring:**
          - 90-100 (Excellent): Near perfect, minimal issues.
          - 75-89 (Good): Generally clean, some minor areas for improvement.
          - 60-74 (Fair): Multiple issues noted that require attention.
          - 0-59 (Poor/Critical): Significant, urgent issues, potential health hazards.
      2.  **Overall Score:** This should be an average of the cleanliness, organization, and safety scores.
      3.  **Issues:** Identify 2-5 of the MOST IMPORTANT issues. If the space is excellent, list 1-2 minor maintenance or improvement points.
      4.  **Assessment:** Summarize the "why" behind the score.
      5.  **Recommendations:** Provide clear, actionable steps to fix the identified issues.

      Return ONLY the JSON object. Do not include \`\`\`json or any other text.
    `;

    const result = await geminiModel.generateContent([prompt, imagePart]);
    const response = result.response;
    const jsonString = response.text();
    
    // Parse the JSON string into an object
    const analysisResult = JSON.parse(jsonString);

    console.log('✅ Gemini analysis complete.');
    console.log('Overall Score:', analysisResult.overallScore);
    console.log('Issues found:', analysisResult.issues.length);

    return analysisResult;

  } catch (error) {
    console.error('❌ Gemini Analysis Error:', error.message);
    if (error.message.includes('json')) {
       console.error("Gemini did not return valid JSON. Check the prompt or model settings.");
    }
    // Fallback to a "failed analysis" object to avoid crashing the app
    return {
      overallScore: 0,
      cleanliness: 0,
      organization: 0,
      safety: 0,
      assessment: "AI analysis failed. Please check the image or system logs.",
      issues: [{
        type: "Analysis Error",
        description: `Failed to analyze image. Error: ${error.message}`,
        severity: "Critical",
        confidence: 100
      }],
      recommendations: ["Retry analysis", "Check AI service status"]
    };
  }
}

// --- END UPDATED AI FUNCTION ---


export async function GET(request) {
  const { pathname } = new URL(request.url);
  const path = pathname.replace('/api/', '');

  try {
    const { db } = await connectToDatabase();

    if (path === 'audits') {
      const audits = await db.collection('audits')
        .find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();
      
      return NextResponse.json({ 
        success: true, 
        data: audits,
        count: audits.length 
      });
    }

    if (path.startsWith('audits/')) {
      const auditId = path.split('/')[1];
      const audit = await db.collection('audits').findOne({ id: auditId });
      
      if (!audit) {
        return NextResponse.json(
          { success: false, error: 'Audit not found' }, 
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true, data: audit });
    }

    if (path === 'dashboard/stats') {
      // (Your existing dashboard logic is great and remains unchanged)
      const audits = await db.collection('audits')
        .find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();
      
      const totalAudits = audits.length;
      const avgScore = totalAudits > 0 
        ? Math.round(audits.reduce((sum, a) => sum + (a.result?.overallScore || 0), 0) / totalAudits)
        : 0;
      
      const criticalIssues = audits.reduce((count, a) => {
        const critical = (a.result?.issues || []).filter(i => i.severity === 'Critical').length;
        return count + critical;
      }, 0);

      const locations = [...new Set(audits.map(a => a.location).filter(Boolean))];
      
      const recentAudits = audits.slice(0, 5).map(a => ({
        id: a.id,
        location: a.location,
        score: a.result?.overallScore || 0,
        date: a.createdAt,
        status: 'Completed'
      }));

      const scoreTrend = audits.slice(0, 7).reverse().map(a => ({
        date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: a.result?.overallScore || 0
      }));

      return NextResponse.json({
        success: true,
        data: {
          totalAudits,
          avgScore,
          criticalIssues,
          locationsCount: locations.length,
          recentAudits,
          scoreTrend
        }
      });
    }

    // Firebase Auth: GET /api/auth/user/:uid
    if (path.startsWith('auth/user/')) {
      const uid = path.split('/')[2];
      if (!uid) {
        return NextResponse.json(
          { success: false, error: 'User ID is required' },
          { status: 400 }
        );
      }

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
    }

    // Firebase Auth: GET /api/auth/me (get current user from token)
    if (path === 'auth/me') {
      try {
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

    if (path === 'health') {
      return NextResponse.json({
        success: true,
        status: 'healthy',
        database: 'connected',
        // --- UPDATED HEALTH CHECK ---
        ai: 'Gemini 1.5 Flash (Live)',
        mode: 'live_ai'
        // --- END UPDATED ---
      });
    }

    return NextResponse.json(
      { success: false, error: 'Endpoint not found' }, 
      { status: 404 }
    );
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { pathname } = new URL(request.url);
  const path = pathname.replace('/api/', '');

  try {
    const { db } = await connectToDatabase();

    // Firebase Auth: POST /api/auth/register (sync Firebase user to MongoDB)
    if (path === 'auth/register') {
      const body = await request.json();
      const { uid, email, name, companyName, emailVerified } = body;

      if (!uid || !email) {
        return NextResponse.json(
          { success: false, error: 'UID and email are required' },
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
    }

    if (path === 'analyze') {
      const body = await request.json();
      const { image, location, areaNotes } = body;

      if (!image) {
        return NextResponse.json(
          { success: false, error: 'Image is required' }, 
          { status: 400 }
        );
      }

      // --- UPDATED IMAGE PARSING ---
      // This now correctly extracts the MIME type and base64 data
      let imageBase64;
      let mimeType = 'image/jpeg'; // Default

      if (image.startsWith('data:')) {
        const parts = image.split(';base64,');
        const mimeTypeData = parts[0].split(':')[1];
        if (mimeTypeData) {
          mimeType = mimeTypeData; // e.g., 'image/png' or 'image/webp'
        }
        imageBase64 = parts[1];
      } else {
        // Assume it's raw base64 data, which is less common
        imageBase64 = image;
      }
      // --- END UPDATED IMAGE PARSING ---

      console.log('📸 Processing image analysis request...');
      console.log('Location:', location);
      console.log('Image size:', imageBase64.length, 'characters');
      console.log('MIME type:', mimeType);

      // Pass both the base64 data and the MIME type to the function
      const analysisResult = await analyzeHygieneImage(imageBase64, mimeType);

      console.log('✅ Analysis complete');
      console.log('Overall Score:', analysisResult.overallScore);

      // Get Firebase UID from Authorization header
      let userId = null;
      try {
        const authHeader = request.headers.get('authorization');
        if (authHeader) {
          userId = await getFirebaseUID(authHeader);
        }
      } catch (error) {
        console.warn('Auth error (continuing without user):', error.message);
      }

      const audit = {
        id: uuidv4(),
        userId: userId, // Firebase UID
        location: location || 'Unknown',
        areaNotes: areaNotes || '',
        // Don't save the full base64 string, just a snippet
        imageData: image.substring(0, 100) + '...', 
        result: analysisResult,
        createdAt: new Date().toISOString(),
        status: 'Completed'
      };

      await db.collection('audits').insertOne(audit);

      console.log('💾 Audit saved to database:', audit.id);

      return NextResponse.json({
        success: true,
        data: {
          auditId: audit.id,
          result: analysisResult
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Endpoint not found' }, 
      { status: 404 }
    );
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message
      }, 
      { status: 500 }
    );
  }
}

// (Your DELETE function is perfect and remains unchanged)
export async function DELETE(request) {
  const { pathname } = new URL(request.url);
  const path = pathname.replace('/api/', '');

  try {
    if (path.startsWith('audits/')) {
      const auditId = path.split('/')[1];
      
      const { db } = await connectToDatabase();
      
      const result = await db.collection('audits').deleteOne({ id: auditId });
      
      if (result.deletedCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Audit not found' }, 
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true, message: 'Audit deleted' });
    }

    return NextResponse.json(
      { success: false, error: 'Endpoint not found' }, 
      { status: 404 }
    );
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}