/**
 * Dashboard.jsx
 *
 * Main dashboard component that displays overview statistics and recent activity.
 * This component provides a comprehensive view of all assets in the system.
 *
 * Features:
 * - Asset statistics cards (Total, In Use, In Maintenance, Retired)
 * - Visual pie chart showing asset status distribution
 * - Recent activity table showing latest asset actions
 * - Responsive design that works on all screen sizes
 * - Dark mode support
 *
 * Props:
 * @param {Array} assets - Array of all equipment/asset items
 * @param {Array} recentActivity - Array of recent activity objects with asset, action, user, and date
 */

import React from "react";

export default function Dashboard({ assets = [], recentActivity = [] }) {
  // Calculate asset statistics
  const totalAssets = assets.length;
  const inUse = assets.filter((a) => a.status === "In Use").length;
  const inMaintenance = assets.filter(
    (a) => a.status === "In Maintenance"
  ).length;
  const retired = assets.filter((a) => a.status === "Retired").length;

  // Calculate percentages for the chart
  const inUsePercent =
    totalAssets > 0 ? Math.round((inUse / totalAssets) * 100) : 0;
  const maintenancePercent =
    totalAssets > 0 ? Math.round((inMaintenance / totalAssets) * 100) : 0;
  const retiredPercent =
    totalAssets > 0 ? Math.round((retired / totalAssets) * 100) : 0;

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Dashboard Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-gray-900 text-3xl font-bold leading-tight">
          Dashboard
        </h1>
        <div className="flex flex-wrap gap-3 justify-start">
          <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold leading-normal gap-2 hover:bg-blue-700 transition-colors">
            <span className="text-xl">+</span>
            <span className="truncate">Add New Asset</span>
          </button>
          <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white text-gray-900 border border-gray-300 text-sm font-bold leading-normal hover:bg-gray-50 transition-colors">
            <span className="truncate">Generate Report</span>
          </button>
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

        {/* In Maintenance Card */}
        <div className="flex flex-col gap-2 rounded-lg p-6 bg-white border border-gray-200 shadow-sm">
          <p className="text-base font-medium leading-normal text-gray-600">
            In Maintenance
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
              {/* In Maintenance segment (yellow) */}
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
                <span>In Maintenance</span>
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
    </div>
  );
}
