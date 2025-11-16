/**
 * Cron Job Routes
 * 
 * Endpoints for scheduled tasks like maintenance notifications
 * These should be called by external cron job services or internal schedulers
 */

const express = require('express');
const router = express.Router();
const { runMaintenanceNotificationChecks } = require('../utils/maintenanceNotifications');

/**
 * POST /api/cron/maintenance-notifications
 * Run daily maintenance notification checks
 * Should be called once per day (e.g., at 8:00 AM)
 */
router.post('/maintenance-notifications', async (req, res) => {
  try {
    console.log('Running maintenance notification checks via cron endpoint');
    
    const results = await runMaintenanceNotificationChecks();
    
    res.json({
      success: true,
      message: 'Maintenance notification checks completed',
      results
    });
  } catch (error) {
    console.error('Error running maintenance notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run maintenance notifications',
      error: error.message
    });
  }
});

/**
 * GET /api/cron/status
 * Check cron job system status
 */
router.get('/status', (req, res) => {
  res.json({
    status: 'active',
    message: 'Cron job system is operational',
    availableJobs: [
      {
        name: 'maintenance-notifications',
        description: 'Daily maintenance notification checks',
        endpoint: 'POST /api/cron/maintenance-notifications',
        recommendedSchedule: 'Daily at 8:00 AM'
      }
    ],
    timestamp: new Date()
  });
});

module.exports = router;
