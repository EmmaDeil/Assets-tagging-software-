/**
 * Notification Model
 *
 * MongoDB schema for system notifications
 */

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["maintenance", "status_change", "assignment", "alert", "info"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    assetId: {
      type: String,
      default: null,
    },
    userId: {
      type: String,
      default: null,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    read: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
notificationSchema.index({ read: 1, createdAt: -1 });
notificationSchema.index({ assetId: 1 });
notificationSchema.index({ userId: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
