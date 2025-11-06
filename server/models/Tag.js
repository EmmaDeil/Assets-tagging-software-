/**
 * Tag Model
 * 
 * Mongoose schema for tag management.
 * Stores tags for organizing assets by location, department, type, and status.
 */

const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Tag category is required'],
      enum: ['Location', 'Department', 'Asset Type', 'Status'],
    },
    color: {
      type: String,
      default: '#3B82F6', // Blue
    },
    description: {
      type: String,
      trim: true,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster searches
tagSchema.index({ category: 1 });
tagSchema.index({ name: 'text' });

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
