/**
 * UserProfile.jsx
 *
 * User profile management component for personal information, security, roles, and notification preferences.
 */

import React, { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";

const UserProfile = () => {
  // Current user ID - In production, get this from auth context/session
  const [currentUserId, setCurrentUserId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    jobTitle: "",
    phoneNumber: "",
    department: "",
  });

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    systemUpdates: false,
    weeklySummary: false,
  });

  // User roles
  const [userRoles, setUserRoles] = useState([]);

  // Toast notification
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Fetch current user from the first user in database (temporary solution)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users`);
        if (response.ok) {
          const users = await response.json();
          if (users.length > 0) {
            // Use the first user as the current user (temporary)
            setCurrentUserId(users[0]._id);
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch user profile data when userId is available
  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUserId) return;

      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/users/profile/${currentUserId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const userData = await response.json();

        // Set form data
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          jobTitle: userData.jobTitle || "",
          phoneNumber: userData.phoneNumber || "",
          department: userData.department || "",
        });

        // Set notification preferences
        if (userData.notificationPreferences) {
          setNotifications({
            criticalAlerts:
              userData.notificationPreferences.criticalAlerts ?? true,
            systemUpdates:
              userData.notificationPreferences.systemUpdates ?? false,
            weeklySummary:
              userData.notificationPreferences.weeklySummary ?? false,
          });
        }

        // Set user roles
        if (userData.roles && userData.roles.length > 0) {
          setUserRoles(userData.roles);
        } else {
          // Fallback to single role if roles array is empty
          setUserRoles([
            {
              name: userData.role || "User",
              description: "Default user role",
              status: userData.status || "Active",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        showToast("Failed to load profile data", "error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUserId]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle notification change
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Save profile changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!currentUserId) {
      showToast("User not found", "error");
      return;
    }

    try {
      setSaving(true);

      // Validate
      if (!formData.name || !formData.email) {
        showToast("Name and email are required", "error");
        setSaving(false);
        return;
      }

      // Prepare data for API
      const updateData = {
        name: formData.name,
        email: formData.email,
        jobTitle: formData.jobTitle,
        phoneNumber: formData.phoneNumber,
        department: formData.department,
        notificationPreferences: notifications,
      };

      // API call to update profile
      const response = await fetch(
        `${API_BASE_URL}/users/profile/${currentUserId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      const updatedUser = await response.json();

      // Update local state with the response
      setFormData({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        jobTitle: updatedUser.jobTitle || "",
        phoneNumber: updatedUser.phoneNumber || "",
        department: updatedUser.department || "",
      });

      showToast("Profile updated successfully!", "success");
    } catch (error) {
      console.error("Error saving profile:", error);
      showToast(error.message || "Failed to save profile changes", "error");
    } finally {
      setSaving(false);
    }
  };

  // Submit password change
  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }

    if (!currentUserId) {
      showToast("User not found", "error");
      return;
    }

    try {
      setSaving(true);

      // API call to change password
      const response = await fetch(
        `${API_BASE_URL}/users/change-password/${currentUserId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change password");
      }

      showToast("Password changed successfully!", "success");
      setShowChangePasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      showToast(error.message || "Failed to change password", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="flex-grow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            User Profile
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage your profile, security, and notification settings.
          </p>
        </header>

        <form onSubmit={handleSaveProfile}>
          <div className="space-y-12">
            {/* Personal Information */}
            <section className="p-6 md:p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                <h2 className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
                  Personal Information
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  Update your personal details here.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                {/* Full Name */}
                <div className="sm:col-span-3">
                  <label
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                    htmlFor="name"
                  >
                    Full Name
                  </label>
                  <div className="mt-2">
                    <input
                      className="block w-full rounded-md border-0 py-2.5 px-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="sm:col-span-3">
                  <label
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <div className="mt-2">
                    <input
                      className="block w-full rounded-md border-0 py-2.5 px-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Job Title */}
                <div className="sm:col-span-3">
                  <label
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                    htmlFor="jobTitle"
                  >
                    Job Title
                  </label>
                  <div className="mt-2">
                    <input
                      className="block w-full rounded-md border-0 py-2.5 px-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      id="jobTitle"
                      name="jobTitle"
                      type="text"
                      value={formData.jobTitle}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="sm:col-span-3">
                  <label
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                    htmlFor="phoneNumber"
                  >
                    Phone Number
                  </label>
                  <div className="mt-2">
                    <input
                      className="block w-full rounded-md border-0 py-2.5 px-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      id="phoneNumber"
                      name="phoneNumber"
                      type="text"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Profile Picture */}
                <div className="col-span-full">
                  <label
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                    htmlFor="photo"
                  >
                    Profile Picture
                  </label>
                  <div className="mt-2 flex items-center gap-x-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-gray-500 dark:text-gray-400">
                        person
                      </span>
                    </div>
                    <button
                      className="rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      type="button"
                      onClick={() =>
                        showToast("Photo upload coming soon!", "info")
                      }
                    >
                      Change Photo
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Security */}
            <section className="p-6 md:p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                <h2 className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
                  Security
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  Manage your password and security settings.
                </p>
              </div>
              <div>
                <button
                  className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  type="button"
                  onClick={() => setShowChangePasswordModal(true)}
                >
                  Change Password
                </button>
              </div>
            </section>

            {/* Roles & Permissions */}
            <section className="p-6 md:p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                <h2 className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
                  Roles &amp; Permissions
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  View your assigned roles within the system.
                </p>
              </div>
              <div className="flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-0"
                            scope="col"
                          >
                            Role
                          </th>
                          <th
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                            scope="col"
                          >
                            Description
                          </th>
                          <th
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                            scope="col"
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {userRoles.map((role) => (
                          <tr key={role.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-0">
                              {role.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {role.description}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/50 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
                                {role.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* Notification Preferences */}
            <section className="p-6 md:p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                <h2 className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
                  Notification Preferences
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  Select which notifications you would like to receive.
                </p>
              </div>
              <div className="space-y-6">
                <fieldset>
                  <div className="space-y-4">
                    <div className="relative flex items-start">
                      <div className="flex h-6 items-center">
                        <input
                          checked={notifications.criticalAlerts}
                          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-blue-600 focus:ring-blue-600"
                          id="criticalAlerts"
                          name="criticalAlerts"
                          type="checkbox"
                          onChange={handleNotificationChange}
                        />
                      </div>
                      <div className="ml-3 text-sm leading-6">
                        <label
                          className="font-medium text-gray-900 dark:text-white"
                          htmlFor="criticalAlerts"
                        >
                          Email notifications for critical alerts
                        </label>
                      </div>
                    </div>
                    <div className="relative flex items-start">
                      <div className="flex h-6 items-center">
                        <input
                          checked={notifications.systemUpdates}
                          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-blue-600 focus:ring-blue-600"
                          id="systemUpdates"
                          name="systemUpdates"
                          type="checkbox"
                          onChange={handleNotificationChange}
                        />
                      </div>
                      <div className="ml-3 text-sm leading-6">
                        <label
                          className="font-medium text-gray-900 dark:text-white"
                          htmlFor="systemUpdates"
                        >
                          In-app notifications for system updates
                        </label>
                      </div>
                    </div>
                    <div className="relative flex items-start">
                      <div className="flex h-6 items-center">
                        <input
                          checked={notifications.weeklySummary}
                          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-blue-600 focus:ring-blue-600"
                          id="weeklySummary"
                          name="weeklySummary"
                          type="checkbox"
                          onChange={handleNotificationChange}
                        />
                      </div>
                      <div className="ml-3 text-sm leading-6">
                        <label
                          className="font-medium text-gray-900 dark:text-white"
                          htmlFor="weeklySummary"
                        >
                          Weekly summary report via email
                        </label>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                className="text-sm font-semibold leading-6 text-gray-900 dark:text-white rounded-md px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700"
                type="button"
                onClick={() => window.location.reload()}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={saving || !currentUserId}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">
                    lock
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Change Password
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Update your account password
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitPasswordChange}>
              <div className="p-6 space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
                    htmlFor="currentPassword"
                  >
                    Current Password
                  </label>
                  <input
                    className="block w-full rounded-md border-0 py-2.5 px-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
                    htmlFor="newPassword"
                  >
                    New Password
                  </label>
                  <input
                    className="block w-full rounded-md border-0 py-2.5 px-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="8"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
                    htmlFor="confirmPassword"
                  >
                    Confirm New Password
                  </label>
                  <input
                    className="block w-full rounded-md border-0 py-2.5 px-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="8"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
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
    </main>
  );
};

export default UserProfile;
