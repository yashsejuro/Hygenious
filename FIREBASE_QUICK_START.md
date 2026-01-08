# 🚀 Quick Start: Add Firebase Config to Hygenious

## Step 1: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the **⚙️ Settings** (gear icon) → **Project settings**
4. Scroll down to **Your apps** section
5. If you don't have a web app yet:
   - Click the **Web** icon (`</>`)
   - Register your app:
     - App nickname: "Hygenious Web"
     - Click **Register app**
6. You'll see your Firebase configuration object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Step 2: Create `.env.local` File

1. In your project root (`C:\Users\Asus\OneDrive\Desktop\hygienous\`), create a file named `.env.local`
2. Copy the template below and fill in your Firebase values:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# MongoDB Configuration (if you already have this, keep it)
MONGO_URL=your_mongodb_connection_string
DB_NAME=smart_hygiene_audit

# Google Gemini API Key (if you already have this, keep it)
GEMINI_API_KEY=your_gemini_api_key
```

## Step 3: Copy Values from Firebase Console

Replace each value:
- `NEXT_PUBLIC_FIREBASE_API_KEY` → Copy `apiKey` from Firebase config
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` → Copy `authDomain` from Firebase config
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` → Copy `projectId` from Firebase config
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` → Copy `storageBucket` from Firebase config
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` → Copy `messagingSenderId` from Firebase config
- `NEXT_PUBLIC_FIREBASE_APP_ID` → Copy `appId` from Firebase config

## Step 4: Verify Authentication is Enabled

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Make sure these are enabled:
   - ✅ **Email/Password** (enabled)
   - ✅ **Google** (enabled)

## Step 5: Test Your Setup

1. **Restart your development server** (important!):
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. Open your browser: `http://localhost:3000`

3. Test Registration:
   - Go to `/register`
   - Try creating an account with email/password
   - Check your email for verification link

4. Test Google Sign-In:
   - Click "Sign up with Google" or "Sign in with Google"
   - Complete Google authentication

## ✅ Success Indicators

- ✅ No console errors about Firebase configuration
- ✅ Registration form works
- ✅ Google OAuth button works
- ✅ Email verification email is sent
- ✅ You can log in after verifying email

## 🐛 Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure `.env.local` file exists in project root
- Make sure all `NEXT_PUBLIC_*` variables are set
- **Restart your dev server** after creating `.env.local`

### "Email already in use"
- User already exists - try logging in instead

### Google OAuth not working
- Check that Google sign-in is enabled in Firebase Console
- Make sure `localhost` is in authorized domains (should be automatic)

### Environment variables not loading
- Make sure file is named exactly `.env.local` (not `.env.local.txt`)
- Make sure it's in the project root (same folder as `package.json`)
- Restart your dev server

---

**Need help?** Check `FIREBASE_SETUP.md` for detailed documentation.

