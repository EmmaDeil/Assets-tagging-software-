/**
 * Settings.js
 * 
 * MongoDB model for application settings.
 * Stores configuration data like app name, timezone, maintenance mode, etc.
 */

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // General Settings
  appName: {
    type: String,
    default: 'Q tag Manager',
    required: true
  },
  timezone: {
    type: String,
    default: 'UTC-5',
    required: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  
  // API Settings
  apiKey: {
    type: String,
    default: function() {
      return `${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}-key`;
    }
  },
  lastApiUse: {
    type: Date,
    default: null
  },
  
  // Branding Settings
  logoUrl: {
    type: String,
    default: ''
  },
  primaryColor: {
    type: String,
    default: '#3B82F6' // Blue
  },
  secondaryColor: {
    type: String,
    default: '#10B981' // Green
  },
  companyName: {
    type: String,
    default: 'AssetManager'
  },
  
  // Email Notifications Settings
  emailNotificationsEnabled: {
    type: Boolean,
    default: false
  },
  emailHost: {
    type: String,
    default: ''
  },
  emailPort: {
    type: Number,
    default: 587
  },
  emailUsername: {
    type: String,
    default: ''
  },
  emailPassword: {
    type: String,
    default: ''
  },
  
  // Integrations
  integrations: {
    slack: {
      enabled: { type: Boolean, default: false },
      webhookUrl: { type: String, default: '' }
    },
    teams: {
      enabled: { type: Boolean, default: false },
      webhookUrl: { type: String, default: '' }
    }
  },
  
  // Singleton pattern - only one settings document
  isSingleton: {
    type: Boolean,
    default: true,
    unique: true
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  const count = await mongoose.model('Settings').countDocuments();
  if (count > 0) {
    const error = new Error('Settings document already exists. Use update instead.');
    return next(error);
  }
  next();
});

module.exports = mongoose.model('Settings', settingsSchema);
