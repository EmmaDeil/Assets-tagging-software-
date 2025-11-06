/**
 * DashboardExample.jsx
 *
 * Example usage of the Dashboard component with the Header.
 * This file demonstrates how to integrate the Dashboard into your application
 * with sample data and proper structure.
 *
 * To use this in your main App.jsx:
 * 1. Import Dashboard and Header components
 * 2. Add a navigation state to switch between Dashboard and Assets views
 * 3. Pass your equipment data with status field
 * 4. Track recent activity when assets are modified
 */

import React, { useState } from "react";
import Header from "./Header";
import Dashboard from "./Dashboard";

export default function DashboardExample() {
  const [currentPage, setCurrentPage] = useState("Dashboard");

  // Sample assets data with status field
  // In your actual app, this would come from your EquipmentContext
  const sampleAssets = [
    {
      id: "1",
      name: 'MacBook Pro 16"',
      model: "MBP16-2023",
      serial: "ABC123456",
      location: "Office A",
      status: "In Use",
      maintenancePeriod: "Annually",
    },
    {
      id: "2",
      name: "Dell OptiPlex 3080",
      model: "OPT3080",
      serial: "DEF789012",
      location: "Office B",
      status: "Retired",
      maintenancePeriod: "Every 6 Months",
    },
    {
      id: "3",
      name: "Server Rack #45",
      model: "SR-2024",
      serial: "GHI345678",
      location: "Data Center",
      status: "In Maintenance",
      maintenancePeriod: "Monthly",
    },
    {
      id: "4",
      name: "iPhone 14 Pro",
      model: "IP14P-256",
      serial: "JKL901234",
      location: "Mobile Pool",
      status: "In Use",
      maintenancePeriod: "As Needed",
    },
  ];

  // Sample recent activity data
  // In your actual app, you would track this when assets are created, modified, etc.
  const recentActivity = [
    {
      assetName: 'MacBook Pro 16"',
      action: "Checked Out",
      actionType: "Checked Out",
      user: "John Doe",
      date: "2m ago",
      icon: "💻",
    },
    {
      assetName: "Server Rack #45",
      action: "Maintenance",
      actionType: "Maintenance",
      user: "Jane Smith",
      date: "1h ago",
      icon: "🖥️",
    },
    {
      assetName: "iPhone 14 Pro",
      action: "Added",
      actionType: "Added",
      user: "Admin",
      date: "3h ago",
      icon: "📱",
    },
    {
      assetName: "Dell OptiPlex 3080",
      action: "Retired",
      actionType: "Retired",
      user: "System",
      date: "1d ago",
      icon: "🖥️",
    },
  ];

  /**
   * Handle navigation between pages
   * @param {string} page - Page name to navigate to
   */
  const handleNavigate = (page) => {
    setCurrentPage(page);
    console.log("Navigating to:", page);
  };

  /**
   * Handle search functionality
   * @param {string} query - Search query string
   */
  const handleSearch = (query) => {
    console.log("Searching for:", query);
    // Implement your search logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Component */}
      <Header
        activePage={currentPage}
        onNavigate={handleNavigate}
        onSearch={handleSearch}
      />

      {/* Main Content */}
      <main className="px-4 sm:px-8 lg:px-10 flex flex-1 justify-center py-8">
        <div className="flex flex-col w-full max-w-7xl">
          {currentPage === "Dashboard" && (
            <Dashboard assets={sampleAssets} recentActivity={recentActivity} />
          )}

          {currentPage === "Assets" && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Assets View
              </h2>
              <p className="text-gray-600">
                This would be your existing EquipmentTable and asset management
                components
              </p>
            </div>
          )}

          {currentPage === "Reports" && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Reports View
              </h2>
              <p className="text-gray-600">
                Generate and view asset reports here
              </p>
            </div>
          )}

          {currentPage === "Settings" && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Settings View
              </h2>
              <p className="text-gray-600">
                Application settings and preferences
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
