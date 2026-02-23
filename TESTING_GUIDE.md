# Testing Google OAuth Implementation

## Quick Start

### 1. Set Up Google OAuth Credentials
Follow the detailed instructions in `GOOGLE_OAUTH_SETUP.md` to:
- Create a Google Cloud project
- Get your Client ID and Client Secret
- Configure authorized redirect URIs

### 2. Configure Environment Variables
Edit `backend/.env` and replace the placeholder values:
```env
GOOGLE_CLIENT_ID=your_actual_client_id
GOOGLE_CLIENT_SECRET=your_actual_client_secret
SESSION_SECRET=any_random_string_here
```

### 3. Start the Application

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 4. Test the Flow

1. Open your browser to `http://localhost:5173`
2. Navigate to the Auth page
3. Click "Continue with Google" button
4. You should be redirected to Google's login page
5. Select your Google account
6. Grant permissions
7. You'll be redirected back and logged in automatically

## What Was Implemented

### Backend Changes:
1. **User Model** (`backend/models/User.js`)
   - Added `googleId` field to store Google user ID
   - Made password optional for Google OAuth users

2. **Passport Configuration** (`backend/config/passport.js`)
   - Configured Google OAuth strategy
   - Handles user creation and authentication

3. **Auth Routes** (`backend/routes/auth.js`)
   - `GET /api/auth/google` - Initiates Google OAuth flow
   - `GET /api/auth/google/callback` - Handles Google callback

4. **Server Configuration** (`backend/server.js`)
   - Added session middleware
   - Initialized Passport.js

5. **Dependencies**
   - `passport` - Authentication middleware
   - `passport-google-oauth20` - Google OAuth strategy
   - `express-session` - Session management
   - `dotenv` - Environment variable management

### Frontend Changes:
1. **Google Callback Component** (`frontend/src/components/GoogleCallback.jsx`)
   - Handles the redirect from Google
   - Stores JWT token and user info
   - Redirects to home page

2. **App Routes** (`frontend/src/App.jsx`)
   - Added route for `/auth/google/success`

3. **Auth Component** (`frontend/src/components/Auth.jsx`)
   - Already had the "Continue with Google" button
   - Button redirects to backend OAuth endpoint

## Testing Checklist

- [ ] Google OAuth credentials configured in `.env`
- [ ] Backend server running on port 3000
- [ ] Frontend running on port 5173
- [ ] MongoDB running and connected
- [ ] Click "Continue with Google" button
- [ ] Redirected to Google login
- [ ] Successfully authenticated
- [ ] Redirected back to app
- [ ] User logged in with JWT token
- [ ] User data stored in database

## Common Issues

### Button doesn't work
- Check browser console for errors
- Verify backend is running on port 3000
- Check CORS configuration

### Google redirect fails
- Verify redirect URI in Google Console matches: `http://localhost:3000/api/auth/google/callback`
- Check that Client ID and Secret are correct in `.env`

### Database errors
- Ensure MongoDB is running
- Check database connection in `backend/server.js`

## Database Verification

After successful login, check your MongoDB:
```javascript
// In MongoDB shell or Compass
db.users.find({ googleId: { $exists: true } })
```

You should see users with:
- `googleId` field populated
- `status` set to "active"
- `email` from Google account
- `name` from Google profile
