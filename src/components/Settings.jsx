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
 */

import React, { useState } from "react";

export default function Settings() {
  // State for settings form
  const [appName, setAppName] = useState("AssetManager");
  const [timezone, setTimezone] = useState("UTC-5");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [apiKey, setApiKey] = useState("**********-**********-**********-key");
  const [activeSection, setActiveSection] = useState("general");
  const [lastApiUse, setLastApiUse] = useState("2 hours ago");

  /**
   * Handle saving general settings
   */
  const handleSaveSettings = () => {
    console.log("Saving settings:", {
      appName,
      timezone,
      maintenanceMode,
    });
    alert("Settings saved successfully!");
  };

  /**
   * Handle regenerating API key
   */
  const handleRegenerateApiKey = () => {
    if (
      window.confirm(
        "Are you sure you want to regenerate the API key? This will invalidate the old key."
      )
    ) {
      const newKey = `${Math.random()
        .toString(36)
        .substring(2, 15)}-${Math.random()
        .toString(36)
        .substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}-key`;
      setApiKey(newKey);
      setLastApiUse("Just now");
      alert("API key regenerated successfully!");
    }
  };

  /**
   * Handle deleting all assets
   */
  const handleDeleteAllAssets = () => {
    const confirmation = window.prompt(
      'This action cannot be undone. Type "DELETE ALL ASSETS" to confirm:'
    );
    if (confirmation === "DELETE ALL ASSETS") {
      console.log("Deleting all assets...");
      alert(
        "All assets have been deleted. This is a demo - actual deletion would happen here."
      );
    } else if (confirmation !== null) {
      alert("Confirmation text did not match. No assets were deleted.");
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
          ? "bg-blue-50 text-blue-600 font-semibold"
          : "text-gray-600 hover:bg-gray-100 font-medium"
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
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
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
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">
                    General Settings
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Update general information and preferences.
                  </p>
                </div>
                <div className="p-6 space-y-6">
                  {/* Application Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                    <label
                      className="text-sm font-medium text-gray-900 sm:pt-2"
                      htmlFor="appName"
                    >
                      Application Name
                    </label>
                    <div className="sm:col-span-2">
                      <input
                        className="w-full rounded-md border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-sm"
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
                      className="text-sm font-medium text-gray-900 sm:pt-2"
                      htmlFor="timezone"
                    >
                      Timezone
                    </label>
                    <div className="sm:col-span-2">
                      <select
                        className="w-full rounded-md border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-sm"
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

                  {/* Maintenance Mode Toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <label
                      className="text-sm font-medium text-gray-900"
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
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                      <span className="text-sm text-gray-600">
                        Enable maintenance mode
                      </span>
                    </div>
                  </div>
                </div>
                {/* Save/Cancel Buttons */}
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setAppName("AssetManager");
                      setTimezone("UTC-5");
                      setMaintenanceMode(false);
                    }}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-white text-gray-900 border border-gray-300 text-sm font-bold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* API Access Card */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">
                    API Access
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage API keys for integrations and external access.
                  </p>
                </div>
                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-mono text-sm bg-gray-50 p-3 rounded-md inline-block border border-gray-200 break-all">
                      {apiKey}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Last used: {lastApiUse}
                    </p>
                  </div>
                  <button
                    onClick={handleRegenerateApiKey}
                    className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-white text-gray-900 border border-gray-300 text-sm font-bold hover:bg-gray-50 transition-colors gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">
                      refresh
                    </span>
                    <span>Regenerate Key</span>
                  </button>
                </div>
              </div>

              {/* Danger Zone Card */}
              <div className="bg-red-50 border border-red-200 rounded-lg">
                <div className="p-6">
                  <h2 className="text-lg font-bold text-red-800">
                    Danger Zone
                  </h2>
                  <p className="text-sm text-red-700 mt-1">
                    These actions are permanent and cannot be undone.
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-red-200 rounded-md bg-white">
                    <div>
                      <p className="font-semibold text-red-800">
                        Delete all assets
                      </p>
                      <p className="text-sm text-red-700">
                        This will permanently delete all asset records.
                      </p>
                    </div>
                    <button
                      onClick={handleDeleteAllAssets}
                      className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors self-start sm:self-center"
                    >
                      Delete All Assets
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Permissions Section (Placeholder) */}
          {activeSection === "permissions" && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Permissions</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage user roles and permissions.
                </p>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                    lock
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Permissions Management
                  </h3>
                  <p className="text-gray-600">
                    Configure user roles and access control settings here.
                  </p>
                  <p className="text-sm text-gray-500 mt-4">
                    This feature is coming soon.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Section (Placeholder) */}
          {activeSection === "integrations" && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">
                  Integrations
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Connect with third-party services and tools.
                </p>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                    integration_instructions
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Third-Party Integrations
                  </h3>
                  <p className="text-gray-600">
                    Integrate with external services like Slack, Microsoft
                    Teams, and more.
                  </p>
                  <p className="text-sm text-gray-500 mt-4">
                    This feature is coming soon.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Branding Section (Placeholder) */}
          {activeSection === "branding" && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Branding</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Customize your application's appearance and branding.
                </p>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                    palette
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Brand Customization
                  </h3>
                  <p className="text-gray-600">
                    Upload your logo, choose colors, and customize the look and
                    feel.
                  </p>
                  <p className="text-sm text-gray-500 mt-4">
                    This feature is coming soon.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
