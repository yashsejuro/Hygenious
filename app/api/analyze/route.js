
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getFirebaseUID } from '@/lib/auth-server';
import { analyzeHygieneImage } from '@/lib/ai';
import { uploadImage } from '@/lib/cloudinary';
import { v4 as uuidv4 } from 'uuid';

// Maximum image size: 10MB (base64 encoded)
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE_BASE64 = Math.floor(MAX_IMAGE_SIZE_BYTES * 1.33); // Base64 is ~33% larger

function validateImageFormat(image) {
    if (!image.startsWith('data:')) {
        const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
        return base64Regex.test(image);
    }
    const imageTypeRegex = /^data:image\/(jpeg|png|gif|webp|jpg);base64,/;
    return imageTypeRegex.test(image);
}

function validateImageSize(image) {
    // Calculate approximate size of base64 image
    // Base64 encoding increases size by ~33%
    const base64Length = image.length;
    
    // Remove data URL prefix if present for size calculation
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const actualBase64Length = base64Data.length;
    
    // Estimate original size (base64 is 4/3 of original)
    const estimatedOriginalSize = (actualBase64Length * 3) / 4;
    
    return {
        isValid: estimatedOriginalSize <= MAX_IMAGE_SIZE_BYTES,
        sizeBytes: estimatedOriginalSize,
        maxSizeBytes: MAX_IMAGE_SIZE_BYTES
    };
}

export async function POST(request) {
    try {
        const { db } = await connectToDatabase();
        const body = await request.json();
        const { image, location, areaNotes } = body;

        // Input validation
        if (!image) {
            return NextResponse.json(
                { success: false, error: 'Image is required' },
                { status: 400 }
            );
        }

        // Validate image size before processing
        const sizeValidation = validateImageSize(image);
        if (!sizeValidation.isValid) {
            const sizeMB = (sizeValidation.sizeBytes / (1024 * 1024)).toFixed(2);
            const maxMB = (sizeValidation.maxSizeBytes / (1024 * 1024)).toFixed(0);
            return NextResponse.json(
                { 
                    success: false, 
                    error: `Image too large. Size: ${sizeMB}MB, Maximum: ${maxMB}MB` 
                },
                { status: 400 }
            );
        }

        if (!validateImageFormat(image)) {
            return NextResponse.json(
                { success: false, error: 'Invalid image format. Supported formats: JPEG, PNG, GIF, WebP' },
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

        // Image Parsing
        let imageBase64;
        let mimeType = 'image/jpeg';

        if (image.startsWith('data:')) {
            const parts = image.split(';base64,');
            const mimeTypeData = parts[0].split(':')[1];
            if (mimeTypeData) {
                mimeType = mimeTypeData;
            }
            imageBase64 = parts[1];
        } else {
            imageBase64 = image;
        }

        console.log('📸 Processing image analysis request...');
        console.log('Location:', location);
        console.log('MIME type:', mimeType);

        // AI Analysis
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
                    const userDoc = await db.collection('users').findOne({ uid: uid });
                    if (userDoc) {
                        user.name = userDoc.name || 'Anonymous';
                        user.organizationId = userDoc.organizationId;
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
            const uploadStr = image.startsWith('data:') ? image : `data:${mimeType};base64,${image}`;
            imageUrl = await uploadImage(uploadStr, auditId);
            console.log('☁️ Image uploaded to Cloudinary:', imageUrl);
        } catch (uploadError) {
            console.error('Failed to upload to Cloudinary:', uploadError);
        }

        // Create audit object
        const audit = {
            id: auditId,
            auditId: auditId,
            userId: user.uid,
            userName: user.name,
            organizationId: user.organizationId || user.uid,
            location: location || 'Unknown',
            areaNotes: areaNotes || '',
            imageUrl: imageUrl,
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
    } catch (error) {
        console.error('Analysis Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
