/**
 * MaintenanceRecords.jsx
 *
 * Historical maintenance records page with filtering, search,
 * statistics, and export capabilities.
 */

import React, { useState, useEffect, useCallback } from "react";
import API_BASE_URL from "../config/api";

export default function MaintenanceRecords() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    serviceType: "",
    technician: "",
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statistics, setStatistics] = useState({
    totalRecords: 0,
    totalCost: 0,
    averageCost: 0,
    mostCommonServiceType: "",
    mostCommonTechnician: "",
  });

  // Toast notification
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const calculateStatistics = useCallback((data) => {
    if (data.length === 0) {
      setStatistics({
        totalRecords: 0,
        totalCost: 0,
        averageCost: 0,
        mostCommonServiceType: "",
        mostCommonTechnician: "",
      });
      return;
    }

    const totalCost = data.reduce((sum, record) => sum + (record.cost || 0), 0);
    const averageCost = totalCost / data.length;

    // Most common service type
    const serviceTypeCounts = {};
    data.forEach((record) => {
      serviceTypeCounts[record.serviceType] =
        (serviceTypeCounts[record.serviceType] || 0) + 1;
    });
    const mostCommonServiceType = Object.keys(serviceTypeCounts).reduce(
      (a, b) => (serviceTypeCounts[a] > serviceTypeCounts[b] ? a : b),
      ""
    );

    // Most common technician
    const technicianCounts = {};
    data.forEach((record) => {
      technicianCounts[record.technician] =
        (technicianCounts[record.technician] || 0) + 1;
    });
    const mostCommonTechnician = Object.keys(technicianCounts).reduce(
      (a, b) => (technicianCounts[a] > technicianCounts[b] ? a : b),
      ""
    );

    setStatistics({
      totalRecords: data.length,
      totalCost,
      averageCost,
      mostCommonServiceType,
      mostCommonTechnician,
    });
  }, []);

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/maintenance/records/history`
      );
      if (!response.ok) throw new Error("Failed to load records");

      const data = await response.json();
      setRecords(data);
      calculateStatistics(data);
    } catch (error) {
      console.error("Error loading records:", error);
      showToast("Failed to load maintenance records", "error");
    } finally {
      setLoading(false);
    }
  }, [calculateStatistics]);

  const applyFilters = useCallback(() => {
    let filtered = [...records];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.technician.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date range filter
    if (filters.startDate) {
      filtered = filtered.filter(
        (record) =>
          new Date(record.completedDate) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(
        (record) => new Date(record.completedDate) <= new Date(filters.endDate)
      );
    }

    // Service type filter
    if (filters.serviceType) {
      filtered = filtered.filter(
        (record) => record.serviceType === filters.serviceType
      );
    }

    // Technician filter
    if (filters.technician) {
      filtered = filtered.filter(
        (record) => record.technician === filters.technician
      );
    }

    setFilteredRecords(filtered);
    calculateStatistics(filtered);
  }, [records, searchTerm, filters, calculateStatistics]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const exportToCSV = () => {
    const headers = [
      "Asset ID",
      "Asset Name",
      "Service Type",
      "Technician",
      "Scheduled Date",
      "Completed Date",
      "Cost",
      "Notes",
    ];
    const rows = filteredRecords.map((record) => [
      record.assetId,
      record.assetName,
      record.serviceType,
      record.technician,
      formatDate(record.scheduledDate),
      formatDate(record.completedDate),
      record.cost || 0,
      record.notes || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `maintenance-records-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    showToast("Records exported successfully!", "success");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      startDate: "",
      endDate: "",
      serviceType: "",
      technician: "",
    });
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // Get unique values for dropdowns
  const uniqueServiceTypes = [...new Set(records.map((r) => r.serviceType))];
  const uniqueTechnicians = [...new Set(records.map((r) => r.technician))];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Maintenance Records
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Historical maintenance data and analytics
          </p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredRecords.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          Export CSV
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Records
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {statistics.totalRecords}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(statistics.totalCost)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Average Cost
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(statistics.averageCost)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Top Service
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1 truncate">
            {statistics.mostCommonServiceType || "N/A"}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Top Technician
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1 truncate">
            {statistics.mostCommonTechnician || "N/A"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search asset, technician, service..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Service Type
            </label>
            <select
              value={filters.serviceType}
              onChange={(e) =>
                setFilters({ ...filters, serviceType: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              {uniqueServiceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Technician */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Technician
            </label>
            <select
              value={filters.technician}
              onChange={(e) =>
                setFilters({ ...filters, technician: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Technicians</option>
              {uniqueTechnicians.map((tech) => (
                <option key={tech} value={tech}>
                  {tech}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
              history
            </span>
            <p className="text-gray-600 dark:text-gray-400">
              No maintenance records found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Service Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Technician
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Completed Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRecords.map((record) => (
                  <tr
                    key={record._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {record.assetName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {record.assetId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {record.serviceType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {record.technician}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(record.completedDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(record.cost)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Maintenance Record Details
              </h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedRecord(null);
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Asset Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Asset Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Asset Name:
                    </span>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedRecord.assetName}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Asset ID:
                    </span>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedRecord.assetId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Maintenance Details */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Maintenance Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Service Type:
                    </span>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedRecord.serviceType}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Technician:
                    </span>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedRecord.technician}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Priority:
                    </span>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedRecord.priority}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Cost:
                    </span>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {formatCurrency(selectedRecord.cost)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Timeline
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Scheduled Date:
                    </span>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {formatDate(selectedRecord.scheduledDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Started Date:
                    </span>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {formatDate(selectedRecord.startedDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Completed Date:
                    </span>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {formatDate(selectedRecord.completedDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Completed By:
                    </span>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedRecord.completedBy || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedRecord.description && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                    {selectedRecord.description}
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedRecord.notes && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                    {selectedRecord.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedRecord(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
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
