/**
 * PermissionsManagement.jsx
 *
 * Component for managing user permissions in a detailed, categorized table.
 * Allows administrators to grant or restrict access to specific features.
 */

import React, { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";

export default function PermissionsManagement() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Show toast notification
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Permission categories with descriptions
  const permissionCategories = {
    dashboard: {
      title: "Dashboard",
      icon: "dashboard",
      permissions: [
        {
          key: "viewDashboard",
          label: "View Dashboard",
          description: "Access to main dashboard and statistics",
        },
      ],
    },
    assets: {
      title: "Assets & Equipment",
      icon: "inventory_2",
      permissions: [
        {
          key: "viewAssets",
          label: "View Assets",
          description: "View asset list and details",
        },
        {
          key: "createAssets",
          label: "Create Assets",
          description: "Register new assets",
        },
        {
          key: "editAssets",
          label: "Edit Assets",
          description: "Modify asset information",
        },
        {
          key: "deleteAssets",
          label: "Delete Assets",
          description: "Permanently delete assets",
        },
        {
          key: "exportAssets",
          label: "Export Assets",
          description: "Export asset data to CSV/PDF",
        },
        {
          key: "uploadDocuments",
          label: "Upload Documents",
          description: "Upload files to assets",
        },
        {
          key: "downloadDocuments",
          label: "Download Documents",
          description: "Download asset documents",
        },
        {
          key: "deleteDocuments",
          label: "Delete Documents",
          description: "Remove uploaded documents",
        },
      ],
    },
    notes: {
      title: "Notes",
      icon: "note",
      permissions: [
        {
          key: "createNotes",
          label: "Create Notes",
          description: "Add notes to assets",
        },
        {
          key: "editNotes",
          label: "Edit Notes",
          description: "Modify existing notes",
        },
        {
          key: "deleteNotes",
          label: "Delete Notes",
          description: "Remove notes from assets",
        },
      ],
    },
    tags: {
      title: "Tags",
      icon: "local_offer",
      permissions: [
        {
          key: "viewTags",
          label: "View Tags",
          description: "View tag management page",
        },
        {
          key: "createTags",
          label: "Create Tags",
          description: "Create new tags",
        },
        {
          key: "editTags",
          label: "Edit Tags",
          description: "Modify existing tags",
        },
        {
          key: "deleteTags",
          label: "Delete Tags",
          description: "Remove tags from system",
        },
      ],
    },
    maintenance: {
      title: "Maintenance",
      icon: "build",
      permissions: [
        {
          key: "viewMaintenance",
          label: "View Maintenance",
          description: "View maintenance records",
        },
        {
          key: "createMaintenance",
          label: "Create Maintenance",
          description: "Schedule maintenance",
        },
        {
          key: "editMaintenance",
          label: "Edit Maintenance",
          description: "Modify maintenance records",
        },
        {
          key: "deleteMaintenance",
          label: "Delete Maintenance",
          description: "Remove maintenance records",
        },
      ],
    },
    users: {
      title: "User Management",
      icon: "group",
      permissions: [
        {
          key: "viewUsers",
          label: "View Users",
          description: "View user list",
        },
        {
          key: "createUsers",
          label: "Create Users",
          description: "Add new users to system",
        },
        {
          key: "editUsers",
          label: "Edit Users",
          description: "Modify user information",
        },
        {
          key: "deleteUsers",
          label: "Delete Users",
          description: "Remove users from system",
        },
        {
          key: "managePermissions",
          label: "Manage Permissions",
          description: "Control user access rights",
        },
      ],
    },
    reports: {
      title: "Reports & Analytics",
      icon: "assessment",
      permissions: [
        {
          key: "viewReports",
          label: "View Reports",
          description: "Access reports page",
        },
        {
          key: "exportReports",
          label: "Export Reports",
          description: "Download report data",
        },
      ],
    },
    activities: {
      title: "Activities",
      icon: "history",
      permissions: [
        {
          key: "viewActivities",
          label: "View Activities",
          description: "View activity logs",
        },
        {
          key: "createActivities",
          label: "Create Activities",
          description: "Log new activities",
        },
      ],
    },
    notifications: {
      title: "Notifications",
      icon: "notifications",
      permissions: [
        {
          key: "viewNotifications",
          label: "View Notifications",
          description: "Receive notifications",
        },
        {
          key: "deleteNotifications",
          label: "Delete Notifications",
          description: "Clear notifications",
        },
      ],
    },
    settings: {
      title: "System Settings",
      icon: "settings",
      permissions: [
        {
          key: "viewSettings",
          label: "View Settings",
          description: "Access settings page",
        },
        {
          key: "editSettings",
          label: "Edit Settings",
          description: "Modify system settings",
        },
        {
          key: "regenerateApiKey",
          label: "Regenerate API Key",
          description: "Generate new API keys",
        },
        {
          key: "deleteAllAssets",
          label: "Delete All Assets",
          description: "⚠️ Dangerous: Delete all system data",
        },
      ],
    },
  };

  /**
   * Load all users on component mount
   */
  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Fetch users from API
   */
  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      showToast("Failed to load users", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  /**
   * Load permissions for a specific user
   */
  const loadUserPermissions = async (userId) => {
    try {
      setLoadingPermissions(true);
      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/permissions`
      );
      if (!response.ok) throw new Error("Failed to fetch permissions");

      const data = await response.json();
      setPermissions(data.permissions || {});
    } catch (error) {
      console.error("Error loading permissions:", error);
      showToast("Failed to load permissions", "error");
    } finally {
      setLoadingPermissions(false);
    }
  };

  /**
   * Handle selecting a user to manage
   */
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    loadUserPermissions(user._id);
    setShowModal(true);
  };

  /**
   * Toggle a specific permission
   */
  const togglePermission = (permissionKey) => {
    setPermissions((prev) => ({
      ...prev,
      [permissionKey]: !prev[permissionKey],
    }));
  };

  /**
   * Enable all permissions in a category
   */
  const enableAllInCategory = (category) => {
    const updates = {};
    permissionCategories[category].permissions.forEach((perm) => {
      updates[perm.key] = true;
    });
    setPermissions((prev) => ({ ...prev, ...updates }));
  };

  /**
   * Disable all permissions in a category
   */
  const disableAllInCategory = (category) => {
    const updates = {};
    permissionCategories[category].permissions.forEach((perm) => {
      updates[perm.key] = false;
    });
    setPermissions((prev) => ({ ...prev, ...updates }));
  };

  /**
   * Save updated permissions
   */
  const handleSavePermissions = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      const response = await fetch(
        `${API_BASE_URL}/users/${selectedUser._id}/permissions`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ permissions }),
        }
      );

      if (!response.ok) throw new Error("Failed to update permissions");

      showToast("Permissions updated successfully!", "success");
      setShowModal(false);
      loadUsers(); // Refresh user list
    } catch (error) {
      console.error("Error saving permissions:", error);
      showToast("Failed to save permissions. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Get role badge color
   */
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Administrator":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "Manager":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b dark:border-gray-700 pb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined">
            admin_panel_settings
          </span>
          User Permissions Management
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Control what each user can view, create, edit, or delete in the system
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loadingUsers ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.department || "No department"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleSelectUser(user)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 ml-auto"
                      >
                        <span className="material-symbols-outlined text-sm">
                          lock
                        </span>
                        Manage Permissions
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined">lock</span>
                  Manage Permissions: {selectedUser.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedUser.email} • {selectedUser.role}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingPermissions ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(permissionCategories).map(
                    ([categoryKey, category]) => (
                      <div
                        key={categoryKey}
                        className="border dark:border-gray-700 rounded-lg overflow-hidden"
                      >
                        {/* Category Header */}
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-700 dark:text-gray-300">
                              {category.icon}
                            </span>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {category.title}
                            </h4>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => enableAllInCategory(categoryKey)}
                              className="text-xs px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                            >
                              Enable All
                            </button>
                            <button
                              onClick={() => disableAllInCategory(categoryKey)}
                              className="text-xs px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                            >
                              Disable All
                            </button>
                          </div>
                        </div>

                        {/* Permissions List */}
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {category.permissions.map((permission) => (
                            <div
                              key={permission.key}
                              className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <div className="flex-1">
                                <label
                                  htmlFor={permission.key}
                                  className="font-medium text-sm text-gray-900 dark:text-white cursor-pointer"
                                >
                                  {permission.label}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {permission.description}
                                </p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  id={permission.key}
                                  checked={
                                    permissions?.[permission.key] || false
                                  }
                                  onChange={() =>
                                    togglePermission(permission.key)
                                  }
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">
                      save
                    </span>
                    Save Permissions
                  </>
                )}
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
