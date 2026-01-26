import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAuth } from 'firebase-admin/auth';
import admin from 'firebase-admin';
import { v2 as cloudinary } from "cloudinary";
import { hasPermission } from '@/lib/rbac';
import { connectToDatabase } from '@/lib/db';

// cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// upload image to cloudinary
async function uploadImage(base64Image, auditId) {
  const result = await cloudinary.uploader.upload(base64Image, {
    folder: "hygiene_audits",
    public_id: auditId,
    overwrite: true,
    resource_type: "image"
  });

  return result.secure_url;
}

// Get your API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn(
    '⚠️ GEMINI_API_KEY is not defined. AI analysis will fail. Please add it to your .env file.'
  );
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
});

// Validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateImageFormat(image) {
  // Check if image is a valid base64 string
  if (!image.startsWith('data:')) {
    // If not data URL, check if it's a valid base64 string
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    return base64Regex.test(image);
  }

  // If it's a data URL, check if it's an image
  const imageTypeRegex = /^data:image\/(jpeg|png|gif|webp|jpg);base64,/;
  return imageTypeRegex.test(image);
}

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
    throw new Error('Missing Firebase Admin SDK environment variables');
  }

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
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error.message);
  console.warn('Firebase Admin SDK not available. Token verification will use basic decoding.');
}

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

// Use centralized database connection from lib/db.js
import { connectToDatabase } from '@/lib/db';

/**
 * Analyze hygiene image using Google Gemini 1.5 Flash
 */
async function analyzeHygieneImage(imageBase64, mimeType = 'image/jpeg') {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured for analysis.');
  }

  try {
    console.log(`🔍 Analyzing image with Gemini 2.5 Flash (MIME: ${mimeType})...`);

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
    let jsonString = response.text();

    // Clean the response text to remove markdown formatting if present
    jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

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





export async function GET(request) {
  const { pathname } = new URL(request.url);
  const path = pathname.replace('/api/', '');

  try {
    const { db } = await connectToDatabase();

    // List All Users (Admin Only)
    if (path === 'users' && request.method === 'GET') {
      // 1. Authenticate
      const authHeader = request.headers.get('authorization');
      if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const { db } = await connectToDatabase();

      // 2. Check Admin Role
      try {
        const uid = await getFirebaseUID(authHeader);
        const currentUser = await db.collection('users').findOne({ uid });

        if (!currentUser || currentUser.role !== 'admin') {
          return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
        }
      } catch (e) {
        return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
      }

      // 3. Fetch Users (Scoped to Organization)
      // If the user has no organizationId (legacy), we might show all (migrating) or none. 
      // For now, let's assume we want to match organizationId if it exists.

      const query = {};
      if (currentUser.organizationId) {
        query.organizationId = currentUser.organizationId;
      } else {
        // Fallback for legacy admin: maybe show only themselves or nothing to force update
        // Let's show themselves so it doesn't break
        query.uid = uid;
      }

      const users = await db.collection('users').find(query, { projection: { password: 0 } }).toArray();
      return NextResponse.json({ success: true, data: users });
    }

    if (path === 'audits') {
      try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        let query = {};
        try {
          const uid = await getFirebaseUID(authHeader);
          const currentUser = await db.collection('users').findOne({ uid });

          if (currentUser && currentUser.organizationId) {
            query.organizationId = currentUser.organizationId;
          } else {
            query.userId = uid;
          }
        } catch (e) {
          return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        const audits = await db.collection('audits')
          .find(query)
          .sort({ createdAt: -1 })
          .limit(100)
          .toArray();

        return NextResponse.json({
          success: true,
          data: audits,
          count: audits.length
        });
      } catch (e) {
        // If auth fails, return empty or error
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
    }

    if (path.startsWith('audits/')) {
      const auditId = path.split('/')[1];

      const authHeader = request.headers.get('authorization');
      if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    }

    if (path === 'dashboard/stats') {
      const authHeader = request.headers.get('authorization');
      if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      let query = {};
      try {
        const uid = await getFirebaseUID(authHeader);
        const currentUser = await db.collection('users').findOne({ uid });

        if (currentUser && currentUser.organizationId) {
          query.organizationId = currentUser.organizationId;
        } else {
          query.userId = uid;
        }
      } catch (e) {
        return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
      }

      const audits = await db.collection('audits')
        .find(query)
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

    if (path === 'dashboard/rankings') {
      const authHeader = request.headers.get('authorization');
      let query = {};

      // If auth header is present, scope to org. If not, return empty or error?
      // Given the sensitive nature, we should require auth.
      if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      try {
        const uid = await getFirebaseUID(authHeader);
        const currentUser = await db.collection('users').findOne({ uid });

        if (currentUser && currentUser.organizationId) {
          query.organizationId = currentUser.organizationId;
        } else {
          query.userId = uid;
        }
      } catch (e) {
        return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
      }

      const audits = await db.collection('audits')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      // Group audits by facility/location and calculate averages
      const facilityMap = new Map();

      audits.forEach(audit => {
        const key = audit.location || 'Unknown Location';
        if (!facilityMap.has(key)) {
          facilityMap.set(key, {
            location: key,
            facilityName: audit.facilityName || key,
            scores: [],
            audits: 0
          });
        }

        const facility = facilityMap.get(key);
        if (audit.result?.overallScore) {
          facility.scores.push(audit.result.overallScore);
        }
        facility.audits++;
      });

      // Calculate rankings for each category
      const createRankings = (category) => {
        const facilities = Array.from(facilityMap.values())
          .filter(f => f.scores.length > 0)
          .map(f => {
            const avgScore = Math.round(
              f.scores.reduce((sum, s) => sum + s, 0) / f.scores.length
            );

            // Calculate trend (comparing recent audits to older ones)
            const recentScores = f.scores.slice(0, Math.ceil(f.scores.length / 2));
            const olderScores = f.scores.slice(Math.ceil(f.scores.length / 2));
            const recentAvg = recentScores.length > 0
              ? recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length
              : avgScore;
            const olderAvg = olderScores.length > 0
              ? olderScores.reduce((sum, s) => sum + s, 0) / olderScores.length
              : avgScore;
            const trend = Math.round(recentAvg - olderAvg);

            return {
              location: f.location,
              facilityName: f.facilityName,
              score: avgScore,
              trend: trend,
              audits: f.audits,
              category: category
            };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 10); // Top 10

        return facilities;
      };

      // Create rankings for different categories
      const categories = {
        all: createRankings('All Facilities'),
        kitchen: createRankings('Kitchen'),
        washroom: createRankings('Washroom'),
        storage: createRankings('Storage'),
        dining: createRankings('Dining Area'),
        office: createRankings('Office')
      };

      return NextResponse.json({
        success: true,
        data: categories
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
    }

    if (path === 'analyze') {
      const body = await request.json();
      const { image, location, areaNotes } = body;

      // Input validation
      if (!image) {
        return NextResponse.json(
          { success: false, error: 'Image is required' },
          { status: 400 }
        );
      }

      if (!validateImageFormat(image)) {
        return NextResponse.json(
          { success: false, error: 'Invalid image format' },
          { status: 400 }
        );
      }

      if (location && typeof location !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Location must be a string' },
          { status: 400 }
        );
      }

      if (areaNotes && typeof areaNotes !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Area notes must be a string' },
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
      let user = { uid: null, name: 'Anonymous', organizationId: null };
      try {
        const authHeader = request.headers.get('authorization');
        if (authHeader) {
          const uid = await getFirebaseUID(authHeader);
          if (uid) {
            user.uid = uid;
            // Fetch user details to get name AND organizationId
            const userDoc = await db.collection('users').findOne({ uid: uid });
            if (userDoc) {
              user.name = userDoc.name || 'Anonymous';
              user.organizationId = userDoc.organizationId; // IMPORTANT: Get org ID
            }
          }
        }
      } catch (error) {
        console.warn('Auth error (continuing without user):', error.message);
      }

      const auditId = uuidv4();

      // Upload to Cloudinary
      let imageUrl = null;
      try {
        // Use the original 'image' string which includes the data URI if present, 
        // or construct it if it was raw base64 (less likely for upload).
        // Cloudinary handles 'data:image/...' strings well.
        const uploadStr = image.startsWith('data:') ? image : `data:${mimeType};base64,${image}`;
        imageUrl = await uploadImage(uploadStr, auditId);
        console.log('☁️ Image uploaded to Cloudinary:', imageUrl);
      } catch (uploadError) {
        console.error('Failed to upload to Cloudinary:', uploadError);
        // We continue even if upload fails, just without imageUrl
      }

      // Create audit object matching the requested structure
      const audit = {
        id: auditId,
        auditId: auditId, // Store both if needed, or just id
        userId: user.uid,
        userName: user.name,
        organizationId: user.organizationId || user.uid, // Fallback to UID if no Org ID yet (legacy)
        location: location || 'Unknown',
        areaNotes: areaNotes || '',
        imageUrl: imageUrl, // Added imageUrl
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
          result: analysisResult,
          imageUrl: imageUrl
        }
      });
    }

    if (path === 'feedback') {
      const body = await request.json();
      const { scanId, accuracy, feedback, userId } = body;

      // Validation
      if (!scanId || accuracy === undefined) {
        return NextResponse.json(
          { success: false, error: 'Scan ID and accuracy are required' },
          { status: 400 }
        );
      }

      // Resolve User ID and Name
      let finalUserId = userId || 'anonymous';
      let finalUserName = 'Anonymous';

      try {
        // 1. Try to get UID from token (most secure)
        const authHeader = request.headers.get('authorization');
        if (authHeader) {
          const tokenUid = await getFirebaseUID(authHeader);
          if (tokenUid) {
            finalUserId = tokenUid;
          }
        }

        // 2. Look up user details in DB if we have a valid ID
        if (finalUserId !== 'anonymous') {
          const user = await db.collection('users').findOne({ uid: finalUserId });
          if (user && user.name) {
            finalUserName = user.name;
          }
        }
      } catch (authError) {
        console.warn('Feedback auth resolution failed:', authError.message);
        // Fallback to anonymous/provided ID is already set
      }

      // Save to database
      const feedbackDoc = {
        scanId,
        accuracy: Number(accuracy),
        comments: feedback || '',
        userId: finalUserId,
        userName: finalUserName, // <--- Now storing the name!
        timestamp: new Date().toISOString(),
        used_for_training: false // Mark as pending for ML team
      };

      await db.collection('feedback').insertOne(feedbackDoc);

      // Log low accuracy for review
      if (accuracy < 50) {
        console.warn(`⚠️ Low accuracy feedback (${accuracy}%) received for scan: ${scanId}`);
      }

      return NextResponse.json({
        success: true,
        message: 'Feedback recorded',
        feedbackId: feedbackDoc._id
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
// (Your DELETE function is perfect and remains unchanged)
export async function DELETE(request) {
  const { pathname } = new URL(request.url);
  const path = pathname.replace('/api/', '');

  try {
    const { db } = await connectToDatabase();

    // 1. Authenticate & Get User Role
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.log('❌ DELETE failed: No Auth Header');
      return NextResponse.json({ success: false, error: 'Unauthorized: No Auth Header' }, { status: 401 });
    }

    let userRole = 'staff'; // Default role
    try {
      const uid = await getFirebaseUID(authHeader);
      console.log('Start Deletion for UID:', uid);

      const user = await db.collection('users').findOne({ uid });
      if (user) {
        console.log('User found in DB. Role:', user.role);
        if (user.role) userRole = user.role;
      } else {
        console.log('❌ User NOT found in DB for UID:', uid);
      }
    } catch (authError) {
      console.error('❌ DELETE Auth Error:', authError);
      return NextResponse.json({ success: false, error: 'Invalid Token' }, { status: 401 });
    }

    if (path.startsWith('audits/')) {
      // 2. Check Permission
      const canDelete = hasPermission(userRole, 'delete_audit');
      console.log(`Permission Check: Role=${userRole}, Delete=${canDelete}`);

      if (!canDelete) {
        return NextResponse.json(
          { success: false, error: `Forbidden: Role '${userRole}' cannot delete audits.` },
          { status: 403 }
        );
      }

      const auditId = path.split('/')[1];

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

export async function PUT(request) {
  const { pathname } = new URL(request.url);
  const path = pathname.replace('/api/', '');

  try {
    const { db } = await connectToDatabase();

    // Update User Role (Admin Only)
    if (path === 'users/role') {
      const authHeader = request.headers.get('authorization');
      if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}