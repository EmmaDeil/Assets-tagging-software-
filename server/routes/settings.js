/**
 * settings.js
 * 
 * API routes for application settings management.
 * Handles CRUD operations for settings configuration.
 */

const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const Equipment = require('../models/Equipment');
const Activity = require('../models/Activity');

/**
 * GET /api/settings
 * Get application settings
 */
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ isSingleton: true });
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new Settings({
        isSingleton: true
      });
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ 
      message: 'Error fetching settings',
      error: error.message 
    });
  }
});

/**
 * PUT /api/settings
 * Update application settings
 */
router.put('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ isSingleton: true });
    
    // If no settings exist, create them
    if (!settings) {
      settings = new Settings({
        isSingleton: true,
        ...req.body
      });
      await settings.save();
      return res.json(settings);
    }
    
    // Update existing settings
    const allowedUpdates = [
      'appName', 
      'timezone', 
      'maintenanceMode',
      'logoUrl',
      'primaryColor',
      'secondaryColor',
      'companyName',
      'emailNotificationsEnabled',
      'emailHost',
      'emailPort',
      'emailUsername',
      'emailPassword',
      'integrations'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });
    
    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ 
      message: 'Error updating settings',
      error: error.message 
    });
  }
});

/**
 * POST /api/settings/regenerate-api-key
 * Regenerate API key
 */
router.post('/regenerate-api-key', async (req, res) => {
  try {
    let settings = await Settings.findOne({ isSingleton: true });
    
    if (!settings) {
      settings = new Settings({ isSingleton: true });
    }
    
    // Generate new API key
    const newKey = `${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}-key`;
    settings.apiKey = newKey;
    settings.lastApiUse = new Date();
    
    await settings.save();
    
    res.json({ 
      message: 'API key regenerated successfully',
      apiKey: newKey,
      lastApiUse: settings.lastApiUse
    });
  } catch (error) {
    console.error('Error regenerating API key:', error);
    res.status(500).json({ 
      message: 'Error regenerating API key',
      error: error.message 
    });
  }
});

/**
 * DELETE /api/settings/delete-all-assets
 * Delete all assets (dangerous operation)
 */
router.delete('/delete-all-assets', async (req, res) => {
  try {
    const { confirmation } = req.body;
    
    if (confirmation !== 'DELETE ALL ASSETS') {
      return res.status(400).json({ 
        message: 'Confirmation text does not match. No assets were deleted.' 
      });
    }
    
    // Delete all equipment
    const equipmentResult = await Equipment.deleteMany({});
    
    // Delete all activities
    const activityResult = await Activity.deleteMany({});
    
    res.json({ 
      message: 'All assets deleted successfully',
      deletedEquipment: equipmentResult.deletedCount,
      deletedActivities: activityResult.deletedCount
    });
  } catch (error) {
    console.error('Error deleting assets:', error);
    res.status(500).json({ 
      message: 'Error deleting assets',
      error: error.message 
    });
  }
});

/**
 * GET /api/settings/users
 * Get all users for permissions management
 */
router.get('/users', async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      message: 'Error fetching users',
      error: error.message 
    });
  }
});

/**
 * PUT /api/settings/users/:id/role
 * Update user role
 */
router.put('/users/:id/role', async (req, res) => {
  try {
    const User = require('../models/User');
    const { role } = req.body;
    
    if (!['Administrator', 'Manager', 'User', 'Viewer'].includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Must be Administrator, Manager, User, or Viewer.' 
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ 
      message: 'Error updating user role',
      error: error.message 
    });
  }
});

/**
 * GET /api/settings/stats
 * Get system statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const User = require('../models/User');
    const Maintenance = require('../models/Maintenance');
    const Notification = require('../models/Notification');
    
    const stats = {
      totalAssets: await Equipment.countDocuments(),
      totalUsers: await User.countDocuments(),
      totalActivities: await Activity.countDocuments(),
      totalMaintenanceRecords: await Maintenance.countDocuments(),
      totalNotifications: await Notification.countDocuments(),
      assetsByStatus: {
        inUse: await Equipment.countDocuments({ status: 'In Use' }),
        available: await Equipment.countDocuments({ status: 'Available' }),
        underMaintenance: await Equipment.countDocuments({ status: 'Under Maintenance' }),
        retired: await Equipment.countDocuments({ status: 'Retired' }),
        lost: await Equipment.countDocuments({ status: 'Lost' })
      }
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      message: 'Error fetching statistics',
      error: error.message 
    });
  }
});

module.exports = router;
