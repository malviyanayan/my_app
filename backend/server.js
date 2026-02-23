require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const session = require('express-session');
const passport = require('./config/passport');

const authRoutes = require('./routes/auth');
const health = require('./routes/health');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/product');

const app = express();
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



app.listen(3000, () => console.log('Server running on 3000'));
