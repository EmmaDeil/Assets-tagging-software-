/**
 * Notification Routes
 *
 * API endpoints for notification management
 */

const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

/**
 * GET /api/notifications
 * Get all notifications for the current user (sorted by newest first)
 * Query params: userId (required for user-specific notifications)
 */
router.get("/", async (req, res) => {
  try {
    const { userId, role } = req.query;
    
    let query = {};
    
    // If userId provided, get notifications for that user or admin-only notifications (null userId)
    if (userId) {
      // Regular users get their own notifications
      // Admins get their notifications + all general notifications (userId: null)
      if (role === 'Administrator') {
        query = {
          $or: [
            { userId: userId },
            { userId: null } // General admin notifications
          ]
        };
      } else {
        query = { userId: userId };
      }
    } else {
      // If no userId, return general notifications (backward compatibility)
      query = { userId: null };
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50); // Increased limit for better user experience
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

/**
 * GET /api/notifications/unread
 * Get unread notification count for the current user
 * Query params: userId, role
 */
router.get("/unread", async (req, res) => {
  try {
    const { userId, role } = req.query;
    
    let query = { read: false };
    
    if (userId) {
      if (role === 'Administrator') {
        query = {
          read: false,
          $or: [
            { userId: userId },
            { userId: null }
          ]
        };
      } else {
        query = { read: false, userId: userId };
      }
    } else {
      query = { read: false, userId: null };
    }
    
    const count = await Notification.countDocuments(query);
    res.json({ count });
  } catch (error) {
    console.error("Error counting unread notifications:", error);
    res.status(500).json({ error: "Failed to count notifications" });
  }
});

/**
 * POST /api/notifications
 * Create a new notification
 */
router.post("/", async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 */
router.patch("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
router.patch("/read-all", async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification
 */
router.delete("/:id", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

/**
 * DELETE /api/notifications
 * Clear all notifications
 */
router.delete("/", async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ message: "All notifications cleared" });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

module.exports = router;
