# Make npm@gmail.com Admin

## Quick Command

Run this single command to make npm@gmail.com an admin:

```bash
mongosh --eval 'use adrsmyapp; db.users.updateOne({email:"npm@gmail.com"}, {$set:{role:"admin",status:"active"}}); db.users.findOne({email:"npm@gmail.com"}, {password:0})'
```

## Or Step by Step

```bash
# Open MongoDB shell
mongosh

# Switch to database
use adrsmyapp

# Make npm@gmail.com admin
db.users.updateOne(
  { email: "npm@gmail.com" },
  { $set: { role: "admin", status: "active" } }
)

# Verify it worked
db.users.findOne({ email: "npm@gmail.com" }, { password: 0 })

# Exit
exit
```

## Expected Output

```javascript
{
  _id: ObjectId("..."),
  name: "...",
  email: "npm@gmail.com",
  role: "admin",        // ✅ Should be "admin"
  status: "active",     // ✅ Should be "active"
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

## After Running Command

1. **Restart Backend:**
```bash
cd backend
npm run dev
```

2. **Refresh Frontend:**
   - Press F5 in browser

3. **Test Chat:**
   - Login as any user
   - Go to Dashboard → Chat Support
   - ✅ Input box should be enabled
   - ✅ Can send messages

## Verify Admin Endpoint

```bash
# Get your token from browser console
TOKEN="your-jwt-token"

# Test admin endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/chat/admin
```

**Expected Response:**
```json
{
  "_id": "...",
  "name": "...",
  "email": "npm@gmail.com"
}
```

## Browser Console Check

After refreshing, you should see:
```
Fetching admin info...
Token: exists
Role: user
Admin info received: { _id: "...", name: "...", email: "npm@gmail.com" }
Loading messages with admin: ...
✅ Chat enabled!
```

## Success!

Once you run the command:
- ✅ npm@gmail.com will be admin
- ✅ Users can send messages to support
- ✅ Admin can see and reply to messages
- ✅ Chat support fully functional

Run the command now and test! 🚀
