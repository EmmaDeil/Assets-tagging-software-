/**
 * maintenanceMode.js
 * 
 * Middleware to check if the application is in maintenance mode
 * When maintenance mode is enabled, all database write operations are blocked
 * Only GET requests to /settings endpoint are allowed
 */

const Settings = require('../models/Settings');

// Cache maintenance mode status to reduce database queries
let maintenanceModeCache = null;
let lastCacheTime = null;
const CACHE_DURATION = 10000; // 10 seconds

/**
 * Middleware function to check maintenance mode
 */
async function checkMaintenanceMode(req, res, next) {
  try {
    // Allow GET requests to settings endpoint (needed to read maintenance mode status)
    if (req.path === '/settings' && req.method === 'GET') {
      return next();
    }

    // Check cache first
    const now = Date.now();
    if (maintenanceModeCache !== null && lastCacheTime && (now - lastCacheTime < CACHE_DURATION)) {
      if (maintenanceModeCache === true) {
        return res.status(503).json({
          message: 'Application is currently in maintenance mode. Please try again later.',
          maintenanceMode: true
        });
      }
      return next();
    }

    // Fetch fresh maintenance mode status
    const settings = await Settings.findOne();
    
    if (!settings) {
      // If no settings exist, create default
      const defaultSettings = new Settings();
      await defaultSettings.save();
      maintenanceModeCache = false;
      lastCacheTime = now;
      return next();
    }

    // Update cache
    maintenanceModeCache = settings.maintenanceMode || false;
    lastCacheTime = now;

    // Block all operations if maintenance mode is enabled
    if (maintenanceModeCache === true) {
      return res.status(503).json({
        message: 'Application is currently in maintenance mode. Please try again later.',
        maintenanceMode: true
      });
    }

    next();
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    // If there's an error, allow the request to proceed
    next();
  }
}

/**
 * Clear the maintenance mode cache
 * Call this when settings are updated
 */
function clearMaintenanceModeCache() {
  maintenanceModeCache = null;
  lastCacheTime = null;
}

module.exports = {
  checkMaintenanceMode,
  clearMaintenanceModeCache
};
