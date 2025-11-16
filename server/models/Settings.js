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
    default: 'QR Tag Manager',
    required: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  defaultCurrency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD', 'CHF', 'SGD', 'NZD', 'ZAR', 'BRL', 'MXN', 'AED', 'SAR', 'KRW', 'HKD', 'SEK', 'NOK', 'NGN']
  },
  dateFormat: {
    type: String,
    default: 'MM/DD/YYYY',
    enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD.MM.YYYY']
  },
  autoBackup: {
    type: Boolean,
    default: true
  },
  maintenanceNotificationDays: {
    type: Number,
    default: 7,
    min: 1,
    max: 90
  },
  sessionTimeout: {
    type: Number,
    default: 30,
    min: 5,
    max: 21360 // 24 hours max
  },
  recordsPerPage: {
    type: Number,
    default: 25,
    min: 10,
    max: 500
  },
  emailNotifications: {
    type: Boolean,
    default: false
  },
  assetIdPrefix: {
    type: String,
    default: 'AST-',
    maxlength: 10
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'pt', 'zh', 'ar', 'hi']
  },
  maintenanceReminderFrequency: {
    type: String,
    default: 'monthly',
    enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual']
  },
  dataRetentionDays: {
    type: Number,
    default: 90,
    enum: [30, 60, 90, 180, 365, -1] // -1 means keep forever
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
    default: 'QR Tag Manager'
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
