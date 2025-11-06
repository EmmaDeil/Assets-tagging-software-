/**
 * AdvancedSearch.jsx
 *
 * Advanced search panel component for filtering assets with multiple criteria.
 * This component appears as a slide-out panel on the right side of the screen.
 *
 * Features:
 * - Filter by asset type
 * - Filter by status
 * - Purchase date range selection
 * - Cost range filtering
 * - Location filtering
 * - Logical operator selection (AND/OR)
 * - Clear all filters functionality
 * - Apply filters with callback
 * - Smooth slide-in/out animation
 *
 * Props:
 * @param {boolean} isOpen - Controls panel visibility
 * @param {Function} onClose - Callback when close button is clicked
 * @param {Function} onApplyFilters - Callback when filters are applied with filter object
 * @param {Array} assetTypes - Available asset types for filtering
 * @param {Array} locations - Available locations for filtering
 */

import React, { useState, useEffect } from "react";

export default function AdvancedSearch({
  isOpen = false,
  onClose,
  onApplyFilters,
  assetTypes = [],
  locations = [],
}) {
  // Filter state
  const [filters, setFilters] = useState({
    assetType: "All Types",
    status: "Any Status",
    purchaseDateFrom: "",
    purchaseDateTo: "",
    costMin: "",
    costMax: "",
    location: "All Locations",
    logicalOperator: "AND",
  });

  /**
   * Handle input changes
   * @param {string} field - Field name
   * @param {string} value - New value
   */
  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Clear all filters
   */
  const handleClearAll = () => {
    setFilters({
      assetType: "All Types",
      status: "Any Status",
      purchaseDateFrom: "",
      purchaseDateTo: "",
      costMin: "",
      costMax: "",
      location: "All Locations",
      logicalOperator: "AND",
    });
  };

  /**
   * Apply filters and close panel
   */
  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
    if (onClose) {
      onClose();
    }
  };

  /**
   * Close panel when clicking outside
   */
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when panel is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Slide-out panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 lg:w-md bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-600 text-2xl">
                filter_alt
              </span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Advanced Search
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close advanced search"
            >
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">
                close
              </span>
            </button>
          </div>

          {/* Panel Content - Scrollable */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Asset Type Filter */}
            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                htmlFor="asset-type"
              >
                Asset Type
              </label>
              <select
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
                id="asset-type"
                value={filters.assetType}
                onChange={(e) => handleChange("assetType", e.target.value)}
              >
                <option>All Types</option>
                {assetTypes.length > 0 ? (
                  assetTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))
                ) : (
                  <>
                    <option>Laptops</option>
                    <option>Monitors</option>
                    <option>Servers</option>
                    <option>Smartphones</option>
                    <option>Tablets</option>
                    <option>Printers</option>
                  </>
                )}
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                htmlFor="status"
              >
                Status
              </label>
              <select
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
                id="status"
                value={filters.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option>Any Status</option>
                <option>In Use</option>
                <option>In Maintenance</option>
                <option>Retired</option>
                <option>In Storage</option>
              </select>
            </div>

            {/* Purchase Date Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Purchase Date
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
                  placeholder="From"
                  type="date"
                  value={filters.purchaseDateFrom}
                  onChange={(e) =>
                    handleChange("purchaseDateFrom", e.target.value)
                  }
                />
                <input
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
                  placeholder="To"
                  type="date"
                  value={filters.purchaseDateTo}
                  onChange={(e) =>
                    handleChange("purchaseDateTo", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Cost Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cost
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
                  placeholder="Min"
                  type="number"
                  min="0"
                  value={filters.costMin}
                  onChange={(e) => handleChange("costMin", e.target.value)}
                />
                <input
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
                  placeholder="Max"
                  type="number"
                  min="0"
                  value={filters.costMax}
                  onChange={(e) => handleChange("costMax", e.target.value)}
                />
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                htmlFor="location"
              >
                Location
              </label>
              <select
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
                id="location"
                value={filters.location}
                onChange={(e) => handleChange("location", e.target.value)}
              >
                <option>All Locations</option>
                {locations.length > 0 ? (
                  locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))
                ) : (
                  <>
                    <option>Headquarters</option>
                    <option>East Wing Office</option>
                    <option>Data Center A</option>
                    <option>West Campus</option>
                    <option>Remote Office</option>
                  </>
                )}
              </select>
            </div>

            {/* Logical Operator */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Logical Operator
              </label>
              <div className="flex flex-col space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    className="form-radio text-blue-600 focus:ring-blue-500 w-4 h-4"
                    name="logical-operator"
                    type="radio"
                    checked={filters.logicalOperator === "AND"}
                    onChange={() => handleChange("logicalOperator", "AND")}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    AND (match all criteria)
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    className="form-radio text-blue-600 focus:ring-blue-500 w-4 h-4"
                    name="logical-operator"
                    type="radio"
                    checked={filters.logicalOperator === "OR"}
                    onChange={() => handleChange("logicalOperator", "OR")}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    OR (match any criteria)
                  </span>
                </label>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(filters.assetType !== "All Types" ||
              filters.status !== "Any Status" ||
              filters.purchaseDateFrom ||
              filters.purchaseDateTo ||
              filters.costMin ||
              filters.costMax ||
              filters.location !== "All Locations") && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                  Active Filters:
                </p>
                <div className="flex flex-wrap gap-2">
                  {filters.assetType !== "All Types" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                      Type: {filters.assetType}
                    </span>
                  )}
                  {filters.status !== "Any Status" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                      Status: {filters.status}
                    </span>
                  )}
                  {(filters.purchaseDateFrom || filters.purchaseDateTo) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                      Date Range
                    </span>
                  )}
                  {(filters.costMin || filters.costMax) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                      Cost Range
                    </span>
                  )}
                  {filters.location !== "All Locations" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                      Location: {filters.location}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Panel Footer - Action Buttons */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              onClick={handleClearAll}
              className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <span>Clear All</span>
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors gap-2"
            >
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
