/**
 * MaintenanceWidget.jsx
 *
 * Compact widget showing maintenance overview for dashboard
 */

import React, { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";

export default function MaintenanceWidget({ onNavigateToMaintenance }) {
  const [stats, setStats] = useState({
    overdue: 0,
    dueToday: 0,
    inProgress: 0,
    scheduled: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
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

      setStats({
        overdue: overdue.length,
        dueToday: dueToday.length,
        inProgress: inProgress.length,
        scheduled: scheduled.length,
      });
    } catch (error) {
      console.error("Error loading maintenance stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
            build
          </span>
          Maintenance Overview
        </h3>
        <button
          onClick={onNavigateToMaintenance}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          View All →
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Overdue - Critical */}
          {stats.overdue > 0 && (
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">
                  warning
                </span>
                <span className="text-sm font-medium text-red-900 dark:text-red-300">
                  Overdue
                </span>
              </div>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.overdue}
              </span>
            </div>
          )}

          {/* Due Today */}
          {stats.dueToday > 0 && (
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">
                  schedule
                </span>
                <span className="text-sm font-medium text-orange-900 dark:text-orange-300">
                  Due Soon
                </span>
              </div>
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.dueToday}
              </span>
            </div>
          )}

          {/* In Progress */}
          <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">
                engineering
              </span>
              <span className="text-sm font-medium text-yellow-900 dark:text-yellow-300">
                In Progress
              </span>
            </div>
            <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.inProgress}
            </span>
          </div>

          {/* Scheduled */}
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                event_available
              </span>
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Scheduled
              </span>
            </div>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {stats.scheduled}
            </span>
          </div>

          {/* All clear message */}
          {stats.overdue === 0 &&
            stats.dueToday === 0 &&
            stats.inProgress === 0 &&
            stats.scheduled === 0 && (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-4xl text-green-600 dark:text-green-400 mb-2">
                  check_circle
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No maintenance scheduled
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
