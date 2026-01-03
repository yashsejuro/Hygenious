# Authentication System Testing Guide

This guide provides step-by-step instructions for testing the newly implemented authentication system.

## Prerequisites

1. **Set up environment variables**:
   - Copy `.env.local.example` to `.env.local`
   - Generate a secure JWT_SECRET (see ENV_SETUP.md)
   - Add your MongoDB connection string and other required variables

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

## Test Cases

### 1. User Registration Flow

**Steps:**
1. Navigate to `http://localhost:3000`
2. Click "Sign Up" button in the navigation
3. Fill in the registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: test123 (minimum 6 characters)
   - Company Name: Test Company (optional)
4. Click "Create Account"

**Expected Results:**
- ✅ Success toast notification appears
- ✅ Redirected to dashboard page
- ✅ User info displayed in dashboard header
- ✅ Token stored in localStorage
- ✅ User document created in MongoDB users collection

**Common Issues:**
- Email already exists error → Use a different email
- Password too short → Use at least 6 characters

### 2. User Login Flow

**Steps:**
1. Logout if currently logged in
2. Navigate to `http://localhost:3000`
3. Click "Login" button in the navigation
4. Fill in the login form:
   - Email: test@example.com
   - Password: test123
5. Click "Sign In"

**Expected Results:**
- ✅ Success toast notification appears
- ✅ Redirected to dashboard page
- ✅ User info displayed in dashboard header
- ✅ Token stored in localStorage

**Common Issues:**
- Invalid credentials → Check email/password
- Token expired → Should auto-logout and redirect to login

### 3. Protected Routes (Authentication Guard)

**Steps:**
1. Logout from the application
2. Try to access these URLs directly:
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/dashboard/audits/new`

**Expected Results:**
- ✅ Immediately redirected to login page
- ✅ No unauthorized access to protected content
- ✅ After logging in, can access these pages

### 4. Create Audit (with User Association)

**Steps:**
1. Login as a user
2. Navigate to dashboard
3. Click "New Audit" button
4. Upload or take a photo
5. Fill in location and notes
6. Submit the audit

**Expected Results:**
- ✅ Audit created successfully
- ✅ Audit includes `userId` field in database
- ✅ Audit appears in user's dashboard
- ✅ Authorization header sent with request

**Verify in MongoDB:**
```javascript
// Check that audit has userId
db.audits.findOne({ /* audit id */ })
// Should include: userId: "user-uuid"
```

### 5. Dashboard Stats (User-Specific Data)

**Steps:**
1. Login as User A
2. Create 2-3 audits
3. Note the stats (total audits, scores, etc.)
4. Logout
5. Register/Login as User B
6. Check dashboard stats

**Expected Results:**
- ✅ User A sees only their audits and stats
- ✅ User B starts with 0 audits
- ✅ Users cannot see each other's data
- ✅ Dashboard is properly isolated per user

### 6. Logout Functionality

**Steps:**
1. Login to the application
2. Navigate to dashboard
3. Click "Logout" button in header

**Expected Results:**
- ✅ Redirected to login page
- ✅ Token removed from localStorage
- ✅ User state cleared
- ✅ Cannot access dashboard without re-login

### 7. Session Persistence (Auto-Login)

**Steps:**
1. Login to the application
2. Navigate to dashboard
3. Refresh the page (F5 or Ctrl+R)
4. Close the browser tab
5. Open a new tab and navigate to `http://localhost:3000`

**Expected Results:**
- ✅ User remains logged in after refresh
- ✅ User remains logged in in new tab
- ✅ Token persists in localStorage
- ✅ Token verified on page load

### 8. Token Expiration Handling

**Steps:**
1. Login to the application
2. Open browser DevTools → Application → Local Storage
3. Manually modify or delete the token
4. Try to fetch dashboard stats or create an audit

**Expected Results:**
- ✅ 401 Unauthorized error caught
- ✅ User automatically logged out
- ✅ Toast notification shown
- ✅ Redirected to login page

### 9. Invalid Registration/Login Attempts

**Test Cases:**

**Invalid Email Format:**
- Input: `notanemail`
- Expected: Validation error message

**Password Too Short:**
- Input: `12345` (5 characters)
- Expected: "Password must be at least 6 characters"

**Missing Required Fields:**
- Leave name/email/password empty
- Expected: "Please fill in all required fields"

**Duplicate Email Registration:**
- Register with existing email
- Expected: "User with this email already exists"

**Wrong Password on Login:**
- Use correct email, wrong password
- Expected: "Invalid email or password"

### 10. UI Conditional Rendering

**When NOT logged in:**
- ✅ Home page shows "Login" and "Sign Up" buttons
- ✅ Hero section shows "Get Started Free" button
- ✅ Dashboard redirects to login

**When logged in:**
- ✅ Home page shows "Dashboard" and "Get Started" buttons
- ✅ Dashboard shows user info and logout button
- ✅ Can create audits and view stats

## Security Checklist

- [ ] JWT_SECRET is not hardcoded in repository
- [ ] Passwords are hashed before storage
- [ ] Password hashes are never exposed in API responses
- [ ] API endpoints validate authentication tokens
- [ ] 401 errors trigger automatic logout
- [ ] Tokens have appropriate expiration (7 days)
- [ ] localStorage is used securely (MVP acceptable)
- [ ] Email validation prevents invalid formats
- [ ] Minimum password length enforced

## MongoDB Verification Queries

```javascript
// Check users collection
db.users.find().pretty()
// Should show: id, email, password (hashed), name, companyName, timestamps

// Check audits with userId
db.audits.find({ userId: "specific-user-id" }).pretty()
// Should only return audits for that user

// Verify password is hashed
db.users.findOne({ email: "test@example.com" })
// password field should be bcrypt hash starting with $2b$
```

## Performance Testing

1. **Load Time**: Dashboard should load within 2 seconds
2. **Login Speed**: Login should complete within 1 second
3. **Token Verification**: Should be instant on page load
4. **Audit Creation**: Should complete within 5-10 seconds (AI processing)

## Known Limitations (MVP)

1. **localStorage**: Tokens stored in localStorage (not HTTP-only cookies)
   - Acceptable for MVP
   - Should upgrade to HTTP-only cookies for production

2. **Token Refresh**: No automatic token refresh
   - Tokens expire after 7 days
   - User must re-login

3. **Password Reset**: Not implemented yet
   - Users cannot reset forgotten passwords
   - Planned for future release

4. **Email Verification**: Not implemented yet
   - Users can register without email verification
   - Planned for future release

5. **Rate Limiting**: Not implemented
   - Endpoints not protected against brute force
   - Should add rate limiting for production

## Troubleshooting

**Issue**: "JWT_SECRET is not configured"
- **Solution**: Add JWT_SECRET to .env.local file

**Issue**: Can't login after registration
- **Solution**: Check browser console for errors, verify MongoDB connection

**Issue**: Dashboard shows no data after login
- **Solution**: Check network tab for 401 errors, verify token in localStorage

**Issue**: Infinite redirect loop
- **Solution**: Clear localStorage and cookies, try again

**Issue**: "User not found" after refresh
- **Solution**: Token may be invalid, logout and login again

## Next Steps

After completing all tests:
1. Document any bugs found
2. Verify all security measures are in place
3. Test on different browsers (Chrome, Firefox, Safari)
4. Test on mobile devices
5. Prepare for production deployment
