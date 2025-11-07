/**
 * Seed Admin User
 * 
 * Creates the default administrator user if it doesn't exist
 * Run this script: node server/scripts/seedAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN_USER = {
  name: 'David Deil',
  email: 'admin@deil.com',
  role: 'Administrator',
  department: 'Administration',
  phone: '+1234567890',
  status: 'Active',
  profilePhoto: null,
  bio: 'System Administrator',
  joinDate: new Date(),
};

async function seedAdmin() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/asset-management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Check if admin user exists
    const existingAdmin = await User.findOne({ email: ADMIN_USER.email });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists:');
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
    } else {
      // Create admin user
      const admin = new User(ADMIN_USER);
      await admin.save();
      console.log('✅ Admin user created successfully:');
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
    }

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  }
}

// Run the seed function
seedAdmin();
