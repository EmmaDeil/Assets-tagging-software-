/**
 * Equipment Routes
 * 
 * REST API endpoints for equipment/asset management.
 * Handles CRUD operations for assets.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Equipment = require('../models/Equipment');
const Activity = require('../models/Activity');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = /pdf|doc|docx|xls|xlsx|txt|jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only document files are allowed (PDF, DOC, XLS, TXT, Images)'));
    }
  }
});

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

/**
 * @route   POST /api/equipment/:id/upload
 * @desc    Upload document for an asset (stores in MongoDB as base64)
 * @access  Public
 */
router.post('/:id/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const equipment = await Equipment.findOne({ id: req.params.id });

    if (!equipment) {
      // Clean up uploaded file if asset not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Read file and convert to base64 for MongoDB storage
    const fileBuffer = fs.readFileSync(req.file.path);
    const base64Data = fileBuffer.toString('base64');

    // Create file object with base64 data
    const fileData = {
      name: req.file.originalname,
      type: req.file.mimetype,
      id: req.file.filename,
      data: base64Data, // Store base64 in MongoDB
      uploadDate: new Date(),
      size: req.file.size
    };

    // Add file to attachedFiles array
    if (!equipment.attachedFiles) {
      equipment.attachedFiles = [];
    }
    equipment.attachedFiles.push(fileData);
    equipment.lastModified = new Date();

    await equipment.save();

    // Clean up physical file after saving to database
    fs.unlinkSync(req.file.path);

    // Log activity
    const activity = new Activity({
      assetName: equipment.name,
      assetId: equipment.id,
      action: 'Document Uploaded',
      actionType: 'Updated',
      details: `Uploaded: ${req.file.originalname}`,
      user: 'Admin',
      icon: '📄',
      date: 'Just now',
      timestamp: Date.now(),
    });
    await activity.save();

    // Return file data without base64 (too large for response)
    const responseFile = {
      name: fileData.name,
      type: fileData.type,
      id: fileData.id,
      uploadDate: fileData.uploadDate,
      size: fileData.size
    };

    res.json({ 
      message: 'File uploaded successfully', 
      file: responseFile,
      equipment 
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

/**
 * @route   DELETE /api/equipment/:id/document/:fileId
 * @desc    Delete a document from an asset
 * @access  Public
 */
router.delete('/:id/document/:fileId', async (req, res) => {
  try {
    const equipment = await Equipment.findOne({ id: req.params.id });

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Find the file
    const fileIndex = equipment.attachedFiles.findIndex(
      file => file.id === req.params.fileId
    );

    if (fileIndex === -1) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = equipment.attachedFiles[fileIndex];

    // Remove from database (no physical file to delete since stored in MongoDB)
    equipment.attachedFiles.splice(fileIndex, 1);
    equipment.lastModified = new Date();
    await equipment.save();

    // Log activity
    const activity = new Activity({
      assetName: equipment.name,
      assetId: equipment.id,
      action: 'Document Deleted',
      actionType: 'Updated',
      details: `Deleted: ${file.name}`,
      user: 'Admin',
      icon: '🗑️',
      date: 'Just now',
      timestamp: Date.now(),
    });
    await activity.save();

    res.json({ 
      message: 'File deleted successfully', 
      equipment 
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
});

/**
 * @route   GET /api/equipment/:id/document/:fileId/download
 * @desc    Download a document from an asset (retrieves from MongoDB)
 * @access  Public
 */
router.get('/:id/document/:fileId/download', async (req, res) => {
  try {
    const equipment = await Equipment.findOne({ id: req.params.id });

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Find the file
    const file = equipment.attachedFiles.find(
      f => f.id === req.params.fileId
    );

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Convert base64 back to binary
    const fileBuffer = Buffer.from(file.data, 'base64');

    // Set headers for download
    res.setHeader('Content-Type', file.type);
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    res.send(fileBuffer);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Error downloading file', error: error.message });
  }
});

module.exports = router;
