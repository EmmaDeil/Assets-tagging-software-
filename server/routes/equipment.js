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
const Maintenance = require('../models/Maintenance');
const Activity = require('../models/Activity');
const {
  createNewAssetNotification,
  createStatusChangeNotification,
  createAssignmentNotification,
} = require('../utils/notificationHelper');

/**
 * Helper function to calculate next maintenance date based on period
 */
function calculateNextMaintenanceDate(lastDate, period) {
  if (!period || period === 'As Needed') return null;
  
  const date = new Date(lastDate);
  
  switch(period) {
    case 'Weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'Monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'Every 3 Months':
    case 'Quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'Every 6 Months':
    case 'Bi-annually':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'Annually':
      date.setFullYear(date.getFullYear() + 1);
      break;
    case 'Every 2 Years':
      date.setFullYear(date.getFullYear() + 2);
      break;
    default:
      return null;
  }
  
  return date;
}

/**
 * Helper function to update asset maintenance status dynamically
 */
async function updateAssetMaintenanceStatus(assetId) {
  try {
    const asset = await Equipment.findOne({ id: assetId });
    if (!asset) return;

    const now = new Date();
    const nextMaintenance = asset.nextScheduledMaintenance;

    if (!nextMaintenance) {
      asset.maintenanceStatus = 'Not Scheduled';
    } else {
      const daysUntilMaintenance = Math.ceil((nextMaintenance - now) / (1000 * 60 * 60 * 24));
      
      // Check for in-progress maintenance
      const inProgressMaintenance = await Maintenance.findOne({
        assetId: assetId,
        status: 'In Progress'
      });

      if (inProgressMaintenance) {
        asset.maintenanceStatus = 'In Progress';
      } else if (daysUntilMaintenance < 0) {
        asset.maintenanceStatus = 'Overdue';
      } else if (daysUntilMaintenance <= 7) {
        asset.maintenanceStatus = 'Due Soon';
      } else {
        asset.maintenanceStatus = 'Up to Date';
      }
    }

    await asset.save();
  } catch (error) {
    console.error('Error updating asset maintenance status:', error);
  }
}

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
 * @route   GET /api/equipment/departments/list
 * @desc    Get unique list of departments from equipment and users
 * @access  Public
 */
router.get('/departments/list', async (req, res) => {
  try {
    const User = require('../models/User');
    
    // Get unique departments from equipment
    const equipmentDepartments = await Equipment.distinct('department');
    
    // Get unique departments from users
    const userDepartments = await User.distinct('department');
    
    // Combine and remove duplicates
    const allDepartments = [...new Set([...equipmentDepartments, ...userDepartments])]
      .filter(dept => dept && dept.trim() !== '') // Remove empty strings
      .sort(); // Sort alphabetically
    
    res.json(allDepartments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
    // Remove maintenanceStatus from req.body if it exists (will be calculated dynamically)
    const { maintenanceStatus, ...equipmentData } = req.body;
    const equipment = new Equipment(equipmentData);
    
    // If asset has a maintenance period, calculate and set next scheduled maintenance
    if (equipment.maintenancePeriod && equipment.maintenancePeriod !== 'As Needed') {
      const nextDate = calculateNextMaintenanceDate(new Date(), equipment.maintenancePeriod);
      equipment.nextScheduledMaintenance = nextDate;
    }
    
    await equipment.save();

    // Create initial maintenance schedule if maintenance period is set
    if (equipment.maintenancePeriod && equipment.maintenancePeriod !== 'As Needed' && equipment.nextScheduledMaintenance) {
      const initialMaintenance = new Maintenance({
        assetId: equipment.id,
        assetName: equipment.name,
        date: equipment.nextScheduledMaintenance,
        scheduledDate: equipment.nextScheduledMaintenance,
        serviceType: 'Preventative Maintenance',
        technician: 'To Be Assigned',
        cost: 0,
        status: 'Scheduled',
        priority: 'Medium',
        description: `Initial ${equipment.maintenancePeriod} maintenance schedule for ${equipment.name}`,
      });
      
      await initialMaintenance.save();
      console.log(`Initial maintenance scheduled for ${equipment.name} on ${equipment.nextScheduledMaintenance}`);
      
      // Update maintenance status dynamically based on scheduled date
      await updateAssetMaintenanceStatus(equipment.id);
    }

    // Log activity - use dynamic user from request or default to System
    const userName = req.body.currentUser || req.body.user || 'System';
    const activity = new Activity({
      assetName: equipment.name,
      assetId: equipment.id,
      action: 'Added',
      actionType: 'Added',
      user: userName,
      icon: '📦',
      date: 'Just now',
      timestamp: Date.now(),
    });
    await activity.save();

    // Create notification for new asset
    await createNewAssetNotification(equipment);

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
    // Get old equipment data first to check for changes
    const oldEquipment = await Equipment.findOne({ id: req.params.id });
    
    if (!oldEquipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const equipment = await Equipment.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, lastModified: new Date() },
      { new: true, runValidators: true }
    );

    // Log activity - use dynamic user from request or default to System
    const userName = req.body.currentUser || req.body.user || 'System';
    const activity = new Activity({
      assetName: equipment.name,
      assetId: equipment.id,
      action: 'Updated',
      actionType: 'Updated',
      user: userName,
      icon: '✏️',
      date: 'Just now',
      timestamp: Date.now(),
    });
    await activity.save();

    // Create notifications for specific changes
    // Status change notification
    if (oldEquipment.status !== equipment.status) {
      await createStatusChangeNotification(equipment, oldEquipment.status, equipment.status);
    }

    // Assignment change notification
    if (oldEquipment.assignedTo !== equipment.assignedTo && equipment.assignedTo) {
      await createAssignmentNotification(equipment, equipment.assignedTo);
    }

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

    // Log activity - use dynamic user from request or default to System
    const userName = req.body.currentUser || req.body.user || 'System';
    const activity = new Activity({
      assetName: equipment.name,
      assetId: equipment.id,
      action: 'Deleted',
      actionType: 'Deleted',
      user: userName,
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

    // Add file to attachedFiles array
    if (!equipment.attachedFiles) {
      equipment.attachedFiles = [];
    }
    
    // Push file data directly to the array - Mongoose will handle subdocument creation
    equipment.attachedFiles.push({
      name: req.file.originalname,
      type: req.file.mimetype,
      id: req.file.filename,
      data: base64Data,
      uploadDate: new Date(),
      size: req.file.size
    });
    
    equipment.lastModified = new Date();

    await equipment.save();

    // Clean up physical file after saving to database
    fs.unlinkSync(req.file.path);

    // Log activity - use dynamic user from request or default to System
    const userName = req.body.currentUser || req.body.user || 'System';
    const activity = new Activity({
      assetName: equipment.name,
      assetId: equipment.id,
      action: 'Document Uploaded',
      actionType: 'Updated',
      details: `Uploaded: ${req.file.originalname}`,
      user: userName,
      icon: '📄',
      date: 'Just now',
      timestamp: Date.now(),
    });
    await activity.save();

    // Get the last added file from the array
    const addedFile = equipment.attachedFiles[equipment.attachedFiles.length - 1];

    // Return file data without base64 (too large for response)
    const responseFile = {
      name: addedFile.name,
      type: addedFile.type,
      id: addedFile.id,
      uploadDate: addedFile.uploadDate,
      size: addedFile.size
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

    // Log activity - use dynamic user from request or default to System
    const userName = req.body.currentUser || req.body.user || 'System';
    const activity = new Activity({
      assetName: equipment.name,
      assetId: equipment.id,
      action: 'Document Deleted',
      actionType: 'Updated',
      details: `Deleted: ${file.name}`,
      user: userName,
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

/**
 * @route   POST /api/equipment/:id/notes
 * @desc    Add a new note to an asset
 * @access  Public
 */
router.post('/:id/notes', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Note content is required' });
    }

    const equipment = await Equipment.findOne({ id: req.params.id });

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Initialize notesHistory if it doesn't exist
    if (!equipment.notesHistory) {
      equipment.notesHistory = [];
    }

    // Get dynamic user from request or default to System
    const userName = req.body.currentUser || req.body.user || 'System';

    // Create new note
    const newNote = {
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userName,
      updatedBy: userName,
    };

    equipment.notesHistory.push(newNote);
    equipment.lastModified = new Date();

    await equipment.save();

    // Log activity - use dynamic user from request or default to System
    const activityUserName = req.body.currentUser || req.body.user || 'System';
    const activity = new Activity({
      assetName: equipment.name,
      assetId: equipment.id,
      action: 'Note Added',
      actionType: 'Updated',
      details: `Added a new note`,
      user: activityUserName,
      icon: '📝',
      date: 'Just now',
      timestamp: Date.now(),
    });
    await activity.save();

    res.json({ 
      message: 'Note added successfully', 
      note: newNote,
      equipment 
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ message: 'Error adding note', error: error.message });
  }
});

/**
 * @route   PUT /api/equipment/:id/notes/:noteId
 * @desc    Update an existing note
 * @access  Public
 */
router.put('/:id/notes/:noteId', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Note content is required' });
    }

    const equipment = await Equipment.findOne({ id: req.params.id });

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Find the note in the notesHistory array
    const note = equipment.notesHistory.id(req.params.noteId);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Get dynamic user from request or default to System
    const userName = req.body.currentUser || req.body.user || 'System';

    // Update note
    note.content = content.trim();
    note.updatedAt = new Date();
    note.updatedBy = userName;
    equipment.lastModified = new Date();

    await equipment.save();

    // Log activity - use dynamic user from request or default to System
    const activityUserName = req.body.currentUser || req.body.user || 'System';
    const activity = new Activity({
      assetName: equipment.name,
      assetId: equipment.id,
      action: 'Note Updated',
      actionType: 'Updated',
      details: `Updated a note`,
      user: activityUserName,
      icon: '✏️',
      date: 'Just now',
      timestamp: Date.now(),
    });
    await activity.save();

    res.json({ 
      message: 'Note updated successfully', 
      note,
      equipment 
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Error updating note', error: error.message });
  }
});

/**
 * @route   DELETE /api/equipment/:id/notes/:noteId
 * @desc    Delete a note
 * @access  Public
 */
router.delete('/:id/notes/:noteId', async (req, res) => {
  try {
    const equipment = await Equipment.findOne({ id: req.params.id });

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Find and remove the note
    const noteIndex = equipment.notesHistory.findIndex(
      note => note._id.toString() === req.params.noteId
    );

    if (noteIndex === -1) {
      return res.status(404).json({ message: 'Note not found' });
    }

    equipment.notesHistory.splice(noteIndex, 1);
    equipment.lastModified = new Date();

    await equipment.save();

    // Log activity - use dynamic user from request or default to System
    const userName = req.body.currentUser || req.body.user || 'System';
    const activity = new Activity({
      assetName: equipment.name,
      assetId: equipment.id,
      action: 'Note Deleted',
      actionType: 'Updated',
      details: `Deleted a note`,
      user: userName,
      icon: '🗑️',
      date: 'Just now',
      timestamp: Date.now(),
    });
    await activity.save();

    res.json({ 
      message: 'Note deleted successfully',
      equipment 
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
});

module.exports = router;
