/**
 * maintenanceCron.js
 * 
 * Automated cron job for maintenance notifications
 * 
 * This script should be run daily (e.g., every day at 8:00 AM)
 * It triggers the backend notification checks for:
 * - 3-day reminders
 * - Due date notifications  
 * - Overdue critical alerts
 * 
 * Setup Options:
 * 
 * Option 1: node-cron (built-in scheduler)
 * Run: node maintenanceCron.js
 * Keeps running and executes daily
 * 
 * Option 2: System cron (Linux/Mac)
 * Add to crontab: 0 8 * * * node /path/to/maintenanceCron.js
 * 
 * Option 3: Task Scheduler (Windows)
 * Create a scheduled task to run: node /path/to/maintenanceCron.js
 * 
 * Option 4: External service (cron-job.org, EasyCron, etc.)
 * Point to: POST http://your-domain.com/api/cron/maintenance-notifications
 */

const cron = require('node-cron');
const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const CRON_SCHEDULE = '0 8 * * *'; // Daily at 8:00 AM (can be customized)

/**
 * Run maintenance notification checks
 */
async function runMaintenanceChecks() {
  console.log(`[${new Date().toISOString()}] Running maintenance notification checks...`);
  
  try {
    const response = await axios.post(`${API_BASE_URL}/cron/maintenance-notifications`, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = response.data;
    
    console.log(`[${new Date().toISOString()}] ✅ Maintenance checks completed successfully!`);
    console.log('Results:', JSON.stringify(result, null, 2));
    
    // Log summary
    console.log('\n📊 Summary:');
    console.log(`  - Due today notifications sent: ${result.results?.dueToday?.sent || 0}`);
    console.log(`  - Upcoming reminders sent: ${result.results?.upcoming?.sent || 0}`);
    console.log(`  - Overdue alerts sent: ${result.results?.overdue?.sent || 0}`);
    console.log('');
    
    return result;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error running maintenance checks:`, error.message);
    throw error;
  }
}

/**
 * Setup automated cron job
 */
function setupCronJob() {
  console.log('🔧 Setting up maintenance notification cron job...');
  console.log(`📅 Schedule: ${CRON_SCHEDULE} (Daily at 8:00 AM)`);
  console.log(`🌐 API URL: ${API_BASE_URL}`);
  console.log('');

  // Schedule the cron job
  const task = cron.schedule(CRON_SCHEDULE, async () => {
    await runMaintenanceChecks();
  });

  console.log('✅ Cron job scheduled successfully!');
  console.log('⏰ Waiting for scheduled time...');
  console.log('Press Ctrl+C to stop the cron job\n');

  // Run immediately on startup (optional - comment out if not desired)
  console.log('🚀 Running initial check...\n');
  runMaintenanceChecks();

  return task;
}

/**
 * Check if running as a one-time job or continuous cron
 */
if (require.main === module) {
  // Check if --once flag is provided
  const runOnce = process.argv.includes('--once');

  if (runOnce) {
    // Run once and exit
    console.log('Running maintenance checks once...\n');
    runMaintenanceChecks()
      .then(() => {
        console.log('\n✅ One-time check completed. Exiting...');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n❌ One-time check failed:', error.message);
        process.exit(1);
      });
  } else {
    // Run as continuous cron job
    setupCronJob();
    
    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\n\n👋 Shutting down cron job...');
      process.exit(0);
    });
  }
}

module.exports = { runMaintenanceChecks, setupCronJob };
