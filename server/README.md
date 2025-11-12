# ASE Tag Software - Backend Server

Backend API server for the ASE Tag Software asset management system.

## 🚀 Quick Start

### Development
```bash
npm install
npm start
```

Server runs on: http://localhost:5000

### Production
```bash
NODE_ENV=production npm start
```

## 📦 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (via Mongoose)
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

## 🔧 Configuration

Create a `.env` file in the server directory:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=your_frontend_url
```

See `.env.example` for reference.

# Terminal 2 - Client  
npm run client
```

The server will run on `http://localhost:5000`
The frontend will run on `http://localhost:5173`

### 4. API Endpoints

- `GET /api/health` - Health check
- `GET /api/equipment` - Get all assets
- `POST /api/equipment` - Create new asset
- `PUT /api/equipment/:id` - Update asset
- `DELETE /api/equipment/:id` - Delete asset
- `GET /api/activities` - Get all activities
- `POST /api/activities` - Create activity log
- `GET /api/users` - Get all users
- `GET /api/tags` - Get all tags

### 5. Database Models

**Equipment/Assets**
- name, id, category, location, status
- model, serial, purchaseDate, cost
- maintenancePeriod, notes, attachedFiles
- Timestamps: createdAt, updatedAt

**Activities**
- assetName, assetId, action, actionType
- user, icon, date, timestamp

**Users**
- name, email, role, status, department
- Timestamps: createdAt, updatedAt

**Tags**
- name, category, color, description
- usageCount, timestamps

## Troubleshooting

### Connection Issues

If you see `ECONNREFUSED` errors:
1. Make sure MongoDB is running
2. Check if port 5000 is available
3. Verify `.env` configuration

### Port Already in Use

If port 5000 or 5173 is busy:
```bash
# Change PORT in .env file
PORT=5001
```

### MongoDB Connection Failed

1. Check MongoDB service is running
2. Verify connection string in `.env`
3. For Atlas: Check IP whitelist and credentials
