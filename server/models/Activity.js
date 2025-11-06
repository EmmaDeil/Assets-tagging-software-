/**
 * Activity Model
 * 
 * Mongoose schema for activity/audit trail logging.
 * Tracks all actions performed on assets.
 */

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    assetName: {
      type: String,
      required: true,
    },
    assetId: {
      type: String, // Reference to equipment ID
    },
    action: {
      type: String,
      required: true,
    },
    actionType: {
      type: String,
      required: true,
      enum: ['Added', 'Updated', 'Deleted', 'Checked Out', 'Checked In', 'Maintenance', 'Other'],
    },
    user: {
      type: String,
      required: true,
      default: 'Admin',
    },
    icon: {
      type: String,
      default: '📝',
    },
    date: {
      type: String, // Human-readable date (e.g., "Just now", "2 hours ago")
    },
    timestamp: {
      type: Number,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
activitySchema.index({ timestamp: -1 });
activitySchema.index({ assetId: 1 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
