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

import React, { useState, useEffect } from "react";

export default function Header({ activePage = "Dashboard", onNavigate }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  /**
   * Fetch current user data from backend
   */
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // For now, fetch the first user as the logged-in user
        // In a real app, this would use authentication to get the current user
        const response = await fetch("http://localhost:5000/api/users");
        if (response.ok) {
          const users = await response.json();
          if (users.length > 0) {
            // Get the first user or implement proper auth logic
            setCurrentUser(users[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  /**
   * Close user menu when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

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
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors">
          <svg
            className="w-6 h-6 text-gray-600"
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
        </button>

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
