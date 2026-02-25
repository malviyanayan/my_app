# Fix "Connection Lost" Error

## Problem
Seeing "Connection lost. Please refresh the page" popup in chat.

## Possible Causes

1. **Backend Not Running** ❌
2. **Socket.io Connection Failed** ❌
3. **Token Expired** ❌
4. **Port 3000 Not Accessible** ❌
5. **CORS Issue** ❌

## Quick Fixes

### Fix 1: Check Backend is Running

```bash
# Terminal 1 - Check if backend is running
cd backend
npm run dev
```

**Should see:**
```
Server running on 3000
DB Connected
```

**If not running:**
- Backend crashed
- Start it with `npm run dev`

### Fix 2: Check Backend Console for Errors

Look for errors like:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Then restart backend
npm run dev
```

### Fix 3: Verify Socket.io is Working

**Test with curl:**
```bash
curl http://localhost:3000/socket.io/
```

**Should return:**
```
{"code":0,"message":"Transport unknown"}
```

**If connection refused:**
- Backend not running
- Wrong port
- Firewall blocking

### Fix 4: Check Browser Console

Open browser console (F12) and look for:

**Good:**
```
✅ Socket connected
✅ Socket authenticated successfully
```

**Bad:**
```
❌ Socket connection error: ...
❌ Socket authentication failed: Invalid token
```

### Fix 5: Token Expired

**Check token:**
```javascript
// Browser console
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Expires:', new Date(payload.exp * 1000));
```

**If expired:**
1. Logout
2. Login again
3. Fresh token

### Fix 6: Clear Cache and Reconnect

```javascript
// Browser console
localStorage.clear();
location.reload();
// Then login again
```

### Fix 7: Check CORS Settings

**Backend should have:**
```javascript
// backend/server.js
cors({
  origin: "http://localhost:5173",
  credentials: true,
})
```

**Frontend should connect to:**
```javascript
// frontend/src/services/socket.js
io('http://localhost:3000', { ... })
```

### Fix 8: Restart Everything

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Then:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page (F5)
3. Login again

## Detailed Troubleshooting

### Step 1: Verify Backend

```bash
cd backend
npm run dev
```

**Check console output:**
- ✅ "Server running on 3000"
- ✅ "DB Connected"
- ✅ No errors

### Step 2: Test Socket Connection

```bash
# Test if socket.io endpoint is accessible
curl http://localhost:3000/socket.io/
```

**Expected:** Some response (not connection refused)

### Step 3: Check Browser Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Filter: WS (WebSocket)
4. Refresh page
5. Look for: `socket.io/?EIO=4&transport=websocket`

**Status should be:** 101 Switching Protocols

**If failed:**
- Backend not running
- Wrong URL
- CORS issue

### Step 4: Check Browser Console

**Look for:**
```
Connecting socket with token...
Socket connected successfully
Socket authenticated successfully
```

**If you see:**
```
Socket connection error: ...
```

**Then:**
- Backend not accessible
- Check firewall
- Check port 3000

### Step 5: Verify Token

```javascript
// Browser console
localStorage.getItem('token')
// Should return JWT token, not null
```

**If null:**
- Not logged in
- Token cleared
- Login again

### Step 6: Check MongoDB

```bash
mongosh
use adrsmyapp
db.users.findOne({ role: 'admin' })
```

**Should return admin user**

## Common Error Messages

### "Connection lost. Please refresh the page"

**Causes:**
- Backend stopped
- Socket disconnected
- Network issue

**Solution:**
1. Check backend is running
2. Refresh page
3. Check network connection

### "Socket authentication failed: Invalid token"

**Causes:**
- Token expired
- Wrong JWT_SECRET
- Token format incorrect

**Solution:**
1. Logout and login again
2. Check JWT_SECRET in backend .env
3. Verify token in localStorage

### "Socket connection error: connect ECONNREFUSED"

**Causes:**
- Backend not running
- Wrong port
- Firewall blocking

**Solution:**
1. Start backend: `npm run dev`
2. Check port 3000 is free
3. Check firewall settings

## Prevention

### Auto-Reconnect (Already Implemented)

The socket now has:
- ✅ Auto-reconnection (up to 10 attempts)
- ✅ Reconnection delay (1-5 seconds)
- ✅ Better error handling
- ✅ Connection status tracking

### Keep Backend Running

Use process manager:
```bash
# Install PM2
npm install -g pm2

# Start backend with PM2
cd backend
pm2 start server.js --name myapp-backend

# Check status
pm2 status

# View logs
pm2 logs myapp-backend
```

## Success Indicators

✅ Backend console shows: "Server running on 3000"
✅ Browser console shows: "Socket connected successfully"
✅ Browser console shows: "Socket authenticated successfully"
✅ Network tab shows: WebSocket connection (101)
✅ Chat header shows: "Online" (green)
✅ No error popups
✅ Can send messages

## Quick Test

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev

# Browser
# 1. Open http://localhost:5173
# 2. Login
# 3. Go to Chat Support
# 4. Check console for "Socket connected"
# 5. Try sending message
```

## Still Having Issues?

1. **Check backend logs** for errors
2. **Check browser console** for errors
3. **Check network tab** for failed requests
4. **Verify MongoDB** is running
5. **Verify admin user** exists
6. **Try different browser** (clear cache)
7. **Restart computer** (last resort)

## Debug Mode

Add this to see detailed logs:

```javascript
// Browser console
localStorage.setItem('debug', 'socket.io-client:*');
location.reload();
```

This will show detailed socket.io logs.

## Contact Support

If still not working, provide:
1. Backend console output
2. Browser console output
3. Network tab screenshot
4. Error messages
5. Steps to reproduce

The connection should work now with improved reconnection logic! 🚀
