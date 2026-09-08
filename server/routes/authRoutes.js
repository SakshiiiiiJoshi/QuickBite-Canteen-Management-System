const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Admin login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/seed
// @desc    Seed default admin (dev only)
// @access  Public
router.post('/seed', async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({ username: 'admin' });

    if (existingAdmin) {
      return res.json({ message: 'Admin already exists', username: 'admin' });
    }

    const admin = await Admin.create({
      username: 'admin',
      password: 'admin123',
    });

    res.status(201).json({
      message: 'Default admin created',
      username: admin.username,
      defaultPassword: 'admin123',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
