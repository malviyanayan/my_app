# 🚀 Chat Support - Quick Start

## Sabse Pehle Yeh Karein

### 1. Test Script Chalayein
```bash
node test-chat-system.js
```

Yeh script check karega:
- ✅ Database connection
- ✅ Backend server
- ✅ Admin user exists
- ✅ Socket.io working
- ✅ Messages in database

### 2. Agar Test Fail Ho

#### Backend Not Running?
```bash
cd backend
npm start
```

#### Frontend Not Running?
```bash
cd frontend
npm run dev
```

#### Admin User Nahi Hai?
MongoDB me check karein:
```bash
mongosh adrsmyapp
db.users.findOne({ role: 'admin' })
```

Agar nahi hai toh create karein (see CREATE_ADMIN_USER.md)

### 3. Manual Testing

#### User Side:
1. Login as regular user
2. Dashboard → Chat Support
3. Message bhejein "Hello Support"
4. Browser console check karein (F12)

#### Admin Side:
1. Login as admin
2. Dashboard → Chat Support
3. User ka message dikhna chahiye
4. Reply bhejein

### 4. Agar Kaam Nahi Kar Raha

**Browser Console Check Karein (F12):**
- Socket connected? ✅
- Token present? ✅
- Any errors? ❌

**Backend Logs Check Karein:**
- User authenticated? ✅
- Message saved? ✅
- Message delivered? ✅

### 5. Common Fixes

**"Unable to connect to support team"**
→ Admin user create karein

**"Connection lost"**
→ Backend server start karein

**Messages not sending**
→ Token check karein, logout/login karein

**Messages not received**
→ Dono users online hone chahiye

## 📚 Detailed Guides

- `CHAT_SUPPORT_FIX_GUIDE.md` - Complete fix guide
- `CHAT_SUPPORT_DIAGNOSIS.md` - Issue diagnosis
- `test-chat-system.js` - Automated testing
- `fix-chat-support.ps1` - Windows diagnostic

## ✅ Success Indicators

Jab sab kuch sahi hoga:
- ✅ User instantly admin ko message bhej sakta hai
- ✅ Admin real-time me message receive karta hai
- ✅ Admin reply instantly user ko milta hai
- ✅ Typing indicators dikhte hain
- ✅ Online/offline status updates hota hai

## 🆘 Help Needed?

Agar abhi bhi issue hai:
1. Run: `node test-chat-system.js`
2. Share output
3. Share browser console errors
4. Share backend logs

---

**Quick Command:**
```bash
# Everything check karne ke liye
node test-chat-system.js
```
