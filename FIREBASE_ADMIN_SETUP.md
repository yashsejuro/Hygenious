# Firebase Admin SDK Setup

To properly configure the Firebase Admin SDK for server-side operations, you need to set up the following environment variables in your `.env.local` file:

## Required Environment Variables

```env
# Firebase Admin SDK Configuration (for server-side operations)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-adminsdk-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENTS\n-----END PRIVATE KEY-----\n"
```

## How to Get These Values

### 1. Create a Service Account

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) → **Service Accounts**
4. Click on **Generate new private key**
5. This will download a JSON file with your service account details

### 2. Extract the Required Values

From the downloaded JSON file, extract these values:

- `project_id` → Use as `FIREBASE_PROJECT_ID`
- `client_email` → Use as `FIREBASE_CLIENT_EMAIL`
- `private_key` → Use as `FIREBASE_PRIVATE_KEY`

### 3. Format the Private Key

The private key needs to have newlines properly escaped. If your private key looks like this:

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKc...
-----END PRIVATE KEY-----
```

It should be formatted in your `.env.local` file as a single line with `\n` characters:

```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKc...\n-----END PRIVATE KEY-----\n"
```

## Complete Environment File Example

```env
# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK Configuration (Server-side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Other Environment Variables
MONGO_URL=your_mongodb_connection_string
DB_NAME=smart_hygiene_audit
GEMINI_API_KEY=your_gemini_api_key
```

## Important Notes

- **Never commit** your `.env.local` file to version control
- **Never share** your service account keys with anyone
- The Firebase Admin SDK is used for server-side authentication verification
- If these variables are not set, the app will fall back to basic JWT token decoding
- The private key must have proper newline characters escaped as `\n`