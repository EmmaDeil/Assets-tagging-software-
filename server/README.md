# ASE Tag Software - Backend Server

## Setup Instructions

### 1. Install MongoDB

**Option A: Local MongoDB**
- Download and install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
- Start MongoDB service:
  ```bash
  # Windows (as admin)
  net start MongoDB
  
  # macOS/Linux
  sudo systemctl start mongod
  ```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Get your connection string
- Update `.env` file with your MongoDB Atlas URI

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/ase-tag-software

# For MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ase-tag-software

PORT=5000
NODE_ENV=development
```

### 3. Start the Application

From the root directory:

```bash
# Start both server and client concurrently
npm run dev

# Or start them separately:
# Terminal 1 - Server
npm run server

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
