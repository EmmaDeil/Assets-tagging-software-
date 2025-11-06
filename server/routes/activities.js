/**
 * Activity Routes
 * 
 * REST API endpoints for activity/audit trail management.
 */

const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

/**
 * @route   GET /api/activities
 * @desc    Get all activities (limited to last 50)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const activities = await Activity.find()
      .sort({ timestamp: -1 })
      .limit(limit);
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/activities/asset/:assetId
 * @desc    Get activities for a specific asset
 * @access  Public
 */
router.get('/asset/:assetId', async (req, res) => {
  try {
    const activities = await Activity.find({ assetId: req.params.assetId })
      .sort({ timestamp: -1 });
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching asset activities:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/activities
 * @desc    Create new activity log
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const activity = new Activity({
      ...req.body,
      date: 'Just now',
      timestamp: Date.now(),
    });
    
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

module.exports = router;
