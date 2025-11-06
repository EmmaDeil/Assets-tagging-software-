/**
 * App.jsx
 *
 * This is the main application component that ties everything together.
 * It provides a two-column layout:
 *
 * LEFT COLUMN:
 * - AssetForm: Add new equipment
 * - QRScanner: Scan QR codes using camera or file upload
 * - Displays scanned QR data when a code is detected
 *
 * RIGHT COLUMN:
 * - EquipmentTable: Shows all equipment with their QR codes
 * - Displays details of selected equipment
 *
 * How data flows:
 * 1. User fills out AssetForm → equipment saved to EquipmentContext
 * 2. EquipmentTable reads from EquipmentContext and displays all equipment
 * 3. Each equipment row shows a QR code containing its unique ID
 * 4. User can scan a QR code → scanned data is displayed
 * 5. User clicks "View" on a table row → equipment ID is shown
 */

import "./App.css";
import React, { useState } from "react";
import { EquipmentProvider } from "./context/EquipmentContext";
import AssetForm from "./components/AssetForm";
import EquipmentTable from "./components/EquipmentTable";
import QRScanner from "./components/QRScanner";

function App() {
  // State: Stores the ID of the currently selected equipment (from table "View" button)
  const [selected, setSelected] = useState(null);

  // State: Stores the data decoded from a scanned QR code
  const [scanned, setScanned] = useState(null);

  return (
    // Wrap the entire app in EquipmentProvider so all components can access equipment data
    <EquipmentProvider>
      {/* Two-column grid layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr", // Two equal-width columns
          gap: 24, // Space between columns
          padding: 24, // Padding around the entire grid
        }}
      >
        {/* LEFT COLUMN: Input and scanning */}
        <section>
          {/* Section 1: Add new equipment */}
          <h2>Add asset</h2>
          <AssetForm />

          {/* Section 2: Scan QR codes */}
          <h2 style={{ marginTop: 24 }}>Scan QR (camera or upload)</h2>
          <QRScanner
            onDetected={(data) => setScanned(data)} // Save scanned data to state
          />

          {/* Show the scanned QR data if available */}
          {scanned && (
            <div style={{ marginTop: 8 }}>
              <strong>Scanned QR data:</strong>
              <pre style={{ whiteSpace: "pre-wrap" }}>{String(scanned)}</pre>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: View equipment */}
        <section>
          {/* Section 3: List all equipment in a table */}
          <h2>Equipment</h2>
          <EquipmentTable
            onSelect={(id) => setSelected(id)} // Save selected equipment ID to state
          />

          {/* Show details of the selected equipment */}
          {selected && (
            <div style={{ marginTop: 12 }}>
              <h3>Selected equipment id</h3>
              <div>{selected}</div>
              {/* 
                Note: You could expand this to show full equipment details
                by using the getById function from EquipmentContext
              */}
            </div>
          )}
        </section>
      </div>
    </EquipmentProvider>
  );
}

export default App;
