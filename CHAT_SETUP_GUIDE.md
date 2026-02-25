# Chat Support Backend Integration Guide

## ✅ What's Been Implemented

### Backend:
1. **Message Model** (`backend/models/Message.js`)
   - Stores chat messages between users
   - Tracks read/unread status
   - Indexed for performance

2. **Chat Routes** (`backend/routes/chat.js`)
   - GET `/api/chat/conversations` - Get all user conversations (admin)
   - GET `/api/chat/messages/:userId` - Get messages with specific user
   - POST `/api/chat/send` - Send message (REST fallback)
   - GET `/api/chat/unread-count` - Get unread message count
   - GET `/api/chat/admin` - Get admin user info

3. **Socket.io Integration** (`backend/server.js`)
   - Real-time messaging
   - User authentication via JWT
   - Online/offline status tracking
   - Typing indicators
   - Message read receipts

### Frontend:
1. **Socket Service** (`frontend/src/services/socket.js`)
   - Singleton socket connection manager
   - Event handlers for real-time features
   - Auto-reconnection logic

2. **Chat API Service** (`frontend/src/services/chatApi.js`)
   - REST API calls for chat history
   - Conversation management
   - Unread count tracking

## 🚀 Installation Steps

### Step 1: Install Frontend Dependencies
```bash
cd frontend
npm install socket.io-client
```

### Step 2: Verify Backend Dependencies
Backend already has socket.io installed. No action needed.

### Step 3: Start Backend Server
```bash
cd backend
npm run dev
```

### Step 4: Start Frontend Server
```bash
cd frontend
npm run dev
```

## 📋 Testing Checklist

### Before Testing:
- [ ] MongoDB is running
- [ ] Backend server is running on port 3000
- [ ] Frontend is running on port 5173
- [ ] At least one admin user exists in database
- [ ] At least one regular user exists in database

### Test Scenarios:

#### 1. User to Admin Chat:
- [ ] Login as regular user
- [ ] Navigate to Dashboard → Chat Support
- [ ] Send a message to admin
- [ ] Check if message appears in chat

#### 2. Admin to User Chat:
- [ ] Login as admin
- [ ] Navigate to Dashboard → Chat Support
- [ ] See list of users who sent messages
- [ ] Click on a user
- [ ] Send a reply
- [ ] Check if message appears

#### 3. Real-time Features:
- [ ] Open two browsers (one as user, one as admin)
- [ ] Send message from user
- [ ] Check if admin receives it instantly
- [ ] Reply from admin
- [ ] Check if user receives it instantly

#### 4. Online Status:
- [ ] Check if online indicator shows correctly
- [ ] Logout one user
- [ ] Check if status changes to offline

## 🔧 Next Steps to Complete Integration

### Update ChatSupport Component:

You need to update `frontend/src/components/dashboard/ChatSupport.jsx` to:

1. **Import services:**
```javascript
import socketService from '../../services/socket';
import * as chatApi from '../../services/chatApi';
```

2. **Connect socket on mount:**
```javascript
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    socketService.connect(token);
  }
  
  return () => {
    socketService.disconnect();
  };
}, []);
```

3. **Load conversations (admin):**
```javascript
useEffect(() => {
  if (role === 'admin') {
    loadConversations();
  }
}, [role]);

const loadConversations = async () => {
  try {
    const data = await chatApi.getConversations();
    // Transform data to match your usersList format
    setUsersList(data.map(conv => ({
      id: conv.userId,
      name: conv.name,
      email: conv.email,
      lastMessage: conv.lastMessage,
      timestamp: formatTime(conv.lastMessageTime),
      unread: conv.unreadCount,
      online: false // Will be updated via socket
    })));
  } catch (error) {
    console.error('Error loading conversations:', error);
  }
};
```

4. **Load messages when user selected:**
```javascript
const handleUserSelect = async (user) => {
  setSelectedUser(user);
  setShowChat(true);
  
  try {
    const data = await chatApi.getMessages(user.id);
    setMessages(data.map(msg => ({
      id: msg._id,
      sender: msg.sender._id === localStorage.getItem('userId') ? 'admin' : 'user',
      text: msg.message,
      timestamp: formatTime(msg.createdAt)
    })));
    
    // Mark as read
    socketService.markAsRead(user.id);
  } catch (error) {
    console.error('Error loading messages:', error);
  }
};
```

5. **Send message via socket:**
```javascript
const handleSendMessage = (e) => {
  e.preventDefault();
  if (!inputMessage.trim() || !selectedUser) return;

  const receiverId = role === 'user' ? adminId : selectedUser.id;
  socketService.sendMessage(receiverId, inputMessage);
  setInputMessage('');
};
```

6. **Listen for incoming messages:**
```javascript
useEffect(() => {
  socketService.onReceiveMessage((message) => {
    // Add message to chat if it's from current conversation
    if (selectedUser && message.sender._id === selectedUser.id) {
      setMessages(prev => [...prev, {
        id: message._id,
        sender: 'user',
        text: message.message,
        timestamp: formatTime(message.createdAt)
      }]);
    }
  });

  socketService.onMessageSent((message) => {
    // Add sent message to chat
    setMessages(prev => [...prev, {
      id: message._id,
      sender: role === 'admin' ? 'admin' : 'user',
      text: message.message,
      timestamp: formatTime(message.createdAt)
    }]);
  });

  return () => {
    socketService.removeAllListeners();
  };
}, [selectedUser, role]);
```

## 🔐 Security Notes

1. **JWT Authentication**: Socket connections are authenticated using JWT tokens
2. **Authorization**: Admin-only routes are protected
3. **Input Validation**: Messages are trimmed and validated
4. **CORS**: Configured for localhost:5173 only

## 🐛 Troubleshooting

### Socket not connecting:
- Check if backend is running
- Check browser console for errors
- Verify token is valid in localStorage

### Messages not sending:
- Check if socket is authenticated
- Verify receiverId is correct
- Check backend console for errors

### Real-time not working:
- Ensure both users are connected
- Check socket connection status
- Verify event listeners are set up

## 📝 Database Schema

### Message Collection:
```javascript
{
  _id: ObjectId,
  sender: ObjectId (ref: User),
  receiver: ObjectId (ref: User),
  message: String,
  read: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Features Implemented

✅ Real-time messaging via Socket.io
✅ Message persistence in MongoDB
✅ Online/offline status tracking
✅ Unread message count
✅ Message read receipts
✅ Typing indicators (backend ready)
✅ Auto-reconnection
✅ JWT authentication for sockets
✅ Admin-user chat separation
✅ Conversation history
✅ REST API fallback

## 🚧 Optional Enhancements

- [ ] File/image sharing
- [ ] Message deletion
- [ ] Message editing
- [ ] Emoji support
- [ ] Push notifications
- [ ] Message search
- [ ] Chat history pagination
- [ ] Group chat support
- [ ] Voice messages
- [ ] Video call integration

## 📞 Support

If you encounter any issues:
1. Check backend console for errors
2. Check browser console for errors
3. Verify MongoDB is running
4. Ensure all dependencies are installed
5. Check CORS configuration
