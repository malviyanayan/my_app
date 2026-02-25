#!/usr/bin/env node

/**
 * Chat Support System Test Script
 * Tests backend connectivity, database, and socket functionality
 */

const mongoose = require('mongoose');
const axios = require('axios');

const BACKEND_URL = 'http://localhost:3000';
const DB_URL = 'mongodb://127.0.0.1:27017/adrsmyapp';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testDatabaseConnection() {
  log('\n📊 Testing Database Connection...', 'blue');
  try {
    await mongoose.connect(DB_URL);
    log('✅ Database connected successfully', 'green');
    return true;
  } catch (error) {
    log(`❌ Database connection failed: ${error.message}`, 'red');
    return false;
  }
}

async function checkAdminUser() {
  log('\n👤 Checking for Admin User...', 'blue');
  try {
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      role: String
    }));
    
    const admin = await User.findOne({ role: 'admin' });
    
    if (admin) {
      log(`✅ Admin user found: ${admin.name} (${admin.email})`, 'green');
      log(`   Admin ID: ${admin._id}`, 'blue');
      return admin;
    } else {
      log('❌ No admin user found in database', 'red');
      log('   Please create an admin user first', 'yellow');
      return null;
    }
  } catch (error) {
    log(`❌ Error checking admin: ${error.message}`, 'red');
    return null;
  }
}

async function testBackendHealth() {
  log('\n🏥 Testing Backend Server...', 'blue');
  try {
    const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
    log('✅ Backend server is running', 'green');
    log(`   Status: ${response.data.status}`, 'blue');
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('❌ Backend server is not running', 'red');
      log('   Please start the server: cd backend && npm start', 'yellow');
    } else {
      log(`❌ Backend health check failed: ${error.message}`, 'red');
    }
    return false;
  }
}

async function testChatEndpoints(token) {
  log('\n🔌 Testing Chat API Endpoints...', 'blue');
  
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
  try {
    // Test admin endpoint
    const adminResponse = await axios.get(`${BACKEND_URL}/api/chat/admin`, { headers });
    log('✅ GET /api/chat/admin - Working', 'green');
    log(`   Admin: ${adminResponse.data.name}`, 'blue');
  } catch (error) {
    log(`❌ GET /api/chat/admin - Failed: ${error.response?.status || error.message}`, 'red');
  }
  
  try {
    // Test conversations endpoint
    const convResponse = await axios.get(`${BACKEND_URL}/api/chat/conversations`, { headers });
    log('✅ GET /api/chat/conversations - Working', 'green');
    log(`   Conversations: ${convResponse.data.length}`, 'blue');
  } catch (error) {
    log(`❌ GET /api/chat/conversations - Failed: ${error.response?.status || error.message}`, 'red');
  }
}

async function checkMessages() {
  log('\n💬 Checking Messages in Database...', 'blue');
  try {
    const Message = mongoose.model('Message', new mongoose.Schema({
      sender: mongoose.Schema.Types.ObjectId,
      receiver: mongoose.Schema.Types.ObjectId,
      message: String,
      read: Boolean,
      createdAt: Date
    }));
    
    const messageCount = await Message.countDocuments();
    log(`✅ Total messages in database: ${messageCount}`, 'green');
    
    if (messageCount > 0) {
      const recentMessages = await Message.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('sender', 'name email')
        .populate('receiver', 'name email');
      
      log('\n   Recent messages:', 'blue');
      recentMessages.forEach((msg, i) => {
        log(`   ${i + 1}. ${msg.sender?.name || 'Unknown'} → ${msg.receiver?.name || 'Unknown'}`, 'blue');
        log(`      "${msg.message.substring(0, 50)}${msg.message.length > 50 ? '...' : ''}"`, 'blue');
      });
    }
    
    return messageCount;
  } catch (error) {
    log(`❌ Error checking messages: ${error.message}`, 'red');
    return 0;
  }
}

async function testSocketConnection() {
  log('\n🔌 Testing Socket.IO Connection...', 'blue');
  try {
    const io = require('socket.io-client');
    const socket = io(BACKEND_URL, {
      transports: ['websocket'],
      timeout: 5000
    });
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        log('❌ Socket connection timeout', 'red');
        socket.close();
        resolve(false);
      }, 5000);
      
      socket.on('connect', () => {
        clearTimeout(timeout);
        log('✅ Socket.IO connection successful', 'green');
        log(`   Socket ID: ${socket.id}`, 'blue');
        socket.close();
        resolve(true);
      });
      
      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        log(`❌ Socket connection error: ${error.message}`, 'red');
        socket.close();
        resolve(false);
      });
    });
  } catch (error) {
    log(`❌ Socket test failed: ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('='.repeat(60), 'blue');
  log('🧪 CHAT SUPPORT SYSTEM - DIAGNOSTIC TEST', 'blue');
  log('='.repeat(60), 'blue');
  
  const results = {
    database: false,
    backend: false,
    admin: false,
    socket: false,
    messages: 0
  };
  
  // Test 1: Database
  results.database = await testDatabaseConnection();
  
  if (results.database) {
    // Test 2: Admin User
    results.admin = await checkAdminUser();
    
    // Test 3: Messages
    results.messages = await checkMessages();
  }
  
  // Test 4: Backend Server
  results.backend = await testBackendHealth();
  
  if (results.backend) {
    // Test 5: Chat Endpoints
    await testChatEndpoints();
    
    // Test 6: Socket Connection
    results.socket = await testSocketConnection();
  }
  
  // Summary
  log('\n' + '='.repeat(60), 'blue');
  log('📋 TEST SUMMARY', 'blue');
  log('='.repeat(60), 'blue');
  
  log(`Database Connection: ${results.database ? '✅ PASS' : '❌ FAIL'}`, results.database ? 'green' : 'red');
  log(`Backend Server: ${results.backend ? '✅ PASS' : '❌ FAIL'}`, results.backend ? 'green' : 'red');
  log(`Admin User Exists: ${results.admin ? '✅ PASS' : '❌ FAIL'}`, results.admin ? 'green' : 'red');
  log(`Socket.IO Connection: ${results.socket ? '✅ PASS' : '❌ FAIL'}`, results.socket ? 'green' : 'red');
  log(`Messages in Database: ${results.messages}`, 'blue');
  
  const allPassed = results.database && results.backend && results.admin && results.socket;
  
  if (allPassed) {
    log('\n🎉 All tests passed! Chat system should be working.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please fix the issues above.', 'yellow');
    
    if (!results.backend) {
      log('\n💡 Start backend server: cd backend && npm start', 'yellow');
    }
    if (!results.admin) {
      log('💡 Create admin user: See CREATE_ADMIN_USER.md', 'yellow');
    }
  }
  
  log('\n' + '='.repeat(60), 'blue');
  
  // Cleanup
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
