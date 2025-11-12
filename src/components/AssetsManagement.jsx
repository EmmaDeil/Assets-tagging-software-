/**
 * AssetsManagement.jsx
 *
 * Comprehensive assets management page with table view, search, and filters.
 * This component displays all assets in a sortable, filterable table format.
 *
 * Features:
 * - Search by asset name or tag ID
 * - Filter by status, location, and asset type
 * - Sortable columns
 * - Bulk selection with checkboxes
 * - View, edit, and delete actions for each asset
 * - Pagination support
 * - Export functionality
 * - Responsive design
 *
 * Props:
 * @param {Array} assets - Array of all equipment/asset items
 * @param {Function} onView - Callback when view button is clicked
 * @param {Function} onEdit - Callback when edit button is clicked
 * @param {Function} onDelete - Callback when delete button is clicked
 * @param {Function} onAddNew - Callback when "Add New Asset" button is clicked
 */

import React, { useState, useMemo } from "react";
import AdvancedSearch from "./AdvancedSearch";

export default function AssetsManagement({
  assets = [],
  onView,
  onEdit,
  onDelete,
  onAddNew,
}) {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState(null);
  const itemsPerPage = 10;

  /**
   * Get status badge styling based on status type
   * @param {string} status - Asset status
   * @returns {Object} Style classes for the badge
   */
  const getStatusBadge = (status) => {
    const badges = {
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
        bg: "bg-red-100 dark:bg-red-900/50",
        text: "text-red-700 dark:text-red-300",
        dot: "bg-red-500",
      },
      Lost: {
        bg: "bg-gray-100 dark:bg-gray-700/50",
        text: "text-gray-700 dark:text-gray-300",
        dot: "bg-gray-500",
      },
    };
    return badges[status] || badges["Available"];
  };

  /**
   * Filter and search assets (including advanced filters)
   */
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Basic search
      const matchesSearch =
        searchQuery === "" ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchQuery.toLowerCase());

      // Basic filters
      const matchesStatus =
        statusFilter === "All" || asset.status === statusFilter;

      const matchesLocation =
        locationFilter === "All" || asset.location === locationFilter;

      // Advanced filters (if applied) - Always use AND logic
      let matchesAdvanced = true;
      if (advancedFilters) {
        const filters = advancedFilters;

        // Asset Type filter
        if (filters.assetType && filters.assetType !== "All Types") {
          const typeMatch = asset.category === filters.assetType;
          if (!typeMatch) matchesAdvanced = false;
        }

        // Status filter (from advanced search)
        if (filters.status && filters.status !== "Any Status") {
          const statusMatch = asset.status === filters.status;
          if (!statusMatch) matchesAdvanced = false;
        }

        // Purchase date range filter
        if (filters.purchaseDateFrom || filters.purchaseDateTo) {
          const assetDate = new Date(asset.purchaseDate);
          let dateMatch = true;

          if (filters.purchaseDateFrom) {
            const fromDate = new Date(filters.purchaseDateFrom);
            if (assetDate < fromDate) dateMatch = false;
          }

          if (filters.purchaseDateTo) {
            const toDate = new Date(filters.purchaseDateTo);
            if (assetDate > toDate) dateMatch = false;
          }

          if (!dateMatch) matchesAdvanced = false;
        }

        // Cost range filter
        if (filters.costMin || filters.costMax) {
          const assetCost = parseFloat(asset.cost) || 0;
          let costMatch = true;

          if (filters.costMin && assetCost < parseFloat(filters.costMin)) {
            costMatch = false;
          }

          if (filters.costMax && assetCost > parseFloat(filters.costMax)) {
            costMatch = false;
          }

          if (!costMatch) matchesAdvanced = false;
        }

        // Location filter (from advanced search)
        if (filters.location && filters.location !== "All Locations") {
          const locationMatch = asset.location === filters.location;
          if (!locationMatch) matchesAdvanced = false;
        }
      }

      return (
        matchesSearch && matchesStatus && matchesLocation && matchesAdvanced
      );
    });
  }, [assets, searchQuery, statusFilter, locationFilter, advancedFilters]);

  /**
   * Paginate assets
   */
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAssets.slice(startIndex, endIndex);
  }, [filteredAssets, currentPage]);

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  /**
   * Handle select all checkbox
   */
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAssets(paginatedAssets.map((asset) => asset.id));
    } else {
      setSelectedAssets([]);
    }
  };

  /**
   * Handle individual checkbox
   */
  const handleSelectAsset = (assetId) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  /**
   * Get unique locations from assets
   */
  const uniqueLocations = useMemo(() => {
    return [
      "All",
      ...new Set(assets.map((asset) => asset.location).filter(Boolean)),
    ];
  }, [assets]);

  /**
   * Get unique statuses from assets
   */
  const uniqueStatuses = useMemo(() => {
    return [
      "All",
      ...new Set(assets.map((asset) => asset.status).filter(Boolean)),
    ];
  }, [assets]);

  /**
   * Get unique asset types from assets
   */
  const uniqueAssetTypes = useMemo(() => {
    return [...new Set(assets.map((asset) => asset.category).filter(Boolean))];
  }, [assets]);

  /**
   * Handle advanced search filter application
   */
  const handleApplyAdvancedFilters = (filters) => {
    setAdvancedFilters(filters);
    setCurrentPage(1); // Reset to first page
  };

  /**
   * Clear advanced filters
   */
  const handleClearAdvancedFilters = () => {
    setAdvancedFilters(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-gray-900 text-3xl font-bold leading-tight">
            Asset Inventory
          </p>
          <p className="text-gray-600 text-base font-normal leading-normal">
            View, search, and manage all recorded assets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdvancedSearchOpen(true)}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white border border-gray-300 text-gray-900 text-sm font-medium leading-normal hover:bg-gray-50 transition-colors gap-2"
          >
            <span className="material-symbols-outlined text-lg">
              filter_alt
            </span>
            <span className="truncate">Advanced Search</span>
            {advancedFilters && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                ●
              </span>
            )}
          </button>
          <button
            onClick={onAddNew}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold leading-normal hover:bg-blue-700 transition-colors gap-2"
          >
            {/* <span className="text-xl">+</span> */}
            <span className="truncate">Add New Asset</span>
          </button>
          <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white border border-gray-300 text-gray-900 text-sm font-medium leading-normal hover:bg-gray-50 transition-colors gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span className="truncate">Export</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <label className="flex flex-col min-w-40 h-12 w-full md:flex-1">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-gray-500 flex bg-gray-100 items-center justify-center pl-4 rounded-l-lg border border-gray-300 border-r-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-blue-500/50 border border-gray-300 bg-gray-100 h-full placeholder:text-gray-500 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                placeholder="Search by asset name or tag ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </label>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 border border-gray-300 px-4 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  Status: {status}
                </option>
              ))}
            </select>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="flex h-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 border border-gray-300 px-4 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {uniqueLocations.map((location) => (
                <option key={location} value={location}>
                  Location: {location}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-12">
                  <input
                    className="form-checkbox h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                    type="checkbox"
                    checked={
                      paginatedAssets.length > 0 &&
                      selectedAssets.length === paginatedAssets.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Asset Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Tag ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedAssets.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No assets found matching your criteria
                  </td>
                </tr>
              ) : (
                paginatedAssets.map((asset) => {
                  const badge = getStatusBadge(asset.status);
                  return (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          className="form-checkbox h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                          type="checkbox"
                          checked={selectedAssets.includes(asset.id)}
                          onChange={() => handleSelectAsset(asset.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {asset.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {asset.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center gap-x-1.5 rounded-full ${badge.bg} px-2.5 py-1 text-xs font-medium ${badge.text}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${badge.dot}`}
                          ></span>
                          {asset.status || "In Use"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {asset.location || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {asset.model || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onView && onView(asset)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1.5 rounded-md hover:bg-blue-50"
                            title="View details"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => onEdit && onEdit(asset)}
                            className="text-gray-600 hover:text-blue-600 transition-colors p-1.5 rounded-md hover:bg-blue-50"
                            title="Edit asset"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => onDelete && onDelete(asset)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded-md hover:bg-red-50"
                            title="Delete asset"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-medium text-gray-900">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-gray-900">
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredAssets.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-900">
                    {filteredAssets.length}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            currentPage === pageNum
                              ? "z-10 bg-blue-50 text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return (
                        <span
                          key={pageNum}
                          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-600 ring-1 ring-inset ring-gray-300"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Search Panel */}
      <AdvancedSearch
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
        onApplyFilters={handleApplyAdvancedFilters}
        assetTypes={uniqueAssetTypes}
        locations={uniqueLocations.filter((loc) => loc !== "All")}
      />

      {/* Active Advanced Filters Badge */}
      {advancedFilters && (
        <div className="fixed bottom-4 right-4 z-30">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3">
            <span className="text-sm font-medium">
              Advanced filters applied
            </span>
            <button
              onClick={handleClearAdvancedFilters}
              className="text-white hover:text-blue-200 font-semibold"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
