require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const session = require('express-session');
const passport = require('./config/passport');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/auth');
const health = require('./routes/health');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/product');
const chatRoutes = require('./routes/chat');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  }
});

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL (Vite)
    credentials: true,
  })
);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files for product images
app.use('/images/products', express.static('F:\\adrs\\images\\myapp\\products'));

mongoose.connect('mongodb://127.0.0.1:27017/adrsmyapp')
.then(() => console.log('DB Connected'));

app.use('/api/auth', authRoutes);
app.use('/', health);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);

// Socket.io connection handling
const connectedUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Authenticate socket connection
  socket.on('authenticate', async (token) => {
    try {
      if (!token) {
        console.error('❌ No token provided for authentication');
        socket.emit('authenticated', { success: false, message: 'No token provided' });
        return;
      }

      const SECRET = process.env.JWT_SECRET || 'mysecretkey';
      const decoded = jwt.verify(token, SECRET);
      socket.userId = decoded.id; // Changed from decoded.userId to decoded.id
      socket.userRole = decoded.role;
      
      // Store user's socket connection
      connectedUsers.set(decoded.id, socket.id);
      
      console.log(`✅ User ${decoded.id} authenticated`);
      console.log(`   Socket ID: ${socket.id}`);
      console.log(`   Role: ${decoded.role}`);
      console.log(`   Name: ${decoded.name || 'N/A'}`);
      console.log(`   Total connected users: ${connectedUsers.size}`);
      
      socket.emit('authenticated', { success: true, userId: decoded.id, role: decoded.role });
      
      // Notify all users that this user is online
      io.emit('user-online', { userId: decoded.id });
    } catch (error) {
      console.error('❌ Socket authentication error:', error.message);
      socket.emit('authenticated', { success: false, message: 'Invalid token' });
    }
  });

  // Send message
  socket.on('send-message', async (data) => {
    try {
      const { receiverId, message } = data;
      
      console.log('\n📤 ===== SEND MESSAGE EVENT =====');
      console.log('   Sender ID:', socket.userId);
      console.log('   Sender Role:', socket.userRole);
      console.log('   Receiver ID:', receiverId);
      console.log('   Message:', message?.substring(0, 50) + (message?.length > 50 ? '...' : ''));
      
      if (!socket.userId) {
        console.error('❌ Socket not authenticated');
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      if (!receiverId || !message) {
        console.error('❌ Missing receiverId or message');
        socket.emit('error', { message: 'Receiver ID and message are required' });
        return;
      }

      // Convert receiverId to ObjectId if it's a string
      const mongoose = require('mongoose');
      const receiverObjectId = mongoose.Types.ObjectId.isValid(receiverId) 
        ? new mongoose.Types.ObjectId(receiverId) 
        : receiverId;

      // Save message to database
      const newMessage = new Message({
        sender: socket.userId,
        receiver: receiverObjectId,
        message: message.trim()
      });

      await newMessage.save();
      await newMessage.populate('sender', 'name email');
      await newMessage.populate('receiver', 'name email');

      console.log('✅ Message saved to database');
      console.log('   Message ID:', newMessage._id);
      console.log('   Sender:', newMessage.sender.name, '(' + newMessage.sender._id + ')');
      console.log('   Receiver:', newMessage.receiver.name, '(' + newMessage.receiver._id + ')');

      // Send to receiver if online (check both string and ObjectId formats)
      const receiverSocketId = connectedUsers.get(receiverId) || 
                               connectedUsers.get(receiverObjectId.toString());
      
      console.log('   Looking for receiver socket...');
      console.log('   Receiver ID (string):', receiverId);
      console.log('   Receiver ID (ObjectId):', receiverObjectId.toString());
      console.log('   Connected users:', Array.from(connectedUsers.entries()));
      console.log('   Receiver socket ID:', receiverSocketId || 'NOT FOUND');
      
      if (receiverSocketId) {
        console.log('📨 Sending to receiver socket:', receiverSocketId);
        io.to(receiverSocketId).emit('receive-message', {
          _id: newMessage._id,
          sender: newMessage.sender,
          receiver: newMessage.receiver,
          message: newMessage.message,
          createdAt: newMessage.createdAt,
          read: newMessage.read
        });
        console.log('✅ Message delivered to receiver');
      } else {
        console.log('⚠️  Receiver offline or not connected');
      }

      // Send confirmation to sender
      socket.emit('message-sent', {
        _id: newMessage._id,
        sender: newMessage.sender,
        receiver: newMessage.receiver,
        message: newMessage.message,
        createdAt: newMessage.createdAt,
        read: newMessage.read
      });
      console.log('✅ Confirmation sent to sender');
      console.log('===== END SEND MESSAGE =====\n');

    } catch (error) {
      console.error('❌ Error sending message:', error.message);
      console.error(error.stack);
      socket.emit('error', { message: 'Failed to send message', error: error.message });
    }
  });

  // Mark messages as read
  socket.on('mark-read', async (data) => {
    try {
      const { senderId } = data;
      
      if (!socket.userId) {
        return;
      }

      await Message.updateMany(
        {
          sender: senderId,
          receiver: socket.userId,
          read: false
        },
        { read: true }
      );

      // Notify sender that messages were read
      const senderSocketId = connectedUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messages-read', {
          readBy: socket.userId
        });
      }

    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { receiverId } = data;
    const receiverSocketId = connectedUsers.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user-typing', {
        userId: socket.userId
      });
    }
  });

  socket.on('stop-typing', (data) => {
    const { receiverId } = data;
    const receiverSocketId = connectedUsers.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user-stop-typing', {
        userId: socket.userId
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      io.emit('user-offline', { userId: socket.userId });
      console.log(`❌ User ${socket.userId} disconnected`);
      console.log(`Total connected users: ${connectedUsers.size}`);
    }
    console.log('Socket disconnected:', socket.id);
  });
});

server.listen(3000, () => console.log('Server running on 3000'));
