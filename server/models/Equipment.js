/**
 * Equipment/Asset Model
 * 
 * Mongoose schema for equipment/asset management.
 * Stores all asset information including QR codes, files, and maintenance schedules.
 */

const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },
    id: {
      type: String,
      required: [true, 'Asset ID/Tag ID is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'Other',
    },
    location: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      trim: true,
      default: 'In Use',
    },
    model: {
      type: String,
      trim: true,
    },
    serial: {
      type: String,
      trim: true,
    },
    purchaseDate: {
      type: String,
    },
    acquisitionDate: {
      type: String,
    },
    cost: {
      type: Number,
      min: 0,
    },
    maintenancePeriod: {
      type: String,
      enum: [
        '', 
        'Weekly',
        'Monthly', 
        'Every 3 Months',
        'Every 6 Months',
        'Quarterly', 
        'Bi-annually', 
        'Annually',
        'Every 2 Years',
        'As Needed'
      ],
      default: '',
    },
    maintenanceSchedule: {
      type: String,
      enum: [
        '', 
        'Weekly',
        'Monthly', 
        'Every 3 Months',
        'Every 6 Months',
        'Quarterly', 
        'Bi-annually', 
        'Annually',
        'Every 2 Years',
        'As Needed'
      ],
      default: '',
    },
    notes: {
      type: String,
    },
    qrCode: {
      type: String, // Base64 encoded QR code or URL
    },
    attachedFiles: [
      {
        name: String,
        type: String,
        id: String,
        data: String, // Base64 encoded file data stored in MongoDB
        uploadDate: Date,
        size: Number, // File size in bytes
      },
    ],
    assignedTo: {
      type: String,
    },
    department: {
      type: String,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for faster searches
// Note: 'id' field already has a unique index, so we only add text search for name and category
equipmentSchema.index({ name: 'text', category: 'text' });
equipmentSchema.index({ status: 1 });
equipmentSchema.index({ location: 1 });

const Equipment = mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment;
