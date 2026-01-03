# Environment Variables Setup

This application requires certain environment variables to be configured for proper operation.

## Required Variables

### JWT_SECRET
**CRITICAL**: This is required for authentication to work.

- **Purpose**: Used to sign and verify JWT tokens for user authentication
- **Security**: Must be a strong, random string that is kept secret
- **Generation**: You can generate a secure secret using:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
  Or use any other secure random string generator

- **Setup**: Add this to your `.env.local` file:
  ```
  JWT_SECRET=your_secure_random_string_here
  ```

### Other Environment Variables

See the `.env.local` file for other required variables:
- `MONGO_URL` - MongoDB connection string
- `DB_NAME` - Database name
- `GEMINI_API_KEY` - Google Gemini API key for AI analysis

## Security Notes

1. **Never commit** `.env.local` or any file containing secrets to version control
2. **Never share** your JWT_SECRET with anyone
3. **Rotate secrets** periodically, especially if you suspect they've been compromised
4. **Use different secrets** for development, staging, and production environments

## Production Deployment

When deploying to production:
1. Generate a new, strong JWT_SECRET specifically for production
2. Use environment variables or secrets management provided by your hosting platform
3. Never use the same secrets across environments
4. Enable additional security measures like rate limiting and HTTPS
