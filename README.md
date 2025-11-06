# ASE Tag Software (Assets Tagging with QR Codes)

A React-based application for managing equipment/assets with QR code generation and scanning capabilities.

## Features

- **Asset Form**: Add new equipment entries with fields for name, model, serial, location, and notes.
- **QR Code Generation**: Automatically generates a 64x64 QR code for each asset (encodes the unique asset ID).
- **Equipment Table**: Displays all assets in a table with their QR codes and details.
- **QR Scanner**: Scan QR codes from your device's camera or by uploading an image; displays the scanned data (the asset ID).

## Project structure

```
src/
├─ components/
│  ├─ AssetForm.jsx         → Form for adding equipment
│  ├─ EquipmentTable.jsx    → Table listing all equipment + QR codes
│  ├─ QRCodeGenerator.jsx   → Reusable QR code renderer (64x64 default)
│  └─ QRScanner.jsx         → Camera & image QR scanner component
├─ context/
│  └─ EquipmentContext.jsx  → React Context provider for equipment data
└─ App.jsx                  → Main application entry (wires all components)
```

All components are **reusable**:

- `<AssetForm />` — pass custom `onSubmit` if you want different behavior.
- `<QRCodeGenerator value="..." size={64} />` — renders any string as a QR code.
- `<EquipmentTable onSelect={handler} />` — pass a callback to handle row selection.
- `<QRScanner onDetected={handler} />` — triggers callback when a QR code is scanned.

## Quick start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```
   By default, Vite serves the app at **http://localhost:5173**.

3. Build for production:
   ```bash
   npm run build
   ```

## Dependencies

- **react**: ^19.1.1
- **react-dom**: ^19.1.1
- **react-qr-code**: ^2.0.18 (renders SVG-based QR codes)
- **jsqr**: ^1.4.0 (decodes QR codes from images & video frames)

## How it works

1. **Add an asset**: Fill in the form and submit. The app creates a unique ID for the equipment and stores it in React Context.
2. **View table**: The equipment table lists all assets, showing a QR code (containing the asset ID) for each row.
3. **Scan a QR code**: Use the scanner to read a QR code (either from your camera or by uploading an image). The scanned data (asset ID) displays below the scanner.
4. **View details**: Click "View" in the table row to see the selected asset ID. (You can extend this to show a full detail view.)

## Next steps & customization

- Add a details panel that looks up the asset by the scanned ID and displays all fields.
- Persist data (local storage, or a backend API).
- Add ability to edit or delete assets.
- Change QR size or styling by passing a `size` prop to `<QRCodeGenerator />`.
- Integrate printing or exporting QR codes as images.

---

**License**: See LICENSE file (if any).
