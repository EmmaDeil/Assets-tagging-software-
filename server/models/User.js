/**
 * User Model
 * 
 * Mongoose schema for user management.
 * Stores user information and role-based access control.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ['Administrator', 'Manager', 'User'],
      default: 'User',
    },
    roles: [{
      name: String,
      description: String,
      status: {
        type: String,
        default: 'Active'
      }
    }],
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    department: {
      type: String,
      trim: true,
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    profilePhoto: {
      type: String,
      trim: true,
      default: null,
    },
    notificationPreferences: {
      criticalAlerts: {
        type: Boolean,
        default: true,
      },
      systemUpdates: {
        type: Boolean,
        default: false,
      },
      weeklySummary: {
        type: Boolean,
        default: false,
      },
    },
    permissions: {
      // Dashboard
      viewDashboard: { type: Boolean, default: true },
      
      // Assets/Equipment
      viewAssets: { type: Boolean, default: true },
      createAssets: { type: Boolean, default: true },
      editAssets: { type: Boolean, default: true },
      deleteAssets: { type: Boolean, default: false },
      exportAssets: { type: Boolean, default: true },
      uploadDocuments: { type: Boolean, default: true },
      downloadDocuments: { type: Boolean, default: true },
      deleteDocuments: { type: Boolean, default: false },
      
      // Notes
      createNotes: { type: Boolean, default: true },
      editNotes: { type: Boolean, default: true },
      deleteNotes: { type: Boolean, default: false },
      
      // Tags
      viewTags: { type: Boolean, default: true },
      createTags: { type: Boolean, default: false },
      editTags: { type: Boolean, default: false },
      deleteTags: { type: Boolean, default: false },
      
      // Maintenance
      viewMaintenance: { type: Boolean, default: true },
      createMaintenance: { type: Boolean, default: true },
      editMaintenance: { type: Boolean, default: true },
      deleteMaintenance: { type: Boolean, default: false },
      
      // Users
      viewUsers: { type: Boolean, default: false },
      createUsers: { type: Boolean, default: false },
      editUsers: { type: Boolean, default: false },
      deleteUsers: { type: Boolean, default: false },
      managePermissions: { type: Boolean, default: false },
      
      // Reports
      viewReports: { type: Boolean, default: true },
      exportReports: { type: Boolean, default: true },
      
      // Activities
      viewActivities: { type: Boolean, default: true },
      createActivities: { type: Boolean, default: true },
      
      // Notifications
      viewNotifications: { type: Boolean, default: true },
      deleteNotifications: { type: Boolean, default: true },
      
      // Settings
      viewSettings: { type: Boolean, default: false },
      editSettings: { type: Boolean, default: false },
      regenerateApiKey: { type: Boolean, default: false },
      deleteAllAssets: { type: Boolean, default: false },
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster searches
// Note: email index is automatically created by the 'unique: true' property
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
