# Quick Start - Google OAuth

## 🚀 3 Steps to Get Started

### Step 1: Get Google Credentials (5 minutes)
1. Visit: https://console.cloud.google.com/
2. Create a project → APIs & Services → Credentials
3. Create OAuth Client ID (Web application)
4. Add redirect URI: `http://localhost:3000/api/auth/google/callback`
5. Copy your Client ID and Client Secret

### Step 2: Configure (1 minute)
Edit `backend/.env`:
```env
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
SESSION_SECRET=any_random_text_here
```

### Step 3: Run (30 seconds)
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

## ✅ Test It
1. Open: http://localhost:5173/auth
2. Click "Continue with Google"
3. Login with your Google account
4. Done! You're logged in

## 📚 Need More Help?
- Detailed setup: `GOOGLE_OAUTH_SETUP.md`
- Testing guide: `TESTING_GUIDE.md`
- Full summary: `IMPLEMENTATION_SUMMARY.md`

## ⚠️ Important
- Don't commit `.env` file to git
- Replace placeholder values in `.env`
- Make sure MongoDB is running
