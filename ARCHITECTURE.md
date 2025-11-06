# Project Architecture Guide

This document explains how the ASE Tag Software is organized and how all the pieces work together.

---

## 📁 Project Structure

```
src/
├── context/
│   └── EquipmentContext.jsx    # Global state management for equipment data
│
├── components/
│   ├── AssetForm.jsx           # Form to add new equipment
│   ├── EquipmentTable.jsx      # Table displaying all equipment
│   ├── QRCodeGenerator.jsx     # Generates QR codes (64x64)
│   └── QRScanner.jsx           # Scans QR codes (camera or upload)
│
├── App.jsx                     # Main app component (wires everything)
├── App.css                     # Styling
└── main.jsx                    # Entry point
```

---

## 🔄 Data Flow

### 1. Adding Equipment
```
User fills form → AssetForm component → addEquipment() function → 
EquipmentContext (stores data) → EquipmentTable updates automatically
```

### 2. Displaying Equipment
```
EquipmentContext (holds all equipment) → EquipmentTable reads the data →
Displays rows with QR codes → Each QR code contains equipment ID
```

### 3. Scanning QR Codes
```
User scans QR → QRScanner decodes it → onDetected callback →
App.jsx displays the scanned data
```

---

## 🧩 Component Details

### EquipmentContext (src/context/EquipmentContext.jsx)
**Purpose:** Central data store for all equipment

**What it provides:**
- `items` - Array of all equipment objects
- `addEquipment(data)` - Function to add new equipment
- `getById(id)` - Function to find equipment by ID

**How to use it:**
```jsx
import { useContext } from 'react';
import { EquipmentContext } from './context/EquipmentContext';

function MyComponent() {
  const { items, addEquipment, getById } = useContext(EquipmentContext);
  // Now you can use these!
}
```

---

### AssetForm (src/components/AssetForm.jsx)
**Purpose:** Form for adding new equipment

**Features:**
- Input fields: name (required), model, serial, location, notes
- Generates unique ID automatically when equipment is created
- Resets form after submission
- Shows alert with created equipment ID

**Data it creates:**
```javascript
{
  id: "1699276800000-a3b5c7d",  // Auto-generated
  name: "Laptop",
  model: "Dell XPS 15",
  serial: "SN12345",
  location: "Office 201",
  notes: "Assigned to IT department"
}
```

---

### QRCodeGenerator (src/components/QRCodeGenerator.jsx)
**Purpose:** Generates QR codes from any string

**Props:**
- `value` (string) - The data to encode in the QR code
- `size` (number) - Width/height in pixels (default: 64)

**Usage example:**
```jsx
<QRCodeGenerator value="12345-abc" size={64} />
<QRCodeGenerator value="https://example.com" size={128} />
```

**How it works:**
- Uses `react-qr-code` library to generate SVG QR codes
- Can encode any text: IDs, URLs, phone numbers, etc.
- Scalable (SVG) so quality is perfect at any size

---

### EquipmentTable (src/components/EquipmentTable.jsx)
**Purpose:** Display all equipment in a table with QR codes

**Props:**
- `onSelect(id)` - Callback when user clicks "View" button

**Features:**
- Shows all equipment details in rows
- Each row has a 64x64 QR code containing the equipment ID
- "View" button to select equipment
- Shows "No equipment yet" if table is empty

**What the QR codes contain:**
- Just the equipment ID (e.g., "1699276800000-a3b5c7d")
- When scanned, you can look up this ID to get full equipment details

---

### QRScanner (src/components/QRScanner.jsx)
**Purpose:** Scan QR codes using camera or uploaded images

**Props:**
- `onDetected(data)` - Callback when QR code is found

**Features:**
- **Camera mode:** Live video scanning (press "Start camera scan")
- **Upload mode:** Select an image file containing a QR code
- Uses `jsQR` library to decode QR codes
- Automatically stops camera after finding a code

**How the camera scanning works:**
1. Requests camera access from browser
2. Displays live video feed
3. Continuously captures video frames
4. Analyzes each frame looking for QR codes
5. When found, decodes it and calls `onDetected`
6. Stops camera automatically

**Browser permissions:**
- First time: Browser will ask for camera permission
- User must allow camera access for scanning to work

---

### App (src/App.jsx)
**Purpose:** Main component that brings everything together

**Layout:**
```
┌─────────────────────────┬─────────────────────────┐
│ LEFT COLUMN             │ RIGHT COLUMN            │
├─────────────────────────┼─────────────────────────┤
│ Add Asset               │ Equipment Table         │
│ [AssetForm]             │ [EquipmentTable]        │
│                         │                         │
│ Scan QR Code            │ Selected Equipment      │
│ [QRScanner]             │ Shows ID when clicked   │
│ [Scanned data display]  │                         │
└─────────────────────────┴─────────────────────────┘
```

**State management:**
- `selected` - ID of equipment selected in table
- `scanned` - Data from most recently scanned QR code

---

## 🔧 Technologies Used

### Core Framework
- **React 19.1.1** - UI framework
- **Vite 7.1.7** - Build tool and dev server

### QR Code Libraries
- **react-qr-code 2.0.18** - Generates QR codes as SVG
- **jsqr 1.4.0** - Decodes QR codes from images

### Why these libraries?
- `react-qr-code`: Simple, lightweight, produces clean SVGs
- `jsqr`: Pure JavaScript, no dependencies, works in browser

---

## 💡 Common Workflows

### Workflow 1: Add and View Equipment
1. User fills out the asset form
2. Clicks "Add asset" button
3. Equipment appears in the table with a QR code
4. User can click "View" to select it

### Workflow 2: Generate QR Labels
1. Add equipment using the form
2. Equipment appears in table with QR code
3. Right-click QR code and "Save Image As..."
4. Print the QR code label
5. Attach label to physical equipment

### Workflow 3: Scan Equipment
1. Click "Start camera scan" (or upload QR image)
2. Point camera at equipment's QR label
3. App scans and displays the equipment ID
4. You can now look up that ID in the table
5. Click "View" to see more details

---

## 🚀 Extending the Project

### Add Full Equipment Details View
Currently, clicking "View" only shows the ID. To show all details:

```jsx
// In App.jsx, import the context
import { useContext } from 'react';
import { EquipmentContext } from './context/EquipmentContext';

function App() {
  const { getById } = useContext(EquipmentContext);
  const [selected, setSelected] = useState(null);
  
  // Get full equipment details
  const selectedEquipment = selected ? getById(selected) : null;
  
  return (
    // ... in the right column ...
    {selectedEquipment && (
      <div>
        <h3>Equipment Details</h3>
        <p><strong>Name:</strong> {selectedEquipment.name}</p>
        <p><strong>Model:</strong> {selectedEquipment.model}</p>
        <p><strong>Serial:</strong> {selectedEquipment.serial}</p>
        <p><strong>Location:</strong> {selectedEquipment.location}</p>
        <p><strong>Notes:</strong> {selectedEquipment.notes}</p>
      </div>
    )}
  );
}
```

### Save Data to Local Storage
```jsx
// In EquipmentContext.jsx
import { useEffect } from 'react';

export function EquipmentProvider({ children }) {
  // Load from localStorage on startup
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('equipment');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('equipment', JSON.stringify(items));
  }, [items]);
  
  // ... rest of the code
}
```

### Add Delete Function
```jsx
// In EquipmentContext.jsx
function deleteEquipment(id) {
  setItems((prev) => prev.filter((item) => item.id !== id));
}

// In EquipmentTable.jsx
<button onClick={() => deleteEquipment(it.id)}>Delete</button>
```

---

## 🐛 Troubleshooting

### Camera not working
- Check browser permissions (camera must be allowed)
- Try using Chrome or Edge (best camera support)
- On mobile: Use HTTPS (camera requires secure connection)

### QR codes not scanning
- Ensure good lighting
- Hold camera steady
- Try uploading a clear photo instead
- Make sure QR code is not too small or blurry

### Equipment not appearing in table
- Check the browser console for errors
- Verify the form was submitted (should see alert)
- Make sure EquipmentProvider is wrapping the app

---

## 📚 Learning Resources

Want to understand the code better? Learn about:

- **React Context:** https://react.dev/learn/passing-data-deeply-with-context
- **React Hooks (useState, useEffect):** https://react.dev/reference/react
- **QR Codes:** https://en.wikipedia.org/wiki/QR_code
- **Canvas API:** https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- **MediaDevices API (camera):** https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices

---

**Questions?** Read the inline comments in each file - they explain every function and important code block!
