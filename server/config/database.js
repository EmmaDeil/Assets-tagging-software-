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
 * Uses connection string from environment variable MONGODB_URI.
 * Logs connection status and handles connection errors.
 * 
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);
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
