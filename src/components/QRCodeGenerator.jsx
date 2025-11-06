/**
 * QRCodeGenerator.jsx
 *
 * A reusable component that generates and displays QR codes.
 * This component uses the `react-qr-code` library to render QR codes as SVG images.
 *
 * Use cases:
 * - Generate QR codes for equipment IDs (so they can be scanned later)
 * - Generate QR codes for URLs, text, or any string data
 * - Customize the size of the QR code
 *
 * Props:
 * @param {string} value - The data to encode in the QR code (e.g., equipment ID, URL)
 * @param {number} size - The width and height of the QR code in pixels (default: 64)
 *
 * Example usage:
 * <QRCodeGenerator value="12345-abc" size={128} />
 */

import React from "react";
import QRCode from "react-qr-code";

export default function QRCodeGenerator({ value, size = 64 }) {
  // Note: react-qr-code renders an SVG element
  // We wrap it in a div to control the exact size and layout
  return (
    <div
      className="inline-block"
      style={{
        width: size, // Set exact width (dynamic value from prop)
        height: size, // Set exact height (dynamic value from prop)
      }}
    >
      {/* 
        QRCode component from react-qr-code library
        - Converts any string value into a QR code
        - Renders as an SVG (scalable vector graphic)
        - The QR code will contain the exact string we pass in
      */}
      <QRCode
        value={String(value || "")} // Convert to string and handle null/undefined
        size={size} // Size of the QR code in pixels
      />
    </div>
  );
}
