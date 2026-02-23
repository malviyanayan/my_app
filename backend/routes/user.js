const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const User = require('../models/User');

router.get('/dashboard', auth, role('user'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = router;
