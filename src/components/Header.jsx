/**
 * Header.jsx
 *
 * Application header component with navigation, search, and user profile.
 * This component provides the main navigation structure for the application.
 *
 * Features:
 * - Application logo and branding
 * - Main navigation menu (Dashboard, Assets, Reports, Settings)
 * - Search functionality
 * - Notification icon
 * - User profile picture
 * - Responsive design that collapses on mobile
 * - Sticky positioning
 *
 * Props:
 * @param {string} activePage - Currently active page for highlighting navigation
 * @param {Function} onNavigate - Callback function when navigation item is clicked
 * @param {Function} onSearch - Callback function for search input
 */

import React, { useState } from "react";

export default function Header({
  activePage = "Dashboard",
  onNavigate,
  onSearch,
}) {
  const [searchValue, setSearchValue] = useState("");

  /**
   * Handle search input changes
   * @param {Event} e - Input change event
   */
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

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
      {/* Left side: Logo and Navigation */}
      <div className="flex items-center gap-8">
        {/* Logo and Brand */}
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
          <h2 className="text-xl font-bold leading-tight tracking-tight">
            AssetManager
          </h2>
        </div>

        {/* Navigation Menu - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => handleNavClick("Dashboard")}
            className={`${
              activePage === "Dashboard"
                ? "text-blue-600 text-sm font-bold leading-normal border-b-2 border-blue-600 pb-1"
                : "text-gray-600 hover:text-blue-600 text-sm font-medium leading-normal"
            } transition-colors`}
          >
            Dashboard
          </button>
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
      </div>

      {/* Right side: Search, Notifications, Profile */}
      <div className="flex flex-1 justify-end gap-4 sm:gap-6 items-center">
        {/* Search Bar - Hidden on small screens */}
        <label className="hidden sm:flex flex-col min-w-40 h-10 max-w-64">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-gray-100">
            <div className="text-gray-500 flex items-center justify-center pl-3">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-gray-500 px-2 text-sm font-normal leading-normal"
              placeholder="Search assets..."
              value={searchValue}
              onChange={handleSearchChange}
            />
          </div>
        </label>

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
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuARSx7j4wX5-TM_9FGjltDJfM8W15YRnR0WHZiOtVj5J_g5fFoJZHzYcfxAo53KvgkaV-GxnmHS6ZWJPaNZt9KCJgL5lPw5y2gzNnL5rTaiIB-KB4in4Nt_-h5hipKKznpI2oWwnV_czybkBakPfZZBTnB2uuXlR8nBUiQtwBbTKX5-RBe8Y_7Ic1ZT3hysV5QfFV-5vvsX9OieLbs6Yl7IYeaSalKyxrYgwJ4zrGHjvL5fsgjxycc6eBlggKDOMXreApNm2MaOuSE")',
          }}
          title="User profile"
        ></div>
      </div>
    </header>
  );
}
