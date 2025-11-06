/**
 * EquipmentTable.jsx
 *
 * Displays all equipment/assets in a table format with QR codes.
 * Each row shows:
 * - A 64x64 QR code containing the equipment's unique ID
 * - All equipment details (name, model, serial, location, notes)
 * - A "View" button to select that equipment
 *
 * This component reads from EquipmentContext to get the list of all equipment.
 *
 * Props:
 * @param {Function} onSelect - Callback function called when user clicks "View" button
 *                              Receives the equipment ID as parameter
 *
 * Example usage:
 * <EquipmentTable onSelect={(id) => console.log('Selected:', id)} />
 */

import React, { useContext } from "react";
import { EquipmentContext } from "../context/EquipmentContext";
import QRCodeGenerator from "./QRCodeGenerator";

export default function EquipmentTable({ onSelect }) {
  // Get the list of all equipment items from context
  const { items } = useContext(EquipmentContext);

  return (
    <div style={{ overflowX: "auto" }}>
      {" "}
      {/* Allow horizontal scroll on small screens */}
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        {/* Table header row */}
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: 8 }}>QR</th>
            <th style={{ textAlign: "left", padding: 8 }}>Name</th>
            <th style={{ textAlign: "left", padding: 8 }}>Model</th>
            <th style={{ textAlign: "left", padding: 8 }}>Serial</th>
            <th style={{ textAlign: "left", padding: 8 }}>Location</th>
            <th style={{ textAlign: "left", padding: 8 }}>Notes</th>
            <th style={{ textAlign: "left", padding: 8 }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {/* Show a message if no equipment has been added yet */}
          {items.length === 0 && (
            <tr>
              <td colSpan={7} style={{ padding: 8 }}>
                No equipment yet
              </td>
            </tr>
          )}

          {/* Loop through all equipment items and create a row for each */}
          {items.map((it) => (
            <tr key={it.id} style={{ borderTop: "1px solid #eee" }}>
              {/* QR Code column - generates a QR code containing the equipment ID */}
              <td style={{ padding: 8 }}>
                <QRCodeGenerator
                  value={it.id} // The QR code will contain this equipment's unique ID
                  size={64} // 64x64 pixels as specified in requirements
                />
              </td>

              {/* Equipment details columns */}
              <td style={{ padding: 8 }}>{it.name}</td>
              <td style={{ padding: 8 }}>{it.model}</td>
              <td style={{ padding: 8 }}>{it.serial}</td>
              <td style={{ padding: 8 }}>{it.location}</td>
              <td style={{ padding: 8 }}>{it.notes}</td>

              {/* Actions column with View button */}
              <td style={{ padding: 8 }}>
                <button onClick={() => onSelect && onSelect(it.id)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
