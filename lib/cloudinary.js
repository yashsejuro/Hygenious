
import { v2 as cloudinary } from "cloudinary";

// cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// upload image to cloudinary
export async function uploadImage(base64Image, auditId) {
    try {
        const result = await cloudinary.uploader.upload(base64Image, {
            folder: "hygiene_audits",
            public_id: auditId,
            overwrite: true,
            resource_type: "image"
        });
        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw error;
    }
}
