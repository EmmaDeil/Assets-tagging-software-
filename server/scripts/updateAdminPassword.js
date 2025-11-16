/**
 * Update Administrator Password
 * 
 * Updates the password for the administrator account
 * Run this script: node server/scripts/updateAdminPassword.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN_EMAIL = 'admin@deil.com';
const NEW_PASSWORD = 'Admin123';

async function updateAdminPassword() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/asset-management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Find administrator user
    const admin = await User.findOne({ email: ADMIN_EMAIL });

    if (!admin) {
      console.log('❌ Administrator user not found with email:', ADMIN_EMAIL);
      console.log('   Available users:');
      const users = await User.find({}).select('name email role');
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
      });
      await mongoose.connection.close();
      process.exit(1);
    }

    // Update password
    admin.password = NEW_PASSWORD;
    await admin.save(); // The pre-save hook will hash the password

    console.log('✅ Administrator password updated successfully!');
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   New Password: ${NEW_PASSWORD}`);
    console.log('\n🔐 You can now login with:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${NEW_PASSWORD}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating administrator password:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the update function
updateAdminPassword();
