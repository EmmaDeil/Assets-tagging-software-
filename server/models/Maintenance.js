/**
 * Maintenance Model
 * 
 * Mongoose schema for maintenance record management.
 * Stores maintenance history for assets including service details, costs, and status.
 */

const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    assetId: {
      type: String,
      required: [true, 'Asset ID is required'],
      index: true,
    },
    assetName: {
      type: String,
      required: [true, 'Asset name is required'],
    },
    date: {
      type: Date,
      required: [true, 'Maintenance date is required'],
      default: Date.now,
    },
    serviceType: {
      type: String,
      required: [true, 'Service type is required'],
      enum: [
        'Annual Inspection',
        'Repair',
        'Preventative Maintenance',
        'Emergency Repair',
        'Routine Maintenance',
        'Calibration',
        'Upgrade',
        'Cleaning',
        'Other'
      ],
    },
    technician: {
      type: String,
      required: [true, 'Technician name is required'],
      trim: true,
    },
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: [0, 'Cost cannot be negative'],
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    description: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    nextMaintenanceDate: {
      type: Date,
    },
    completedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster searches
maintenanceSchema.index({ assetId: 1, date: -1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ serviceType: 1 });
maintenanceSchema.index({ date: -1 });

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

module.exports = Maintenance;
