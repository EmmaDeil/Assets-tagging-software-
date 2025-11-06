# ASE Tag Software (Assets Tagging with QR Codes)

A React-based application for managing equipment/assets with QR code generation and scanning capabilities.

## Features

- **Asset Form**: Add new equipment entries with fields for name, model, serial, location, and notes.
- **QR Code Generation**: Automatically generates a 64x64 QR code for each asset (encodes the unique asset ID).
- **Equipment Table**: Displays all assets in a table with their QR codes and details.
- **QR Scanner**: Scan QR codes from your device's camera or by uploading an image; displays the full equipment details including name, model, serial, location, and notes.
- **Print Labels**: Print QR code labels for each equipment with a dedicated print button. Labels include the QR code (200x200) and equipment details, optimized for physical attachment to devices.

## Project structure

```
src/
├─ components/
│  ├─ AssetForm.jsx         → Form for adding equipment
│  ├─ EquipmentTable.jsx    → Table listing all equipment + QR codes
│  ├─ QRCodeGenerator.jsx   → Reusable QR code renderer (64x64 default)
│  ├─ QRScanner.jsx         → Camera & image QR scanner component
│  └─ QRCodePrint.jsx       → Print-optimized QR label component
├─ context/
│  └─ EquipmentContext.jsx  → React Context provider for equipment data
└─ App.jsx                  → Main application entry (wires all components)
```

All components are **reusable**:

- `<AssetForm />` — pass custom `onSubmit` if you want different behavior.
- `<QRCodeGenerator value="..." size={64} />` — renders any string as a QR code.
- `<EquipmentTable onSelect={handler} />` — pass a callback to handle row selection.
- `<QRScanner onDetected={handler} />` — triggers callback when a QR code is scanned.
- `<QRCodePrint equipment={item} onClose={handler} />` — displays print-optimized label.
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
- **tailwindcss**: ^4.x (utility-first CSS framework for styling)
- **@tailwindcss/postcss**: Latest (PostCSS plugin for Tailwind v4)

## Styling

This project uses **Tailwind CSS v4** for all styling:

- **Modern design**: Clean, professional UI with rounded corners, shadows, and smooth transitions
- **Responsive layout**: Adapts to different screen sizes (mobile, tablet, desktop)
- **Accessible colors**: Uses Tailwind's color palette with proper contrast ratios
- **Interactive elements**: Hover states, focus rings, and button animations
- **Form styling**: Beautiful input fields with focus states and proper spacing

### Color scheme:
- Primary: Blue (buttons, links, accents)
- Success: Green (successful scans, confirmations)
- Error: Red (error messages, warnings)
- Neutral: Gray scale (backgrounds, text, borders)

All inline styles have been replaced with Tailwind utility classes for better maintainability and consistency.

## How it works

1. **Add an asset**: Fill in the form and submit. The app creates a unique ID for the equipment and stores it in React Context.
2. **View table**: The equipment table lists all assets, showing a QR code (containing the asset ID) for each row.
3. **Print labels**: Click the "🖨️ Print" button next to any equipment to open a print dialog with a large QR code (200x200) and equipment details. The label is optimized for printing and can be attached to physical devices.
4. **Scan a QR code**: Use the scanner to read a QR code (either from your camera or by uploading an image). The app will look up the equipment and display all details (name, model, serial, location, notes). If the equipment is not found, a warning message is shown.
5. **View details**: Click "View" in the table row to see the selected asset ID.

## Printing QR Code Labels

The application includes a built-in print feature for creating physical labels:

### How to print:
1. Click the **"🖨️ Print"** button in any equipment row
2. A print preview modal will appear with the label
3. The print dialog opens automatically
4. Choose your printer or "Print to PDF" to save digitally
5. Print the label and attach it to your equipment

### Label contents:
- Large 200x200 QR code (only the QR code is printed)
- Equipment details are shown in the preview but NOT printed
- Clean, minimal label perfect for sticking on devices

### Print tips:
- **Only the QR code prints** - equipment details are shown in preview only
- Use **adhesive label paper** for easy attachment to devices
- Common sizes: 2"x2" or 3"x3" labels work well for 200x200 QR codes
- For durability, use **waterproof/laminated labels**
- Test scan the printed QR code before applying to equipment
- Save as PDF for digital backup of all QR codes

## Next steps & customization

- Add a details panel that looks up the asset by the scanned ID and displays all fields.
- Persist data (local storage, or a backend API).
- Add ability to edit or delete assets.
- Change QR size or styling by passing a `size` prop to `<QRCodeGenerator />`.
- Batch print multiple QR codes at once.
- Export equipment data as CSV or Excel.
- Add equipment categories or tags for better organization.

---

**License**: See LICENSE file (if any).
