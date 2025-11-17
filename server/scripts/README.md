# Database Seeding Scripts

This directory contains scripts for seeding the database with initial data.

## Seed Script (`seedDatabase.js`)

Seeds both development and production databases with:
- **Users**: Admin, Manager, and User accounts with default passwords
- **Departments**: 10 common departments (IT, Operations, Finance, etc.)
- **Locations**: 10 typical locations (Main Building, Warehouse, Server Room, etc.)
- **Asset Types**: 12 asset categories (Computer, Monitor, Printer, etc.)
- **Status Tags**: 8 status options (Available, In Use, Under Maintenance, etc.)

## Usage

### Seed Development Database
```bash
npm run seed:dev
```
or
```bash
node scripts/seedDatabase.js dev
```

### Seed Production Database
```bash
npm run seed:prod
```
or
```bash
node scripts/seedDatabase.js prod
```

### Seed Both Databases
```bash
npm run seed:both
```
or
```bash
node scripts/seedDatabase.js both
```

### Clear and Reseed (⚠️ Destructive!)
```bash
npm run seed:clear
```
or
```bash
node scripts/seedDatabase.js dev --clear
```

## Default Credentials

After seeding, you can login with these accounts:

| Role | Email | Password |
|------|-------|----------|
| **Administrator** | admin@deil.com | Admin123 |
| **Manager** | manager@deil.com | Manager123 |
| **User** | user@deil.com | User123 |

## What Gets Created

### 👥 Users (3 accounts)
- 1 Administrator
- 1 Manager
- 1 Regular User

### 🏷️ Tags (40 total)

#### Departments (10)
- IT Department, Operations, Finance, Human Resources, Marketing, Engineering, Research, Administration, Security, Maintenance

#### Locations (10)
- Main Building, Warehouse A, Warehouse B, Server Room, Conference Rooms, Reception, Parking Lot, Lab, Workshop

#### Asset Types (12)
- Computer, Monitor, Printer, Scanner, Furniture, Vehicle, Tool, Server, Network Device, Appliance, Equipment, Software License

#### Status (8)
- Available, In Use, Under Maintenance, Out of Service, Reserved, Retired, Lost, Disposed

## Notes

- ✅ Script checks for existing data and skips duplicates
- ✅ Safe to run multiple times
- ✅ Passwords are hashed using bcrypt
- ⚠️ Use `--clear` flag with caution (deletes all data)
- 🔒 Never commit `.env` file with production credentials

## Troubleshooting

If you encounter errors:

1. **MongoDB URI not found**: Ensure `.env` file has `MONGODB_URI_DEV` and `MONGODB_URI_PROD`
2. **Connection timeout**: Check internet connection and MongoDB Atlas whitelist
3. **Duplicate key error**: Data already exists (safe to ignore)
4. **Authentication failed**: Verify MongoDB credentials in `.env`
