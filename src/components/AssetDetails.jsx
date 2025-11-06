/**
 * AssetDetails.jsx
 *
 * Detailed view component for displaying comprehensive information about a single asset.
 * Provides a complete overview with activity history, QR code, and edit capabilities.
 *
 * Features:
 * - Full asset information display (all fields)
 * - Real-time QR code generation for asset identification
 * - Activity history timeline specific to the asset
 * - Tabbed interface (Activity, Documents, History)
 * - Status badge with color-coded visual indicators
 * - Edit button integration
 * - Print QR code functionality
 * - Responsive layout with mobile support
 * - Breadcrumb navigation
 * - Not found handling for invalid asset IDs
 *
 * Information Displayed:
 * - Asset Name and ID
 * - Status with color-coded badge
 * - Category/Type
 * - Location
 * - Model and Serial Number
 * - Acquisition/Purchase Date
 * - Description/Notes
 * - Maintenance Period
 * - Last activity timestamp
 * - QR code (150x150px)
 *
 * Tabs:
 * 1. Activity - Recent actions and changes to the asset
 * 2. Documents - Placeholder for asset documentation (future feature)
 * 3. History - Placeholder for full audit history (future feature)
 *
 * Props:
 * @param {string} assetId - Unique ID of the asset to display
 * @param {Function} onClose - Callback when user clicks "Back to Assets" button
 * @param {Function} onEdit - Callback when user clicks "Edit Asset" button
 *                             Receives the asset object as parameter
 *
 * State:
 * @state {string} activeTab - Currently selected tab ("activity", "documents", "history")
 *
 * Context Usage:
 * @context {Array} items - All assets for finding the requested asset
 * @context {Array} activities - Activity log for filtering asset-specific activities
 *
 * Error Handling:
 * - Displays "Asset not found" message if assetId doesn't match any asset
 * - Provides "Back to Assets" button for navigation recovery
 *
 * @example
 * <AssetDetails
 *   assetId="1699276800000-a3b5c7d"
 *   onClose={() => setView('management')}
 *   onEdit={(asset) => console.log('Editing:', asset)}
 * />
 */

import React, { useState, useContext } from "react";
import { EquipmentContext } from "../context/EquipmentContext";

const AssetDetails = ({ assetId, onClose, onEdit }) => {
  // Access global equipment context for asset data and activities
  const { items, activities } = useContext(EquipmentContext);

  // State: Active tab in the tabbed interface
  const [activeTab, setActiveTab] = useState("activity");

  // Find the asset by ID from the global items array
  const asset = items.find((item) => item.id === assetId);

  // Handle case where asset ID doesn't match any existing asset
  if (!asset) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Asset not found</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Assets
        </button>
      </div>
    );
  }

  // Filter activities for this specific asset
  // Checks both equipmentId and assetId for backward compatibility
  const assetActivities = activities.filter(
    (activity) =>
      activity.equipmentId === asset.id || activity.assetId === asset.id
  );

  /**
   * Get status badge styling configuration
   *
   * Returns color scheme object for displaying asset status with appropriate colors.
   * Supports both light and dark modes with tailwind classes.
   *
   * @param {string} status - Asset status ("In Use", "In Maintenance", "Retired", "In Storage")
   * @returns {Object} Style configuration with bg, text, and dot color classes
   */
  const getStatusBadge = (status) => {
    const statusConfig = {
      "In Use": {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-400",
        dot: "bg-green-600",
      },
      "In Maintenance": {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-700 dark:text-yellow-400",
        dot: "bg-yellow-600",
      },
      Retired: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
        dot: "bg-red-600",
      },
      "In Storage": {
        bg: "bg-gray-100 dark:bg-gray-900/30",
        text: "text-gray-700 dark:text-gray-400",
        dot: "bg-gray-600",
      },
    };
    const config = statusConfig[status] || statusConfig["In Storage"];

    return (
      <div
        className={`flex h-7 shrink-0 items-center justify-center gap-x-1.5 rounded-full px-3 py-1 ${config.bg}`}
      >
        <div className={`size-2 rounded-full ${config.dot}`}></div>
        <p className={`text-xs font-medium ${config.text}`}>
          {status || "Active"}
        </p>
      </div>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get activity icon
  const getActivityIcon = (action) => {
    const icons = {
      Added: "add_circle",
      Updated: "edit",
      "Location Changed": "location_on",
      Assigned: "person",
      "Status Changed": "sync",
      Maintenance: "build",
    };
    return icons[action] || "circle";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap gap-2 pb-4">
            <button
              onClick={onClose}
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600"
            >
              Assets
            </button>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              /
            </span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {asset.category || "Equipment"}
            </span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              /
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {asset.id}
            </span>
          </div>

          {/* Page Heading with Actions */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-6">
            <div className="flex min-w-72 flex-col gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-gray-900 dark:text-gray-100">
                  {asset.name}
                </h1>
                {getStatusBadge(asset.status)}
              </div>
              <p className="text-base font-normal leading-normal text-gray-600 dark:text-gray-400">
                {asset.id}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex shrink-0 gap-3">
              <button
                onClick={onClose}
                className="flex h-10 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 px-4 text-sm font-bold leading-normal tracking-[0.015em] text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <span className="material-symbols-outlined text-sm">
                  arrow_back
                </span>
                <span className="truncate">Back</span>
              </button>
              <button
                onClick={() => onEdit(asset)}
                className="flex h-10 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-blue-600 px-4 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-700"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                <span className="truncate">Edit Asset</span>
              </button>
            </div>
          </div>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column (Summary) */}
            <aside className="lg:col-span-1">
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Asset Details
                </h2>
                <div className="space-y-5">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Current Location
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {asset.location || "Not specified"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Assigned To
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {asset.assignedTo || "Unassigned"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Department
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {asset.department || "Not specified"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Asset Category
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {asset.category || "Not specified"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Acquisition Date &amp; Cost
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(
                        asset.purchaseDate ||
                          asset.acquisitionDate ||
                          asset.createdAt
                      )}{" "}
                      - $
                      {typeof asset.cost === "number"
                        ? asset.cost.toFixed(2)
                        : "0.00"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Model Number
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {asset.model || "Not specified"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Serial Number
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 break-all">
                      {asset.serial || "Not specified"}
                    </span>
                  </div>
                  {asset.maintenancePeriod && (
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Maintenance Schedule
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {asset.maintenancePeriod}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Right Column (Tabs) */}
            <div className="lg:col-span-2">
              <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("activity")}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === "activity"
                      ? "text-blue-600 border-b-2 border-blue-600 font-bold"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  Activity Log
                </button>
                <button
                  onClick={() => setActiveTab("documents")}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === "documents"
                      ? "text-blue-600 border-b-2 border-blue-600 font-bold"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  Documents
                </button>
                <button
                  onClick={() => setActiveTab("maintenance")}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === "maintenance"
                      ? "text-blue-600 border-b-2 border-blue-600 font-bold"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  Maintenance History
                </button>
                <button
                  onClick={() => setActiveTab("notes")}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === "notes"
                      ? "text-blue-600 border-b-2 border-blue-600 font-bold"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  Notes
                </button>
              </div>

              <div className="pt-6">
                {/* Activity Log Tab */}
                {activeTab === "activity" && (
                  <div className="flow-root">
                    {assetActivities.length > 0 ? (
                      <ul className="-mb-8" role="list">
                        {assetActivities.map((activity, idx) => (
                          <li key={idx}>
                            <div
                              className={`relative ${
                                idx !== assetActivities.length - 1 ? "pb-8" : ""
                              }`}
                            >
                              {idx !== assetActivities.length - 1 && (
                                <span
                                  aria-hidden="true"
                                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                                ></span>
                              )}
                              <div className="relative flex items-start space-x-3">
                                <div>
                                  <div className="relative px-1">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-gray-800 ring-8 ring-gray-50 dark:ring-gray-900">
                                      <span
                                        className="material-symbols-outlined text-gray-600 dark:text-gray-400"
                                        style={{ fontSize: "18px" }}
                                      >
                                        {getActivityIcon(activity.action)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="min-w-0 flex-1 py-1.5">
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                      {activity.action}
                                    </span>
                                    {activity.details && (
                                      <span> - {activity.details}</span>
                                    )}
                                  </div>
                                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                    <time dateTime={activity.timestamp}>
                                      {formatDate(activity.timestamp)} at{" "}
                                      {formatTime(activity.timestamp)}
                                    </time>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-12">
                        <span className="material-symbols-outlined text-gray-400 text-5xl">
                          history
                        </span>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                          No activity history available
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === "documents" && (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-gray-400 text-5xl">
                      description
                    </span>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      No documents uploaded
                    </p>
                    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                      Upload Document
                    </button>
                  </div>
                )}

                {/* Maintenance History Tab */}
                {activeTab === "maintenance" && (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-gray-400 text-5xl">
                      build
                    </span>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      No maintenance records
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                      Scheduled Maintenance:{" "}
                      {asset.maintenancePeriod || "Not set"}
                    </p>
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === "notes" && (
                  <div className="p-6">
                    {asset.notes ? (
                      <div className="prose dark:prose-invert max-w-none">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                          Asset Notes
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {asset.notes}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <span className="material-symbols-outlined text-gray-400 text-5xl">
                          note
                        </span>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                          No notes available for this asset
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssetDetails;
