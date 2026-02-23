const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailService = require("../models/emailer");
const passport = require('passport');

const SECRET = "mysecretkey";

const generateCode = (length = 15) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
};





// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword)
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });

    if (newPassword.length < 6)
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "Invalid reset request"
      });

    // Match token with otp field
    if (user.otp !== token)
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = null; // clear token after use

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});



// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    const token = generateCode(); // 15 char code

    // Save token in otp field
    user.otp = token;
    await user.save();

    const resetLink =
      "http://localhost:5173/auth/reset-password?email=" +
      email +
      "&token=" +
      token;

    // fire and forget
    void emailService.sendOTP(email, resetLink);

    return res.status(200).json({
      success: true,
      message: "Password reset link sent"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Resend Verification
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    if (user.status === "active")
      return res.status(400).json({
        success: false,
        message: "Account already verified"
      });

    const newCode = generateCode();

    user.otp = newCode;
    await user.save();

    const verification_link =
      "http://localhost:5173/auth/verify?email=" +
      email +
      "&code=" +
      newCode;

    // fire and forget
    void emailService.sendOTP(email, verification_link);

    return res.status(200).json({
      success: true,
      message: "Verification email resent"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Validation
const validateRegister = ({ name, email, password }) => {
  if (!name || !email || !password)
    return "All fields are required";

  if (password.length < 6)
    return "Password must be at least 6 characters";

  return null;
};

const validateLogin = ({ email, password }) => {
  if (!email || !password)
    return "Email and password are required";

  return null;
};





// Verify Email
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code)
      return res.status(400).json({
        success: false,
        message: "Email and code are required"
      });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    if (user.status === "active")
      return res.status(400).json({
        success: false,
        message: "Account already verified"
      });

    if (user.otp !== code)
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code"
      });

    user.status = "active";
    user.otp = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});




// Register
router.post('/register', async (req, res) => {
  try {
    const error = validateRegister(req.body);
    if (error)
      return res.status(400).json({ success: false, message: error });

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({
        success: false,
        message: "User already exists"
      });

    const hashedPassword = await bcrypt.hash(password, 10);

    const verification_code = generateCode();

    console.log("jai ho")
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      otp : verification_code
    });
    console.log("jai ho")


    const verification_link = "http://localhost:5173/auth/verify?email=" + email + "&code=" + verification_code
    
    // fire and forget (does not block response)
    try{
      emailService.sendOTP(email, verification_link)
      .then(() => console.log("OTP mail sent"))
      .catch(err => console.error("Mail error:", err.message));
    }catch(err){
      console.log(err)
    }


    return res.status(201).json({
      success: true,
      message: "User registered successfully"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const error = validateLogin(req.body);
    if (error)
      return res.status(400).json({ success: false, message: error });

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });

    // check verification status
    if (user.status === "unverified")
      return res.status(403).json({
        success: false,
        message: "Account not verified. Please verify OTP."
      });

    if (user.status === "Blocked")
      return res.status(403).json({
        success: false,
        message: "Account is blocked."
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      token,
      role: user.role
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = router;


// Google OAuth Routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:5173/auth',
    session: true,
  }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { id: req.user._id, role: req.user.role },
        SECRET,
        { expiresIn: '1d' }
      );

      // Redirect to frontend with token
      res.redirect(`http://localhost:5173/auth/google/success?token=${token}&role=${req.user.role}&name=${encodeURIComponent(req.user.name)}`);
    } catch (error) {
      res.redirect('http://localhost:5173/auth?error=authentication_failed');
    }
  }
);
