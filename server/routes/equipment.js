/**
 * Equipment Routes
 * 
 * REST API endpoints for equipment/asset management.
 * Handles CRUD operations for assets.
 */

const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const Activity = require('../models/Activity');

/**
 * @route   GET /api/equipment
 * @desc    Get all equipment/assets
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const equipment = await Equipment.find().sort({ createdAt: -1 });
    res.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/equipment/:id
 * @desc    Get equipment by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findOne({ id: req.params.id });
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    res.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/equipment
 * @desc    Create new equipment/asset
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const equipment = new Equipment(req.body);
    await equipment.save();

    // Log activity
    const activity = new Activity({
      assetName: equipment.name,
      assetId: equipment.id,
      action: 'Added',
      actionType: 'Added',
      user: 'Admin',
      icon: '📦',
      date: 'Just now',
      timestamp: Date.now(),
    });
    await activity.save();

    res.status(201).json(equipment);
  } catch (error) {
    console.error('Error creating equipment:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Asset ID already exists' });
    }
    
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

/**
 * @route   PUT /api/equipment/:id
 * @desc    Update equipment/asset
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, lastModified: new Date() },
      { new: true, runValidators: true }
    );

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Log activity
    const activity = new Activity({
      assetName: equipment.name,
      assetId: equipment.id,
      action: 'Updated',
      actionType: 'Updated',
      user: 'Admin',
      icon: '✏️',
      date: 'Just now',
      timestamp: Date.now(),
    });
    await activity.save();

    res.json(equipment);
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

/**
 * @route   DELETE /api/equipment/:id
 * @desc    Delete equipment/asset
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findOneAndDelete({ id: req.params.id });

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Log activity
    const activity = new Activity({
      assetName: equipment.name,
      assetId: equipment.id,
      action: 'Deleted',
      actionType: 'Deleted',
      user: 'Admin',
      icon: '🗑️',
      date: 'Just now',
      timestamp: Date.now(),
    });
    await activity.save();

    res.json({ message: 'Equipment deleted successfully', equipment });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/equipment/search/:query
 * @desc    Search equipment by name, id, or category
 * @access  Public
 */
router.get('/search/:query', async (req, res) => {
  try {
    const equipment = await Equipment.find({
      $or: [
        { name: { $regex: req.params.query, $options: 'i' } },
        { id: { $regex: req.params.query, $options: 'i' } },
        { category: { $regex: req.params.query, $options: 'i' } },
      ],
    });

    res.json(equipment);
  } catch (error) {
    console.error('Error searching equipment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
