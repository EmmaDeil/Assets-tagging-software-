/**
 * Tag Routes
 * 
 * REST API endpoints for tag management.
 */

const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');

/**
 * @route   GET /api/tags
 * @desc    Get all tags
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.find().sort({ category: 1, name: 1 });
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/tags/category/:category
 * @desc    Get tags by category
 * @access  Public
 */
router.get('/category/:category', async (req, res) => {
  try {
    const tags = await Tag.find({ category: req.params.category })
      .sort({ name: 1 });
    
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags by category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/tags
 * @desc    Create new tag
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const tag = new Tag(req.body);
    await tag.save();
    
    res.status(201).json(tag);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

/**
 * @route   PUT /api/tags/:id
 * @desc    Update tag
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const tag = await Tag.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    res.json(tag);
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

/**
 * @route   DELETE /api/tags/:id
 * @desc    Delete tag
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const tag = await Tag.findByIdAndDelete(req.params.id);

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    res.json({ message: 'Tag deleted successfully', tag });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
