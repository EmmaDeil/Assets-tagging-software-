# Notification System Documentation

## Overview
Complete notification system with backend API, frontend context, and real-time updates.

## Features Implemented

### ✅ Backend (Server)
1. **Notification Model** (`server/models/Notification.js`)
   - MongoDB schema with fields: type, title, message, assetId, userId, priority, read, actionUrl
   - Timestamps for createdAt and updatedAt
   - Indexed for fast queries

2. **Notification Routes** (`server/routes/notifications.js`)
   - `GET /api/notifications` - Get all notifications
   - `GET /api/notifications/unread` - Get unread count
   - `POST /api/notifications` - Create notification
   - `PATCH /api/notifications/:id/read` - Mark as read
   - `PATCH /api/notifications/read-all` - Mark all as read
   - `DELETE /api/notifications/:id` - Delete specific
   - `DELETE /api/notifications` - Clear all

3. **Notification Helper** (`server/utils/notificationHelper.js`)
   - `createMaintenanceNotification()` - Maintenance due alerts
   - `createStatusChangeNotification()` - Status change alerts
   - `createAssignmentNotification()` - Assignment alerts
   - `createNewAssetNotification()` - New asset alerts
   - `createAlertNotification()` - General alerts

4. **Auto-Notification Triggers** (`server/routes/equipment.js`)
   - New asset registered → Creates "New Asset" notification
   - Status changed → Creates "Status Change" notification
   - Asset assigned → Creates "Assignment" notification

### ✅ Frontend (Client)
1. **Notification Context** (`src/context/NotificationContext.jsx`)
   - Global state management
   - Real-time polling (every 30 seconds)
   - Functions: addNotification, markAsRead, markAllAsRead, deleteNotification
   - Unread count tracking
   - Helper functions for creating typed notifications

2. **Header Component** (`src/components/Header.jsx`)
   - Bell icon with unread badge (shows count)
   - Dropdown notification panel
   - Color-coded notification types
   - Click to mark as read
   - Delete individual notifications
   - "Mark all as read" button
   - Responsive design with dark mode

3. **App Integration** (`src/App.jsx`)
   - NotificationProvider wraps entire app
   - Available to all components via useContext

## Notification Types

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| `maintenance` | 🔧 build | Yellow | Maintenance due/overdue |
| `status_change` | ↔️ swap_horiz | Blue | Asset status updated |
| `assignment` | 👤 person_add | Green | Asset assigned to user |
| `alert` | ⚠️ warning | Red | Critical alerts |
| `info` | ℹ️ info | Gray | General information |

## Priority Levels
- **high**: Red badge, urgent action needed
- **medium**: Standard display
- **low**: Low contrast, informational only

## Usage Examples

### Frontend - Create Notification
```javascript
import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

function MyComponent() {
  const { addNotification, notifyStatusChange } = useContext(NotificationContext);

  // Method 1: Using helper function
  notifyStatusChange(asset, "In Use", "Under Maintenance");

  // Method 2: Manual creation
  addNotification({
    type: "alert",
    title: "Critical Alert",
    message: "Server backup required",
    priority: "high"
  });
}
```

### Backend - Create Notification
```javascript
const { createAlertNotification } = require('../utils/notificationHelper');

// In any route
await createAlertNotification(
  "Low Stock Alert",
  "Only 2 laptops remaining in inventory",
  null // optional assetId
);
```

### Check Unread Count
```javascript
const { unreadCount } = useContext(NotificationContext);

// Display in UI
{unreadCount > 0 && <Badge>{unreadCount}</Badge>}
```

## Automatic Notifications

### When are notifications created?

1. **Asset Registration**
   - Trigger: New asset added via POST /api/equipment
   - Notification: "New Asset Registered"
   - Type: info, Priority: low

2. **Status Change**
   - Trigger: Asset status updated via PUT /api/equipment/:id
   - Notification: "Asset Status Changed"
   - Type: status_change, Priority: medium
   - Message: "Asset X changed from Y to Z"

3. **Assignment Change**
   - Trigger: assignedTo field updated via PUT /api/equipment/:id
   - Notification: "Asset Assigned"
   - Type: assignment, Priority: medium
   - Message: "Asset X assigned to Person Y"

## Testing the System

### Test Backend API
```bash
# Create a test notification
curl -X POST http://localhost:5000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type": "alert",
    "title": "Test Notification",
    "message": "This is a test",
    "priority": "high"
  }'

# Get all notifications
curl http://localhost:5000/api/notifications

# Mark as read
curl -X PATCH http://localhost:5000/api/notifications/<id>/read
```

### Test Frontend
1. Start the app
2. Look for bell icon in header (top right)
3. Register a new asset → Check for notification
4. Change asset status → Check for notification
5. Click bell icon → See dropdown
6. Click notification → Marks as read
7. Click X → Deletes notification

## Real-Time Updates
- Notifications automatically refresh every 30 seconds
- Unread count updates in real-time
- Badge disappears when all notifications are read

## Customization

### Add New Notification Type
1. Update Notification model enum in `server/models/Notification.js`
2. Add color/icon mapping in `Header.jsx` notification dropdown
3. Create helper function in `notificationHelper.js`

### Change Polling Interval
```javascript
// In NotificationContext.jsx, line ~165
const interval = setInterval(fetchNotifications, 30000); // Change 30000 to desired ms
```

### Add Sound Alert
```javascript
// In NotificationContext.jsx, add to fetchNotifications:
if (newUnreadCount > unreadCount) {
  new Audio('/notification-sound.mp3').play();
}
```

## API Response Examples

### GET /api/notifications
```json
[
  {
    "_id": "6548a3b2c1d2e3f4a5b6c7d8",
    "type": "maintenance",
    "title": "Maintenance Due",
    "message": "Asset Laptop Pro requires maintenance",
    "assetId": "ASE-COMP-HQ-123456",
    "priority": "high",
    "read": false,
    "createdAt": "2025-11-07T10:30:00.000Z",
    "updatedAt": "2025-11-07T10:30:00.000Z"
  }
]
```

## Performance Considerations
- Notifications limited to 100 most recent
- Indexed queries for fast retrieval
- Efficient MongoDB queries with sorting
- Minimal re-renders using React Context

## Future Enhancements
- [ ] WebSocket for real-time push notifications
- [ ] User-specific notifications (filter by userId)
- [ ] Email notifications for high-priority alerts
- [ ] Notification preferences/settings
- [ ] Archive old notifications
- [ ] Push notifications for mobile
- [ ] Notification categories/filters
- [ ] Snooze/remind me later feature

## Troubleshooting

### Notifications not showing
1. Check if server is running: `http://localhost:5000/api/notifications`
2. Check MongoDB connection
3. Verify NotificationProvider wraps App
4. Check browser console for errors

### Unread count not updating
- Check polling interval is active
- Verify `markAsRead()` API call succeeds
- Check state updates in React DevTools

### Notifications not auto-creating
- Verify notification helper is imported in routes
- Check server logs for errors
- Test notification creation manually via API
