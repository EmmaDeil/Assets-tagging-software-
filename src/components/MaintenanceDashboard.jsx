/**
 * MaintenanceDashboard.jsx
 *
 * Main maintenance management interface with overview cards,
 * maintenance list, and quick actions for scheduling and managing maintenance.
 */

import React, { useState, useEffect, useCallback } from "react";
import API_BASE_URL from "../config/api";
import { getDefaultCurrency, getCurrencySymbol } from "../config/currency";

export default function MaintenanceDashboard({ onNavigateToCalendar }) {
  const [maintenanceData, setMaintenanceData] = useState({
    scheduled: [],
    inProgress: [],
    overdue: [],
    dueToday: [],
    upcoming: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionNotes, setActionNotes] = useState("");
  const [actionCost, setActionCost] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Default currency state
  const [defaultCurrency, setDefaultCurrency] = useState("USD");

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const loadMaintenanceData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all maintenance types in parallel
      const [scheduled, inProgress, overdue, dueToday, upcoming] =
        await Promise.all([
          fetch(`${API_BASE_URL}/maintenance?status=Scheduled`).then((r) =>
            r.json()
          ),
          fetch(`${API_BASE_URL}/maintenance?status=In Progress`).then((r) =>
            r.json()
          ),
          fetch(`${API_BASE_URL}/maintenance/overdue/list`).then((r) =>
            r.json()
          ),
          fetch(`${API_BASE_URL}/maintenance/due/today`).then((r) => r.json()),
          fetch(`${API_BASE_URL}/maintenance/upcoming/list?days=30`).then((r) =>
            r.json()
          ),
        ]);

      setMaintenanceData({
        scheduled,
        inProgress,
        overdue,
        dueToday,
        upcoming,
      });
    } catch (error) {
      console.error("Error loading maintenance data:", error);
      showToast("Failed to load maintenance data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMaintenanceData();
  }, [loadMaintenanceData]);

  // Load default currency on component mount
  useEffect(() => {
    const loadCurrency = async () => {
      const currency = await getDefaultCurrency();
      setDefaultCurrency(currency);
    };
    loadCurrency();
  }, []);

  const handleStartMaintenance = (maintenance) => {
    setSelectedMaintenance(maintenance);
    setActionType("start");
    setActionNotes("");
    setShowActionModal(true);
  };

  const handleCompleteMaintenance = (maintenance) => {
    setSelectedMaintenance(maintenance);
    setActionType("complete");
    setActionNotes("");
    setActionCost(maintenance.cost || "");
    setShowActionModal(true);
  };

  const handleNotStarted = (maintenance) => {
    setSelectedMaintenance(maintenance);
    setActionType("notStarted");
    setActionNotes("");
    setShowActionModal(true);
  };

  const submitAction = async () => {
    if (!selectedMaintenance) return;

    try {
      setSubmitting(true);
      let endpoint = "";
      let body = {};

      switch (actionType) {
        case "start":
          endpoint = `${API_BASE_URL}/maintenance/${selectedMaintenance._id}/start`;
          body = { notes: actionNotes };
          break;
        case "complete":
          endpoint = `${API_BASE_URL}/maintenance/${selectedMaintenance._id}/complete`;
          body = {
            completedBy: "Current User", // TODO: Get from auth context
            notes: actionNotes,
            cost: parseFloat(actionCost) || 0,
          };
          break;
        case "notStarted":
          endpoint = `${API_BASE_URL}/maintenance/${selectedMaintenance._id}/not-started`;
          body = { notes: actionNotes };
          break;
        default:
          return;
      }

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to update maintenance");

      showToast(
        `Maintenance ${
          actionType === "complete" ? "completed" : "updated"
        } successfully!`,
        "success"
      );
      setShowActionModal(false);
      setSelectedMaintenance(null);
      setActionNotes("");
      setActionCost("");
      loadMaintenanceData();
    } catch (error) {
      console.error("Error updating maintenance:", error);
      showToast("Failed to update maintenance", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysUntil = (date) => {
    const today = new Date();
    const scheduled = new Date(date);
    const diffTime = scheduled - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (status) => {
    const badges = {
      Scheduled:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      "In Progress":
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      Completed:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      Cancelled:
        "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
      "Not Started":
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return badges[status] || badges["Scheduled"];
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      Low: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
      Medium:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      High: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
      Critical: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    };
    return badges[priority] || badges["Medium"];
  };

  const allMaintenance = [
    ...maintenanceData.scheduled,
    ...maintenanceData.inProgress,
    ...maintenanceData.overdue,
  ];

  const filteredMaintenance =
    activeTab === "all"
      ? allMaintenance
      : activeTab === "overdue"
      ? maintenanceData.overdue
      : activeTab === "inProgress"
      ? maintenanceData.inProgress
      : activeTab === "scheduled"
      ? maintenanceData.scheduled
      : allMaintenance;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Maintenance Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Schedule, track, and manage asset maintenance
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigateToCalendar && onNavigateToCalendar()}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
          >
            <span className="material-symbols-outlined text-sm sm:text-base">
              calendar_month
            </span>
            <span className="hidden sm:inline">Calendar</span>
            <span className="sm:hidden">Cal</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2 p-2">
            {[
              { id: "all", label: "All", icon: "list" },
              { id: "overdue", label: "Overdue", icon: "warning" },
              { id: "inProgress", label: "In Progress", icon: "engineering" },
              { id: "scheduled", label: "Scheduled", icon: "event" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {tab.icon}
                </span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">
                  {tab.id === "inProgress" ? "Progress" : tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Maintenance List */}
        <div className="p-3 sm:p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredMaintenance.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
                build
              </span>
              <p className="text-gray-600 dark:text-gray-400">
                No maintenance found
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMaintenance.map((maintenance) => {
                const daysUntil = getDaysUntil(maintenance.scheduledDate);
                const isOverdue = daysUntil < 0;

                return (
                  <div
                    key={maintenance._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      {/* Left: Asset Info */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                            {maintenance.assetName}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                              maintenance.status
                            )}`}
                          >
                            {maintenance.status}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(
                              maintenance.priority
                            )}`}
                          >
                            {maintenance.priority}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Asset ID:
                            </span>
                            <span className="ml-2 text-gray-900 dark:text-white font-medium">
                              {maintenance.assetId}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Service Type:
                            </span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                              {maintenance.serviceType}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Technician:
                            </span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                              {maintenance.technician}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Scheduled:
                            </span>
                            <span
                              className={`ml-2 font-medium ${
                                isOverdue
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-gray-900 dark:text-white"
                              }`}
                            >
                              {formatDate(maintenance.scheduledDate)}
                              {isOverdue &&
                                ` (${Math.abs(daysUntil)} days overdue)`}
                              {!isOverdue && daysUntil === 0 && " (Today)"}
                              {!isOverdue &&
                                daysUntil > 0 &&
                                ` (in ${daysUntil} days)`}
                            </span>
                          </div>
                        </div>

                        {maintenance.description && (
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {maintenance.description}
                          </p>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                        {maintenance.status === "Scheduled" && (
                          <>
                            <button
                              onClick={() =>
                                handleStartMaintenance(maintenance)
                              }
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs sm:text-sm"
                            >
                              <span className="material-symbols-outlined text-sm">
                                play_arrow
                              </span>
                              Start
                            </button>
                            <button
                              onClick={() => handleNotStarted(maintenance)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-xs sm:text-sm whitespace-nowrap"
                            >
                              <span className="material-symbols-outlined text-sm">
                                block
                              </span>
                              <span className="hidden sm:inline">
                                Not Started
                              </span>
                              <span className="sm:hidden">Skip</span>
                            </button>
                          </>
                        )}
                        {maintenance.status === "In Progress" && (
                          <button
                            onClick={() =>
                              handleCompleteMaintenance(maintenance)
                            }
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs sm:text-sm"
                          >
                            <span className="material-symbols-outlined text-sm">
                              check_circle
                            </span>
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && selectedMaintenance && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {actionType === "start" && "Start Maintenance"}
                {actionType === "complete" && "Complete Maintenance"}
                {actionType === "notStarted" && "Mark as Not Started"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedMaintenance.assetName} -{" "}
                {selectedMaintenance.serviceType}
              </p>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {actionType === "complete" && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cost ({getCurrencySymbol(defaultCurrency)})
                  </label>
                  <input
                    type="number"
                    value={actionCost}
                    onChange={(e) => setActionCost(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter cost"
                    step="0.0"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add notes about this maintenance..."
                />
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedMaintenance(null);
                  setActionNotes("");
                  setActionCost("");
                }}
                className="w-full sm:w-auto px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                disabled={submitting}
                className="w-full sm:w-auto px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {toast.type === "success"
                ? "check_circle"
                : toast.type === "error"
                ? "error"
                : "info"}
            </span>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
