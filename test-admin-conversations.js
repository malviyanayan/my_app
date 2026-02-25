#!/usr/bin/env node

/**
 * Test Admin Conversations List
 * Verifies that admin can see all users, not just those who have sent messages
 */

const mongoose = require('mongoose');
const axios = require('axios');

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

async function testAdminConversations() {
  log('\n' + '='.repeat(60), 'blue');
  log('🧪 TESTING ADMIN CONVERSATIONS LIST', 'blue');
  log('='.repeat(60), 'blue');

  try {
    // Connect to database
    log('\n📊 Connecting to database...', 'blue');
    await mongoose.connect(DB_URL);
    log('✅ Database connected', 'green');

    // Define schemas
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      role: String,
      status: String,
      createdAt: Date
    }));

    const Message = mongoose.model('Message', new mongoose.Schema({
      sender: mongoose.Schema.Types.ObjectId,
      receiver: mongoose.Schema.Types.ObjectId,
      message: String,
      read: Boolean,
      createdAt: Date
    }));

    // Get admin user
    log('\n👤 Finding admin user...', 'blue');
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      log('❌ No admin user found!', 'red');
      log('   Please create an admin user first', 'yellow');
      process.exit(1);
    }
    
    log(`✅ Admin found: ${admin.name} (${admin.email})`, 'green');
    log(`   Admin ID: ${admin._id}`, 'blue');

    // Count all non-admin users
    log('\n👥 Checking all users...', 'blue');
    const allUsers = await User.find({ 
      role: { $ne: 'admin' },
      _id: { $ne: admin._id }
    }).select('name email status createdAt');
    
    log(`✅ Total non-admin users: ${allUsers.length}`, 'green');
    
    if (allUsers.length === 0) {
      log('⚠️  No regular users found in database', 'yellow');
      log('   Register some users to test conversations', 'yellow');
    } else {
      log('\n   Users list:', 'blue');
      allUsers.forEach((user, i) => {
        log(`   ${i + 1}. ${user.name} (${user.email}) - ${user.status}`, 'blue');
      });
    }

    // Check messages
    log('\n💬 Checking messages...', 'blue');
    const messagesWithAdmin = await Message.find({
      $or: [
        { sender: admin._id },
        { receiver: admin._id }
      ]
    }).populate('sender', 'name email').populate('receiver', 'name email');

    log(`✅ Total messages involving admin: ${messagesWithAdmin.length}`, 'green');

    // Find users who have messaged
    const usersWhoMessaged = new Set();
    messagesWithAdmin.forEach(msg => {
      if (msg.sender._id.toString() !== admin._id.toString()) {
        usersWhoMessaged.add(msg.sender._id.toString());
      }
      if (msg.receiver._id.toString() !== admin._id.toString()) {
        usersWhoMessaged.add(msg.receiver._id.toString());
      }
    });

    log(`   Users who have sent/received messages: ${usersWhoMessaged.size}`, 'blue');
    log(`   Users who haven't messaged yet: ${allUsers.length - usersWhoMessaged.size}`, 'blue');

    // Test API endpoint
    log('\n🔌 Testing /api/chat/conversations endpoint...', 'blue');
    log('   Note: This requires admin authentication token', 'yellow');
    log('   If you have a token, you can test manually:', 'yellow');
    log('   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/chat/conversations', 'magenta');

    // Summary
    log('\n' + '='.repeat(60), 'blue');
    log('📋 SUMMARY', 'blue');
    log('='.repeat(60), 'blue');
    
    log(`\nTotal Users (excluding admin): ${allUsers.length}`, 'blue');
    log(`Users with messages: ${usersWhoMessaged.size}`, 'blue');
    log(`Users without messages: ${allUsers.length - usersWhoMessaged.size}`, 'blue');
    
    if (allUsers.length > 0) {
      log('\n✅ Admin should see ALL these users in conversations list', 'green');
      log('   Even if they haven\'t sent any messages yet', 'green');
      log('   Users without messages will show "No messages yet"', 'green');
    } else {
      log('\n⚠️  No users to display in conversations', 'yellow');
      log('   Register some users first to test the feature', 'yellow');
    }

    log('\n' + '='.repeat(60), 'blue');
    log('🧪 TEST INSTRUCTIONS', 'blue');
    log('='.repeat(60), 'blue');
    log('\n1. Login as admin in the frontend', 'white');
    log('2. Go to Dashboard → Chat Support', 'white');
    log(`3. You should see ${allUsers.length} user(s) in the list`, 'white');
    log('4. Click on any user to start chatting', 'white');
    log('5. Users without messages will show "No messages yet"', 'white');
    log('\n' + '='.repeat(60), 'blue');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

// Run test
testAdminConversations().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
