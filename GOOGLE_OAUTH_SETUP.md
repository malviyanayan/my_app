# Google OAuth Setup Guide

## Overview
This guide will help you set up Google OAuth authentication for your application.

## Prerequisites
- Google Cloud Console account
- Node.js and npm installed

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure the OAuth consent screen if prompted:
   - User Type: External
   - App name: Your App Name
   - User support email: Your email
   - Developer contact: Your email
6. Select "Web application" as the application type
7. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
8. Click "Create"
9. Copy the Client ID and Client Secret

## Step 2: Configure Backend

1. Create a `.env` file in the `backend` directory:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Add your Google OAuth credentials to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_actual_client_id_here
   GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
   SESSION_SECRET=your_random_session_secret_here
   ```

3. Update `backend/config/passport.js` to use environment variables (already configured)

## Step 3: Install Dependencies

The required packages are already installed:
- `passport`
- `passport-google-oauth20`
- `express-session`

If you need to reinstall:
```bash
cd backend
npm install passport passport-google-oauth20 express-session
```

## Step 4: Start the Application

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## How It Works

1. User clicks "Continue with Google" button
2. User is redirected to Google's OAuth consent screen
3. After approval, Google redirects back to `/api/auth/google/callback`
4. Backend creates or finds the user and generates a JWT token
5. User is redirected to frontend with the token
6. Frontend stores the token and logs the user in

## Features

- Automatic user creation for new Google users
- Auto-verification for Google OAuth users (no email verification needed)
- Existing users can link their Google account
- Secure JWT token generation
- Session management with Passport.js

## Security Notes

- Never commit your `.env` file to version control
- Keep your Client Secret secure
- Use HTTPS in production
- Update redirect URIs for production environment

## Troubleshooting

### "Redirect URI mismatch" error
- Ensure the redirect URI in Google Console matches exactly: `http://localhost:3000/api/auth/google/callback`
- Check that your backend is running on port 3000

### "Invalid client" error
- Verify your Client ID and Client Secret are correct in `.env`
- Ensure there are no extra spaces in the `.env` file

### Session issues
- Clear browser cookies and try again
- Restart the backend server after changing `.env`

## Production Deployment

For production, update:
1. Redirect URI in Google Console to your production domain
2. Frontend redirect URLs in `backend/routes/auth.js`
3. CORS origin in `backend/server.js`
4. Use environment variables for all sensitive data
