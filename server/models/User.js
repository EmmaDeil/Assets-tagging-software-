/**
 * User Model
 * 
 * Mongoose schema for user management.
 * Stores user information and role-based access control.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
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
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Index for faster searches
// Note: email index is automatically created by the 'unique: true' property
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to generate reset password token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = require('crypto').randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
