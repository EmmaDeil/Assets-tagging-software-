/**
 * Notification Helper Utility
 *
 * Helper functions to generate notifications for various asset events
 */

const Notification = require("../models/Notification");

/**
 * Create a maintenance due notification
 * @param {Object} asset - Asset object
 */
async function createMaintenanceNotification(asset) {
  try {
    const notification = new Notification({
      type: "maintenance",
      title: "Maintenance Due",
      message: `Asset ${asset.name} (${asset.id}) requires maintenance`,
      assetId: asset.id,
      priority: "high",
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating maintenance notification:", error);
  }
}

/**
 * Create a status change notification
 * @param {Object} asset - Asset object
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 */
async function createStatusChangeNotification(asset, oldStatus, newStatus) {
  try {
    const notification = new Notification({
      type: "status_change",
      title: "Asset Status Changed",
      message: `${asset.name} status changed from ${oldStatus} to ${newStatus}`,
      assetId: asset.id,
      priority: "medium",
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating status change notification:", error);
  }
}

/**
 * Create an assignment notification
 * @param {Object} asset - Asset object
 * @param {string} assignee - Person assigned to
 */
async function createAssignmentNotification(asset, assignee) {
  try {
    const notification = new Notification({
      type: "assignment",
      title: "Asset Assigned",
      message: `${asset.name} has been assigned to ${assignee}`,
      assetId: asset.id,
      priority: "medium",
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating assignment notification:", error);
  }
}

/**
 * Create a new asset notification
 * @param {Object} asset - Asset object
 */
async function createNewAssetNotification(asset) {
  try {
    const notification = new Notification({
      type: "info",
      title: "New Asset Registered",
      message: `${asset.name} (${asset.id}) has been added to inventory`,
      assetId: asset.id,
      priority: "low",
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating new asset notification:", error);
  }
}

/**
 * Create a critical alert notification
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {string} assetId - Optional asset ID
 */
async function createAlertNotification(title, message, assetId = null) {
  try {
    const notification = new Notification({
      type: "alert",
      title,
      message,
      assetId,
      priority: "high",
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating alert notification:", error);
  }
}

module.exports = {
  createMaintenanceNotification,
  createStatusChangeNotification,
  createAssignmentNotification,
  createNewAssetNotification,
  createAlertNotification,
};
