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
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../config/api";

export default function Header({ activePage = "Dashboard", onNavigate }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const notificationButtonRef = React.useRef(null);
  const profileButtonRef = React.useRef(null);
  const [notificationDropdownStyle, setNotificationDropdownStyle] = useState(
    {}
  );
  const [profileDropdownStyle, setProfileDropdownStyle] = useState({});

  // Access auth context and get the actual logged-in user
  const { logout, user: currentUser, hasPermission } = useAuth();

  // Access notification context
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useContext(NotificationContext);

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
      if (showMobileMenu && !event.target.closest(".mobile-menu-container")) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu, showNotifications, showMobileMenu]);

  /**
   * Calculate dropdown positions for desktop view
   */
  useEffect(() => {
    const calculatePositions = () => {
      if (window.innerWidth >= 768) {
        // Desktop view - calculate button positions
        if (notificationButtonRef.current) {
          const rect = notificationButtonRef.current.getBoundingClientRect();
          setNotificationDropdownStyle({
            top: `${rect.bottom + 8}px`,
            right: `${window.innerWidth - rect.right}px`,
          });
        }
        if (profileButtonRef.current) {
          const rect = profileButtonRef.current.getBoundingClientRect();
          setProfileDropdownStyle({
            top: `${rect.bottom + 8}px`,
            right: `${window.innerWidth - rect.right}px`,
          });
        }
      }
    };

    calculatePositions();
    window.addEventListener("resize", calculatePositions);
    window.addEventListener("scroll", calculatePositions);

    return () => {
      window.removeEventListener("resize", calculatePositions);
      window.removeEventListener("scroll", calculatePositions);
    };
  }, [showNotifications, showUserMenu]);

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
    <header className="flex items-center justify-between border-b border-gray-200 px-3 sm:px-6 md:px-10 py-3 sm:py-4 bg-white sticky top-0 z-50 shadow-sm overflow-x-hidden overflow-y-visible">
      {/* Left side: Logo */}
      <div className="flex items-center gap-2 sm:gap-3 text-gray-900 shrink-0">
        <div className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0">
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
          className="text-base sm:text-lg md:text-xl font-bold leading-tight tracking-tight cursor-pointer truncate"
          onClick={() => handleNavClick("Dashboard")}
        >
          AssetFlow
        </h2>
      </div>

      {/* Right side: Navigation, Search, Notifications, Profile */}
      <div className="flex flex-1 justify-end gap-2 sm:gap-4 md:gap-8 items-center min-w-0">
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
          {/* Users - Only visible to users with viewUsers permission */}
          {hasPermission("viewUsers") && (
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
          )}
          <button
            onClick={() => handleNavClick("Maintenance")}
            className={`${
              activePage === "Maintenance" ||
              activePage === "MaintenanceRecords" ||
              activePage === "MaintenanceCalendar"
                ? "text-blue-600 text-sm font-bold leading-normal border-b-2 border-blue-600 pb-1"
                : "text-gray-600 hover:text-blue-600 text-sm font-medium leading-normal"
            } transition-colors`}
          >
            Maintenance
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
          {/* Settings - Only visible to users with viewSettings permission */}
          {hasPermission("viewSettings") && (
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
          )}
        </nav>

        {/* Mobile Menu Button - Only visible on mobile */}
        <div className="md:hidden relative mobile-menu-container shrink-0">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
            </svg>
          </button>

          {/* Mobile Menu Dropdown */}
          {showMobileMenu && (
            <div className="fixed right-2 top-16 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999] py-2">
              <button
                onClick={() => {
                  handleNavClick("Assets");
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                  activePage === "Assets"
                    ? "text-blue-600 font-semibold bg-blue-50"
                    : "text-gray-700"
                }`}
              >
                <span className="text-sm">📦 Assets</span>
              </button>
              <button
                onClick={() => {
                  handleNavClick("Tags");
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                  activePage === "Tags"
                    ? "text-blue-600 font-semibold bg-blue-50"
                    : "text-gray-700"
                }`}
              >
                <span className="text-sm">🏷️ Tags</span>
              </button>
              {/* Users - Only for users with viewUsers permission */}
              {hasPermission("viewUsers") && (
                <button
                  onClick={() => {
                    handleNavClick("Users");
                    setShowMobileMenu(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    activePage === "Users"
                      ? "text-blue-600 font-semibold bg-blue-50"
                      : "text-gray-700"
                  }`}
                >
                  <span className="text-sm">👥 Users</span>
                </button>
              )}
              <button
                onClick={() => {
                  handleNavClick("Maintenance");
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                  activePage === "Maintenance" ||
                  activePage === "MaintenanceRecords" ||
                  activePage === "MaintenanceCalendar"
                    ? "text-blue-600 font-semibold bg-blue-50"
                    : "text-gray-700"
                }`}
              >
                <span className="text-sm">🔧 Maintenance</span>
              </button>
              <button
                onClick={() => {
                  handleNavClick("Reports");
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                  activePage === "Reports"
                    ? "text-blue-600 font-semibold bg-blue-50"
                    : "text-gray-700"
                }`}
              >
                <span className="text-sm">📊 Reports</span>
              </button>
              {/* Settings - Only for users with viewSettings permission */}
              {hasPermission("viewSettings") && (
                <button
                  onClick={() => {
                    handleNavClick("Settings");
                    setShowMobileMenu(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    activePage === "Settings"
                      ? "text-blue-600 font-semibold bg-blue-50"
                      : "text-gray-700"
                  }`}
                >
                  <span className="text-sm">⚙️ Settings</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <div
          ref={notificationButtonRef}
          className="relative notification-container shrink-0 z-50"
        >
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300"
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
            <div
              className="fixed w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[9999] max-h-[500px] overflow-hidden flex flex-col"
              style={
                window.innerWidth >= 768
                  ? notificationDropdownStyle
                  : { top: "4rem", right: "0.5rem" }
              }
            >
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
        <div
          ref={profileButtonRef}
          className="relative user-menu-container shrink-0 z-50"
        >
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-9 h-9 sm:w-10 sm:h-10 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all flex items-center justify-center text-white font-bold text-xs sm:text-sm"
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
            <div
              className="fixed w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-[9999]"
              style={
                window.innerWidth >= 768
                  ? profileDropdownStyle
                  : { top: "4rem", right: "0.5rem" }
              }
            >
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
                    handleNavClick("Profile");
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">
                    person
                  </span>
                  My Profile
                </button>
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
                  App Settings
                </button>
                <button
                  onClick={async () => {
                    setShowUserMenu(false);
                    try {
                      await logout();
                      // Redirect to login page
                      window.location.href = "/login";
                    } catch (error) {
                      console.error("Logout error:", error);
                      // Force redirect even if logout fails
                      window.location.href = "/login";
                    }
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
