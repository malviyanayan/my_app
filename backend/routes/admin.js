const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const User = require('../models/User');



router.post('/createuser', auth, role('admin'), async (req, res) => {
  try {
    const { name, email, password, role: userRole } = req.body;

    if (!name || !email || !password || !userRole) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 3 and 50 characters'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    if (!['user', 'admin'].includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role value'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: userRole
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});



router.delete('/deleteuser/:id', auth, role('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


router.put('/updateuser/:id', auth, role('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role: userRole, status } = req.body;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id'
      });
    }

    const updateData = {};

    updateData.status = status

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Name must be between 3 and 50 characters'
        });
      }
      updateData.name = name.trim();
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use'
        });
      }

      updateData.email = email.toLowerCase().trim();
    }

    if (password !== undefined) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters'
        });
      }
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (userRole !== undefined) {
      if (!['user', 'admin'].includes(userRole)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role value'
        });
      }
      updateData.role = userRole;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});




// Admin Dashboard
router.get('/dashboard', auth, role('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins
      }
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});



// GET /all_users?page=1
router.get('/getusers', auth, role('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const users = await User.find({ role: 'user' })
      .select('_id name email createdAt updatedAt status')
      .sort({ createdAt: -1 }) // recent first
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ role: 'user' });

    return res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data: users
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});


// Get single user
router.get('/users/:id', auth, role('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Delete user
router.delete('/users/:id', auth, role('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Change user role
router.patch('/users/:id/role', auth, role('admin'), async (req, res) => {
  try {
    const { role: newRole } = req.body;

    if (!["user", "admin"].includes(newRole))
      return res.status(400).json({ success: false, message: "Invalid role" });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: newRole },
      { new: true }
    ).select('-password');

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
