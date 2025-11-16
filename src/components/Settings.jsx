/**
 * Settings.jsx
 *
 * Application settings and configuration management component.
 * This component provides an interface to manage:
 * - General application settings (name, timezone, maintenance mode)
 * - API access keys
 * - Permissions and roles
 * - Integrations
 * - Branding customization
 * - Dangerous operations (data deletion)
 *
 * Features:
 * - Side navigation for different settings sections
 * - Form inputs for general settings
 * - API key management with regeneration
 * - Maintenance mode toggle
 * - Danger zone for destructive operations
 * - Responsive design with sticky sidebar
 * - Full backend integration with MongoDB
 */

import React, { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";
import PermissionsManagement from "./PermissionsManagement";

export default function Settings() {
  // State for settings form
  const [appName, setAppName] = useState("QR Tag Manager");
  const [timezone, setTimezone] = useState("UTC-5");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [apiKey, setApiKey] = useState("Loading...");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Show toast notification
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };
  const [activeSection, setActiveSection] = useState("general");
  const [lastApiUse, setLastApiUse] = useState("Never");
  const [saving, setSaving] = useState(false);

  // Modal states
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  // Branding state
  const [companyName, setCompanyName] = useState("QR Tag Manager");
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [secondaryColor, setSecondaryColor] = useState("#10B981");

  // System stats state
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Load settings from backend on component mount
   */
  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * Load users when permissions section is active
   */
  useEffect(() => {
    if (activeSection === "general") {
      loadSystemStats();
    }
  }, [activeSection]);

  /**
   * Fetch settings from API
   */
  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`);
      if (!response.ok) throw new Error("Failed to fetch settings");

      const data = await response.json();
      setAppName(data.appName);
      setTimezone(data.timezone);
      setMaintenanceMode(data.maintenanceMode);
      setApiKey(data.apiKey);
      setCompanyName(data.companyName || "QR Tag Manager");
      setPrimaryColor(data.primaryColor || "#3B82F6");
      setSecondaryColor(data.secondaryColor || "#10B981");
      setDefaultCurrency(data.defaultCurrency || "USD");

      // Format last API use
      if (data.lastApiUse) {
        const date = new Date(data.lastApiUse);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) {
          setLastApiUse("Less than an hour ago");
        } else if (diffHours < 24) {
          setLastApiUse(`${diffHours} hour${diffHours > 1 ? "s" : ""} ago`);
        } else {
          const diffDays = Math.floor(diffHours / 24);
          setLastApiUse(`${diffDays} day${diffDays > 1 ? "s" : ""} ago`);
        }
      } else {
        setLastApiUse("Never used");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      showToast("Failed to load settings. Please refresh the page.", "error");
    }
  };

  /**
   * Load system statistics
   */
  const loadSystemStats = async () => {
    try {
      setLoadingStats(true);
      const response = await fetch(`${API_BASE_URL}/settings/stats`);
      if (!response.ok) throw new Error("Failed to fetch stats");

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  /**
   * Handle saving general settings
   */
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appName,
          timezone,
          maintenanceMode,
          defaultCurrency,
        }),
      });

      if (!response.ok) throw new Error("Failed to save settings");

      const data = await response.json();
      showToast("Settings saved successfully!", "success");

      // Update local state with saved data
      setAppName(data.appName);
      setTimezone(data.timezone);
      setMaintenanceMode(data.maintenanceMode);
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast("Failed to save settings. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle saving branding settings
   */
  const handleSaveBranding = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName,
          primaryColor,
          secondaryColor,
        }),
      });

      if (!response.ok) throw new Error("Failed to save branding");

      showToast("Branding settings saved successfully!", "success");
    } catch (error) {
      console.error("Error saving branding:", error);
      showToast("Failed to save branding settings. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle regenerating API key
   */
  const handleRegenerateApiKey = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/settings/regenerate-api-key`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to regenerate API key");

      const data = await response.json();
      setApiKey(data.apiKey);
      setLastApiUse("Just now");
      setShowRegenerateModal(false);
      showToast("API key regenerated successfully!", "success");
    } catch (error) {
      console.error("Error regenerating API key:", error);
      showToast("Failed to regenerate API key. Please try again.", "error");
    }
  };

  /**
   * Handle deleting all assets
   */
  const handleDeleteAllAssets = async () => {
    if (deleteConfirmText !== "DELETE ALL ASSETS") {
      showToast(
        "Confirmation text does not match. Please type 'DELETE ALL ASSETS' exactly.",
        "error"
      );
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(
        `${API_BASE_URL}/settings/delete-all-assets`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            confirmation: "DELETE ALL ASSETS",
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();

      // Close modal and reset
      setShowDeleteModal(false);
      setDeleteConfirmText("");

      showToast(
        `Successfully deleted ${data.deletedEquipment} assets and ${data.deletedActivities} activity records.`,
        "success"
      );

      // Reload stats if on general section
      if (activeSection === "general") {
        loadSystemStats();
      }
    } catch (error) {
      console.error("Error deleting assets:", error);
      showToast("Failed to delete assets. Please try again.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Render navigation item
   */
  const renderNavItem = (id, icon, label) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full ${
        activeSection === id
          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
      } transition-colors`}
    >
      <span className="material-symbols-outlined text-base">{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your application's settings, configurations, and integrations.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <aside className="md:col-span-3 lg:col-span-2">
          <nav className="flex flex-col gap-1 md:sticky md:top-28">
            {renderNavItem("general", "settings", "General")}
            {renderNavItem("permissions", "lock", "Permissions")}
            {renderNavItem(
              "integrations",
              "integration_instructions",
              "Integrations"
            )}
            {renderNavItem("branding", "palette", "Branding")}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="md:col-span-9 lg:col-span-10 flex flex-col gap-8">
          {/* General Settings Section */}
          {activeSection === "general" && (
            <>
              {/* General Settings Card */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    General Settings
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Update general information and preferences.
                  </p>
                </div>
                <div className="p-6 space-y-6">
                  {/* Application Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                    <label
                      className="text-sm font-medium text-gray-900 dark:text-white sm:pt-2"
                      htmlFor="appName"
                    >
                      Application Name
                    </label>
                    <div className="sm:col-span-2">
                      <input
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-sm"
                        id="appName"
                        type="text"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Timezone */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                    <label
                      className="text-sm font-medium text-gray-900 dark:text-white sm:pt-2"
                      htmlFor="timezone"
                    >
                      Timezone
                    </label>
                    <div className="sm:col-span-2">
                      <select
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-sm"
                        id="timezone"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                      >
                        <option value="UTC-8">
                          (UTC-08:00) Pacific Time (US &amp; Canada)
                        </option>
                        <option value="UTC-5">
                          (UTC-05:00) Eastern Time (US &amp; Canada)
                        </option>
                        <option value="UTC+1">
                          (UTC+01:00) Central European Time
                        </option>
                        <option value="UTC+0">(UTC+00:00) London</option>
                        <option value="UTC+8">(UTC+08:00) Singapore</option>
                        <option value="UTC+9">(UTC+09:00) Tokyo</option>
                      </select>
                    </div>
                  </div>

                  {/* Default Currency */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                    <label
                      className="text-sm font-medium text-gray-900 dark:text-white sm:pt-2"
                      htmlFor="currency"
                    >
                      Default Currency
                    </label>
                    <div className="sm:col-span-2">
                      <select
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-sm"
                        id="currency"
                        value={defaultCurrency}
                        onChange={(e) => setDefaultCurrency(e.target.value)}
                      >
                        <option value="USD">USD - US Dollar ($)</option>
                        <option value="EUR">EUR - Euro (€)</option>
                        <option value="GBP">GBP - British Pound (£)</option>
                        <option value="JPY">JPY - Japanese Yen (¥)</option>
                        <option value="CNY">CNY - Chinese Yuan (¥)</option>
                        <option value="INR">INR - Indian Rupee (₹)</option>
                        <option value="AUD">
                          AUD - Australian Dollar (A$)
                        </option>
                        <option value="CAD">CAD - Canadian Dollar (C$)</option>
                        <option value="CHF">CHF - Swiss Franc (Fr)</option>
                        <option value="SGD">SGD - Singapore Dollar (S$)</option>
                        <option value="NZD">
                          NZD - New Zealand Dollar (NZ$)
                        </option>
                        <option value="NGN">
                          NGN - Nigerian Naira (₦)
                        </option>
                        <option value="ZAR">
                          ZAR - South African Rand (R)
                        </option>
                        <option value="BRL">BRL - Brazilian Real (R$)</option>
                        <option value="MXN">MXN - Mexican Peso ($)</option>
                        <option value="AED">AED - UAE Dirham (د.إ)</option>
                        <option value="SAR">SAR - Saudi Riyal (﷼)</option>
                        <option value="KRW">KRW - South Korean Won (₩)</option>
                        <option value="HKD">
                          HKD - Hong Kong Dollar (HK$)
                        </option>
                        <option value="SEK">SEK - Swedish Krona (kr)</option>
                        <option value="NOK">NOK - Norwegian Krone (kr)</option>
                      </select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        This currency will be used throughout the application
                        for all cost-related fields
                      </p>
                    </div>
                  </div>

                  {/* Maintenance Mode Toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <label
                      className="text-sm font-medium text-gray-900 dark:text-white"
                      htmlFor="maintenance"
                    >
                      Maintenance Mode
                    </label>
                    <div className="sm:col-span-2 flex items-center gap-3">
                      <label
                        className="relative inline-flex items-center cursor-pointer"
                        htmlFor="maintenance-toggle"
                      >
                        <input
                          className="sr-only peer"
                          id="maintenance-toggle"
                          type="checkbox"
                          checked={maintenanceMode}
                          onChange={(e) => setMaintenanceMode(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Enable maintenance mode
                      </span>
                    </div>
                  </div>
                </div>
                {/* Save/Cancel Buttons */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setAppName("AssetManager");
                      setTimezone("UTC-5");
                      setMaintenanceMode(false);
                    }}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>

              {/* System Statistics Card */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        System Statistics
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Overview of your system's data and usage.
                      </p>
                    </div>
                    <button
                      onClick={loadSystemStats}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">
                        refresh
                      </span>
                      Refresh
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {loadingStats ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                        Loading statistics...
                      </p>
                    </div>
                  ) : stats ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Total Assets */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              Total Assets
                            </p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">
                              {stats.totalAssets}
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-3xl text-blue-600 dark:text-blue-400">
                            inventory_2
                          </span>
                        </div>
                      </div>

                      {/* In Use */}
                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                              In Use
                            </p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-300 mt-1">
                              {stats.assetsByStatus.inUse}
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">
                            check_circle
                          </span>
                        </div>
                      </div>

                      {/* Available */}
                      <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
                              Available
                            </p>
                            <p className="text-2xl font-bold text-teal-900 dark:text-teal-300 mt-1">
                              {stats.assetsByStatus.available}
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-3xl text-teal-600 dark:text-teal-400">
                            inventory
                          </span>
                        </div>
                      </div>

                      {/* Under Maintenance */}
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                              Maintenance
                            </p>
                            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300 mt-1">
                              {stats.assetsByStatus.underMaintenance}
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-3xl text-yellow-600 dark:text-yellow-400">
                            build
                          </span>
                        </div>
                      </div>

                      {/* Total Users */}
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                              Total Users
                            </p>
                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-300 mt-1">
                              {stats.totalUsers}
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-3xl text-purple-600 dark:text-purple-400">
                            group
                          </span>
                        </div>
                      </div>

                      {/* Total Activities */}
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                              Activities
                            </p>
                            <p className="text-2xl font-bold text-orange-900 dark:text-orange-300 mt-1">
                              {stats.totalActivities}
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-3xl text-orange-600 dark:text-orange-400">
                            activity_zone
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">
                        query_stats
                      </span>
                      <p className="text-gray-600 dark:text-gray-400">
                        Click refresh to load statistics
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* API Access Card */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    API Access
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Manage API keys for integrations and external access.
                  </p>
                </div>
                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-mono text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-md inline-block border border-gray-200 dark:border-gray-600 break-all">
                      {apiKey}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Last used: {lastApiUse}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRegenerateModal(true)}
                    className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">
                      refresh
                    </span>
                    <span>Regenerate Key</span>
                  </button>
                </div>
              </div>

              {/* Danger Zone Card */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="p-6">
                  <h2 className="text-lg font-bold text-red-800 dark:text-red-400">
                    Danger Zone
                  </h2>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    These actions are permanent and cannot be undone.
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-red-200 dark:border-red-800 rounded-md bg-white dark:bg-gray-800">
                    <div>
                      <p className="font-semibold text-red-800 dark:text-red-400">
                        Delete all assets
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        This will permanently delete all asset records.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors self-start sm:self-center"
                    >
                      Delete All Assets
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Permissions Section */}
          {activeSection === "permissions" && <PermissionsManagement />}

          {/* Integrations Section (Placeholder) */}
          {activeSection === "integrations" && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Integrations
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Connect with third-party services and tools.
                </p>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
                    integration_instructions
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Third-Party Integrations
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Integrate with external services like Slack, Microsoft
                    Teams, and more.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    This feature is coming soon.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Branding Section (Placeholder) */}
          {activeSection === "branding" && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Branding & Appearance
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Customize your application's appearance and branding.
                </p>
              </div>
              <div className="p-6 space-y-6">
                {/* Company Name */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                  <label
                    className="text-sm font-medium text-gray-900 dark:text-white sm:pt-2"
                    htmlFor="companyName"
                  >
                    Company Name
                  </label>
                  <div className="sm:col-span-2">
                    <input
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-sm"
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>
                </div>

                {/* Primary Color */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                  <label
                    className="text-sm font-medium text-gray-900 dark:text-white sm:pt-2"
                    htmlFor="primaryColor"
                  >
                    Primary Color
                  </label>
                  <div className="sm:col-span-2 flex items-center gap-3">
                    <input
                      className="w-16 h-10 rounded-md cursor-pointer"
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                    />
                    <input
                      className="flex-1 rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-sm font-mono"
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                  <label
                    className="text-sm font-medium text-gray-900 dark:text-white sm:pt-2"
                    htmlFor="secondaryColor"
                  >
                    Secondary Color
                  </label>
                  <div className="sm:col-span-2 flex items-center gap-3">
                    <input
                      className="w-16 h-10 rounded-md cursor-pointer"
                      id="secondaryColor"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                    />
                    <input
                      className="flex-1 rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-sm font-mono"
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#10B981"
                    />
                  </div>
                </div>

                {/* Color Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                  <label className="text-sm font-medium text-gray-900 dark:text-white sm:pt-2">
                    Preview
                  </label>
                  <div className="sm:col-span-2">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div
                        className="w-12 h-12 rounded-lg shadow-md"
                        style={{ backgroundColor: primaryColor }}
                        title="Primary Color"
                      ></div>
                      <div
                        className="w-12 h-12 rounded-lg shadow-md"
                        style={{ backgroundColor: secondaryColor }}
                        title="Secondary Color"
                      ></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Color Scheme
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          These colors will be applied throughout the
                          application
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save/Cancel Buttons */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setCompanyName("AssetManager");
                    setPrimaryColor("#3B82F6");
                    setSecondaryColor("#10B981");
                  }}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={handleSaveBranding}
                  disabled={saving}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">
                    warning
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Delete All Assets
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                  ⚠️ Warning: This will permanently delete all assets and their
                  associated activity records from the database.
                </p>
              </div>

              <div>
                <label
                  htmlFor="deleteConfirm"
                  className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
                >
                  To confirm, type{" "}
                  <span className="font-mono font-bold text-red-600 dark:text-red-400">
                    DELETE ALL ASSETS
                  </span>{" "}
                  below:
                </label>
                <input
                  id="deleteConfirm"
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type here..."
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  autoFocus
                />
              </div>

              {deleteConfirmText &&
                deleteConfirmText !== "DELETE ALL ASSETS" && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    ⚠️ Text does not match. Please type exactly: DELETE ALL
                    ASSETS
                  </p>
                )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                disabled={isDeleting}
                className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllAssets}
                disabled={
                  deleteConfirmText !== "DELETE ALL ASSETS" || isDeleting
                }
                className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">
                      delete_forever
                    </span>
                    <span>Delete All Assets</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate API Key Confirmation Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-2xl">
                    warning
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Regenerate API Key?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    This action will invalidate the old key
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Are you sure you want to regenerate the API key? The current key
                will stop working immediately, and any applications using it
                will need to be updated with the new key.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowRegenerateModal(false)}
                className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerateApiKey}
                className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-bold transition-colors gap-2"
              >
                <span className="material-symbols-outlined text-lg">
                  refresh
                </span>
                <span>Regenerate Key</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl border-2 animate-in slide-in-from-bottom-5 ${
            toast.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200"
              : toast.type === "error"
              ? "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200"
              : "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-200"
          }`}
        >
          <span className="material-symbols-outlined text-2xl">
            {toast.type === "success"
              ? "check_circle"
              : toast.type === "error"
              ? "error"
              : "info"}
          </span>
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={() => setToast({ show: false, message: "", type: "" })}
            className="ml-2 hover:opacity-70"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
