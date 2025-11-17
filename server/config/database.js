/**
 * database.js
 * 
 * MongoDB database connection configuration.
 * Handles connection to MongoDB Atlas or local MongoDB instance.
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * 
 * Uses environment-specific connection string:
 * - Development: MONGODB_URI_DEV (assetflow_dev database)
 * - Production: MONGODB_URI_PROD (assetflow_prod database)
 * 
 * Falls back to MONGODB_URI if environment-specific variable not set.
 * 
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // Determine which MongoDB URI to use based on environment
    const environment = process.env.NODE_ENV || 'development';
    let mongoURI;

    if (environment === 'production') {
      mongoURI = process.env.MONGODB_URI_PROD || process.env.MONGODB_URI;
    } else {
      mongoURI = process.env.MONGODB_URI_DEV || process.env.MONGODB_URI;
    }

    if (!mongoURI) {
      throw new Error('MongoDB URI not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);
    console.log(`🌍 Environment: ${environment}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection error: ${err}`);
});

module.exports = connectDB;
