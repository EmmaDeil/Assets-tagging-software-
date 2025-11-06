/**
 * QRCodePrint.jsx
 *
 * A component for printing QR codes.
 * This creates a print-friendly layout optimized for printing QR labels
 * that can be attached to physical equipment.
 *
 * Features:
 * - Large QR code for easy scanning (200x200)
 * - Print-optimized layout (removes unnecessary UI elements)
 * - Clean, minimal design - only QR code is printed
 *
 * Props:
 * @param {Object} equipment - The equipment object to print
 * @param {Function} onClose - Callback to close the print view
 */

import React, { useEffect } from "react";
import QRCodeGenerator from "./QRCodeGenerator";

export default function QRCodePrint({ equipment, onClose }) {
  /**
   * Automatically trigger print dialog when component mounts
   * and close the view after printing or canceling
   */
  useEffect(() => {
    // Small delay to ensure the component is fully rendered
    const timer = setTimeout(() => {
      window.print();
    }, 100);

    // Listen for when the print dialog is closed
    const handleAfterPrint = () => {
      onClose && onClose();
    };

    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [onClose]);

  if (!equipment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:bg-white print:relative print:inset-auto">
      {/* Print preview container - visible on screen, optimized for print */}
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 print:shadow-none print:max-w-full">
        {/* Header - hidden when printing */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center print:hidden">
          <h3 className="text-lg font-semibold text-gray-900">
            Print QR Code Label
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Printable content */}
        <div className="p-8 print:p-0">
          {/* QR Code Label - This is what gets printed */}
          <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg print:border-none print:p-0">
            {/* QR Code - Large for easy scanning - ONLY THIS PRINTS */}
            <div className="flex justify-center">
              <QRCodeGenerator value={equipment.id} size={200} />
            </div>

            {/* Equipment Details - SHOWN ON SCREEN ONLY, HIDDEN WHEN PRINTING */}
            <div className="space-y-2 text-center mt-4 print:hidden">
              <h4 className="text-xl font-bold text-gray-900 wrap-break-word">
                {equipment.name}
              </h4>

              {equipment.model && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Model:</span> {equipment.model}
                </p>
              )}

              {equipment.serial && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Serial:</span>{" "}
                  {equipment.serial}
                </p>
              )}

              {equipment.location && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Location:</span>{" "}
                  {equipment.location}
                </p>
              )}

              {/* Equipment ID in small text */}
              <p className="text-xs text-gray-400 font-mono pt-2 break-all">
                ID: {equipment.id}
              </p>
            </div>
          </div>

          {/* Instructions - hidden when printing */}
          <div className="mt-4 text-sm text-gray-600 text-center print:hidden">
            <p>Only the QR code will be printed.</p>
            <p className="text-xs mt-1">
              Tip: Use "Print to PDF" to save QR codes digitally.
            </p>
          </div>
        </div>

        {/* Footer buttons - hidden when printing */}
        <div className="p-4 border-t border-gray-200 flex gap-2 justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Print Again
          </button>
        </div>
      </div>
    </div>
  );
}
