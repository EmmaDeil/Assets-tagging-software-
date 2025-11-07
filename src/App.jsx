/**
 * App.jsx
 *
 * Main application component that manages routing and page navigation.
 * This is the central hub of the application that coordinates all major features.
 *
 * Application Structure:
 * - Header: Navigation bar with page links and search functionality
 * - Main Content Area: Displays the active page component based on user navigation
 *
 * Available Pages:
 * 1. Dashboard - Overview statistics, charts, and recent activity
 * 2. Assets - Asset management with table view, detail view, and registration form
 * 3. Tags - Tag management for organizing assets (Location, Department, Type, Status)
 * 4. Users - User management with role-based access control
 * 5. Reports - Analytics dashboard with charts and data export capabilities
 * 6. Settings - Application settings, API keys, and system configuration
 *
 * State Management:
 * - Uses EquipmentContext for global asset/equipment data
 * - Local state for page navigation and view modes
 * - Asset detail view state for showing individual asset information
 *
 * Navigation Flow:
 * - User clicks navigation link in Header → updates currentPage state
 * - Component renders corresponding page based on currentPage value
 * - Assets page has sub-views: management (table), details (single asset), add (registration form)
 *
 * Props Flow:
 * - Context provides: items (assets), activities (recent activity)
 * - Callback functions passed to child components for state updates
 * - View transitions handled through local state (assetsView, viewingAssetId)
 */

import "./App.css";
import React, { useState, useContext } from "react";
import {
  EquipmentProvider,
  EquipmentContext,
} from "./context/EquipmentContext";
import { NotificationProvider } from "./context/NotificationContext";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import AssetsManagement from "./components/AssetsManagement";
import AssetDetails from "./components/AssetDetails";
import AssetRegistration from "./components/AssetRegistration";
import EditAsset from "./components/EditAsset";
import TagManagement from "./components/TagManagement";
import UserManagement from "./components/UserManagement";
import Reports from "./components/Reports";
import Settings from "./components/Settings";

/**
 * AppContent component
 *
 * Inner application component that has access to EquipmentContext.
 * This component must be wrapped by EquipmentProvider to access global state.
 *
 * Responsibilities:
 * - Manages page navigation state
 * - Handles view mode switching for Assets page (table/detail/add views)
 * - Provides navigation and search callbacks to Header
 * - Renders appropriate page component based on current navigation state
 *
 * State Variables:
 * @state {string} currentPage - Current active page ("Dashboard", "Assets", "Tags", "Users", "Reports", "Settings")
 * @state {string} assetsView - Assets page view mode ("management", "details", "add", "edit")
 * @state {string|null} viewingAssetId - ID of asset being viewed in detail view, null when not viewing
 * @state {string|null} editingAssetId - ID of asset being edited, null when not editing
 *
 * Context Usage:
 * @context {Array} items - Array of all equipment/asset objects from EquipmentContext
 * @context {Array} activities - Array of recent activity log entries from EquipmentContext
 */
function AppContent() {
  // Access equipment data from context
  const { items, activities, deleteEquipment } = useContext(EquipmentContext);

  // State: Current page being displayed - persist to localStorage
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem("currentPage") || "Dashboard";
  });

  // State: View mode for Assets page - persist to localStorage
  const [assetsView, setAssetsView] = useState(() => {
    return localStorage.getItem("assetsView") || "management";
  });

  // State: Asset ID for detail view - persist to localStorage
  const [viewingAssetId, setViewingAssetId] = useState(() => {
    return localStorage.getItem("viewingAssetId") || null;
  });

  // State: Asset ID for edit view - persist to localStorage
  const [editingAssetId, setEditingAssetId] = useState(() => {
    return localStorage.getItem("editingAssetId") || null;
  });

  // Persist current page to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  // Persist assets view to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem("assetsView", assetsView);
  }, [assetsView]);

  // Persist viewing asset ID to localStorage whenever it changes
  React.useEffect(() => {
    if (viewingAssetId) {
      localStorage.setItem("viewingAssetId", viewingAssetId);
    } else {
      localStorage.removeItem("viewingAssetId");
    }
  }, [viewingAssetId]);

  // Persist editing asset ID to localStorage whenever it changes
  React.useEffect(() => {
    if (editingAssetId) {
      localStorage.setItem("editingAssetId", editingAssetId);
    } else {
      localStorage.removeItem("editingAssetId");
    }
  }, [editingAssetId]);

  /**
   * Handle navigation between pages
   *
   * Updates the current page state when user clicks navigation links in header.
   * This triggers a re-render showing the selected page component.
   * Also persists the navigation to localStorage for page refresh persistence.
   *
   * @param {string} page - Page identifier ("Dashboard", "Assets", "Tags", "Users", "Reports", "Settings")
   */
  const handleNavigate = (page) => {
    setCurrentPage(page);
    // Reset assets view when navigating away from Assets page
    if (page !== "Assets") {
      setAssetsView("management");
      setViewingAssetId(null);
      setEditingAssetId(null);
    }
  };

  /**
   * Handle search functionality
   *
   * Called when user types in the search box in the header.
   * Currently logs search queries - can be extended for global search functionality.
   *
   * @param {string} query - User's search query string
   * @todo Implement global search across assets, tags, users, etc.
   */
  const handleSearch = (query) => {
    console.log("Searching for:", query);
    // TODO: Implement search functionality
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Component with Navigation */}
      <Header
        activePage={currentPage}
        onNavigate={handleNavigate}
        onSearch={handleSearch}
      />

      {/* Main Content */}
      <main className="px-4 sm:px-8 lg:px-10 flex flex-1 justify-center py-8">
        <div className="flex flex-col w-full max-w-7xl">
          {/* Dashboard Page */}
          {currentPage === "Dashboard" && (
            <Dashboard assets={items} recentActivity={activities} />
          )}

          {/* Assets Page with Management View */}
          {currentPage === "Assets" && assetsView === "management" && (
            <AssetsManagement
              assets={items}
              onView={(asset) => {
                setViewingAssetId(asset.id);
                setAssetsView("details");
              }}
              onEdit={(asset) => {
                setEditingAssetId(asset.id);
                setAssetsView("edit");
              }}
              onDelete={async (asset) => {
                if (
                  window.confirm(
                    `Are you sure you want to delete "${asset.name}"?`
                  )
                ) {
                  try {
                    await deleteEquipment(asset.id);
                    console.log("Asset deleted successfully");
                  } catch (error) {
                    alert(`Failed to delete asset: ${error.message}`);
                  }
                }
              }}
              onAddNew={() => setAssetsView("add")}
            />
          )}

          {/* Assets Page with Detail View */}
          {currentPage === "Assets" && assetsView === "details" && (
            <AssetDetails
              assetId={viewingAssetId}
              onClose={() => {
                setAssetsView("management");
                setViewingAssetId(null);
              }}
              onEdit={(asset) => {
                setEditingAssetId(asset.id);
                setAssetsView("edit");
              }}
            />
          )}

          {/* Assets Page with Registration Form */}
          {currentPage === "Assets" && assetsView === "add" && (
            <AssetRegistration
              onSuccess={() => {
                setAssetsView("management");
              }}
              onCancel={() => {
                setAssetsView("management");
              }}
            />
          )}

          {/* Assets Page with Edit Form */}
          {currentPage === "Assets" && assetsView === "edit" && (
            <EditAsset
              assetId={editingAssetId}
              onSave={(updatedAsset) => {
                console.log("Asset updated successfully:", updatedAsset);
                setAssetsView("management");
                setEditingAssetId(null);
              }}
              onCancel={() => {
                setAssetsView("management");
                setEditingAssetId(null);
              }}
            />
          )}

          {/* Tags Page */}
          {currentPage === "Tags" && <TagManagement />}

          {/* Users Page */}
          {currentPage === "Users" && <UserManagement />}

          {/* Reports Page */}
          {currentPage === "Reports" && <Reports />}

          {/* Settings Page */}
          {currentPage === "Settings" && <Settings />}
        </div>
      </main>
    </div>
  );
}

/**
 * App component (Root Component)
 *
 * Entry point of the application that provides global context.
 * Wraps AppContent with EquipmentProvider and NotificationProvider to make
 * equipment/asset data and notifications available to all child components.
 *
 * Context Provided:
 * - Equipment/Asset data (items array)
 * - Recent activity logs
 * - Functions to add, update, delete equipment
 * - Notifications system with real-time updates
 * - Helper functions like getById for retrieving specific items
 *
 * @returns {JSX.Element} Application with context provider wrappers
 */
function App() {
  return (
    <EquipmentProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </EquipmentProvider>
  );
}

export default App;
