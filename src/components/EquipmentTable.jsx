/**
 * EquipmentTable.jsx
 *
 * Displays all equipment/assets in a table format with QR codes.
 * Each row shows:
 * - A 64x64 QR code containing the equipment's unique ID
 * - All equipment details (name, model, serial, location, notes, maintenance period)
 * - Action buttons: "View" to select equipment and "Print" to print QR label
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

import React, { useContext, useState } from "react";
import { EquipmentContext } from "../context/EquipmentContext";
import QRCodeGenerator from "./QRCodeGenerator";
import QRCodePrint from "./QRCodePrint";

export default function EquipmentTable({ onSelect }) {
  // Get the list of all equipment items from context
  const { items } = useContext(EquipmentContext);

  // State: Track which equipment is being printed (null when not printing)
  const [printingEquipment, setPrintingEquipment] = useState(null);

  return (
    <>
      <div className="overflow-x-auto">
        {" "}
        {/* Allow horizontal scroll on small screens */}
        <table className="w-full border-collapse bg-white rounded-lg shadow">
          {/* Table header row */}
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-700">QR</th>
              <th className="text-left p-3 font-semibold text-gray-700">
                Name
              </th>
              <th className="text-left p-3 font-semibold text-gray-700">
                Model
              </th>
              <th className="text-left p-3 font-semibold text-gray-700">
                Serial
              </th>
              <th className="text-left p-3 font-semibold text-gray-700">
                Location
              </th>
              <th className="text-left p-3 font-semibold text-gray-700">
                Notes
              </th>
              <th className="text-left p-3 font-semibold text-gray-700">
                Maintenance Period
              </th>
              <th className="text-left p-3 font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {/* Show a message if no equipment has been added yet */}
            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  No equipment yet
                </td>
              </tr>
            )}

            {/* Loop through all equipment items and create a row for each */}
            {items.map((it) => (
              <tr
                key={it.id}
                className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {/* QR Code column - generates a QR code containing the equipment ID */}
                <td className="p-3">
                  <QRCodeGenerator
                    value={it.id} // The QR code will contain this equipment's unique ID
                    size={64} // 64x64 pixels as specified in requirements
                  />
                </td>

                {/* Equipment details columns */}
                <td className="p-3 text-gray-900">{it.name}</td>
                <td className="p-3 text-gray-600">{it.model}</td>
                <td className="p-3 text-gray-600">{it.serial}</td>
                <td className="p-3 text-gray-600">{it.location}</td>
                <td className="p-3 text-gray-600">{it.notes}</td>
                <td className="p-3 text-gray-600">{it.maintenancePeriod}</td>

                {/* Actions column with View and Print buttons */}
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelect && onSelect(it.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setPrintingEquipment(it)}
                      className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-colors"
                      title="Print QR code label"
                    >
                      🖨️ Print
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Print modal - shown when user clicks Print button */}
      {printingEquipment && (
        <QRCodePrint
          equipment={printingEquipment}
          onClose={() => setPrintingEquipment(null)}
        />
      )}
    </>
  );
}
