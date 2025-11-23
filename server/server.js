/**
 * server.js
 * 
 * Main Express server file.
 * Handles API routing, middleware, and database connection.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const equipmentRoutes = require('./routes/equipment');
const activityRoutes = require('./routes/activities');
const userRoutes = require('./routes/users');
const tagRoutes = require('./routes/tags');
const maintenanceRoutes = require('./routes/maintenance');
const notificationRoutes = require('./routes/notifications');
const settingsRoutes = require('./routes/settings');
const cronRoutes = require('./routes/cron');

// Import middleware
const { checkMaintenanceMode } = require('./middleware/maintenanceMode');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Connect to MongoDB
connectDB();

// Trust proxy (important for deployment behind reverse proxy like Render, Heroku, etc.)
app.set('trust proxy', 1);

// CORS Configuration
// Determine allowed origins based on environment
const getAllowedOrigins = () => {
  if (NODE_ENV === 'production') {
    // In production, use the deployed frontend URL from environment variable
    const productionOrigins = [
      process.env.CLIENT_URL, 
      process.env.RENDER_EXTERNAL_URL
    ].filter(Boolean); // Remove undefined/null values
    
    return productionOrigins.length > 0 ? productionOrigins : ['*'];
  } else {
    // In development, allow localhost with various ports
    return [
      'http://localhost:5173', // Vite default port
      'http://localhost:3000', // Common React port
      'http://localhost:5000', // Server port
      'http://localhost:4173', // Vite preview port
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:4173'
    ];
  }
};

const allowedOrigins = getAllowedOrigins();

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      console.log(`✅ Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions)); // Enable CORS with options
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies with limit

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware (only in development)
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Apply maintenance mode middleware to all API routes except settings GET and auth routes
app.use('/api', checkMaintenanceMode);

// API Routes
app.use('/api/auth', authRoutes); // Authentication routes (public)
app.use('/api/equipment', equipmentRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/cron', cronRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'ASE Tag Software API',
    version: '1.0.0',
    endpoints: {
      equipment: '/api/equipment',
      activities: '/api/activities',
      users: '/api/users',
      tags: '/api/tags',
      health: '/api/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';
  
  res.status(statusCode).json({ 
    success: false,
    message: message,
    error: NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const server = app.listen(PORT, () => {
  const baseUrl = NODE_ENV === 'production' 
    ? (process.env.RENDER_EXTERNAL_URL || `https://assets-tagging-software-backend.onrender.com`)
    : `http://localhost:${PORT}`;
  
  console.log(`\n🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 API: ${baseUrl}/api`);
  console.log(`💚 Health: ${baseUrl}/api/health`);
  console.log(`🔓 CORS allowed origins: ${allowedOrigins.join(', ')}\n`);
  
  if (NODE_ENV === 'production') {
    console.log(`🌐 Your API is publicly accessible at: ${baseUrl}`);
  }
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Closing server gracefully...`);
  server.close(() => {
    console.log('Server closed. Exiting process.');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Forcing shutdown after timeout...');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});
