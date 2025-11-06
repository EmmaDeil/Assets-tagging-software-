#!/bin/bash

echo "🔍 Checking ASE Tag Software Setup..."
echo ""

# Check if Node.js is installed
if command -v node &> /dev/null; then
    echo "✅ Node.js installed: $(node --version)"
else
    echo "❌ Node.js is NOT installed"
    exit 1
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    echo "✅ npm installed: $(npm --version)"
else
    echo "❌ npm is NOT installed"
    exit 1
fi

echo ""
echo "📦 Checking dependencies..."

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "⚠️  Dependencies NOT installed. Run: npm install"
fi

echo ""
echo "🗄️  MongoDB Check..."

# Check if MongoDB is running (local)
if command -v mongo &> /dev/null || command -v mongod &> /dev/null; then
    echo "✅ MongoDB is installed"
    echo "   Make sure MongoDB service is running:"
    echo "   - Windows: net start MongoDB"
    echo "   - Linux/Mac: sudo systemctl start mongod"
else
    echo "⚠️  MongoDB not detected locally"
    echo "   You can use MongoDB Atlas (cloud) instead"
    echo "   Update MONGODB_URI in .env file"
fi

echo ""
echo "⚙️  Configuration Files..."

# Check .env file
if [ -f "server/.env" ]; then
    echo "✅ server/.env file exists"
else
    echo "❌ server/.env file missing"
    echo "   Copy from .env.example and configure"
fi

echo ""
echo "📂 Server Structure..."

# Check server files
if [ -f "server/server.js" ]; then
    echo "✅ server/server.js exists"
else
    echo "❌ server/server.js missing"
fi

if [ -d "server/models" ]; then
    echo "✅ server/models directory exists"
else
    echo "❌ server/models directory missing"
fi

if [ -d "server/routes" ]; then
    echo "✅ server/routes directory exists"
else
    echo "❌ server/routes directory missing"
fi

echo ""
echo "🚀 Ready to start!"
echo "   Run: npm run dev"
echo ""
