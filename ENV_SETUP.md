# Environment Variables Setup

This application requires certain environment variables to be configured for proper operation.

## Required Variables

### Firebase Configuration
**CRITICAL**: These are required for authentication to work.

- **Purpose**: Firebase Authentication provides secure user authentication with email verification and Google OAuth
- **Setup**: 
  1. Go to [Firebase Console](https://console.firebase.google.com/)
  2. Create a new project (or use existing)
  3. Enable Authentication → Sign-in method → Enable Email/Password and Google
  4. Go to Project Settings → General → Your apps → Web app
  5. Copy the Firebase configuration values

- **Add to `.env.local` file**:
  ```env
  NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
  NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
  ```

### Other Environment Variables

**Required:**
- `MONGO_URL` - MongoDB connection string
- `DB_NAME` - Database name (default: 'smart_hygiene_audit')
- `GEMINI_API_KEY` - Google Gemini API key for AI analysis
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

**Optional (Production Optimizations):**
- `MONGODB_MAX_POOL_SIZE` - Maximum database connections in pool (default: 50)
- `MONGODB_MIN_POOL_SIZE` - Minimum database connections to maintain (default: 5)
- `CORS_ORIGINS` - Comma-separated list of allowed CORS origins (required for production, e.g., `https://yourdomain.com`)

## Security Notes

1. **Never commit** `.env.local` or any file containing secrets to version control
2. **Never share** your Firebase API keys with anyone
3. **Firebase Security Rules**: Configure Firebase Security Rules in the Firebase Console
4. **Use different Firebase projects** for development, staging, and production environments
5. **Email Verification**: Users must verify their email before accessing the app (enforced by Firebase)

## Production Deployment

When deploying to production:
1. Create a separate Firebase project for production
2. Use environment variables or secrets management provided by your hosting platform
3. Configure Firebase Security Rules for production
4. Enable additional security measures like rate limiting and HTTPS
5. Set up Firebase App Check for additional protection
6. Configure authorized domains in Firebase Console
