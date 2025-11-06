/**
 * App.jsx
 *
 * This is the main application component that ties everything together.
 * It provides a two-column layout:
 *
 * LEFT COLUMN:
 * - AssetForm: Add new equipment
 * - QRScanner: Scan QR codes using camera or file upload
 * - Displays full equipment details when a QR code is scanned
 *
 * RIGHT COLUMN:
 * - EquipmentTable: Shows all equipment with their QR codes and print buttons
 * - Displays details of selected equipment
 *
 * How data flows:
 * 1. User fills out AssetForm → equipment saved to EquipmentContext
 * 2. EquipmentTable reads from EquipmentContext and displays all equipment
 * 3. Each equipment row shows a QR code containing its unique ID
 * 4. User can scan a QR code → full equipment details are displayed (name, model, serial, location, notes, maintenance period)
 * 5. User clicks "View" on a table row → equipment ID is shown
 * 6. User clicks "Print" on a table row → print dialog opens with QR label
 */

import "./App.css";
import React, { useState, useContext } from "react";
import {
  EquipmentProvider,
  EquipmentContext,
} from "./context/EquipmentContext";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import AssetForm from "./components/AssetForm";
import EquipmentTable from "./components/EquipmentTable";
import QRScanner from "./components/QRScanner";

/**
 * AppContent component
 * Separate component to access EquipmentContext (must be inside EquipmentProvider)
 */
function AppContent() {
  // Access equipment data from context
  const { items, activities, getById } = useContext(EquipmentContext);

  // State: Current page being displayed (Dashboard or Assets)
  const [currentPage, setCurrentPage] = useState("Dashboard");

  // State: Stores the ID of the currently selected equipment (from table "View" button)
  const [selected, setSelected] = useState(null);

  // State: Stores the data decoded from a scanned QR code
  const [scanned, setScanned] = useState(null);

  // Get the full equipment object for the scanned QR code
  const scannedEquipment = scanned ? getById(scanned) : null;

  /**
   * Handle navigation between pages
   * @param {string} page - Page name to navigate to
   */
  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  /**
   * Handle search functionality
   * @param {string} query - Search query string
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

          {/* Assets Page */}
          {currentPage === "Assets" && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Asset Management
              </h1>

              {/* Two-column grid layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT COLUMN: Input and scanning */}
                <section className="space-y-6">
                  {/* Section 1: Add new equipment */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Add Asset
                    </h2>
                    <AssetForm />
                  </div>

                  {/* Section 2: Scan QR codes */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Scan QR Code
                    </h2>
                    <QRScanner
                      onDetected={(data) => setScanned(data)} // Save scanned data to state
                    />

                    {/* Show the scanned QR data if available */}
                    {scanned && (
                      <div className="mt-4">
                        {scannedEquipment ? (
                          // Equipment found - show full details
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <strong className="text-green-900 font-semibold text-lg">
                                ✓ Equipment Found
                              </strong>
                              <button
                                onClick={() => setScanned(null)}
                                className="text-green-700 hover:text-green-900 text-sm underline"
                              >
                                Clear
                              </button>
                            </div>

                            <div className="space-y-2">
                              <div className="border-b border-green-200 pb-2">
                                <p className="text-xs text-green-600 font-medium uppercase">
                                  Name
                                </p>
                                <p className="text-green-900 font-semibold text-lg">
                                  {scannedEquipment.name}
                                </p>
                              </div>

                              {scannedEquipment.model && (
                                <div className="border-b border-green-200 pb-2">
                                  <p className="text-xs text-green-600 font-medium uppercase">
                                    Model
                                  </p>
                                  <p className="text-green-900">
                                    {scannedEquipment.model}
                                  </p>
                                </div>
                              )}

                              {scannedEquipment.serial && (
                                <div className="border-b border-green-200 pb-2">
                                  <p className="text-xs text-green-600 font-medium uppercase">
                                    Serial Number
                                  </p>
                                  <p className="text-green-900">
                                    {scannedEquipment.serial}
                                  </p>
                                </div>
                              )}

                              {scannedEquipment.location && (
                                <div className="border-b border-green-200 pb-2">
                                  <p className="text-xs text-green-600 font-medium uppercase">
                                    Location
                                  </p>
                                  <p className="text-green-900">
                                    {scannedEquipment.location}
                                  </p>
                                </div>
                              )}

                              {scannedEquipment.notes && (
                                <div className="border-b border-green-200 pb-2">
                                  <p className="text-xs text-green-600 font-medium uppercase">
                                    Notes
                                  </p>
                                  <p className="text-green-900">
                                    {scannedEquipment.notes}
                                  </p>
                                </div>
                              )}

                              {scannedEquipment.maintenancePeriod && (
                                <div className="border-b border-green-200 pb-2">
                                  <p className="text-xs text-green-600 font-medium uppercase">
                                    Maintenance Period
                                  </p>
                                  <p className="text-green-900">
                                    {scannedEquipment.maintenancePeriod}
                                  </p>
                                </div>
                              )}

                              <div className="pt-2">
                                <p className="text-xs text-green-600 font-medium uppercase">
                                  Equipment ID
                                </p>
                                <p className="text-green-800 font-mono text-xs break-all">
                                  {scannedEquipment.id}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Equipment not found - show error
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-yellow-900 font-semibold">
                                ⚠️ Equipment Not Found
                              </strong>
                              <button
                                onClick={() => setScanned(null)}
                                className="text-yellow-700 hover:text-yellow-900 text-sm underline"
                              >
                                Clear
                              </button>
                            </div>
                            <p className="text-sm text-yellow-800 mb-2">
                              The scanned QR code does not match any equipment
                              in the system.
                            </p>
                            <p className="text-xs text-yellow-700 font-mono break-all bg-yellow-100 p-2 rounded">
                              Scanned ID: {scanned}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                {/* RIGHT COLUMN: View equipment */}
                <section className="space-y-6">
                  {/* Section 3: List all equipment in a table */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Equipment List
                    </h2>
                    <EquipmentTable
                      onSelect={(id) => setSelected(id)} // Save selected equipment ID to state
                    />
                  </div>

                  {/* Show details of the selected equipment */}
                  {selected && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Selected Equipment
                      </h3>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 font-mono text-sm break-all">
                        {selected}
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {/* Reports Page */}
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

          {/* Settings Page */}
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

/**
 * App component
 * Wraps AppContent with EquipmentProvider so context is available
 */
function App() {
  return (
    <EquipmentProvider>
      <AppContent />
    </EquipmentProvider>
  );
}

export default App;
