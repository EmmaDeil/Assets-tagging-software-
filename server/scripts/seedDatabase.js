/**
 * Database Seeding Script
 * 
 * Seeds both development and production databases with:
 * - Admin user
 * - Sample users
 * - Departments (as tags)
 * - Locations
 * - Asset types
 * - Status tags
 * 
 * Usage:
 *   node scripts/seedDatabase.js dev    # Seeds development database
 *   node scripts/seedDatabase.js prod   # Seeds production database
 *   node scripts/seedDatabase.js both   # Seeds both databases
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tag = require('../models/Tag');

// Seed data configurations
const SEED_DATA = {
  // Admin and sample users
  users: [
    {
      name: 'Administrator',
      email: 'admin@deil.com',
      password: 'Admin123',
      role: 'Administrator',
      department: 'IT Department',
      status: 'Active',
    },
    {
      name: 'John Manager',
      email: 'manager@deil.com',
      password: 'Manager123',
      role: 'Manager',
      department: 'Operations',
      status: 'Active',
    },
    {
      name: 'Jane User',
      email: 'user@deil.com',
      password: 'User123',
      role: 'User',
      department: 'Finance',
      status: 'Active',
    },
  ],

  // Department tags
  departments: [
    { name: 'IT Department', color: '#3B82F6', description: 'Information Technology' },
    { name: 'Operations', color: '#10B981', description: 'Operations Department' },
    { name: 'Finance', color: '#F59E0B', description: 'Finance and Accounting' },
    { name: 'Human Resources', color: '#8B5CF6', description: 'HR Department' },
    { name: 'Marketing', color: '#EC4899', description: 'Marketing and Sales' },
    { name: 'Engineering', color: '#6366F1', description: 'Engineering Department' },
    { name: 'Research', color: '#14B8A6', description: 'Research and Development' },
    { name: 'Administration', color: '#EF4444', description: 'Administrative Services' },
    { name: 'Security', color: '#64748B', description: 'Security Department' },
    { name: 'Maintenance', color: '#F97316', description: 'Maintenance Services' },
  ],

  // Location tags
  locations: [
    { name: 'Main Building', color: '#3B82F6', description: 'Primary office building' },
    { name: 'Warehouse A', color: '#10B981', description: 'Storage facility A' },
    { name: 'Warehouse B', color: '#059669', description: 'Storage facility B' },
    { name: 'Server Room', color: '#EF4444', description: 'Data center and servers' },
    { name: 'Conference Room 1', color: '#8B5CF6', description: 'Meeting room 1' },
    { name: 'Conference Room 2', color: '#7C3AED', description: 'Meeting room 2' },
    { name: 'Reception', color: '#F59E0B', description: 'Front desk and lobby' },
    { name: 'Parking Lot', color: '#64748B', description: 'Vehicle parking area' },
    { name: 'Lab', color: '#14B8A6', description: 'Laboratory facilities' },
    { name: 'Workshop', color: '#F97316', description: 'Maintenance workshop' },
  ],

  // Asset type tags
  assetTypes: [
    { name: 'Computer', color: '#3B82F6', description: 'Desktop and laptop computers' },
    { name: 'Monitor', color: '#06B6D4', description: 'Display monitors' },
    { name: 'Printer', color: '#10B981', description: 'Printing equipment' },
    { name: 'Scanner', color: '#059669', description: 'Document scanners' },
    { name: 'Furniture', color: '#F59E0B', description: 'Office furniture' },
    { name: 'Vehicle', color: '#EF4444', description: 'Company vehicles' },
    { name: 'Tool', color: '#F97316', description: 'Hand and power tools' },
    { name: 'Server', color: '#8B5CF6', description: 'Network servers' },
    { name: 'Network Device', color: '#6366F1', description: 'Routers, switches, etc.' },
    { name: 'Appliance', color: '#EC4899', description: 'Office appliances' },
    { name: 'Equipment', color: '#14B8A6', description: 'General equipment' },
    { name: 'Software License', color: '#64748B', description: 'Software licenses' },
  ],

  // Status tags
  statuses: [
    { name: 'Available', color: '#10B981', description: 'Ready for use' },
    { name: 'In Use', color: '#3B82F6', description: 'Currently being used' },
    { name: 'Under Maintenance', color: '#F59E0B', description: 'Being serviced' },
    { name: 'Out of Service', color: '#EF4444', description: 'Not functional' },
    { name: 'Reserved', color: '#8B5CF6', description: 'Reserved for future use' },
    { name: 'Retired', color: '#64748B', description: 'No longer in service' },
    { name: 'Lost', color: '#DC2626', description: 'Missing or lost' },
    { name: 'Disposed', color: '#991B1B', description: 'Disposed or sold' },
  ],
};

/**
 * Connect to specific database
 */
async function connectToDatabase(environment) {
  let mongoURI;
  
  if (environment === 'production' || environment === 'prod') {
    mongoURI = process.env.MONGODB_URI_PROD;
    console.log('\n🌍 Connecting to PRODUCTION database...');
  } else {
    mongoURI = process.env.MONGODB_URI_DEV;
    console.log('\n🌍 Connecting to DEVELOPMENT database...');
  }

  if (!mongoURI) {
    throw new Error(`MongoDB URI for ${environment} not found in .env file`);
  }

  await mongoose.connect(mongoURI);
  console.log(`✅ Connected to: ${mongoose.connection.name}`);
}

/**
 * Hash password
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

/**
 * Seed users
 */
async function seedUsers() {
  console.log('\n👥 Seeding users...');
  
  for (const userData of SEED_DATA.users) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`  ⚠️  User already exists: ${userData.email}`);
        continue;
      }

      // Hash password before saving
      const hashedPassword = await hashPassword(userData.password);
      
      const user = await User.create({
        ...userData,
        password: hashedPassword,
      });

      console.log(`  ✅ Created user: ${user.email} (${user.role})`);
    } catch (error) {
      console.error(`  ❌ Error creating user ${userData.email}:`, error.message);
    }
  }
}

/**
 * Seed tags by category
 */
async function seedTags(category, tagsData) {
  console.log(`\n🏷️  Seeding ${category} tags...`);
  
  for (const tagData of tagsData) {
    try {
      // Check if tag already exists
      const existingTag = await Tag.findOne({ 
        name: tagData.name, 
        category: category 
      });
      
      if (existingTag) {
        console.log(`  ⚠️  Tag already exists: ${tagData.name}`);
        continue;
      }

      const tag = await Tag.create({
        ...tagData,
        category: category,
      });

      console.log(`  ✅ Created tag: ${tag.name}`);
    } catch (error) {
      console.error(`  ❌ Error creating tag ${tagData.name}:`, error.message);
    }
  }
}

/**
 * Clear all data (optional - be careful!)
 */
async function clearDatabase() {
  console.log('\n🗑️  Clearing existing data...');
  
  await User.deleteMany({});
  console.log('  ✅ Cleared users');
  
  await Tag.deleteMany({});
  console.log('  ✅ Cleared tags');
}

/**
 * Main seeding function
 */
async function seedDatabase(environment, clearFirst = false) {
  try {
    await connectToDatabase(environment);

    if (clearFirst) {
      await clearDatabase();
    }

    // Seed all data
    await seedUsers();
    await seedTags('Department', SEED_DATA.departments);
    await seedTags('Location', SEED_DATA.locations);
    await seedTags('Asset Type', SEED_DATA.assetTypes);
    await seedTags('Status', SEED_DATA.statuses);

    // Print summary
    const userCount = await User.countDocuments();
    const tagCount = await Tag.countDocuments();
    
    console.log('\n📊 Seeding Summary:');
    console.log(`  👥 Total Users: ${userCount}`);
    console.log(`  🏷️  Total Tags: ${tagCount}`);
    console.log(`  📂 Database: ${mongoose.connection.name}`);
    
    console.log('\n🎉 Database seeding completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
  }
}

/**
 * Run seeding script
 */
async function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || 'dev';
  const clearFirst = args.includes('--clear');

  console.log('╔════════════════════════════════════════════╗');
  console.log('║     AssetFlow Database Seeding Script     ║');
  console.log('╚════════════════════════════════════════════╝');

  if (clearFirst) {
    console.log('\n⚠️  WARNING: --clear flag detected. All existing data will be deleted!\n');
  }

  if (environment === 'both') {
    console.log('\n📦 Seeding BOTH databases...\n');
    await seedDatabase('development', clearFirst);
    await seedDatabase('production', clearFirst);
  } else {
    await seedDatabase(environment, clearFirst);
  }

  console.log('✨ All done!\n');
  console.log('📝 Default credentials:');
  console.log('   Admin:   admin@deil.com / Admin123');
  console.log('   Manager: manager@deil.com / Manager123');
  console.log('   User:    user@deil.com / User123\n');
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
