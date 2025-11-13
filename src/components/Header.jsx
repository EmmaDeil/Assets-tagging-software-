/**
 * Header.jsx
 *
 * Application header component with navigation and user profile.
 * This component provides the main navigation structure for the application.
 *
 * Features:
 * - Application logo and branding
 * - Main navigation menu (Assets, Tags, Users, Reports, Settings)
 * - Notification icon
 * - User profile picture (fetched from backend)
 * - User dropdown menu with profile settings and logout
 * - Responsive design that collapses on mobile
 * - Sticky positioning
 * - Dark mode support
 *
 * Props:
 * @param {string} activePage - Currently active page for highlighting navigation
 * @param {Function} onNavigate - Callback function when navigation item is clicked
 */

import React, { useState, useEffect, useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";
import API_BASE_URL from "../config/api";

export default function Header({ activePage = "Dashboard", onNavigate }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Access notification context
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useContext(NotificationContext);

  /**
   * Fetch current user data from backend
   * Automatically logs in the admin user (David Deil - admin@deil.com)
   */
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Fetch the admin user by email
        const response = await fetch(`${API_BASE_URL}/users`);
        if (response.ok) {
          const users = await response.json();
          // Find the admin user (David Deil)
          const adminUser = users.find(
            (user) =>
              user.email === "admin@deil.com" ||
              user.role === "Administrator" ||
              user.name === "David Deil"
          );

          if (adminUser) {
            setCurrentUser(adminUser);
            console.log("Logged in as:", adminUser.name, "-", adminUser.email);
          } else if (users.length > 0) {
            // Fallback to first user if admin not found
            setCurrentUser(users[0]);
            console.warn("Admin user not found, using first user");
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  /**
   * Close menus when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
      if (
        showNotifications &&
        !event.target.closest(".notification-container")
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu, showNotifications]);

  /**
   * Handle navigation click
   * @param {string} page - Page name to navigate to
   */
  const handleNavClick = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-gray-200 px-6 sm:px-10 py-4 bg-white sticky top-0 z-10 shadow-sm">
      {/* Left side: Logo */}
      <div className="flex items-center gap-3 text-gray-900">
        <div className="w-6 h-6 text-blue-600">
          <svg
            fill="none"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
        <h2
          className="text-xl font-bold leading-tight tracking-tight cursor-pointer"
          onClick={() => handleNavClick("Dashboard")}
        >
          AssetManager
        </h2>
      </div>

      {/* Right side: Navigation, Search, Notifications, Profile */}
      <div className="flex flex-1 justify-end gap-4 sm:gap-8 items-center">
        {/* Navigation Menu - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => handleNavClick("Assets")}
            className={`${
              activePage === "Assets"
                ? "text-blue-600 text-sm font-bold leading-normal border-b-2 border-blue-600 pb-1"
                : "text-gray-600 hover:text-blue-600 text-sm font-medium leading-normal"
            } transition-colors`}
          >
            Assets
          </button>
          <button
            onClick={() => handleNavClick("Tags")}
            className={`${
              activePage === "Tags"
                ? "text-blue-600 text-sm font-bold leading-normal border-b-2 border-blue-600 pb-1"
                : "text-gray-600 hover:text-blue-600 text-sm font-medium leading-normal"
            } transition-colors`}
          >
            Tags
          </button>
          <button
            onClick={() => handleNavClick("Users")}
            className={`${
              activePage === "Users"
                ? "text-blue-600 text-sm font-bold leading-normal border-b-2 border-blue-600 pb-1"
                : "text-gray-600 hover:text-blue-600 text-sm font-medium leading-normal"
            } transition-colors`}
          >
            Users
          </button>
          <button
            onClick={() => handleNavClick("Reports")}
            className={`${
              activePage === "Reports"
                ? "text-blue-600 text-sm font-bold leading-normal border-b-2 border-blue-600 pb-1"
                : "text-gray-600 hover:text-blue-600 text-sm font-medium leading-normal"
            } transition-colors`}
          >
            Reports
          </button>
          <button
            onClick={() => handleNavClick("Settings")}
            className={`${
              activePage === "Settings"
                ? "text-blue-600 text-sm font-bold leading-normal border-b-2 border-blue-600 pb-1"
                : "text-gray-600 hover:text-blue-600 text-sm font-medium leading-normal"
            } transition-colors`}
          >
            Settings
          </button>
        </nav>
        {/* Notifications Button */}
        <div className="relative notification-container">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
          >
            <svg
              className="w-6 h-6 text-gray-600 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {/* Unread Badge */}
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[500px] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                {notifications.length > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <span className="material-symbols-outlined text-gray-400 text-5xl mb-2">
                      notifications_off
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                        !notification.read
                          ? "bg-blue-50 dark:bg-blue-900/10"
                          : ""
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification._id);
                        }
                        if (notification.assetId) {
                          // Navigate to asset details if asset-related
                          setShowNotifications(false);
                          // You can add navigation logic here
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon based on type */}
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                            notification.type === "maintenance"
                              ? "bg-yellow-100 dark:bg-yellow-900/30"
                              : notification.type === "status_change"
                              ? "bg-blue-100 dark:bg-blue-900/30"
                              : notification.type === "assignment"
                              ? "bg-green-100 dark:bg-green-900/30"
                              : notification.type === "alert"
                              ? "bg-red-100 dark:bg-red-900/30"
                              : "bg-gray-100 dark:bg-gray-700"
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-base ${
                              notification.type === "maintenance"
                                ? "text-yellow-600 dark:text-yellow-400"
                                : notification.type === "status_change"
                                ? "text-blue-600 dark:text-blue-400"
                                : notification.type === "assignment"
                                ? "text-green-600 dark:text-green-400"
                                : notification.type === "alert"
                                ? "text-red-600 dark:text-red-400"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {notification.type === "maintenance"
                              ? "build"
                              : notification.type === "status_change"
                              ? "swap_horiz"
                              : notification.type === "assignment"
                              ? "person_add"
                              : notification.type === "alert"
                              ? "warning"
                              : "info"}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-sm">
                            close
                          </span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Picture */}
        <div className="relative user-menu-container">
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all flex items-center justify-center text-white font-bold text-sm"
            style={{
              backgroundColor: currentUser?.profilePhoto
                ? "transparent"
                : "#3B82F6",
              backgroundImage: currentUser?.profilePhoto
                ? `url(${currentUser.profilePhoto})`
                : "none",
            }}
            title={
              currentUser
                ? `${currentUser.name} - ${currentUser.email}`
                : "User profile"
            }
          >
            {!currentUser?.profilePhoto &&
              (currentUser?.name?.[0]?.toUpperCase() || "U")}
          </div>

          {/* User Dropdown Menu */}
          {showUserMenu && currentUser && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {currentUser.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {currentUser.role} •{" "}
                  {currentUser.department || "No Department"}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleNavClick("Settings");
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">
                    settings
                  </span>
                  Profile Settings
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    // Add logout logic here
                    console.log("Logout clicked");
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">
                    logout
                  </span>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
