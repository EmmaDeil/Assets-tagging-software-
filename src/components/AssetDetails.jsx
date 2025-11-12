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

import React, { useState, useContext, useEffect } from "react";
import { EquipmentContext } from "../context/EquipmentContext";
import QRCode from "react-qr-code";

const AssetDetails = ({ assetId, onClose, onEdit }) => {
  // Access global equipment context for asset data and activities
  const { items, activities } = useContext(EquipmentContext);

  // State: Active tab in the tabbed interface
  const [activeTab, setActiveTab] = useState("activity");

  // State: QR Code visibility
  const [showQRCode, setShowQRCode] = useState(false);

  // State: Maintenance records
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const [maintenanceFormData, setMaintenanceFormData] = useState({
    serviceType: "",
    technician: "",
    cost: "",
    status: "Scheduled",
    date: new Date().toISOString().split("T")[0],
    description: "",
    notes: "",
  });

  // State: Documents
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documents, setDocuments] = useState([]);

  // Find the asset by ID from the global items array
  const asset = items.find((item) => item.id === assetId);

  // Initialize documents from asset data
  useEffect(() => {
    if (asset && asset.attachedFiles) {
      setDocuments(asset.attachedFiles);
    }
  }, [asset]);

  // Fetch maintenance records when component mounts or assetId changes
  useEffect(() => {
    const fetchMaintenanceRecords = async () => {
      if (!assetId) return;

      try {
        setLoadingMaintenance(true);
        const response = await fetch(
          `http://localhost:5000/api/maintenance?assetId=${assetId}`
        );
        if (response.ok) {
          const data = await response.json();
          setMaintenanceRecords(data);
        }
      } catch (error) {
        console.error("Error fetching maintenance records:", error);
      } finally {
        setLoadingMaintenance(false);
      }
    };

    fetchMaintenanceRecords();
  }, [assetId]);

  /**
   * Handle maintenance form input changes
   */
  const handleMaintenanceChange = (e) => {
    const { name, value } = e.target;
    setMaintenanceFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle adding new maintenance record
   */
  const handleAddMaintenance = async (e) => {
    e.preventDefault();

    try {
      const maintenanceData = {
        ...maintenanceFormData,
        assetId: asset.id,
        assetName: asset.name,
        cost: parseFloat(maintenanceFormData.cost) || 0,
      };

      const response = await fetch("http://localhost:5000/api/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(maintenanceData),
      });

      if (response.ok) {
        const newRecord = await response.json();
        setMaintenanceRecords((prev) => [newRecord, ...prev]);
        setShowAddMaintenance(false);
        // Reset form
        setMaintenanceFormData({
          serviceType: "",
          technician: "",
          cost: "",
          status: "Scheduled",
          date: new Date().toISOString().split("T")[0],
          description: "",
          notes: "",
        });
      }
    } catch (error) {
      console.error("Error adding maintenance record:", error);
      alert("Failed to add maintenance record. Please try again.");
    }
  };

  /**
   * Handle deleting maintenance record
   */
  const handleDeleteMaintenance = async (maintenanceId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this maintenance record?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/maintenance/${maintenanceId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setMaintenanceRecords((prev) =>
          prev.filter((record) => record._id !== maintenanceId)
        );
      }
    } catch (error) {
      console.error("Error deleting maintenance record:", error);
      alert("Failed to delete maintenance record. Please try again.");
    }
  };

  /**
   * Get status badge for maintenance record
   */
  const getMaintenanceStatusBadge = (status) => {
    const statusConfig = {
      Completed: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-400",
        dot: "bg-green-600",
      },
      "In Progress": {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-700 dark:text-yellow-400",
        dot: "bg-yellow-600",
      },
      Scheduled: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-700 dark:text-blue-400",
        dot: "bg-blue-600",
      },
      Cancelled: {
        bg: "bg-gray-100 dark:bg-gray-900/30",
        text: "text-gray-700 dark:text-gray-400",
        dot: "bg-gray-600",
      },
    };

    return statusConfig[status] || statusConfig.Scheduled;
  };

  /**
   * Handle document upload
   */
  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setUploadingDocument(true);

    try {
      const formData = new FormData();
      formData.append("document", file);

      const response = await fetch(
        `http://localhost:5000/api/equipment/${asset.id}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDocuments((prev) => [...prev, data.file]);
        // Reset file input
        e.target.value = "";
      } else {
        const error = await response.json();
        alert(error.message || "Failed to upload document");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Failed to upload document. Please try again.");
    } finally {
      setUploadingDocument(false);
    }
  };

  /**
   * Handle document deletion
   */
  const handleDeleteDocument = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/equipment/${asset.id}/document/${fileId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== fileId));
      } else {
        const error = await response.json();
        alert(error.message || "Failed to delete document");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document. Please try again.");
    }
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  /**
   * Get file icon based on type
   */
  const getFileIcon = (type) => {
    if (type.includes("pdf")) return "picture_as_pdf";
    if (type.includes("word") || type.includes("document"))
      return "description";
    if (type.includes("excel") || type.includes("spreadsheet"))
      return "table_chart";
    if (type.includes("image")) return "image";
    return "insert_drive_file";
  };

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
   * @param {string} status - Asset status ("In Use", "Under Maintenance", "Retired", "Available", "Lost")
   * @returns {Object} Style configuration with bg, text, and dot color classes
   */
  const getStatusBadge = (status) => {
    const statusConfig = {
      "In Use": {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-400",
        dot: "bg-green-600",
      },
      Available: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-700 dark:text-blue-400",
        dot: "bg-blue-600",
      },
      "Under Maintenance": {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-700 dark:text-yellow-400",
        dot: "bg-yellow-600",
      },
      Retired: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
        dot: "bg-red-600",
      },
      Lost: {
        bg: "bg-gray-100 dark:bg-gray-900/30",
        text: "text-gray-700 dark:text-gray-400",
        dot: "bg-gray-600",
      },
    };
    const config = statusConfig[status] || statusConfig["Available"];

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

  // Print QR Code
  const handlePrintQRCode = () => {
    const printWindow = window.open("", "_blank");
    const qrElement = document.getElementById("asset-detail-qr-code");

    if (qrElement) {
      const svgData = qrElement.innerHTML;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - ${asset.name}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
              }
              .qr-container {
                text-align: center;
                padding: 20px;
              }
              h1 {
                margin-bottom: 10px;
                font-size: 18px;
              }
              p {
                margin: 5px 0;
                color: #666;
                font-size: 12px;
              }
              .qr-code {
                margin: 20px 0;
              }
              .qr-code svg {
                width: 64px !important;
                height: 64px !important;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h1>${asset.name}</h1>
              <p><strong>Tag ID:</strong> ${asset.id}</p>
              <p><strong>Location:</strong> ${asset.location || "N/A"}</p>
              <div class="qr-code">
                ${svgData}
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
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

                  {/* QR Code Buttons */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowQRCode(!showQRCode)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                      >
                        <span className="material-symbols-outlined text-lg">
                          qr_code
                        </span>
                        {showQRCode ? "Hide" : "Show"} QR
                      </button>
                      <button
                        onClick={handlePrintQRCode}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
                      >
                        <span className="material-symbols-outlined text-lg">
                          print
                        </span>
                        Print QR
                      </button>
                    </div>

                    {/* QR Code Display - Small, underneath buttons */}
                    {showQRCode && (
                      <div className="mt-4 flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div
                          id="asset-detail-qr-code"
                          className="bg-white p-2 rounded-lg"
                        >
                          <QRCode
                            value={`ASSET:${asset.id}|${asset.name}|${
                              asset.location || "N/A"
                            }`}
                            size={64}
                            level="H"
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                          {asset.id}
                        </p>
                      </div>
                    )}
                  </div>
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
                  <div className="p-6">
                    {/* Upload Section */}
                    <div className="mb-6">
                      <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg appearance-none cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none">
                        <span className="flex items-center space-x-2">
                          <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
                            upload_file
                          </span>
                          <span className="font-medium text-gray-600 dark:text-gray-400">
                            {uploadingDocument
                              ? "Uploading..."
                              : "Drop files to attach, or browse"}
                          </span>
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleDocumentUpload}
                          disabled={uploadingDocument}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                        />
                      </label>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Supported formats: PDF, DOC, XLS, TXT, Images (Max 10MB)
                      </p>
                    </div>

                    {/* Documents List */}
                    {documents.length > 0 ? (
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Uploaded Documents ({documents.length})
                        </h3>
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">
                                {getFileIcon(doc.type)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {doc.name}
                                </p>
                                <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                                  <span>{formatFileSize(doc.size)}</span>
                                  <span>•</span>
                                  <span>
                                    {doc.uploadDate
                                      ? new Date(
                                          doc.uploadDate
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <a
                                href={`http://localhost:5000/api/equipment/${asset.id}/document/${doc.id}/download`}
                                download={doc.name}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                                title="Download"
                              >
                                <span className="material-symbols-outlined text-lg">
                                  download
                                </span>
                              </a>
                              <button
                                onClick={() =>
                                  handleDeleteDocument(doc.id, doc.name)
                                }
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                                title="Delete"
                              >
                                <span className="material-symbols-outlined text-lg">
                                  delete
                                </span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <span className="material-symbols-outlined text-gray-400 text-5xl">
                          description
                        </span>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                          No documents uploaded yet
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                          Upload your first document using the area above
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Maintenance History Tab */}
                {activeTab === "maintenance" && (
                  <div className="p-6">
                    {/* Header with Add Button */}
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Maintenance History for {asset.name}
                      </h3>
                      <button
                        onClick={() => setShowAddMaintenance(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        <span className="material-symbols-outlined text-lg">
                          add
                        </span>
                        Add Maintenance Record
                      </button>
                    </div>

                    {/* Maintenance Schedule Info */}
                    {asset.maintenancePeriod && (
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <span className="font-medium">
                            Scheduled Maintenance:
                          </span>{" "}
                          {asset.maintenancePeriod}
                        </p>
                      </div>
                    )}

                    {/* Loading State */}
                    {loadingMaintenance && (
                      <div className="text-center py-12">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                          Loading maintenance records...
                        </p>
                      </div>
                    )}

                    {/* Maintenance Records Table */}
                    {!loadingMaintenance && maintenanceRecords.length > 0 && (
                      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[800px] text-left">
                            <thead>
                              <tr className="bg-gray-50 dark:bg-gray-800">
                                <th className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Date
                                </th>
                                <th className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Service Type
                                </th>
                                <th className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Technician
                                </th>
                                <th className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Cost
                                </th>
                                <th className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Status
                                </th>
                                <th className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {maintenanceRecords.map((record) => {
                                const statusBadge = getMaintenanceStatusBadge(
                                  record.status
                                );
                                return (
                                  <tr
                                    key={record._id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                  >
                                    <td className="p-4 text-sm text-gray-900 dark:text-gray-100">
                                      {new Date(
                                        record.date
                                      ).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-sm text-gray-900 dark:text-gray-100">
                                      {record.serviceType}
                                    </td>
                                    <td className="p-4 text-sm text-gray-900 dark:text-gray-100">
                                      {record.technician}
                                    </td>
                                    <td className="p-4 text-sm text-gray-900 dark:text-gray-100">
                                      ${record.cost.toFixed(2)}
                                    </td>
                                    <td className="p-4">
                                      <span
                                        className={`inline-flex items-center gap-1.5 rounded-full ${statusBadge.bg} px-2 py-1 text-xs font-medium ${statusBadge.text}`}
                                      >
                                        <span
                                          className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}
                                        ></span>
                                        {record.status}
                                      </span>
                                    </td>
                                    <td className="p-4">
                                      <button
                                        onClick={() =>
                                          handleDeleteMaintenance(record._id)
                                        }
                                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                        title="Delete record"
                                      >
                                        <span className="material-symbols-outlined text-lg">
                                          delete
                                        </span>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {!loadingMaintenance && maintenanceRecords.length === 0 && (
                      <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">
                            build
                          </span>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                          No maintenance records yet
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          Get started by adding the first maintenance record for
                          this asset.
                        </p>
                        <div className="mt-6">
                          <button
                            onClick={() => setShowAddMaintenance(true)}
                            className="flex items-center mx-auto justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                          >
                            <span className="material-symbols-outlined text-lg">
                              add
                            </span>
                            Add First Record
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Add Maintenance Modal */}
                    {showAddMaintenance && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                          <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Add Maintenance Record
                              </h2>
                              <button
                                onClick={() => setShowAddMaintenance(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              >
                                <span className="material-symbols-outlined">
                                  close
                                </span>
                              </button>
                            </div>

                            <form onSubmit={handleAddMaintenance}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Date */}
                                <div className="col-span-1">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Date *
                                  </label>
                                  <input
                                    type="date"
                                    name="date"
                                    value={maintenanceFormData.date}
                                    onChange={handleMaintenanceChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                                  />
                                </div>

                                {/* Service Type */}
                                <div className="col-span-1">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Service Type *
                                  </label>
                                  <select
                                    name="serviceType"
                                    value={maintenanceFormData.serviceType}
                                    onChange={handleMaintenanceChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                                  >
                                    <option value="">Select type</option>
                                    <option value="Annual Inspection">
                                      Annual Inspection
                                    </option>
                                    <option value="Repair">Repair</option>
                                    <option value="Preventative Maintenance">
                                      Preventative Maintenance
                                    </option>
                                    <option value="Emergency Repair">
                                      Emergency Repair
                                    </option>
                                    <option value="Routine Maintenance">
                                      Routine Maintenance
                                    </option>
                                    <option value="Calibration">
                                      Calibration
                                    </option>
                                    <option value="Upgrade">Upgrade</option>
                                    <option value="Cleaning">Cleaning</option>
                                    <option value="Other">Other</option>
                                  </select>
                                </div>

                                {/* Technician */}
                                <div className="col-span-1">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Technician *
                                  </label>
                                  <input
                                    type="text"
                                    name="technician"
                                    value={maintenanceFormData.technician}
                                    onChange={handleMaintenanceChange}
                                    required
                                    placeholder="Enter technician name"
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                                  />
                                </div>

                                {/* Cost */}
                                <div className="col-span-1">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Cost ($) *
                                  </label>
                                  <input
                                    type="number"
                                    name="cost"
                                    value={maintenanceFormData.cost}
                                    onChange={handleMaintenanceChange}
                                    required
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                                  />
                                </div>

                                {/* Status */}
                                <div className="col-span-1 md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status *
                                  </label>
                                  <select
                                    name="status"
                                    value={maintenanceFormData.status}
                                    onChange={handleMaintenanceChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                                  >
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="In Progress">
                                      In Progress
                                    </option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </div>

                                {/* Description */}
                                <div className="col-span-1 md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                  </label>
                                  <textarea
                                    name="description"
                                    value={maintenanceFormData.description}
                                    onChange={handleMaintenanceChange}
                                    rows="3"
                                    placeholder="Describe the maintenance work..."
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                                  />
                                </div>

                                {/* Notes */}
                                <div className="col-span-1 md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Notes
                                  </label>
                                  <textarea
                                    name="notes"
                                    value={maintenanceFormData.notes}
                                    onChange={handleMaintenanceChange}
                                    rows="2"
                                    placeholder="Additional notes..."
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                                  />
                                </div>
                              </div>

                              {/* Form Actions */}
                              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                  type="button"
                                  onClick={() => setShowAddMaintenance(false)}
                                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                  Add Record
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    )}
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
