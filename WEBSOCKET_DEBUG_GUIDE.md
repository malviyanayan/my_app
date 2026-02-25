# WebSocket Live Chat - Debug Guide 🔍

## Quick Verification

### Step 1: Check Backend Console
Backend start karo aur yeh logs dekhne chahiye:
```bash
cd backend
npm start
```

Expected output:
```
Server running on 3000
DB Connected
```

### Step 2: Check Socket.IO Endpoint
```bash
curl http://localhost:3000/socket.io/
```
Should return: `{"code":0,"message":"Transport unknown"}`
(Yeh normal hai - means Socket.IO is running)

### Step 3: Open Browser Console (F12)

#### User Browser:
1. Login as user
2. Go to Chat Support
3. Console me yeh dikhna chahiye:
```
Connecting socket with token...
Creating new socket connection...
Socket connected
✅ User <id> authenticated
   Socket ID: <socket-id>
   Role: user
Socket authenticated successfully
```

#### Admin Browser:
1. Login as admin
2. Go to Chat Support
3. Console me yeh dikhna chahiye:
```
Connecting socket with token...
Creating new socket connection...
Socket connected
✅ User <id> authenticated
   Socket ID: <socket-id>
   Role: admin
Socket authenticated successfully
🔄 Loading conversations for admin...
✅ Loaded X conversations
```

## Message Flow Test

### User Sends Message:

**User Console:**
```
Sending message...
Selected User: {id: "...", name: "Support Team"}
Admin ID: <admin-id>
Role: user
Receiver ID: <admin-id>
Message: Hello Admin
```

**Backend Console:**
```
📤 Send message event received
   Sender ID: <user-id>
   Receiver ID: <admin-id>
   Message: Hello Admin
✅ Message saved to database (ID: <message-id>)
📨 Sending to receiver (Socket: <admin-socket-id>)
✅ Message delivered to receiver
✅ Confirmation sent to sender
```

**Admin Console:**
```
📨 Received message: {sender: {...}, message: "Hello Admin"}
Current role: admin
Admin: Reloading conversations...
Adding message to current chat
```

### Admin Replies:

**Admin Console:**
```
Sending message...
Selected User: {id: "<user-id>", name: "John Doe"}
Role: admin
Receiver ID: <user-id>
Message: Hi, how can I help?
```

**Backend Console:**
```
📤 Send message event received
   Sender ID: <admin-id>
   Receiver ID: <user-id>
   Message: Hi, how can I help?
✅ Message saved to database (ID: <message-id>)
📨 Sending to receiver (Socket: <user-socket-id>)
✅ Message delivered to receiver
✅ Confirmation sent to sender
```

**User Console:**
```
📨 Received message: {sender: {...}, message: "Hi, how can I help?"}
Current role: user
User: Adding admin message to chat
```

## Common Issues & Fixes

### ❌ Issue 1: "Socket not connected"

**Symptoms:**
- Console shows: "Socket disconnected"
- Connection status: "disconnected"

**Check:**
```javascript
// In browser console
socketService.isConnected()
// Should return: true
```

**Fix:**
1. Restart backend server
2. Hard refresh browser (Ctrl+Shift+R)
3. Clear localStorage and login again

### ❌ Issue 2: "Socket authentication failed"

**Symptoms:**
- Console shows: "Socket authentication failed: Invalid token"
- Messages not sending

**Check:**
```javascript
// In browser console
localStorage.getItem('token')
// Should return a JWT token
```

**Fix:**
1. Logout and login again
2. Check if token is expired
3. Verify JWT_SECRET in backend .env

### ❌ Issue 3: "Receiver offline"

**Symptoms:**
- Backend shows: "⚠️ Receiver offline"
- Messages not delivered in real-time

**Check Backend Console:**
```
Connected users: Map(2) {
  '<user-id>' => '<socket-id>',
  '<admin-id>' => '<socket-id>'
}
```

**Fix:**
1. Ensure both users are connected
2. Check if user IDs match
3. Reconnect both users (refresh browsers)

### ❌ Issue 4: Messages not appearing

**Symptoms:**
- Message sent but not visible
- No errors in console

**Check:**
1. **User side:**
   ```javascript
   // Console should show
   selectedUser: {id: "<admin-id>", name: "Support Team"}
   adminId: "<admin-id>"
   ```

2. **Admin side:**
   ```javascript
   // Console should show
   selectedUser: {id: "<user-id>", name: "John Doe"}
   ```

**Fix:**
1. Verify selectedUser is set correctly
2. Check if adminId is loaded for users
3. Reload conversations list

### ❌ Issue 5: "Unable to connect to support team"

**Symptoms:**
- User sees error message
- adminId is null

**Check:**
```bash
# In MongoDB
mongosh adrsmyapp
db.users.findOne({ role: 'admin' })
```

**Fix:**
1. Create admin user if missing
2. Restart backend
3. Refresh user browser

## WebSocket Configuration

### Backend (server.js)
```javascript
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  }
});
```
✅ CORS configured correctly
✅ Credentials enabled

### Frontend (socket.js)
```javascript
this.socket = io('http://localhost:3000', {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling']
});
```
✅ Auto-connect enabled
✅ Reconnection enabled
✅ Both transports available

## Testing Checklist

### Pre-flight Checks:
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] MongoDB running
- [ ] Admin user exists
- [ ] At least one regular user exists

### Connection Checks:
- [ ] User socket connects
- [ ] User socket authenticates
- [ ] Admin socket connects
- [ ] Admin socket authenticates
- [ ] Both users in connectedUsers map

### Message Flow Checks:
- [ ] User can send message
- [ ] Backend receives message
- [ ] Backend saves to database
- [ ] Backend sends to admin socket
- [ ] Admin receives message in real-time
- [ ] Admin can reply
- [ ] User receives reply in real-time

### UI Checks:
- [ ] Messages appear instantly
- [ ] No page refresh needed
- [ ] Typing indicators work
- [ ] Online/offline status updates
- [ ] Unread counts update
- [ ] Conversations list updates

## Advanced Debugging

### Enable Socket.IO Debug Mode

**Backend:**
```bash
DEBUG=socket.io* npm start
```

**Frontend:**
```javascript
// In browser console
localStorage.debug = 'socket.io-client:*';
// Then refresh page
```

### Monitor Network Traffic

1. Open DevTools (F12)
2. Go to Network tab
3. Filter: "WS" (WebSocket)
4. Look for: `ws://localhost:3000/socket.io/`
5. Check frames for messages

### Check Database

```javascript
// In mongosh
use adrsmyapp

// Check recent messages
db.messages.find().sort({createdAt: -1}).limit(5)

// Check connected users
db.users.find({}, {name: 1, email: 1, role: 1})

// Count unread messages
db.messages.countDocuments({read: false})
```

## Success Indicators

When everything works:
- ✅ Both sockets connect within 1 second
- ✅ Authentication happens immediately
- ✅ Messages deliver in < 100ms
- ✅ No errors in any console
- ✅ Real-time updates work perfectly
- ✅ Typing indicators appear/disappear
- ✅ Online status updates instantly

## Performance Metrics

**Good Performance:**
- Socket connection: < 1 second
- Authentication: < 500ms
- Message delivery: < 100ms
- UI update: < 50ms

**If slower:**
- Check network latency
- Check database performance
- Check server load

## Still Not Working?

Run comprehensive test:
```bash
node test-live-chat.js
```

This will:
1. Check backend server
2. Check Socket.IO endpoint
3. Verify database users
4. Provide detailed test instructions
5. Show expected logs

---

**Remember:** WebSocket is ALREADY configured correctly. If not working, it's usually:
1. Backend not running
2. Token expired/invalid
3. Users not connected
4. Browser cache issue

**Quick Fix:** Restart backend + Hard refresh browser (Ctrl+Shift+R)
