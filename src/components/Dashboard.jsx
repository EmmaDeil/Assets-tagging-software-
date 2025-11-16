/**
 * Dashboard.jsx
 *
 * Main dashboard component that displays overview statistics and recent activity.
 * This component provides a comprehensive view of all assets in the system.
 *
 * Features:
 * - Asset statistics cards (Total, In Use, Under Maintenance, Retired)
 * - Visual pie chart showing asset status distribution
 * - Recent activity table showing latest asset actions
 * - Responsive design that works on all screen sizes
 * - Dark mode support
 *
 * Props:
 * @param {Array} assets - Array of all equipment/asset items
 * @param {Array} recentActivity - Array of recent activity objects with asset, action, user, and date
 */

import React, { useState, useEffect, useCallback } from "react";
import API_BASE_URL from "../config/api";

export default function Dashboard({
  assets = [],
  recentActivity = [],
  onNavigate,
}) {
  // Filter modal state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    location: "",
    dateFrom: "",
    dateTo: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    status: "",
    category: "",
    location: "",
    dateFrom: "",
    dateTo: "",
  });

  // Maintenance data state
  const [maintenanceStats, setMaintenanceStats] = useState({
    overdue: 0,
    dueToday: 0,
    inProgress: 0,
    scheduled: 0,
  });

  // Fetch maintenance stats
  const loadMaintenanceStats = useCallback(async () => {
    try {
      const [overdue, dueToday, inProgress, scheduled] = await Promise.all([
        fetch(`${API_BASE_URL}/maintenance/overdue/list`).then((r) => r.json()),
        fetch(`${API_BASE_URL}/maintenance/due/today`).then((r) => r.json()),
        fetch(`${API_BASE_URL}/maintenance?status=In Progress`).then((r) =>
          r.json()
        ),
        fetch(`${API_BASE_URL}/maintenance?status=Scheduled`).then((r) =>
          r.json()
        ),
      ]);

      setMaintenanceStats({
        overdue: overdue.length || 0,
        dueToday: dueToday.length || 0,
        inProgress: inProgress.length || 0,
        scheduled: scheduled.length || 0,
      });
    } catch (error) {
      console.error("Error loading maintenance stats:", error);
    }
  }, []);

  useEffect(() => {
    loadMaintenanceStats();
  }, [loadMaintenanceStats]);

  // Apply filters to assets
  const filteredAssets = assets.filter((asset) => {
    // Status filter
    if (appliedFilters.status && asset.status !== appliedFilters.status) {
      return false;
    }

    // Category filter
    if (appliedFilters.category && asset.category !== appliedFilters.category) {
      return false;
    }

    // Location filter
    if (appliedFilters.location && asset.location !== appliedFilters.location) {
      return false;
    }

    // Date range filter (based on acquisition/purchase date)
    if (appliedFilters.dateFrom || appliedFilters.dateTo) {
      const assetDate = new Date(
        asset.acquisitionDate || asset.purchaseDate || asset.createdAt
      );

      if (appliedFilters.dateFrom) {
        const fromDate = new Date(appliedFilters.dateFrom);
        if (assetDate < fromDate) return false;
      }

      if (appliedFilters.dateTo) {
        const toDate = new Date(appliedFilters.dateTo);
        toDate.setHours(23, 59, 59, 999); // Include the entire end date
        if (assetDate > toDate) return false;
      }
    }

    return true;
  });

  // Calculate asset statistics from filtered data
  const totalAssets = filteredAssets.length;
  const inUse = filteredAssets.filter((a) => a.status === "In Use").length;
  const inMaintenance = filteredAssets.filter(
    (a) => a.status === "Under Maintenance"
  ).length;
  const retired = filteredAssets.filter((a) => a.status === "Retired").length;

  // Calculate percentages for the chart
  const inUsePercent =
    totalAssets > 0 ? Math.round((inUse / totalAssets) * 100) : 0;
  const maintenancePercent =
    totalAssets > 0 ? Math.round((inMaintenance / totalAssets) * 100) : 0;
  const retiredPercent =
    totalAssets > 0 ? Math.round((retired / totalAssets) * 100) : 0;

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setShowFilterModal(false);
  };

  // Reset filters
  const handleResetFilters = () => {
    const resetFilters = {
      status: "",
      category: "",
      location: "",
      dateFrom: "",
      dateTo: "",
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  // Get unique values for filter dropdowns
  const uniqueCategories = [
    ...new Set(assets.map((a) => a.category).filter(Boolean)),
  ];
  const uniqueLocations = [
    ...new Set(assets.map((a) => a.location).filter(Boolean)),
  ];

  // Check if any filters are active
  const hasActiveFilters =
    appliedFilters.status ||
    appliedFilters.category ||
    appliedFilters.location ||
    appliedFilters.dateFrom ||
    appliedFilters.dateTo;

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Dashboard Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-gray-900 dark:text-gray-100 text-3xl font-bold leading-tight">
            Dashboard
          </h1>
          {hasActiveFilters && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Showing {totalAssets} of {assets.length} assets (filtered)
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3 justify-start">
          <button
            onClick={() => setShowFilterModal(true)}
            className={`flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 ${
              hasActiveFilters
                ? "bg-blue-600 text-white"
                : "bg-blue-600 text-white"
            } text-sm font-bold leading-normal gap-2 hover:bg-blue-700 transition-colors relative`}
          >
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            )}
            <span className="material-symbols-outlined text-lg">
              filter_alt
            </span>
            <span className="truncate">
              {hasActiveFilters ? "Filters Active" : "Filter Data"}
            </span>
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-bold leading-normal gap-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">
                filter_alt_off
              </span>
              <span className="truncate">Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Assets Card */}
        <div className="flex flex-col gap-2 rounded-lg p-6 bg-white border border-gray-200 shadow-sm">
          <p className="text-base font-medium leading-normal text-gray-600">
            Total Assets
          </p>
          <p className="text-gray-900 tracking-tight text-3xl font-bold leading-tight">
            {totalAssets}
          </p>
        </div>

        {/* In Use Card */}
        <div className="flex flex-col gap-2 rounded-lg p-6 bg-white border border-gray-200 shadow-sm">
          <p className="text-base font-medium leading-normal text-gray-600">
            In Use
          </p>
          <p className="text-gray-900 tracking-tight text-3xl font-bold leading-tight">
            {inUse}
          </p>
        </div>

        {/* Under Maintenance Card */}
        <div className="flex flex-col gap-2 rounded-lg p-6 bg-white border border-gray-200 shadow-sm">
          <p className="text-base font-medium leading-normal text-gray-600">
            Under Maintenance
          </p>
          <p className="text-gray-900 tracking-tight text-3xl font-bold leading-tight">
            {inMaintenance}
          </p>
        </div>

        {/* Retired Card */}
        <div className="flex flex-col gap-2 rounded-lg p-6 bg-white border border-gray-200 shadow-sm">
          <p className="text-base font-medium leading-normal text-gray-600">
            Retired
          </p>
          <p className="text-gray-900 tracking-tight text-3xl font-bold leading-tight">
            {retired}
          </p>
        </div>
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assets by Status Pie Chart */}
        <div className="lg:col-span-1 flex flex-col gap-4 rounded-lg border border-gray-200 p-6 bg-white shadow-sm">
          <p className="text-gray-900 text-lg font-bold leading-normal">
            Assets by Status
          </p>

          {/* Pie Chart */}
          <div className="flex items-center justify-center min-h-60 relative">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              {/* Background circle */}
              <circle
                className="stroke-current text-blue-100"
                cx="18"
                cy="18"
                fill="none"
                r="15.9155"
                strokeWidth="4"
              />
              {/* In Use segment (blue) */}
              <circle
                className="stroke-current text-blue-600"
                cx="18"
                cy="18"
                fill="none"
                r="15.9155"
                strokeDasharray={`${inUsePercent}, 100`}
                strokeDashoffset="0"
                strokeWidth="4"
                transform="rotate(-90 18 18)"
              />
              {/* Under Maintenance segment (yellow) */}
              <circle
                className="stroke-current text-yellow-500"
                cx="18"
                cy="18"
                fill="none"
                r="15.9155"
                strokeDasharray={`${maintenancePercent}, 100`}
                strokeDashoffset={`-${inUsePercent}`}
                strokeWidth="4"
                transform="rotate(-90 18 18)"
              />
              {/* Retired segment (red) */}
              <circle
                className="stroke-current text-red-500"
                cx="18"
                cy="18"
                fill="none"
                r="15.9155"
                strokeDasharray={`${retiredPercent}, 100`}
                strokeDashoffset={`-${inUsePercent + maintenancePercent}`}
                strokeWidth="4"
                transform="rotate(-90 18 18)"
              />
            </svg>

            {/* Center text */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">
                {totalAssets}
              </span>
              <span className="text-sm text-gray-600">Total Assets</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span>In Use</span>
              </div>
              <span className="font-semibold">
                {inUse} ({inUsePercent}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Under Maintenance</span>
              </div>
              <span className="font-semibold">
                {inMaintenance} ({maintenancePercent}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Retired</span>
              </div>
              <span className="font-semibold">
                {retired} ({retiredPercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="lg:col-span-2 flex flex-col gap-4 rounded-lg border border-gray-200 p-6 bg-white shadow-sm">
          <p className="text-gray-900 text-lg font-bold leading-normal">
            Recent Activity
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-gray-600 uppercase tracking-wider text-xs">
                <tr>
                  <th className="py-3 pr-4 font-medium">Asset</th>
                  <th className="py-3 px-4 font-medium hidden md:table-cell">
                    Action
                  </th>
                  <th className="py-3 px-4 font-medium">User</th>
                  <th className="py-3 pl-4 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      No recent activity
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((activity, index) => (
                    <tr
                      key={index}
                      className={
                        index !== recentActivity.length - 1
                          ? "border-b border-gray-200"
                          : ""
                      }
                    >
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex items-center justify-center w-9 h-9 rounded-lg ${
                              activity.actionType === "Checked Out"
                                ? "bg-green-100 text-green-600"
                                : activity.actionType === "Maintenance"
                                ? "bg-yellow-100 text-yellow-600"
                                : activity.actionType === "Added"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            <span className="text-xl">
                              {activity.icon || "📦"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {activity.assetName}
                            </p>
                            <p className="text-xs text-gray-600 md:hidden">
                              {activity.action}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                            activity.actionType === "Checked Out"
                              ? "bg-green-100 text-green-700"
                              : activity.actionType === "Maintenance"
                              ? "bg-yellow-100 text-yellow-800"
                              : activity.actionType === "Added"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {activity.action}
                        </span>
                      </td>
                      <td className="py-4 px-4">{activity.user}</td>
                      <td className="py-4 pl-4 text-right text-gray-600">
                        {activity.date}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Maintenance Stats Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Maintenance Overview
          </h2>
          <button
            onClick={() => onNavigate && onNavigate("Maintenance")}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
          >
            View All
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Overdue Card */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  Overdue
                </p>
                <p className="text-3xl font-bold text-red-900 dark:text-red-300 mt-1">
                  {maintenanceStats.overdue}
                </p>
              </div>
              <span className="material-symbols-outlined text-4xl text-red-600 dark:text-red-400">
                warning
              </span>
            </div>
          </div>

          {/* Due Soon Card */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  Due Soon
                </p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-300 mt-1">
                  {maintenanceStats.dueToday}
                </p>
              </div>
              <span className="material-symbols-outlined text-4xl text-orange-600 dark:text-orange-400">
                schedule
              </span>
            </div>
          </div>

          {/* In Progress Card */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  In Progress
                </p>
                <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-300 mt-1">
                  {maintenanceStats.inProgress}
                </p>
              </div>
              <span className="material-symbols-outlined text-4xl text-yellow-600 dark:text-yellow-400">
                engineering
              </span>
            </div>
          </div>

          {/* Scheduled Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Scheduled
                </p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-300 mt-1">
                  {maintenanceStats.scheduled}
                </p>
              </div>
              <span className="material-symbols-outlined text-4xl text-blue-600 dark:text-blue-400">
                event_available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">
                    filter_alt
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Filter Assets
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Refine your asset view with custom filters
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Filter */}
                <div>
                  <label className="flex flex-col w-full">
                    <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal pb-2.5">
                      Status
                    </p>
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="form-select flex w-full rounded-xl text-gray-800 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-500 h-12 px-4 text-base transition-all"
                    >
                      <option value="">All Statuses</option>
                      <option value="In Use">In Use</option>
                      <option value="Available">Available</option>
                      <option value="Under Maintenance">
                        Under Maintenance
                      </option>
                      <option value="Retired">Retired</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </label>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="flex flex-col w-full">
                    <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal pb-2.5">
                      Category
                    </p>
                    <select
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      className="form-select flex w-full rounded-xl text-gray-800 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-500 h-12 px-4 text-base transition-all"
                    >
                      <option value="">All Categories</option>
                      {uniqueCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="flex flex-col w-full">
                    <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal pb-2.5">
                      Location
                    </p>
                    <select
                      name="location"
                      value={filters.location}
                      onChange={handleFilterChange}
                      className="form-select flex w-full rounded-xl text-gray-800 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-500 h-12 px-4 text-base transition-all"
                    >
                      <option value="">All Locations</option>
                      {uniqueLocations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Date Range */}
                <div>
                  <label className="flex flex-col w-full">
                    <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal pb-2.5">
                      Date Range
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        name="dateFrom"
                        value={filters.dateFrom}
                        onChange={handleFilterChange}
                        placeholder="From"
                        className="form-input flex w-full rounded-xl text-gray-800 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-500 h-12 px-4 text-sm transition-all"
                      />
                      <input
                        type="date"
                        name="dateTo"
                        value={filters.dateTo}
                        onChange={handleFilterChange}
                        placeholder="To"
                        className="form-input flex w-full rounded-xl text-gray-800 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-500 h-12 px-4 text-sm transition-all"
                      />
                    </div>
                  </label>
                </div>
              </div>

              {/* Active Filters Summary */}
              {(filters.status ||
                filters.category ||
                filters.location ||
                filters.dateFrom ||
                filters.dateTo) && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Active Filters:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filters.status && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                        Status: {filters.status}
                      </span>
                    )}
                    {filters.category && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                        Category: {filters.category}
                      </span>
                    )}
                    {filters.location && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                        Location: {filters.location}
                      </span>
                    )}
                    {(filters.dateFrom || filters.dateTo) && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                        Date: {filters.dateFrom || "Start"} -{" "}
                        {filters.dateTo || "End"}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0 flex justify-end gap-3">
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-lg">check</span>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
