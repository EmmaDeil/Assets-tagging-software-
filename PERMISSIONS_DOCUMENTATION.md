# User Permissions Management System

## Overview
The Asset Management System now includes a comprehensive, granular permissions system that allows administrators to control exactly what each user can do in the system. This document outlines all available permissions and how to manage them.

## Accessing Permissions Management
1. Navigate to **Settings** page
2. Click on **Permissions** in the sidebar
3. Select a user from the table
4. Click **"Manage Permissions"** to open the permissions modal

## Permission Categories

### 1. Dashboard
Controls access to the main dashboard and statistics.

| Permission | Key | Description | Default |
|-----------|-----|-------------|---------|
| View Dashboard | `viewDashboard` | Access to main dashboard and statistics | ✅ Enabled |

### 2. Assets & Equipment
Controls all asset-related operations.

| Permission | Key | Description | Default |
|-----------|-----|-------------|---------|
| View Assets | `viewAssets` | View asset list and details | ✅ Enabled |
| Create Assets | `createAssets` | Register new assets | ✅ Enabled |
| Edit Assets | `editAssets` | Modify asset information | ✅ Enabled |
| Delete Assets | `deleteAssets` | Permanently delete assets | ❌ Disabled |
| Export Assets | `exportAssets` | Export asset data to CSV/PDF | ✅ Enabled |
| Upload Documents | `uploadDocuments` | Upload files to assets | ✅ Enabled |
| Download Documents | `downloadDocuments` | Download asset documents | ✅ Enabled |
| Delete Documents | `deleteDocuments` | Remove uploaded documents | ❌ Disabled |

### 3. Notes
Controls note management on assets.

| Permission | Key | Description | Default |
|-----------|-----|-------------|---------|
| Create Notes | `createNotes` | Add notes to assets | ✅ Enabled |
| Edit Notes | `editNotes` | Modify existing notes | ✅ Enabled |
| Delete Notes | `deleteNotes` | Remove notes from assets | ❌ Disabled |

### 4. Tags
Controls tag management system.

| Permission | Key | Description | Default |
|-----------|-----|-------------|---------|
| View Tags | `viewTags` | View tag management page | ✅ Enabled |
| Create Tags | `createTags` | Create new tags | ❌ Disabled |
| Edit Tags | `editTags` | Modify existing tags | ❌ Disabled |
| Delete Tags | `deleteTags` | Remove tags from system | ❌ Disabled |

### 5. Maintenance
Controls maintenance scheduling and tracking.

| Permission | Key | Description | Default |
|-----------|-----|-------------|---------|
| View Maintenance | `viewMaintenance` | View maintenance records | ✅ Enabled |
| Create Maintenance | `createMaintenance` | Schedule maintenance | ✅ Enabled |
| Edit Maintenance | `editMaintenance` | Modify maintenance records | ✅ Enabled |
| Delete Maintenance | `deleteMaintenance` | Remove maintenance records | ❌ Disabled |

### 6. User Management
Controls user administration features.

| Permission | Key | Description | Default |
|-----------|-----|-------------|---------|
| View Users | `viewUsers` | View user list | ❌ Disabled |
| Create Users | `createUsers` | Add new users to system | ❌ Disabled |
| Edit Users | `editUsers` | Modify user information | ❌ Disabled |
| Delete Users | `deleteUsers` | Remove users from system | ❌ Disabled |
| Manage Permissions | `managePermissions` | Control user access rights | ❌ Disabled |

### 7. Reports & Analytics
Controls reporting features.

| Permission | Key | Description | Default |
|-----------|-----|-------------|---------|
| View Reports | `viewReports` | Access reports page | ✅ Enabled |
| Export Reports | `exportReports` | Download report data | ✅ Enabled |

### 8. Activities
Controls activity log access.

| Permission | Key | Description | Default |
|-----------|-----|-------------|---------|
| View Activities | `viewActivities` | View activity logs | ✅ Enabled |
| Create Activities | `createActivities` | Log new activities | ✅ Enabled |

### 9. Notifications
Controls notification features.

| Permission | Key | Description | Default |
|-----------|-----|-------------|---------|
| View Notifications | `viewNotifications` | Receive notifications | ✅ Enabled |
| Delete Notifications | `deleteNotifications` | Clear notifications | ✅ Enabled |

### 10. System Settings
Controls access to system configuration.

| Permission | Key | Description | Default |
|-----------|-----|-------------|---------|
| View Settings | `viewSettings` | Access settings page | ❌ Disabled |
| Edit Settings | `editSettings` | Modify system settings | ❌ Disabled |
| Regenerate API Key | `regenerateApiKey` | Generate new API keys | ❌ Disabled |
| Delete All Assets | `deleteAllAssets` | ⚠️ Dangerous: Delete all system data | ❌ Disabled |

## API Endpoints

### Get User Permissions
```http
GET /api/users/:id/permissions
```

**Response:**
```json
{
  "userId": "60d5f483f1b2c72b8c8e4f1a",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "User",
  "permissions": {
    "viewDashboard": true,
    "viewAssets": true,
    "createAssets": true,
    "editAssets": true,
    "deleteAssets": false,
    // ... all other permissions
  }
}
```

### Update User Permissions
```http
PUT /api/users/:id/permissions
```

**Request Body:**
```json
{
  "permissions": {
    "viewDashboard": true,
    "createAssets": false,
    "deleteAssets": false
  }
}
```

**Response:**
```json
{
  "message": "Permissions updated successfully",
  "user": {
    "_id": "60d5f483f1b2c72b8c8e4f1a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User",
    "permissions": {
      // Updated permissions object
    }
  }
}
```

## Permission Management UI Features

### Bulk Actions
- **Enable All in Category**: Quickly grant all permissions in a category
- **Disable All in Category**: Quickly revoke all permissions in a category

### Visual Indicators
- ✅ **Green Toggle**: Permission is enabled
- ⬜ **Gray Toggle**: Permission is disabled
- 🔴 **Red Badge**: Administrator role
- 🔵 **Blue Badge**: Manager role
- ⚪ **Gray Badge**: User role

### Search & Filter
- Search users by name or email
- Filter by user role
- Filter by user status (Active/Inactive)

## Recommended Permission Profiles

### Administrator
**Full System Access**
- ✅ All permissions enabled
- Can manage all users and permissions
- Can modify system settings
- Can perform dangerous operations (with confirmation)

### Manager
**Department Management**
- ✅ View Dashboard
- ✅ Full Asset Management (create, edit, delete)
- ✅ Full Maintenance Management
- ✅ View Reports
- ✅ View Users
- ❌ Cannot delete users or change permissions
- ❌ Cannot modify system settings

### Standard User
**Daily Operations**
- ✅ View Dashboard
- ✅ View and Create Assets
- ✅ Edit assigned assets only
- ✅ Create and Edit Notes
- ✅ View Maintenance
- ❌ Cannot delete anything
- ❌ Cannot manage tags
- ❌ Cannot access user management

### Viewer
**Read-Only Access**
- ✅ View Dashboard
- ✅ View Assets
- ✅ View Reports
- ✅ View Activities
- ❌ Cannot create, edit, or delete anything
- ❌ Cannot access settings or user management

## Best Practices

### 1. Principle of Least Privilege
- Grant users only the permissions they need to perform their job
- Start with minimal permissions and add as needed
- Regularly review and audit user permissions

### 2. Role-Based Assignment
- Define standard roles (Admin, Manager, User, Viewer)
- Use these as templates when adding new users
- Customize permissions only when necessary

### 3. Dangerous Permissions
These permissions should be granted sparingly:
- `deleteAssets` - Permanent data loss
- `deleteUsers` - Can lock out users
- `deleteAllAssets` - **CRITICAL**: Wipes entire database
- `managePermissions` - Can escalate privileges

### 4. Regular Audits
- Review user permissions quarterly
- Remove permissions from inactive users
- Check for privilege creep (users accumulating unnecessary permissions)
- Audit deletion operations and sensitive actions

### 5. Separation of Duties
- Don't grant all permissions to a single user (except primary admin)
- Separate sensitive operations (e.g., create vs. delete)
- Require approval for high-risk operations

## Implementation Notes

### Database Schema
Permissions are stored in the `User` model:
```javascript
permissions: {
  viewDashboard: { type: Boolean, default: true },
  createAssets: { type: Boolean, default: true },
  deleteAssets: { type: Boolean, default: false },
  // ... all other permissions
}
```

### Frontend Integration
Permissions are checked before rendering UI elements:
```javascript
// Example: Only show delete button if user has permission
{user.permissions?.deleteAssets && (
  <button onClick={handleDelete}>Delete</button>
)}
```

### API Protection
Backend routes should verify permissions:
```javascript
// Example: Protect delete endpoint
router.delete('/:id', async (req, res) => {
  // TODO: Verify user has deleteAssets permission
  // before allowing deletion
});
```

## Future Enhancements

### Planned Features
1. **Permission Templates**: Save and apply common permission sets
2. **Permission History**: Track when permissions are changed
3. **Temporary Permissions**: Grant time-limited access
4. **Permission Groups**: Create groups with shared permissions
5. **Approval Workflows**: Require approval for permission changes
6. **Audit Logs**: Detailed logging of permission usage
7. **Role Inheritance**: Hierarchical role structure
8. **Custom Permissions**: Allow creation of custom permission types

### Security Improvements
1. **Two-Factor Authentication**: For sensitive operations
2. **Session Timeout**: For users with elevated permissions
3. **IP Whitelisting**: Restrict admin access by location
4. **Permission Decay**: Auto-revoke unused permissions
5. **Emergency Access**: Break-glass procedures for emergencies

## Support

### Common Issues

**Q: User can't see a feature after permissions granted**
A: User needs to log out and log back in for permissions to take effect.

**Q: How do I bulk update permissions for multiple users?**
A: Currently not supported. Planned for future release.

**Q: Can I export permission settings?**
A: Not currently available. Planned for future release.

**Q: What happens if I accidentally revoke my own admin permissions?**
A: Contact another administrator to restore your permissions, or access the database directly.

### Contact
For issues or questions about permissions management:
- Check the system logs for permission-related errors
- Review the user's permission object in the database
- Contact system administrator for access issues

---

**Last Updated**: November 15, 2025  
**Version**: 1.0.0  
**Component**: PermissionsManagement.jsx
