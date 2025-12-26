/**
 * NotificationContext.jsx
 *
 * Global notification management system for the application.
 * Handles notification creation, updates, and real-time synchronization with backend.
 *
 * Features:
 * - Real-time notification fetching
 * - Mark notifications as read/unread
 * - Delete notifications
 * - Unread count tracking
 * - Automatic notifications for asset events (maintenance due, status changes, etc.)
 * - Toast notifications for new alerts
 *
 * Notification Types:
 * - maintenance: Asset maintenance due or overdue
 * - status_change: Asset status updated
 * - assignment: Asset assigned to user
 * - alert: General system alerts
 * - info: Informational messages
 */

import React, { createContext, useState, useEffect, useCallback } from "react";
import API_BASE_URL from "../config/api";
import { useAuth } from "./AuthContext";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const API_URL = `${API_BASE_URL}/notifications`;

  /**
   * Fetch all notifications from backend
   */
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const userId = user?._id;
      const role = user?.role;

      const url = userId ? `${API_URL}?userId=${userId}&role=${role}` : API_URL;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        // Count unread notifications
        const unread = data.filter((notif) => !notif.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Add a new notification
   * @param {Object} notification - Notification object
   */
  const addNotification = async (notification) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notification),
      });

      if (response.ok) {
        const newNotification = await response.json();
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        return newNotification;
      }
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   */
  const markAsRead = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}/read`, {
        method: "PATCH",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === id ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_URL}/read-all`, {
        method: "PATCH",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  /**
   * Delete a notification
   * @param {string} id - Notification ID
   */
  const deleteNotification = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const deletedNotif = notifications.find((n) => n._id === id);
        setNotifications((prev) => prev.filter((notif) => notif._id !== id));
        if (deletedNotif && !deletedNotif.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  /**
   * Clear all notifications
   */
  const clearAllNotifications = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  /**
   * Create maintenance due notification
   * @param {Object} asset - Asset object
   */
  const notifyMaintenanceDue = (asset) => {
    addNotification({
      type: "maintenance",
      title: "Maintenance Due",
      message: `Asset ${asset.name} (${asset.id}) requires maintenance`,
      assetId: asset.id,
      priority: "high",
    });
  };

  /**
   * Create status change notification
   * @param {Object} asset - Asset object
   * @param {string} oldStatus - Previous status
   * @param {string} newStatus - New status
   */
  const notifyStatusChange = (asset, oldStatus, newStatus) => {
    addNotification({
      type: "status_change",
      title: "Asset Status Changed",
      message: `${asset.name} status changed from ${oldStatus} to ${newStatus}`,
      assetId: asset.id,
      priority: "medium",
    });
  };

  /**
   * Create assignment notification
   * @param {Object} asset - Asset object
   * @param {string} assignee - Person assigned to
   */
  const notifyAssignment = (asset, assignee) => {
    addNotification({
      type: "assignment",
      title: "Asset Assigned",
      message: `${asset.name} has been assigned to ${assignee}`,
      assetId: asset.id,
      priority: "medium",
    });
  };

  // Fetch notifications on mount and set up polling
  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    notifyMaintenanceDue,
    notifyStatusChange,
    notifyAssignment,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
