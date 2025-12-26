/**
 * Maintenance Notification System
 * 
 * Checks for due and overdue maintenance and sends notifications
 * Should be called by a cron job daily
 */

const Maintenance = require('../models/Maintenance');
const Equipment = require('../models/Equipment');
const User = require('../models/User');
const { createNotification } = require('./notificationHelper');

/**
 * Check for maintenance due in the next 7 days and notify users based on role
 * - Regular users: Get notified about maintenance in next 7 days
 * - Admins: Get notified about all activities
 */
async function checkWeeklyMaintenanceNotifications() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Find maintenance due in the next 7 days
    const upcomingMaintenance = await Maintenance.find({
      status: { $in: ['Scheduled', 'Not Started'] },
      scheduledDate: { $gte: today, $lte: sevenDaysFromNow }
    });

    console.log(`Found ${upcomingMaintenance.length} maintenance due in next 7 days`);

    // Get all users and admins
    const users = await User.find({ status: 'Active', role: 'User' });
    const admins = await User.find({ status: 'Active', role: 'Administrator' });

    // Notify regular users about maintenance
    for (const maintenance of upcomingMaintenance) {
      const daysUntil = Math.ceil((maintenance.scheduledDate - today) / (1000 * 60 * 60 * 24));
      
      // Notify all regular users
      for (const user of users) {
        await createNotification({
          type: 'maintenance',
          title: 'Upcoming Maintenance',
          message: `Maintenance scheduled for ${maintenance.assetName} in ${daysUntil} day(s). Service type: ${maintenance.serviceType}`,
          userId: user._id.toString(),
          assetId: maintenance.assetId,
          priority: daysUntil <= 3 ? 'high' : 'medium',
          actionUrl: `/maintenance/${maintenance._id}`
        });
      }

      // Notify admins
      for (const admin of admins) {
        await createNotification({
          type: 'maintenance',
          title: 'Upcoming Maintenance',
          message: `Maintenance scheduled for ${maintenance.assetName} in ${daysUntil} day(s). Service type: ${maintenance.serviceType}`,
          userId: admin._id.toString(),
          assetId: maintenance.assetId,
          priority: daysUntil <= 3 ? 'high' : 'medium',
          actionUrl: `/maintenance/${maintenance._id}`
        });
      }
    }

    return { success: true, notified: upcomingMaintenance.length };
  } catch (error) {
    console.error('Error checking weekly maintenance notifications:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notify admins about all activities (asset changes, user actions, etc.)
 */
async function notifyAdminsOfActivity(activityData) {
  try {
    const admins = await User.find({ status: 'Active', role: 'Administrator' });
    
    for (const admin of admins) {
      await createNotification({
        type: 'info',
        title: activityData.title || 'System Activity',
        message: activityData.message,
        userId: admin._id.toString(),
        assetId: activityData.assetId || null,
        priority: activityData.priority || 'low',
        actionUrl: activityData.actionUrl || null
      });
    }

    return { success: true, notified: admins.length };
  } catch (error) {
    console.error('Error notifying admins:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check for maintenance due today and send notifications
 */
async function checkDueMaintenanceNotifications() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find maintenance due today that hasn't been notified
    const dueMaintenance = await Maintenance.find({
      status: { $in: ['Scheduled', 'Not Started'] },
      scheduledDate: { $gte: today, $lt: tomorrow },
      notificationSent: false
    });

    console.log(`Found ${dueMaintenance.length} maintenance due today`);

    // Send notifications for each
    for (const maintenance of dueMaintenance) {
      await createNotification({
        type: 'maintenance',
        title: 'Maintenance Due Today',
        message: `Maintenance scheduled for ${maintenance.assetName} is due today. Service type: ${maintenance.serviceType}`,
        priority: maintenance.priority || 'medium',
        assetId: maintenance.assetId,
        assetName: maintenance.assetName,
        actionRequired: true,
        metadata: {
          maintenanceId: maintenance._id.toString(),
          serviceType: maintenance.serviceType,
          technician: maintenance.technician,
          scheduledDate: maintenance.scheduledDate
        }
      });

      // Mark notification as sent
      maintenance.notificationSent = true;
      await maintenance.save();

      // Update asset notification flag
      const asset = await Equipment.findOne({ id: maintenance.assetId });
      if (asset) {
        asset.maintenanceDueNotificationSent = true;
        await asset.save();
      }
    }

    return { success: true, notified: dueMaintenance.length };
  } catch (error) {
    console.error('Error checking due maintenance notifications:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check for maintenance due in 3 days and send reminder
 */
async function checkUpcomingMaintenanceReminders() {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setHours(0, 0, 0, 0);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const fourDaysFromNow = new Date(threeDaysFromNow);
    fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 1);

    // Find maintenance due in 3 days that hasn't been reminded
    const upcomingMaintenance = await Maintenance.find({
      status: 'Scheduled',
      scheduledDate: { $gte: threeDaysFromNow, $lt: fourDaysFromNow },
      reminderSent: false
    });

    console.log(`Found ${upcomingMaintenance.length} maintenance due in 3 days`);

    // Send reminders for each
    for (const maintenance of upcomingMaintenance) {
      await createNotification({
        type: 'reminder',
        title: 'Upcoming Maintenance Reminder',
        message: `Maintenance for ${maintenance.assetName} is scheduled in 3 days. Service type: ${maintenance.serviceType}`,
        priority: 'low',
        assetId: maintenance.assetId,
        assetName: maintenance.assetName,
        actionRequired: false,
        metadata: {
          maintenanceId: maintenance._id.toString(),
          serviceType: maintenance.serviceType,
          technician: maintenance.technician,
          scheduledDate: maintenance.scheduledDate
        }
      });

      // Mark reminder as sent
      maintenance.reminderSent = true;
      await maintenance.save();
    }

    return { success: true, reminded: upcomingMaintenance.length };
  } catch (error) {
    console.error('Error checking upcoming maintenance reminders:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check for overdue maintenance and send critical notifications
 */
async function checkOverdueMaintenanceNotifications() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find overdue maintenance
    const overdueMaintenance = await Maintenance.find({
      status: { $in: ['Scheduled', 'Not Started', 'In Progress'] },
      scheduledDate: { $lt: today },
      isOverdue: true
    });

    console.log(`Found ${overdueMaintenance.length} overdue maintenance`);

    // Send critical notifications for overdue items
    for (const maintenance of overdueMaintenance) {
      // Calculate days overdue
      const daysOverdue = Math.ceil((today - maintenance.scheduledDate) / (1000 * 60 * 60 * 24));
      
      // Only send notification on day 1, 3, 7, then weekly
      const shouldNotify = daysOverdue === 1 || 
                          daysOverdue === 3 || 
                          daysOverdue === 7 || 
                          (daysOverdue > 7 && daysOverdue % 7 === 0);

      if (shouldNotify) {
        await createNotification({
          type: 'critical',
          title: 'Overdue Maintenance',
          message: `Maintenance for ${maintenance.assetName} is ${daysOverdue} day(s) overdue! Service type: ${maintenance.serviceType}`,
          priority: 'critical',
          assetId: maintenance.assetId,
          assetName: maintenance.assetName,
          actionRequired: true,
          metadata: {
            maintenanceId: maintenance._id.toString(),
            serviceType: maintenance.serviceType,
            technician: maintenance.technician,
            scheduledDate: maintenance.scheduledDate,
            daysOverdue: daysOverdue
          }
        });
      }
    }

    return { success: true, overdue: overdueMaintenance.length };
  } catch (error) {
    console.error('Error checking overdue maintenance notifications:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Main function to run all maintenance notification checks
 * Call this from a daily cron job
 */
async function runMaintenanceNotificationChecks() {
  console.log('Starting maintenance notification checks...');
  
  const results = {
    timestamp: new Date(),
    dueToday: await checkDueMaintenanceNotifications(),
    upcoming: await checkUpcomingMaintenanceReminders(),
    overdue: await checkOverdueMaintenanceNotifications()
  };

  console.log('Maintenance notification checks completed:', results);
  return results;
}

module.exports = {
  runMaintenanceNotificationChecks,
  checkDueMaintenanceNotifications,
  checkUpcomingMaintenanceReminders,
  checkOverdueMaintenanceNotifications,
  checkWeeklyMaintenanceNotifications,
  notifyAdminsOfActivity
};
