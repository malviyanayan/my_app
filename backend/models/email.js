const express = require("express");
const emailService = require("./emailer");

const router = express.Router();

router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000);

  // save OTP to DB here (async/await)
  

  // fire and forget (does not block response)
  emailService.sendOTP(email, otp)
    .then(() => console.log("OTP mail sent"))
    .catch(err => console.error("Mail error:", err.message));

  res.json({ success: true, message: "OTP sent" });
});