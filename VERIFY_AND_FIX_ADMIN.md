# Verify and Fix Admin Issue

## Problem
User is seeing "gajendra" instead of "Support Team" in chat header.

## Root Cause
Either:
1. npm@gmail.com is not set as admin in database
2. Wrong user is being returned as admin
3. Frontend is showing wrong name

## Solution

### Step 1: Check Current Admin

```bash
mongosh
use adrsmyapp

# Check who is currently admin
db.users.find({ role: 'admin' }, { password: 0 }).pretty()
```

**Expected Output:**
```javascript
{
  _id: ObjectId("..."),
  name: "...",
  email: "npm@gmail.com",  // ✅ Should be npm@gmail.com
  role: "admin",
  status: "active"
}
```

**If you see different email or no results:**
- Wrong user is admin
- Need to fix it

### Step 2: Check if "gajendra" is Admin

```bash
# Still in mongosh
db.users.findOne({ name: "gajendra" }, { password: 0 })
```

**If this shows role: "admin":**
- This is the problem!
- "gajendra" is admin instead of npm@gmail.com

### Step 3: Fix - Make npm@gmail.com Admin

```bash
# Remove admin role from all users first
db.users.updateMany(
  { role: 'admin' },
  { $set: { role: 'user' } }
)

# Now make ONLY npm@gmail.com admin
db.users.updateOne(
  { email: 'npm@gmail.com' },
  { $set: { role: 'admin', status: 'active' } }
)

# Verify
db.users.findOne({ role: 'admin' }, { password: 0 })
```

**Expected Output:**
```javascript
{
  _id: ObjectId("..."),
  email: "npm@gmail.com",  // ✅ Correct!
  role: "admin",
  status: "active"
}
```

### Step 4: Verify npm@gmail.com Exists

```bash
# Check if npm@gmail.com user exists
db.users.findOne({ email: 'npm@gmail.com' }, { password: 0 })
```

**If null (user doesn't exist):**
```bash
# You need to register this user first
# Go to http://localhost:5173/auth
# Register with email: npm@gmail.com
# Then come back and run Step 3
```

### Step 5: Restart Backend

```bash
cd backend
npm run dev
```

### Step 6: Test in Browser

1. **Logout and Login Again** (to get fresh token)
2. **Go to Chat Support**
3. **Check Header:**
   - ✅ Should show "Support Team"
   - ✅ NOT "gajendra"

### Step 7: Verify in Console

Open browser console (F12) and check:

```
Fetching admin info...
Admin info received: { _id: "...", name: "...", email: "npm@gmail.com" }
Setting admin ID: ...
Admin name: ...
Admin email: npm@gmail.com
✅ Should show npm@gmail.com
```

## Quick Fix Commands

### One-Line Fix:
```bash
mongosh --eval 'use adrsmyapp; db.users.updateMany({role:"admin"}, {$set:{role:"user"}}); db.users.updateOne({email:"npm@gmail.com"}, {$set:{role:"admin",status:"active"}}); db.users.findOne({role:"admin"}, {password:0})'
```

### Verify Only npm@gmail.com is Admin:
```bash
mongosh --eval 'use adrsmyapp; db.users.find({role:"admin"}, {password:0}).forEach(printjson)'
```

**Should show ONLY npm@gmail.com**

## Common Issues

### Issue 1: npm@gmail.com doesn't exist

**Solution:**
1. Register user at http://localhost:5173/auth
2. Use email: npm@gmail.com
3. Then run admin update command

### Issue 2: Multiple admins exist

**Solution:**
```bash
# Remove all admins
db.users.updateMany({ role: 'admin' }, { $set: { role: 'user' } })

# Make only npm@gmail.com admin
db.users.updateOne({ email: 'npm@gmail.com' }, { $set: { role: 'admin' } })
```

### Issue 3: Still showing wrong name

**Solution:**
1. Clear browser cache
2. Logout completely
3. Login again
4. Fresh token will fetch correct admin

## Verification Checklist

After running commands:

- [ ] Only npm@gmail.com has role: "admin"
- [ ] npm@gmail.com has status: "active"
- [ ] Backend restarted
- [ ] Logged out and logged in again
- [ ] Chat header shows "Support Team"
- [ ] NOT showing "gajendra"
- [ ] Console shows npm@gmail.com as admin

## Final Test

```bash
# Run this to verify everything
mongosh << EOF
use adrsmyapp
print("=== Admin Users ===")
db.users.find({ role: 'admin' }, { password: 0 }).forEach(printjson)
print("\n=== Total Admin Count ===")
print("Count:", db.users.countDocuments({ role: 'admin' }))
print("\n=== Should be 1 and email should be npm@gmail.com ===")
EOF
```

**Expected Output:**
```
=== Admin Users ===
{
  _id: ObjectId("..."),
  email: "npm@gmail.com",
  role: "admin",
  status: "active"
}

=== Total Admin Count ===
Count: 1

=== Should be 1 and email should be npm@gmail.com ===
```

## Success!

After fixing:
- ✅ Header shows "Support Team"
- ✅ Users chat with npm@gmail.com (admin)
- ✅ Admin (npm@gmail.com) can see all user chats
- ✅ No more "gajendra" showing

Run the commands and test! 🚀
