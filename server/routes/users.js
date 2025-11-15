/**
 * User Routes
 * 
 * REST API endpoints for user management.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', user });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/users/profile/:id
 * @desc    Get user profile with full details
 * @access  Public
 */
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/users/profile/:id
 * @desc    Update user profile
 * @access  Public
 */
router.put('/profile/:id', async (req, res) => {
  try {
    const { name, email, jobTitle, phoneNumber, department, notificationPreferences } = req.body;
    
    const updateData = {
      name,
      email,
      jobTitle,
      phoneNumber,
      department,
      notificationPreferences
    };

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

/**
 * @route   POST /api/users/change-password/:id
 * @desc    Change user password
 * @access  Public
 */
router.post('/change-password/:id', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // In a real application, you would:
    // 1. Verify the current password
    // 2. Hash the new password
    // 3. Update the user's password
    
    // For now, just update the password field
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Simple update (in production, hash the password first)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/users/:id/permissions
 * @desc    Get user permissions
 * @access  Public
 */
router.get('/:id/permissions', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions || {}
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/users/:id/permissions
 * @desc    Update user permissions
 * @access  Public (should be Admin only in production)
 */
router.put('/:id/permissions', async (req, res) => {
  try {
    const { permissions } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update permissions
    user.permissions = {
      ...user.permissions,
      ...permissions
    };

    await user.save();

    res.json({
      message: 'Permissions updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
