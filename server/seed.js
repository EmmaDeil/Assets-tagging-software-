/**
 * seed.js
 * 
 * Database seeding script for ASE Tag Software
 * Populates MongoDB with sample data for testing and demonstration
 * 
 * Usage:
 *   node seed.js
 * 
 * This will create:
 * - Sample users (3)
 * - Sample tags (20+)
 * - Sample equipment/assets (15)
 * - Sample activities (20+)
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const Equipment = require('./models/Equipment');
const Activity = require('./models/Activity');
const User = require('./models/User');
const Tag = require('./models/Tag');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ase-tag-software';

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

/**
 * Clear all existing data
 */
async function clearDatabase() {
  try {
    await Equipment.deleteMany({});
    await Activity.deleteMany({});
    await User.deleteMany({});
    await Tag.deleteMany({});
    console.log('🗑️  Cleared existing data');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

/**
 * Seed Users
 */
async function seedUsers() {
  const users = [
    {
      name: 'David Deil',
      email: 'admin@deil.com',
      role: 'Administrator',
      status: 'Active',
      department: 'IT Department',
    },
    // {
    //   name: 'Sarah Manager',
    //   email: 'sarah.manager@company.com',
    //   role: 'Manager',
    //   status: 'Active',
    //   department: 'Operations',
    // },
    // {
    //   name: 'Mike User',
    //   email: 'mike.user@company.com',
    //   role: 'User',
    //   status: 'Active',
    //   department: 'Sales',
    // },
    // {
    //   name: 'Lisa Chen',
    //   email: 'lisa.chen@company.com',
    //   role: 'Manager',
    //   status: 'Active',
    //   department: 'Finance',
    // },
    // {
    //   name: 'David Kim',
    //   email: 'david.kim@company.com',
    //   role: 'User',
    //   status: 'Inactive',
    //   department: 'HR',
    // },
  ];

  try {
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

/**
 * Seed Tags
 */
async function seedTags() {
  const tags = [
    // Location Tags
    { name: 'New York Office', category: 'Location', color: '#3B82F6', description: 'Main office in NYC' },
    { name: 'London Office', category: 'Location', color: '#3B82F6', description: 'UK headquarters' },
    { name: 'Tokyo Office', category: 'Location', color: '#3B82F6', description: 'Asia Pacific office' },
    { name: 'Remote', category: 'Location', color: '#3B82F6', description: 'Employee home office' },
    { name: 'Data Center A', category: 'Location', color: '#3B82F6', description: 'Primary data center' },
    { name: 'Warehouse', category: 'Location', color: '#3B82F6', description: 'Storage facility' },

    // Department Tags
    { name: 'IT Department', category: 'Department', color: '#10B981', description: 'Information Technology' },
    { name: 'Finance', category: 'Department', color: '#10B981', description: 'Finance and Accounting' },
    { name: 'HR', category: 'Department', color: '#10B981', description: 'Human Resources' },
    { name: 'Sales', category: 'Department', color: '#10B981', description: 'Sales team' },
    { name: 'Marketing', category: 'Department', color: '#10B981', description: 'Marketing department' },
    { name: 'Operations', category: 'Department', color: '#10B981', description: 'Operations team' },

    // Asset Type Tags
    { name: 'Computing', category: 'Asset Type', color: '#8B5CF6', description: 'Computers and laptops' },
    { name: 'Peripherals', category: 'Asset Type', color: '#8B5CF6', description: 'Monitors, keyboards, mice' },
    { name: 'Office Furniture', category: 'Asset Type', color: '#8B5CF6', description: 'Desks, chairs, etc.' },
    { name: 'Network Equipment', category: 'Asset Type', color: '#8B5CF6', description: 'Routers, switches' },
    { name: 'Mobile Devices', category: 'Asset Type', color: '#8B5CF6', description: 'Phones and tablets' },
    { name: 'Printers', category: 'Asset Type', color: '#8B5CF6', description: 'Printing equipment' },

    // Status Tags
    { name: 'In Use', category: 'Status', color: '#10B981', description: 'Currently being used' },
    { name: 'Available', category: 'Status', color: '#3B82F6', description: 'Ready for assignment' },
    { name: 'Under Maintenance', category: 'Status', color: '#F59E0B', description: 'Being serviced' },
    { name: 'Retired', category: 'Status', color: '#6B7280', description: 'No longer in service' },
    { name: 'Lost', category: 'Status', color: '#EF4444', description: 'Missing or stolen' },
  ];

  try {
    const createdTags = await Tag.insertMany(tags);
    console.log(`✅ Created ${createdTags.length} tags`);
    return createdTags;
  } catch (error) {
    console.error('Error seeding tags:', error);
    throw error;
  }
}

/**
 * Seed Equipment/Assets
 */
async function seedEquipment() {
  const equipment = [
    // {
    //   name: 'MacBook Pro 16-inch M2',
    //   id: 'LAPTOP-001',
    //   category: 'Laptops',
    //   location: 'New York Office',
    //   status: 'In Use',
    //   model: 'MacBook Pro 16" 2023',
    //   serial: 'C02XJ0A2LVDL',
    //   purchaseDate: '2023-08-15',
    //   acquisitionDate: '2023-08-15',
    //   cost: 2499,
    //   maintenancePeriod: 'Annually',
    //   maintenanceSchedule: 'Annually',
    //   notes: 'Assigned to John Admin',
    //   assignedTo: 'John Admin',
    //   department: 'IT Department',
    // },
    // {
    //   name: 'Dell XPS 15',
    //   id: 'LAPTOP-002',
    //   category: 'Laptops',
    //   location: 'London Office',
    //   status: 'In Use',
    //   model: 'XPS 15 9520',
    //   serial: 'DXPS920-ABC123',
    //   purchaseDate: '2023-09-20',
    //   acquisitionDate: '2023-09-20',
    //   cost: 1899,
    //   maintenancePeriod: 'Annually',
    //   maintenanceSchedule: 'Annually',
    //   notes: 'Development machine',
    //   assignedTo: 'Sarah Manager',
    //   department: 'Operations',
    // },
    // {
    //   name: 'HP EliteBook 840',
    //   id: 'LAPTOP-003',
    //   category: 'Laptops',
    //   location: 'Tokyo Office',
    //   status: 'Available',
    //   model: 'EliteBook 840 G9',
    //   serial: 'HPEB840-XYZ789',
    //   purchaseDate: '2024-01-10',
    //   acquisitionDate: '2024-01-10',
    //   cost: 1499,
    //   maintenancePeriod: 'Quarterly',
    //   maintenanceSchedule: 'Quarterly',
    //   notes: 'Spare laptop for new hires',
    // },
    // {
    //   name: 'Dell UltraSharp 27" Monitor',
    //   id: 'MONITOR-001',
    //   category: 'Monitors',
    //   location: 'New York Office',
    //   status: 'In Use',
    //   model: 'U2723DE',
    //   serial: 'DLMON-001234',
    //   purchaseDate: '2023-07-05',
    //   acquisitionDate: '2023-07-05',
    //   cost: 599,
    //   maintenancePeriod: 'Bi-annually',
    //   maintenanceSchedule: 'Bi-annually',
    //   notes: '4K monitor for design work',
    // },
    // {
    //   name: 'LG UltraWide 34" Monitor',
    //   id: 'MONITOR-002',
    //   category: 'Monitors',
    //   location: 'London Office',
    //   status: 'In Use',
    //   model: '34WK95U',
    //   serial: 'LGMON-567890',
    //   purchaseDate: '2023-11-12',
    //   acquisitionDate: '2023-11-12',
    //   cost: 799,
    //   maintenancePeriod: 'Annually',
    //   maintenanceSchedule: 'Annually',
    //   notes: 'Ultrawide for productivity',
    // },
    // {
    //   name: 'HP LaserJet Pro',
    //   id: 'PRINTER-001',
    //   category: 'Printers',
    //   location: 'New York Office',
    //   status: 'In Use',
    //   model: 'LaserJet Pro M404dn',
    //   serial: 'HPLJ-998877',
    //   purchaseDate: '2023-05-20',
    //   acquisitionDate: '2023-05-20',
    //   cost: 349,
    //   maintenancePeriod: 'Quarterly',
    //   maintenanceSchedule: 'Quarterly',
    //   notes: 'Office printer, toner replaced regularly',
    // },
    // {
    //   name: 'iPhone 14 Pro',
    //   id: 'PHONE-001',
    //   category: 'Smartphones',
    //   location: 'Remote (Employee Home)',
    //   status: 'In Use',
    //   model: 'iPhone 14 Pro 256GB',
    //   serial: 'AAPL-IP14-12345',
    //   purchaseDate: '2023-10-01',
    //   acquisitionDate: '2023-10-01',
    //   cost: 1099,
    //   maintenancePeriod: 'Annually',
    //   maintenanceSchedule: 'Annually',
    //   notes: 'Company phone for sales team',
    //   assignedTo: 'Mike User',
    //   department: 'Sales',
    // },
    // {
    //   name: 'iPad Pro 12.9"',
    //   id: 'TABLET-001',
    //   category: 'Tablets',
    //   location: 'New York Office',
    //   status: 'Available',
    //   model: 'iPad Pro 12.9" M2',
    //   serial: 'AAPL-IPAD-67890',
    //   purchaseDate: '2024-02-14',
    //   acquisitionDate: '2024-02-14',
    //   cost: 1199,
    //   maintenancePeriod: 'Annually',
    //   maintenanceSchedule: 'Annually',
    //   notes: 'For presentations and demos',
    // },
    // {
    //   name: 'Cisco Catalyst Switch',
    //   id: 'NETWORK-001',
    //   category: 'Servers',
    //   location: 'Data Center A',
    //   status: 'In Use',
    //   model: 'Catalyst 2960-X',
    //   serial: 'CISCO-SW-445566',
    //   purchaseDate: '2022-12-10',
    //   acquisitionDate: '2022-12-10',
    //   cost: 2499,
    //   maintenancePeriod: 'Monthly',
    //   maintenanceSchedule: 'Monthly',
    //   notes: 'Core network switch',
    // },
    // {
    //   name: 'Dell PowerEdge Server',
    //   id: 'SERVER-001',
    //   category: 'Servers',
    //   location: 'Data Center A',
    //   status: 'In Use',
    //   model: 'PowerEdge R740',
    //   serial: 'DLSRV-334455',
    //   purchaseDate: '2022-08-22',
    //   acquisitionDate: '2022-08-22',
    //   cost: 5999,
    //   maintenancePeriod: 'Monthly',
    //   maintenanceSchedule: 'Monthly',
    //   notes: 'Primary application server',
    // },
    // {
    //   name: 'Herman Miller Aeron Chair',
    //   id: 'FURNITURE-001',
    //   category: 'Furniture',
    //   location: 'New York Office',
    //   status: 'In Use',
    //   model: 'Aeron Remastered Size B',
    //   serial: 'HM-AERON-112233',
    //   purchaseDate: '2023-03-15',
    //   acquisitionDate: '2023-03-15',
    //   cost: 1395,
    //   maintenancePeriod: 'Bi-annually',
    //   maintenanceSchedule: 'Bi-annually',
    //   notes: 'Ergonomic office chair',
    // },
    // {
    //   name: 'Standing Desk',
    //   id: 'FURNITURE-002',
    //   category: 'Furniture',
    //   location: 'London Office',
    //   status: 'In Use',
    //   model: 'Uplift V2',
    //   serial: 'UPLIFT-998877',
    //   purchaseDate: '2023-06-01',
    //   acquisitionDate: '2023-06-01',
    //   cost: 799,
    //   maintenancePeriod: 'Annually',
    //   maintenanceSchedule: 'Annually',
    //   notes: 'Electric height-adjustable desk',
    // },
    // {
    //   name: 'Logitech MX Master 3',
    //   id: 'PERIPHERAL-001',
    //   category: 'Computers',
    //   location: 'New York Office',
    //   status: 'In Use',
    //   model: 'MX Master 3',
    //   serial: 'LOGI-MX3-556677',
    //   purchaseDate: '2024-01-20',
    //   acquisitionDate: '2024-01-20',
    //   cost: 99,
    //   maintenancePeriod: '',
    //   maintenanceSchedule: '',
    //   notes: 'Wireless mouse for productivity',
    // },
    // {
    //   name: 'Sony WH-1000XM5 Headphones',
    //   id: 'PERIPHERAL-002',
    //   category: 'Computers',
    //   location: 'Remote (Employee Home)',
    //   status: 'In Use',
    //   model: 'WH-1000XM5',
    //   serial: 'SONY-WH5-778899',
    //   purchaseDate: '2024-03-10',
    //   acquisitionDate: '2024-03-10',
    //   cost: 399,
    //   maintenancePeriod: '',
    //   maintenanceSchedule: '',
    //   notes: 'Noise-canceling headphones',
    //   assignedTo: 'Lisa Chen',
    //   department: 'Finance',
    // },
    // {
    //   name: 'Dell Laptop - Retired',
    //   id: 'LAPTOP-OLD-001',
    //   category: 'Laptops',
    //   location: 'Warehouse',
    //   status: 'Retired',
    //   model: 'Latitude 7490',
    //   serial: 'DLLAT-OLD123',
    //   purchaseDate: '2019-04-15',
    //   acquisitionDate: '2019-04-15',
    //   cost: 1299,
    //   maintenancePeriod: '',
    //   maintenanceSchedule: '',
    //   notes: 'End of life - awaiting disposal',
    // },
  ];

  try {
    const createdEquipment = await Equipment.insertMany(equipment);
    console.log(`✅ Created ${createdEquipment.length} equipment items`);
    return createdEquipment;
  } catch (error) {
    console.error('Error seeding equipment:', error);
    throw error;
  }
}

/**
 * Seed Activities
 */
async function seedActivities(equipmentList) {
  const activities = [
    // {
    //   assetName: 'MacBook Pro 16-inch M2',
    //   assetId: 'LAPTOP-001',
    //   action: 'Added to inventory',
    //   actionType: 'Added',
    //   user: 'John Admin',
    //   icon: '📦',
    //   date: '2 months ago',
    //   timestamp: Date.now() - 60 * 24 * 60 * 60 * 1000,
    // },
    // {
    //   assetName: 'MacBook Pro 16-inch M2',
    //   assetId: 'LAPTOP-001',
    //   action: 'Assigned to John Admin',
    //   actionType: 'Updated',
    //   user: 'Sarah Manager',
    //   icon: '👤',
    //   date: '2 months ago',
    //   timestamp: Date.now() - 59 * 24 * 60 * 60 * 1000,
    // },
    // {
    //   assetName: 'Dell XPS 15',
    //   assetId: 'LAPTOP-002',
    //   action: 'Added to inventory',
    //   actionType: 'Added',
    //   user: 'John Admin',
    //   icon: '📦',
    //   date: '45 days ago',
    //   timestamp: Date.now() - 45 * 24 * 60 * 60 * 1000,
    // },
    // {
    //   assetName: 'HP LaserJet Pro',
    //   assetId: 'PRINTER-001',
    //   action: 'Maintenance completed',
    //   actionType: 'Maintenance',
    //   user: 'Mike User',
    //   icon: '🔧',
    //   date: '15 days ago',
    //   timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000,
    // },
    // {
    //   assetName: 'Dell UltraSharp 27" Monitor',
    //   assetId: 'MONITOR-001',
    //   action: 'Updated location to New York Office',
    //   actionType: 'Updated',
    //   user: 'Sarah Manager',
    //   icon: '✏️',
    //   date: '10 days ago',
    //   timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000,
    // },
    // {
    //   assetName: 'iPhone 14 Pro',
    //   assetId: 'PHONE-001',
    //   action: 'Checked out to Mike User',
    //   actionType: 'Checked Out',
    //   user: 'John Admin',
    //   icon: '📱',
    //   date: '8 days ago',
    //   timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
    // },
    // {
    //   assetName: 'Cisco Catalyst Switch',
    //   assetId: 'NETWORK-001',
    //   action: 'Firmware updated',
    //   actionType: 'Maintenance',
    //   user: 'John Admin',
    //   icon: '🔧',
    //   date: '5 days ago',
    //   timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    // },
    // {
    //   assetName: 'iPad Pro 12.9"',
    //   assetId: 'TABLET-001',
    //   action: 'Added to inventory',
    //   actionType: 'Added',
    //   user: 'Sarah Manager',
    //   icon: '📦',
    //   date: '3 days ago',
    //   timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    // },
    // {
    //   assetName: 'Herman Miller Aeron Chair',
    //   assetId: 'FURNITURE-001',
    //   action: 'Moved to New York Office',
    //   actionType: 'Updated',
    //   user: 'Mike User',
    //   icon: '🪑',
    //   date: '2 days ago',
    //   timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    // },
    // {
    //   assetName: 'Dell PowerEdge Server',
    //   assetId: 'SERVER-001',
    //   action: 'Scheduled maintenance',
    //   actionType: 'Maintenance',
    //   user: 'John Admin',
    //   icon: '🔧',
    //   date: '1 day ago',
    //   timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    // },
    // {
    //   assetName: 'HP EliteBook 840',
    //   assetId: 'LAPTOP-003',
    //   action: 'Status changed to Available',
    //   actionType: 'Updated',
    //   user: 'Sarah Manager',
    //   icon: '✏️',
    //   date: '12 hours ago',
    //   timestamp: Date.now() - 12 * 60 * 60 * 1000,
    // },
    // {
    //   assetName: 'Sony WH-1000XM5 Headphones',
    //   assetId: 'PERIPHERAL-002',
    //   action: 'Assigned to Lisa Chen',
    //   actionType: 'Updated',
    //   user: 'John Admin',
    //   icon: '👤',
    //   date: '6 hours ago',
    //   timestamp: Date.now() - 6 * 60 * 60 * 1000,
    // },
    // {
    //   assetName: 'Standing Desk',
    //   assetId: 'FURNITURE-002',
    //   action: 'Assembly completed',
    //   actionType: 'Updated',
    //   user: 'Mike User',
    //   icon: '🔨',
    //   date: '4 hours ago',
    //   timestamp: Date.now() - 4 * 60 * 60 * 1000,
    // },
    // {
    //   assetName: 'LG UltraWide 34" Monitor',
    //   assetId: 'MONITOR-002',
    //   action: 'Calibrated for color accuracy',
    //   actionType: 'Maintenance',
    //   user: 'Sarah Manager',
    //   icon: '🎨',
    //   date: '2 hours ago',
    //   timestamp: Date.now() - 2 * 60 * 60 * 1000,
    // },
    // {
    //   assetName: 'Logitech MX Master 3',
    //   assetId: 'PERIPHERAL-001',
    //   action: 'Added to inventory',
    //   actionType: 'Added',
    //   user: 'John Admin',
    //   icon: '📦',
    //   date: '1 hour ago',
    //   timestamp: Date.now() - 1 * 60 * 60 * 1000,
    // },
    // {
    //   assetName: 'Dell Laptop - Retired',
    //   assetId: 'LAPTOP-OLD-001',
    //   action: 'Marked as Retired',
    //   actionType: 'Updated',
    //   user: 'Sarah Manager',
    //   icon: '🗑️',
    //   date: '30 minutes ago',
    //   timestamp: Date.now() - 30 * 60 * 1000,
    // },
  ];

  try {
    const createdActivities = await Activity.insertMany(activities);
    console.log(`✅ Created ${createdActivities.length} activities`);
    return createdActivities;
  } catch (error) {
    console.error('Error seeding activities:', error);
    throw error;
  }
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  try {
    console.log('\n🌱 Starting database seeding...\n');

    // Connect to database
    await connectDB();

    // Clear existing data
    await clearDatabase();

    // Seed data in order
    console.log('\n📝 Seeding data...\n');
    
    const users = await seedUsers();
    const tags = await seedTags();
    const equipment = await seedEquipment();
    const activities = await seedActivities(equipment);

    // Summary
    console.log('\n✨ Seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Tags: ${tags.length}`);
    console.log(`   - Equipment: ${equipment.length}`);
    console.log(`   - Activities: ${activities.length}`);
    console.log('\n🚀 You can now start the application with: npm run dev\n');

    // Close connection
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();
