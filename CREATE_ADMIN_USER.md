# Create Admin User - Quick Guide

## Problem: "Unable to connect to support team"

This error appears when no admin user exists in the database.

## Solution: Create an Admin User

### Method 1: Using MongoDB Shell (Recommended)

```bash
# Open MongoDB shell
mongosh

# Switch to your database
use adrsmyapp

# Check if any admin exists
db.users.findOne({ role: 'admin' })

# If no admin found, update an existing user to admin
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin", status: "active" } }
)

# Verify admin was created
db.users.findOne({ role: 'admin' })

# Exit
exit
```

### Method 2: Register New User and Make Admin

**Step 1: Register a new user**
1. Go to http://localhost:5173/auth
2. Click "Register"
3. Fill in details:
   - Name: Admin User
   - Email: admin@example.com
   - Password: admin123
4. Register

**Step 2: Verify email (if required)**
- Check console logs for verification link
- Or skip verification by updating database

**Step 3: Make user admin**
```bash
mongosh
use adrsmyapp

# Update the user to admin
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin", status: "active" } }
)

# Verify
db.users.findOne({ email: "admin@example.com" })
```

### Method 3: Using MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect to `mongodb://127.0.0.1:27017`
3. Select database: `adrsmyapp`
4. Select collection: `users`
5. Find a user document
6. Click "Edit Document"
7. Change:
   - `role`: "admin"
   - `status`: "active"
8. Click "Update"

## Verify Admin Exists

### Using MongoDB Shell:
```bash
mongosh
use adrsmyapp
db.users.find({ role: 'admin' }).pretty()
```

### Expected Output:
```javascript
{
  _id: ObjectId("..."),
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$...",
  role: "admin",
  status: "active",
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

## Test Admin Endpoint

### Using curl:
```bash
# Get your token from browser console
TOKEN="your-jwt-token-here"

# Test admin endpoint
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/chat/admin

# Expected response:
# {"_id":"...","name":"Admin User","email":"admin@example.com"}
```

### Using Browser Console:
```javascript
// Open browser console (F12)
// Copy your token
const token = localStorage.getItem('token');
console.log('Token:', token);

// Test fetch
fetch('http://localhost:3000/api/chat/admin', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(data => console.log('Admin:', data))
.catch(err => console.error('Error:', err));
```

## After Creating Admin

1. **Restart Backend** (if needed):
```bash
cd backend
npm run dev
```

2. **Refresh Frontend**:
   - Press F5 or Ctrl+R in browser

3. **Login as User**:
   - Go to Dashboard → Chat Support
   - Input box should now be enabled
   - You can send messages

4. **Test Chat**:
   - Type: "Hello, I need help"
   - Click send
   - Message should appear

## Troubleshooting

### Error: "Admin not found"

**Check database:**
```bash
mongosh
use adrsmyapp
db.users.countDocuments({ role: 'admin' })
# Should return 1 or more
```

**If returns 0:**
- No admin exists
- Follow Method 1 above to create one

### Error: "Invalid token"

**Check token:**
```javascript
// Browser console
localStorage.getItem('token')
// Should return a JWT token
```

**If null or invalid:**
- Logout and login again
- Token will be refreshed

### Error: "Cannot connect to backend"

**Check backend is running:**
```bash
# Should see:
Server running on 3000
DB Connected
```

**If not running:**
```bash
cd backend
npm run dev
```

### Error: "CORS error"

**Check backend CORS settings:**
```javascript
// backend/server.js should have:
cors({
  origin: "http://localhost:5173",
  credentials: true,
})
```

## Quick Commands Reference

```bash
# Check admin exists
mongosh
use adrsmyapp
db.users.findOne({ role: 'admin' })

# Create admin from existing user
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin", status: "active" } }
)

# List all admins
db.users.find({ role: 'admin' })

# Count admins
db.users.countDocuments({ role: 'admin' })

# Delete admin (if needed)
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "user" } }
)
```

## Success Indicators

✅ Admin user exists in database
✅ Backend returns admin info from `/api/chat/admin`
✅ Frontend shows "Online" status
✅ Input box is enabled (white, not gray)
✅ Can type and send messages
✅ No error messages in chat area

## Common Mistakes

❌ Forgetting to set `status: "active"`
❌ Using wrong email in updateOne
❌ Not restarting backend after changes
❌ Not refreshing frontend
❌ Token expired (need to login again)

## Final Check

After creating admin, you should see in browser console:
```
Fetching admin info...
Token: exists
Role: user
Admin info received: { _id: "...", name: "...", email: "..." }
Loading messages with admin: ...
```

And in the UI:
- ✅ "Support Team" header
- ✅ "Online" status (green)
- ✅ Enabled input box
- ✅ Blue send button
- ✅ No error messages

## Need Help?

1. Check browser console for errors
2. Check backend console for errors
3. Verify admin exists in database
4. Test admin endpoint with curl
5. Restart both backend and frontend
6. Clear browser cache and login again

## Quick Test Script

```bash
# Run this to test everything
mongosh << EOF
use adrsmyapp
print("Admin count:", db.users.countDocuments({ role: 'admin' }))
print("Admin user:", JSON.stringify(db.users.findOne({ role: 'admin' }, { password: 0 })))
EOF
```

Expected output:
```
Admin count: 1
Admin user: {"_id":"...","name":"Admin User","email":"admin@example.com","role":"admin","status":"active"}
```

If admin count is 0, create one using Method 1 above!
