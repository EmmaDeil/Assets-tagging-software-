# ASE Tag Software (Assets Tagging & Management)

A comprehensive React-based application for managing equipment/assets with QR code generation, advanced filtering, reporting, and analytics capabilities.

## 🚀 Features

### Core Functionality
- **Dashboard**: Real-time overview with statistics, charts, and recent activity
- **Asset Management**: Complete CRUD operations for equipment inventory
- **Advanced Search**: Multi-criteria filtering with AND/OR logical operators
- **Tag Management**: Organize assets with custom tags (Location, Department, Type, Status)
- **User Management**: Role-based access control (Administrator, Manager, User)
- **Reports & Analytics**: Interactive charts with Chart.js and data export (PDF/CSV)
- **Settings**: Application configuration, API key management, and system settings
- **QR Code Integration**: Generate and display QR codes for asset identification

### Advanced Features
- Real-time search and filtering across all assets
- Interactive data visualizations (Line and Doughnut charts)
- PDF report generation with jsPDF
- CSV data export functionality
- Responsive design for mobile, tablet, and desktop
- Dark mode support (ready for implementation)
- Activity logging and audit trail

## 📁 Project Structure

```
src/
├── components/               # All UI components
│   ├── AdvancedSearch.jsx   → Slide-out panel with multi-criteria filtering
│   ├── AssetDetails.jsx     → Detailed view of a single asset
│   ├── AssetRegistration.jsx → Form for registering new assets
│   ├── AssetsManagement.jsx → Main asset table with search and filters
│   ├── Dashboard.jsx        → Overview dashboard with statistics
│   ├── EditAsset.jsx        → Form for editing existing assets
│   ├── Header.jsx           → Navigation header with search
│   ├── Reports.jsx          → Analytics dashboard with charts
│   ├── Settings.jsx         → Application settings and configuration
│   ├── TagManagement.jsx    → Tag CRUD interface
│   └── UserManagement.jsx   → User administration interface
├── context/
│   └── EquipmentContext.jsx → Global state management for assets
├── App.jsx                  → Main application router
├── main.jsx                 → Application entry point
└── index.css                → Global styles (Tailwind CSS)
```

## 🛠️ Tech Stack

### Core Dependencies
- **React 19.1.1** - UI framework
- **Vite 7.1.7** - Build tool and dev server
- **Tailwind CSS 4.1.16** - Utility-first CSS framework

### Visualization & Export
- **Chart.js 4.5.1** - Interactive charts
- **react-chartjs-2 5.3.1** - React wrapper for Chart.js
- **jsPDF 3.0.3** - PDF generation
- **jspdf-autotable 5.0.2** - PDF table generation

### QR Code
- **react-qr-code 2.0.18** - QR code rendering

### Backend
- **Express 4.21.2** - Node.js web framework
- **Mongoose 8.9.3** - MongoDB object modeling
- **CORS 2.8.5** - Cross-origin resource sharing
- **dotenv 16.4.5** - Environment variable management

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes
- **Concurrently 9.1.2** - Run multiple commands simultaneously

## 🚦 Quick Start

### Prerequisites
- Node.js 16+ installed
- MongoDB installed locally OR MongoDB Atlas account

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Windows: Download from mongodb.com
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB service
# Windows: net start MongoDB
# macOS/Linux: sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Get your connection string
- Update `.env` file with your URI

### 3. Configure Environment Variables

Create a `.env` file in the root directory:
```env
# For Local MongoDB
MONGODB_URI=mongodb://localhost:27017/ase-tag-software

# For MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ase-tag-software

PORT=5000
NODE_ENV=development
```

### 4. Start the Application
```bash
# Start both backend and frontend concurrently
npm run dev
```

This will start:
- **Backend Server**: http://localhost:5000
- **Frontend App**: http://localhost:5173

Alternatively, run them separately:
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

### 5. Build for Production
```bash
npm run build
```
Production build outputs to `dist/` directory

### 6. Preview Production Build
```bash
npm run preview
```

## 🔌 API Endpoints

Base URL: `http://localhost:5000/api`

### Equipment/Assets
- `GET /equipment` - Get all assets
- `GET /equipment/:id` - Get asset by ID
- `POST /equipment` - Create new asset
- `PUT /equipment/:id` - Update asset
- `DELETE /equipment/:id` - Delete asset

### Activities
- `GET /activities` - Get all activities (max 50)
- `GET /activities/asset/:assetId` - Get activities for specific asset
- `POST /activities` - Create activity log

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Tags
- `GET /tags` - Get all tags
- `GET /tags/category/:category` - Get tags by category
- `POST /tags` - Create new tag
- `PUT /tags/:id` - Update tag
- `DELETE /tags/:id` - Delete tag

## 📖 Application Pages

### 1. Dashboard
- Overview statistics (Total Assets, In Use, In Maintenance, Retired)
- Visual pie chart showing asset distribution
- Recent activity feed
- Quick action cards

### 2. Assets Management
- Sortable, filterable asset table
- Advanced search with slide-out panel
- Quick actions (View, Edit, Delete)
- Bulk operations support
- Add new asset button
- Export functionality (CSV)

### 3. Asset Registration
- Comprehensive registration form
- Real-time QR code preview
- File upload support
- Camera integration
- Success confirmation with QR display

### 4. Asset Details
- Complete asset information
- Activity timeline
- QR code display (150x150px)
- Edit and print options
- Status indicators

### 5. Asset Editing
- Pre-populated form with existing asset data
- Update asset name, category, location, and dates
- File attachment management (upload, delete)
- Drag-and-drop file upload support
- Periodic maintenance schedule configuration
- Real-time change tracking with unsaved changes warning
- Breadcrumb navigation
- Responsive layout with form on left, file uploader on right

### 6. Tag Management
- Create, edit, delete tags
- Four tag categories: Location, Department, Asset Type, Status
- Color coding system
- Search and filter functionality
- Pagination support

### 7. User Management
- User CRUD operations
- Role assignment (Administrator, Manager, User)
- Status management (Active/Inactive)
- Dropdown action menus

### 8. Reports & Analytics
- Interactive line chart (Asset Status over Time)
- Doughnut chart (Category Distribution)
- Custom date range picker
- Filter by category and status
- PDF report generation
- CSV data export

### 9. Settings
- General settings (App name, Timezone, Maintenance mode)
- API key management
- Permissions configuration (Coming soon)
- Integrations (Coming soon)
- Branding customization (Coming soon)
- Danger zone for critical operations

## 🔧 Code Quality

### Documentation
- ✅ All components have comprehensive JSDoc comments
- ✅ Function parameters and return types documented
- ✅ State variables explained with @state tags
- ✅ Props documented with @param tags
- ✅ Usage examples provided where helpful

### Code Organization
- ✅ All components in `src/components/` directory
- ✅ Context providers in `src/context/` directory
- ✅ Clean separation of concerns
- ✅ Reusable component architecture
- ✅ Consistent naming conventions

### Dependency Management
- ✅ Only actively used packages installed
- ✅ No unused dependencies
- ✅ Regular version updates
- ✅ Zero vulnerabilities

### Unused Code Cleanup
- ✅ Removed legacy components: AssetForm, EquipmentTable, QRScanner, DashboardExample, QRCodeGenerator, QRCodePrint
- ✅ Removed unused jsqr package
- ✅ No unused imports or variables
- ✅ All code actively utilized

## 🎨 Styling

This project uses **Tailwind CSS v4** for all styling:

- **Modern design**: Clean, professional UI with consistent spacing
- **Responsive layout**: Mobile-first approach, adapts to all screen sizes
- **Accessible colors**: Proper contrast ratios for readability
- **Interactive elements**: Smooth transitions and hover states
- **Form styling**: Beautiful inputs with focus states

### Color Scheme:
- **Primary (Blue #4A90E2)**: Buttons, links, active states
- **Success (Green)**: Positive actions, confirmations
- **Warning (Yellow)**: Caution messages, maintenance status
- **Error (Red)**: Error messages, danger zone
- **Neutral (Gray)**: Backgrounds, text, borders

## 🗄️ State Management

Uses **React Context API** for global state:

### EquipmentContext
- Stores all asset/equipment data
- Provides CRUD functions
- Manages activity log
- Accessible from any component

### Context Functions:
- `addEquipment(data)` - Add new asset
- `getById(id)` - Retrieve asset by ID
- `addActivity(activity)` - Log new activity

## 📊 Data Structure

### Asset Object:
```javascript
{
  id: "1699276800000-a3b5c7d",  // Unique identifier
  name: "Dell XPS 15",           // Asset name
  model: "XPS-15-9520",          // Model number
  serial: "ABC123",              // Serial number
  category: "Laptops",           // Asset category
  location: "Office A",          // Physical location
  status: "In Use",              // Current status
  purchaseDate: "2024-01-15",    // Acquisition date
  cost: 1200,                    // Purchase cost
  description: "...",            // Detailed notes
  maintenancePeriod: "Annual"    // Maintenance schedule
}
```

## 🚀 Future Enhancements

- [ ] Backend API integration
- [ ] Database persistence (LocalStorage/IndexedDB interim)
- [ ] User authentication and sessions
- [ ] Email notifications
- [ ] Barcode support
- [ ] Mobile app (React Native)
- [ ] Scheduled maintenance reminders
- [ ] Asset depreciation calculations
- [ ] Multi-language support

## 📝 Development Notes

### ESLint Configuration
- Uses `eslint.config.js` for modern flat config
- React Hooks rules enabled
- React Refresh plugin for HMR

### Known Warnings
- Fast Refresh warning in EquipmentContext (cosmetic only, doesn't affect functionality)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper documentation
4. Test thoroughly
5. Submit a pull request

## 📄 License

See LICENSE file for details.

---

**Built with ❤️ using React, Vite, and Tailwind CSS**
2. A print preview modal will appear with the label
