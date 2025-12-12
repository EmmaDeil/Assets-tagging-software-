# ASE Tag Software (Assets Tagging & Management)

A comprehensive full-stack application for managing equipment/assets with QR code generation, advanced filtering, reporting, role-based permissions, and analytics capabilities. Built with React, Node.js, Express, and MongoDB.
This README provides an overview of the project, setup instructions, features, and technical details.

## Use Cases
- IT Asset Management
- Office Equipment Tracking
- Maintenance Scheduling
- Inventory Control
- Library Asset Management
- Laboratory Equipment Tracking
- Facility Management
- Medical Equipment Management


## 🚀 Features

### Core Functionality
- **Dashboard**: Real-time overview with statistics, charts, and recent activity
- **Asset Management**: Complete CRUD operations for equipment inventory with file attachments
- **Advanced Search**: Multi-criteria filtering with AND/OR logical operators
- **Tag Management**: Organize assets with custom tags (Location, Department, Type, Status)
- **User Management**: Complete user administration with granular permission control
- **Permissions System**: Fine-grained access control for all features
- **Reports & Analytics**: Interactive charts with Chart.js and data export (PDF/CSV)
- **Maintenance Tracking**: Schedule and track equipment maintenance
- **Activity Logging**: Complete audit trail of all system actions
- **Settings**: Application configuration, API key management, and system settings
- **QR Code Integration**: Generate and display QR codes for asset identification
- **Authentication**: Secure JWT-based authentication with password hashing

### Advanced Features
- **Granular Permissions**: Administrators can control access to every feature per user
- **Role-Based + Permission-Based Access Control**: Combines roles (Admin, Manager, User) with individual permissions
- **Real-time Notifications**: Activity-based notification system with read/unread states
- **Dark Mode Support**: Full dark theme throughout the application
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **File Management**: Upload, view, and delete asset documents and images
- **Activity Logging**: Comprehensive audit trail of all user actions
- **Data Export**: CSV and PDF export for assets and reports
- **Smart Search**: Search across assets, tags, users with live results
- **Advanced Filtering**: Multi-criteria filters with logical operators

## 📁 Project Structure

```
src/
├── components/                  # All UI components
│   ├── AdvancedSearch.jsx      → Slide-out panel with multi-criteria filtering
│   ├── AssetDetails.jsx        → Detailed view of a single asset
│   ├── AssetRegistration.jsx   → Form for registering new assets
│   ├── AssetsManagement.jsx    → Main asset table with search and filters
│   ├── Dashboard.jsx           → Overview dashboard with statistics
│   ├── EditAsset.jsx           → Form for editing existing assets
│   ├── Header.jsx              → Navigation header with notifications
│   ├── MaintenanceCalendar.jsx → Calendar view for maintenance schedules
│   ├── MaintenanceRecords.jsx  → Maintenance history and tracking
│   ├── PermissionsManagement.jsx → Granular user permission control
│   ├── Reports.jsx             → Analytics dashboard with charts
│   ├── Settings.jsx            → Application settings and configuration
│   ├── TagManagement.jsx       → Tag CRUD interface
│   └── UserManagement.jsx      → User administration interface
├── context/
│   ├── AuthContext.jsx         → Authentication and permission management
│   ├── EquipmentContext.jsx    → Global state management for assets
│   └── NotificationContext.jsx → Notification system management
├── config/
│   └── api.js                  → API base URL configuration
├── App.jsx                     → Main application router
├── main.jsx                    → Application entry point
└── index.css                   → Global styles (Tailwind CSS)

server/
├── models/                     # MongoDB schemas
│   ├── Equipment.js           → Asset/equipment model
│   ├── User.js                → User model with permissions
│   ├── Tag.js                 → Tag model
│   ├── Activity.js            → Activity log model
│   ├── Notification.js        → Notification model
│   └── Settings.js            → Application settings model
├── routes/                    # API routes
│   ├── auth.js               → Authentication endpoints
│   ├── equipment.js          → Asset management endpoints
│   ├── users.js              → User management endpoints
│   ├── tags.js               → Tag management endpoints
│   ├── activities.js         → Activity logging endpoints
│   ├── notifications.js      → Notification endpoints
│   └── settings.js           → Settings endpoints
├── middleware/
│   └── auth.js               → JWT authentication middleware
├── config/
│   └── db.js                 → MongoDB connection configuration
└── server.js                 → Express server entry point
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
- **bcryptjs 2.4.3** - Password hashing
- **jsonwebtoken 9.0.2** - JWT authentication
- **CORS 2.8.5** - Cross-origin resource sharing
- **dotenv 16.4.5** - Environment variable management
- **multer 1.4.5-lts.1** - File upload handling

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

**Frontend** - Create `.env` in root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

**Backend** - Create `server/.env`:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/ase-tag-software
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/ase-tag-software

# Server
PORT=5000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# CORS - Frontend URLs
CLIENT_URL=http://localhost:5173
CLIENT_URL_PROD=https://your-production-domain.com
```

### 4. Seed the Database (Optional but Recommended)

Run the seeding script to populate initial data:
```bash
cd server
node seed.js
```

This creates:
- **Admin User**: admin@asetagsoftware.com / Admin@123
- **Manager User**: manager@asetagsoftware.com / Manager@123
- **Regular User**: user@asetagsoftware.com / User@123
- **10 Departments**
- **20 Locations**
- **10 Asset Types**
- **4 Status Tags**

### 5. Start the Application
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

### 6. Build for Production
```bash
npm run build
```
Production build outputs to `dist/` directory

### 7. Preview Production Build
```bash
npm run preview
```

## 🔐 CORS & Environment Configuration

This application features **automatic environment detection** - it knows whether you're in development or production and adjusts accordingly!

### ✨ Automatic Setup

**Development Mode (`npm run dev`):**
- ✅ Frontend automatically connects to `http://localhost:5000/api`
- ✅ Backend automatically allows all localhost ports
- ✅ **Zero configuration needed!**

**Production Mode (`npm run build`):**
- Backend only allows your deployed frontend URL
- Frontend connects to your production backend API
- Secure CORS configuration

### 📝 Quick Configuration

**Development (Ready to go!):**
```bash
# Just run these commands - already configured!
npm run dev              # Frontend
cd server && npm run dev # Backend
```

**Production (Update these URLs):**

1. **Backend** (`server/.env`):
```env
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
MONGODB_URI=mongodb+srv://your-atlas-connection
```

2. **Frontend** (`.env.production` - already exists):
```env
VITE_API_URL=https://your-backend-domain.com/api
```

**📚 Detailed Guide:** [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Complete setup instructions  
**🔒 CORS Details:** [CORS_CONFIGURATION.md](./CORS_CONFIGURATION.md) - CORS deep dive & troubleshooting

## 🔌 API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login (returns JWT token)
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current authenticated user

### Equipment/Assets
- `GET /equipment` - Get all assets
- `GET /equipment/:id` - Get asset by ID
- `POST /equipment` - Create new asset
- `PUT /equipment/:id` - Update asset
- `DELETE /equipment/:id` - Delete asset
- `POST /equipment/:id/upload` - Upload files to asset
- `DELETE /equipment/:id/files/:filename` - Delete asset file

### Activities
- `GET /activities` - Get all activities (max 50)
- `GET /activities/asset/:assetId` - Get activities for specific asset
- `POST /activities` - Create activity log

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `GET /users/:id/permissions` - Get user permissions
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `PUT /users/:id/permissions` - Update user permissions
- `DELETE /users/:id` - Delete user

### Tags
- `GET /tags` - Get all tags
- `GET /tags/category/:category` - Get tags by category
- `POST /tags` - Create new tag
- `PUT /tags/:id` - Update tag
- `DELETE /tags/:id` - Delete tag

### Notifications
- `GET /notifications` - Get user notifications
- `GET /notifications/unread-count` - Get unread count
- `PUT /notifications/:id/read` - Mark notification as read
- `PUT /notifications/mark-all-read` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

### Settings
- `GET /settings` - Get application settings
- `PUT /settings` - Update settings
- `POST /settings/regenerate-api-key` - Regenerate API key
- `DELETE /settings/delete-all-assets` - Delete all assets (danger zone)
- `GET /settings/stats` - Get system statistics

## 📖 Application Pages

### 1. Authentication
- **Login Page**: Secure login with JWT authentication
- **Signup Page**: User registration (admin approval required)
- **Password Validation**: Strong password requirements

### 2. Dashboard
- Overview statistics (Total Assets, In Use, In Maintenance, Available, Retired)
- Visual pie chart showing asset distribution
- Recent activity feed with user avatars
- Quick action cards
- Asset status breakdown

### 3. Assets Management
- Sortable, filterable asset table
- Advanced search with slide-out panel
- Quick actions (View, Edit, Delete)
- Permission-based button visibility
- Add new asset button
- Export functionality (CSV)
- Pagination support
- File attachment management

### 4. Asset Registration
- Comprehensive registration form
- Real-time QR code preview
- File upload support (drag & drop or click)
- Camera integration
- Department, location, and asset type selection
- Success confirmation with QR display
- Activity logging

### 5. Asset Details
- Complete asset information
- Activity timeline
- QR code display (150x150px)
- Edit and print options
- Status indicators
- File attachments with download
- Related maintenance records

### 6. Asset Editing
- Pre-populated form with existing asset data
- Update asset name, category, location, and dates
- File attachment management (upload, delete)
- Drag-and-drop file upload support
- Periodic maintenance schedule configuration
- Real-time change tracking with unsaved changes warning
- Breadcrumb navigation
- Responsive layout with form on left, file uploader on right
- Permission-based edit access

### 7. Tag Management
- Create, edit, delete tags
- Four tag categories: Location, Department, Asset Type, Status
- Color coding system
- Search and filter functionality
- Pagination support
- Permission-based CRUD operations
- Activity logging for tag changes

### 8. User Management
- User CRUD operations
- Role assignment (Administrator, Manager, User)
- Status management (Active/Inactive)
- Department assignment
- Permission management integration
- Dropdown action menus
- Search and filter users
- Role-based badge colors
- Last activity tracking

### 9. Permissions Management
- Granular permission control per user
- Category-based permissions:
  - Dashboard, Assets, Notes, Tags
  - Maintenance, Users, Reports
  - Activities, Notifications, Settings
- Enable/disable individual permissions
- Enable/disable all in category
- Real-time permission updates
- Administrator always has full access

### 10. Maintenance Tracking
- **Maintenance Records**: List view of all maintenance activities
- **Maintenance Calendar**: Calendar view for scheduled maintenance
- Create, edit, delete maintenance records
- Maintenance status tracking
- Cost tracking per maintenance
- Notes and documentation
- Permission-based access

### 11. Reports & Analytics
- Interactive line chart (Asset Status over Time)
- Doughnut chart (Category Distribution)
- Custom date range picker
- Filter by category and status
- PDF report generation
- CSV data export
- Permission-based access

### 12. Notifications
- Real-time notification center
- Unread badge counter
- Notification types: Maintenance, Status Change, Assignment, Alerts
- Mark as read/unread
- Delete notifications
- Timestamp tracking
- Activity-based notifications

### 13. Settings (Administrator Only)
- **General Settings**: App name, timezone, maintenance mode
- **API Key Management**: Generate and regenerate API keys
- **Permissions Management**: Control user access rights
- **System Statistics**: Total assets, users, tags, activities
- **Danger Zone**: Delete all assets (with confirmation)
- Permission-based access control
- Dark mode ready

## 🔐 Permission System

This application features a comprehensive **permission-based access control system** that works alongside roles.

### How It Works

1. **Administrator Role**: Always has full access to all features (hardcoded)
2. **Manager & User Roles**: Access controlled by individual permissions set in Settings → Permissions

### Available Permissions

| Category | Permissions |
|----------|-------------|
| **Dashboard** | viewDashboard |
| **Assets** | viewAssets, createAssets, editAssets, deleteAssets, exportAssets, uploadDocuments, downloadDocuments, deleteDocuments |
| **Notes** | createNotes, editNotes, deleteNotes |
| **Tags** | viewTags, createTags, editTags, deleteTags |
| **Maintenance** | viewMaintenance, createMaintenance, editMaintenance, deleteMaintenance |
| **Users** | viewUsers, createUsers, editUsers, deleteUsers, managePermissions |
| **Reports** | viewReports, exportReports |
| **Activities** | viewActivities, createActivities |
| **Notifications** | viewNotifications, deleteNotifications |
| **Settings** | viewSettings, editSettings, regenerateApiKey, deleteAllAssets |

### Managing Permissions

1. Login as Administrator
2. Go to **Settings** → **Permissions**
3. Select a user from the table
4. Toggle individual permissions or enable/disable entire categories
5. Click **Save Changes**

Changes take effect immediately - the user's UI will update to reflect their new permissions.

### Default Permissions by Role

**Administrator**: All permissions enabled (cannot be changed)

**Manager** (default):
- ✅ View: Dashboard, Assets, Tags, Maintenance, Reports, Activities, Notifications
- ✅ Create/Edit: Assets, Maintenance, Tags
- ✅ Export: Assets, Reports
- ❌ Delete: Assets, Users
- ❌ Settings Access

**User** (default):
- ✅ View: Dashboard, Assets, Activities, Notifications
- ✅ Create: Notes
- ❌ Create/Edit/Delete: Assets, Tags, Users
- ❌ Settings Access

Administrators can customize these defaults per user in the Permissions Management interface.

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
- ✅ Clean separation of frontend and backend
- ✅ Modular component architecture

## 🎨 Styling

This project uses **Tailwind CSS v4** for all styling:

- **Modern design**: Clean, professional UI with consistent spacing
- **Responsive layout**: Mobile-first approach, adapts to all screen sizes
- **Dark mode**: Full dark theme support throughout the application
- **Accessible colors**: Proper contrast ratios for readability (WCAG AA compliant)
- **Interactive elements**: Smooth transitions and hover states
- **Form styling**: Beautiful inputs with focus states and validation feedback
- **Consistent spacing**: 4px/8px/12px/16px grid system
- **Typography**: Clear hierarchy with proper font sizes and weights

### Color Scheme:
- **Primary (Blue #3B82F6)**: Buttons, links, active states
- **Success (Green #10B981)**: Positive actions, confirmations
- **Warning (Yellow #F59E0B)**: Caution messages, maintenance status
- **Error (Red #EF4444)**: Error messages, danger zone
- **Neutral (Gray)**: Backgrounds, text, borders
- **Dark Mode**: Gray-900 backgrounds, proper contrast

### Component Patterns:
- **Cards**: Rounded corners, subtle shadows, hover effects
- **Buttons**: Multiple variants (primary, secondary, ghost, danger)
- **Tables**: Striped rows, sortable columns, hover states
- **Modals**: Centered with backdrop blur
- **Forms**: Inline validation, clear error states
- **Badges**: Color-coded status indicators
- **Dropdowns**: Smooth animations, keyboard navigation

## 🗄️ State Management

### React Context API

The application uses **React Context API** for global state management:

#### AuthContext
- Manages user authentication state
- Stores JWT token in localStorage
- Provides login, logout, register functions
- **hasPermission(permission)**: Check if user has specific permission
- **hasRole(...roles)**: Check if user has specific role(s)
- Automatic token refresh and validation
- User profile management

#### EquipmentContext
- Stores all asset/equipment data
- Provides CRUD functions
- Manages activity log
- Real-time updates
- Accessible from any component

#### NotificationContext
- Manages user notifications
- Real-time notification updates
- Unread count tracking
- Mark as read/unread functionality
- Delete notifications
- Activity-based notification creation

### Context Functions

**AuthContext**:
- `login(email, password)` - Authenticate user
- `logout()` - Clear session
- `register(userData)` - Create new account
- `hasPermission(permission)` - Check permission
- `hasRole(...roles)` - Check role
- `updateUser(userData)` - Update user info

**EquipmentContext**:
- `addEquipment(data)` - Add new asset
- `getById(id)` - Retrieve asset by ID
- `addActivity(activity)` - Log new activity

**NotificationContext**:
- `markAsRead(id)` - Mark notification as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification(id)` - Remove notification

## 📊 Data Structure

### User Object:
```javascript
{
  _id: "507f1f77bcf86cd799439011",  // MongoDB ObjectId
  name: "John Doe",                  // Full name
  email: "john@company.com",         // Email (unique)
  role: "Manager",                   // Administrator, Manager, or User
  department: "IT Department",       // Assigned department
  status: "Active",                  // Active or Inactive
  profilePhoto: "https://...",       // Profile picture URL
  permissions: {                     // Granular permissions
    viewDashboard: true,
    createAssets: true,
    editAssets: true,
    deleteAssets: false,
    viewSettings: false,
    // ... all other permissions
  },
  lastLogin: "2024-12-01T10:30:00Z", // Last login timestamp
  createdAt: "2024-01-15T08:00:00Z", // Account creation
  updatedAt: "2024-12-01T10:30:00Z"  // Last update
}
```

### Asset Object:
```javascript
{
  _id: "507f1f77bcf86cd799439011",  // MongoDB ObjectId
  name: "Dell XPS 15",               // Asset name
  model: "XPS-15-9520",              // Model number
  serial: "ABC123XYZ",               // Serial number
  category: "Laptops",               // Asset category/type
  location: "Office A - Floor 3",    // Physical location
  department: "IT Department",       // Assigned department
  status: "In Use",                  // In Use, Available, In Maintenance, Retired
  purchaseDate: "2024-01-15",        // Acquisition date
  cost: 1200,                        // Purchase cost
  description: "High-performance laptop for development", // Notes
  maintenancePeriod: "Annual",       // Maintenance schedule
  assignedTo: "John Doe",            // Current user
  files: [                           // Attached documents
    {
      filename: "invoice.pdf",
      path: "/uploads/...",
      size: 125000,
      uploadedAt: "2024-01-15T..."
    }
  ],
  qrCode: "AST-507f1f77bcf86cd...",  // QR code identifier
  createdAt: "2024-01-15T08:00:00Z", // Creation timestamp
  updatedAt: "2024-12-01T10:30:00Z"  // Last update
}
```

### Tag Object:
```javascript
{
  _id: "507f1f77bcf86cd799439011",
  name: "IT Department",
  category: "Department",            // Location, Department, Asset Type, Status
  color: "#3B82F6",                 // Hex color code
  description: "Information Technology Department",
  createdAt: "2024-01-15T08:00:00Z",
  updatedAt: "2024-01-15T08:00:00Z"
}
```

### Activity Object:
```javascript
{
  _id: "507f1f77bcf86cd799439011",
  type: "asset_created",            // Activity type
  description: "Asset registered",   // Human-readable description
  assetId: "507f1f77bcf86cd...",    // Related asset
  assetName: "Dell XPS 15",         // Asset name for reference
  userId: "507f1f77bcf86cd...",     // User who performed action
  userName: "John Doe",             // User name for reference
  metadata: {                       // Additional context
    previousStatus: "Available",
    newStatus: "In Use"
  },
  createdAt: "2024-12-01T10:30:00Z"
}
```

### Notification Object:
```javascript
{
  _id: "507f1f77bcf86cd799439011",
  userId: "507f1f77bcf86cd...",     // Recipient user
  type: "maintenance",               // maintenance, status_change, assignment, alert
  title: "Maintenance Due",          // Notification title
  message: "Asset XPS-15 requires maintenance", // Description
  assetId: "507f1f77bcf86cd...",    // Related asset (optional)
  read: false,                       // Read status
  createdAt: "2024-12-01T10:30:00Z",
  readAt: null                       // When marked as read
}
```

## 🚀 Future Enhancements

- [ ] Multi-tenancy support
- [ ] Advanced reporting with custom report builder
- [ ] Email notifications for maintenance reminders
- [ ] Barcode scanner support
- [ ] Mobile app (React Native)
- [ ] Asset depreciation calculations
- [ ] Multi-language support (i18n)
- [ ] Two-factor authentication (2FA)
- [ ] Asset warranty tracking
- [ ] Bulk import/export via Excel
- [ ] Advanced audit logs with diff tracking
- [ ] Real-time collaboration features
- [ ] Integration with external APIs (ServiceNow, Jira, etc.)
- [ ] Custom dashboard widgets
- [ ] Asset lifecycle management
- [ ] Scheduled reports via email
- [ ] Asset reservation system
- [ ] Mobile QR scanning app

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd server
npm test

# Run E2E tests
npm run test:e2e
```

## 📱 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variable: `VITE_API_URL=https://your-backend-api.com/api`
4. Deploy

### Backend (Railway/Render/Heroku)
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables (see `.env` section)
4. Deploy

### Database (MongoDB Atlas)
1. Create cluster at mongodb.com/atlas
2. Whitelist your backend server IP
3. Update `MONGODB_URI` in backend `.env`

## 🔍 Troubleshooting

### CORS Errors
- Ensure `CLIENT_URL` in backend `.env` matches your frontend URL
- Check `VITE_API_URL` in frontend `.env` points to backend
- See [CORS_CONFIGURATION.md](./CORS_CONFIGURATION.md) for details

### Authentication Issues
- Verify `JWT_SECRET` is set in backend `.env`
- Check token expiration (default 30 days)
- Clear localStorage and login again

### Database Connection
- Verify MongoDB is running (local) or accessible (Atlas)
- Check `MONGODB_URI` format and credentials
- Whitelist IP in MongoDB Atlas Network Access

### Permission Problems
- Administrator role always has full access
- Check user permissions in Settings → Permissions
- Verify `hasPermission()` calls match permission keys

## 📚 Additional Documentation

- [Environment Setup Guide](./ENVIRONMENT_SETUP.md) - Detailed setup instructions
- [CORS Configuration](./CORS_CONFIGURATION.md) - CORS troubleshooting
- [API Documentation](./API_DOCS.md) - Complete API reference (coming soon)
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment (coming soon)

## 📝 Development Notes

### Project Structure
- **Frontend**: React 19 with Vite for fast development
- **Backend**: Express REST API with MongoDB
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Storage**: Local filesystem with multer (can be upgraded to S3/CloudStorage)
- **Real-time Updates**: Context API for state synchronization

### ESLint Configuration
## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes with proper documentation
4. Test thoroughly (unit tests, integration tests)
5. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

### Coding Standards
- Follow existing code style and patterns
- Add JSDoc comments to all functions
- Write meaningful commit messages
- Update README if adding new features
- Test on multiple screen sizes
- Ensure no console errors or warnings

## 📧 Support

For issues, questions, or contributions:
- **Issues**: [GitHub Issues](https://github.com/yourusername/ase-tag-software/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ase-tag-software/discussions)
- **Email**: support@asetagsoftware.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS approach
- Chart.js for powerful data visualization
- MongoDB for flexible database solution
- All contributors and users of this project

---

**Built with ❤️ using React, Node.js, Express, MongoDB, and Tailwind CSS**

**Version**: 2.0.0  
**Last Updated**: December 2024  
**Status**: Production Ready ✅
## 🛡️ Security Best Practices

### Implemented
✅ Password hashing with bcrypt (10 rounds)  
✅ JWT authentication with configurable expiration  
✅ Protected API routes with auth middleware  
✅ Permission validation on backend  
✅ CORS configuration  
✅ Environment variable management  
✅ MongoDB injection prevention  
✅ Input validation on forms  

### Recommended for Production
⚠️ Enable HTTPS (SSL/TLS certificates)  
⚠️ Implement rate limiting on API endpoints  
⚠️ Add request validation middleware (express-validator)  
⚠️ Enable helmet.js for security headers  
⚠️ Implement CSRF protection  
⚠️ Add input sanitization  
⚠️ Enable audit logging  
⚠️ Regular security updates  
⚠️ Use environment-specific secrets  
⚠️ Implement 2FA for administrators  

## 👥 User Roles & Permissions

### Administrator
- **Full Access**: Can do everything in the system
- Manage users and permissions
- Access Settings and danger zone
- View all reports and analytics
- Cannot be restricted by permissions

### Manager (Customizable)
- Default permissions for managing day-to-day operations
- Can view and create assets
- Can manage tags and maintenance
- Cannot access Settings by default
- Can be granted specific permissions by Admin

### User (Customizable)
- Limited view-only access by default
- Can view dashboard and assets
- Can create notes
- Cannot create, edit, or delete assets by default
- Permissions fully controlled by Admin

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
