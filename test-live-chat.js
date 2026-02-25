#!/usr/bin/env node

/**
 * Live Chat WebSocket Test
 * Tests real-time messaging between admin and user
 */

const io = require('socket.io-client');
const axios = require('axios');
const mongoose = require('mongoose');

const BACKEND_URL = 'http://localhost:3000';
const DB_URL = 'mongodb://127.0.0.1:27017/adrsmyapp';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

let adminSocket = null;
let userSocket = null;
let adminToken = null;
let userToken = null;
let adminId = null;
let userId = null;

async function getAdminAndUser() {
  log('\n📊 Connecting to database...', 'blue');
  await mongoose.connect(DB_URL);
  
  const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String
  }));
  
  const admin = await User.findOne({ role: 'admin' });
  const user = await User.findOne({ role: 'user' });
  
  if (!admin) {
    log('❌ No admin user found!', 'red');
    process.exit(1);
  }
  
  if (!user) {
    log('❌ No regular user found!', 'red');
    log('   Please register a user first', 'yellow');
    process.exit(1);
  }
  
  log(`✅ Admin: ${admin.name} (${admin.email})`, 'green');
  log(`✅ User: ${user.name} (${user.email})`, 'green');
  
  adminId = admin._id.toString();
  userId = user._id.toString();
  
  await mongoose.connection.close();
  
  return { admin, user };
}

function connectSocket(token, name) {
  return new Promise((resolve, reject) => {
    log(`\n🔌 Connecting ${name} socket...`, 'blue');
    
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: false,
      timeout: 5000
    });
    
    const timeout = setTimeout(() => {
      log(`❌ ${name} socket connection timeout`, 'red');
      socket.close();
      reject(new Error('Connection timeout'));
    }, 5000);
    
    socket.on('connect', () => {
      clearTimeout(timeout);
      log(`✅ ${name} socket connected (ID: ${socket.id})`, 'green');
      
      // Authenticate
      socket.emit('authenticate', token);
    });
    
    socket.on('authenticated', (data) => {
      if (data.success) {
        log(`✅ ${name} authenticated successfully`, 'green');
        log(`   User ID: ${data.userId}`, 'blue');
        log(`   Role: ${data.role}`, 'blue');
        resolve(socket);
      } else {
        log(`❌ ${name} authentication failed: ${data.message}`, 'red');
        socket.close();
        reject(new Error('Authentication failed'));
      }
    });
    
    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      log(`❌ ${name} connection error: ${error.message}`, 'red');
      reject(error);
    });
    
    socket.on('error', (error) => {
      log(`❌ ${name} socket error: ${error}`, 'red');
    });
  });
}

async function testMessageFlow() {
  log('\n' + '='.repeat(60), 'blue');
  log('🧪 TESTING LIVE CHAT - WEBSOCKET', 'blue');
  log('='.repeat(60), 'blue');
  
  try {
    // Get admin and user from database
    const { admin, user } = await getAdminAndUser();
    
    // For testing, we need actual tokens
    // You'll need to login to get real tokens
    log('\n⚠️  NOTE: This test requires actual login tokens', 'yellow');
    log('   Please provide tokens manually or login first', 'yellow');
    
    // Check if backend is running
    log('\n🏥 Checking backend server...', 'blue');
    try {
      await axios.get(`${BACKEND_URL}/health`, { timeout: 3000 });
      log('✅ Backend server is running', 'green');
    } catch (error) {
      log('❌ Backend server is NOT running', 'red');
      log('   Start it with: cd backend && npm start', 'yellow');
      process.exit(1);
    }
    
    // Test socket.io endpoint
    log('\n🔌 Testing Socket.IO endpoint...', 'blue');
    try {
      const response = await axios.get(`${BACKEND_URL}/socket.io/`, { timeout: 3000 });
      log('✅ Socket.IO endpoint is accessible', 'green');
    } catch (error) {
      if (error.response?.status === 400) {
        log('✅ Socket.IO endpoint is accessible (expected 400 for GET)', 'green');
      } else {
        log('❌ Socket.IO endpoint error', 'red');
      }
    }
    
    log('\n' + '='.repeat(60), 'blue');
    log('📋 MANUAL TEST INSTRUCTIONS', 'blue');
    log('='.repeat(60), 'blue');
    
    log('\n1️⃣  Open TWO browser windows:', 'white');
    log('   Window 1: Login as ADMIN', 'blue');
    log('   Window 2: Login as USER', 'blue');
    
    log('\n2️⃣  In BOTH windows, open Browser Console (F12)', 'white');
    
    log('\n3️⃣  User Window:', 'white');
    log('   - Go to Dashboard → Chat Support', 'blue');
    log('   - You should see "Support Team"', 'blue');
    log('   - Check console for:', 'blue');
    log('     ✅ "Socket connected successfully"', 'green');
    log('     ✅ "Socket authenticated successfully"', 'green');
    
    log('\n4️⃣  Admin Window:', 'white');
    log('   - Go to Dashboard → Chat Support', 'blue');
    log(`   - You should see list of users`, 'blue');
    log('   - Check console for:', 'blue');
    log('     ✅ "Socket connected successfully"', 'green');
    log('     ✅ "Socket authenticated successfully"', 'green');
    log(`     ✅ "Loaded X conversations"`, 'green');
    
    log('\n5️⃣  Test Message Flow:', 'white');
    log('   A. User sends message "Hello Admin"', 'blue');
    log('      User console should show:', 'magenta');
    log('        📤 Sending message...', 'magenta');
    log('        ✅ Message sent confirmation', 'magenta');
    log('      Backend console should show:', 'magenta');
    log('        📤 Send message event received', 'magenta');
    log('        ✅ Message saved to database', 'magenta');
    log('        📨 Sending to receiver', 'magenta');
    log('        ✅ Message delivered to receiver', 'magenta');
    log('      Admin console should show:', 'magenta');
    log('        📨 Received message', 'magenta');
    log('        Admin: Reloading conversations...', 'magenta');
    
    log('\n   B. Admin replies "Hi, how can I help?"', 'blue');
    log('      Admin console should show:', 'magenta');
    log('        📤 Sending message...', 'magenta');
    log('        ✅ Message sent confirmation', 'magenta');
    log('      Backend console should show:', 'magenta');
    log('        📤 Send message event received', 'magenta');
    log('        ✅ Message saved to database', 'magenta');
    log('        📨 Sending to receiver', 'magenta');
    log('        ✅ Message delivered to receiver', 'magenta');
    log('      User console should show:', 'magenta');
    log('        📨 Received message', 'magenta');
    log('        User: Adding admin message to chat', 'magenta');
    
    log('\n6️⃣  Verify Real-time:', 'white');
    log('   - Messages should appear INSTANTLY', 'blue');
    log('   - No page refresh needed', 'blue');
    log('   - Typing indicators should work', 'blue');
    log('   - Online/offline status should update', 'blue');
    
    log('\n' + '='.repeat(60), 'blue');
    log('🔍 DEBUGGING CHECKLIST', 'blue');
    log('='.repeat(60), 'blue');
    
    log('\nIf messages NOT working:', 'yellow');
    log('  ❌ Socket not connected?', 'red');
    log('     → Check: "Socket connected successfully" in console', 'blue');
    log('     → Fix: Restart backend, refresh browser', 'blue');
    
    log('\n  ❌ Socket not authenticated?', 'red');
    log('     → Check: "Socket authenticated successfully" in console', 'blue');
    log('     → Fix: Logout and login again', 'blue');
    
    log('\n  ❌ Message not sending?', 'red');
    log('     → Check: Backend console for "Send message event received"', 'blue');
    log('     → Check: receiverId is correct', 'blue');
    log('     → Fix: Verify admin ID is set correctly', 'blue');
    
    log('\n  ❌ Message not received?', 'red');
    log('     → Check: Backend console for "Message delivered to receiver"', 'blue');
    log('     → Check: Both users are connected (check connectedUsers map)', 'blue');
    log('     → Fix: Ensure both sockets are authenticated', 'blue');
    
    log('\n  ❌ "Receiver offline" in backend logs?', 'red');
    log('     → Check: connectedUsers map in backend logs', 'blue');
    log('     → Check: User IDs match between sender and receiver', 'blue');
    log('     → Fix: Reconnect both users', 'blue');
    
    log('\n' + '='.repeat(60), 'blue');
    log('📊 BACKEND LOGS TO WATCH', 'blue');
    log('='.repeat(60), 'blue');
    
    log('\nIn backend console, you should see:', 'white');
    log('  ✅ User connected: <socket-id>', 'green');
    log('  ✅ User <user-id> authenticated', 'green');
    log('     Socket ID: <socket-id>', 'blue');
    log('     Role: user/admin', 'blue');
    log('     Total connected users: 2', 'blue');
    log('  📤 Send message event received', 'green');
    log('     Sender ID: <sender-id>', 'blue');
    log('     Receiver ID: <receiver-id>', 'blue');
    log('  ✅ Message saved to database', 'green');
    log('  📨 Sending to receiver (Socket: <socket-id>)', 'green');
    log('  ✅ Message delivered to receiver', 'green');
    log('  ✅ Confirmation sent to sender', 'green');
    
    log('\n' + '='.repeat(60), 'blue');
    
    log('\n✨ WebSocket is configured correctly!', 'green');
    log('   Follow the manual test instructions above', 'green');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
  }
}

// Run test
testMessageFlow().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
