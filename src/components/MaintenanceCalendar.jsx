/**
 * MaintenanceCalendar.jsx
 *
 * Calendar view for visualizing scheduled maintenance
 * Shows maintenance by date with color-coding by status
 */

import React, { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";

export default function MaintenanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadMaintenanceForMonth();
  }, [currentDate]);

  const loadMaintenanceForMonth = async () => {
    try {
      setLoading(true);
      // Get first and last day of current month
      const firstDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const lastDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const response = await fetch(`${API_BASE_URL}/maintenance`);
      const data = await response.json();

      // Filter to current month
      const filtered = data.filter((m) => {
        const schedDate = new Date(m.scheduledDate);
        return schedDate >= firstDay && schedDate <= lastDay;
      });

      setMaintenanceData(filtered);
    } catch (error) {
      console.error("Error loading maintenance:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDay = firstDay.getDay(); // 0-6 (Sunday-Saturday)
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getMaintenanceForDate = (date) => {
    if (!date) return [];

    return maintenanceData.filter((m) => {
      const schedDate = new Date(m.scheduledDate);
      return schedDate.toDateString() === date.toDateString();
    });
  };

  const getDateStatus = (date) => {
    if (!date) return null;

    const maintenance = getMaintenanceForDate(date);
    if (maintenance.length === 0) return null;

    const hasOverdue = maintenance.some((m) => m.isOverdue);
    const hasInProgress = maintenance.some((m) => m.status === "In Progress");
    const hasScheduled = maintenance.some((m) => m.status === "Scheduled");

    if (hasOverdue) return "overdue";
    if (hasInProgress) return "inProgress";
    if (hasScheduled) return "scheduled";
    return "completed";
  };

  const handleDateClick = (date) => {
    if (!date) return;

    const maintenance = getMaintenanceForDate(date);
    if (maintenance.length > 0) {
      setSelectedDate(date);
      setSelectedMaintenance(maintenance);
      setShowDetailModal(true);
    }
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const days = getCalendarDays();

  const getStatusColor = (status) => {
    switch (status) {
      case "overdue":
        return "bg-red-500 text-white";
      case "inProgress":
        return "bg-yellow-500 text-white";
      case "scheduled":
        return "bg-blue-500 text-white";
      case "completed":
        return "bg-green-500 text-white";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Maintenance Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visual schedule of all maintenance activities
          </p>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          Today
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Overdue
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            In Progress
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Scheduled
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Completed
          </span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Month Navigation */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {monthName}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-semibold text-gray-600 dark:text-gray-400"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {days.map((date, index) => {
                const status = getDateStatus(date);
                const maintenance = date ? getMaintenanceForDate(date) : [];
                const isToday =
                  date && date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={`min-h-24 border-r border-b border-gray-200 dark:border-gray-700 p-2 ${
                      date
                        ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        : ""
                    } ${isToday ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                  >
                    {date && (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-sm font-medium ${
                              isToday
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {date.getDate()}
                          </span>
                          {maintenance.length > 0 && (
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(
                                status
                              )}`}
                            >
                              {maintenance.length}
                            </span>
                          )}
                        </div>
                        {maintenance.length > 0 && (
                          <div className="space-y-1">
                            {maintenance.slice(0, 2).map((m, i) => (
                              <div
                                key={i}
                                className={`text-xs p-1 rounded truncate ${
                                  m.isOverdue
                                    ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                    : m.status === "In Progress"
                                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                }`}
                              >
                                {m.assetName}
                              </div>
                            ))}
                            {maintenance.length > 2 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                +{maintenance.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDate && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Maintenance on{" "}
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {selectedMaintenance.map((maintenance, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {maintenance.assetName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {maintenance.serviceType}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            {maintenance.technician}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            Priority: {maintenance.priority}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          maintenance.isOverdue
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : maintenance.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : maintenance.status === "Completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {maintenance.status}
                      </span>
                    </div>
                    {maintenance.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {maintenance.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
