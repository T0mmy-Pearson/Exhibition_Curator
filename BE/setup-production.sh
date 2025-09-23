#!/bin/bash

# Production Setup Script for Exhibition Curator Backend

echo "🎨 Exhibition Curator - Production Setup"
echo "======================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    echo "📝 Please create .env.production with your MongoDB Atlas connection string"
    echo "📖 See PRODUCTION_DATABASE_SETUP.md for detailed instructions"
    exit 1
fi

echo "✅ .env.production file found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Build the application
echo "🔨 Building application..."
npm run build:prod

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Application built successfully"

# Test database connection
echo "🔌 Testing database connection..."
NODE_ENV=production node -e "
const { connectDB, disconnectDB } = require('./dist/db/connection.js');
connectDB()
  .then(() => {
    console.log('✅ Database connection successful');
    return disconnectDB();
  })
  .then(() => {
    console.log('✅ Setup completed successfully!');
    console.log('🚀 You can now run: npm run start:prod');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    console.log('📖 Please check your MONGODB_URI in .env.production');
    process.exit(1);
  });
"

echo ""
echo "🎉 Production setup completed!"
echo "🚀 To start the production server:"
echo "   npm run start:prod"
echo ""
echo "📊 To monitor the application:"
echo "   Check your MongoDB Atlas dashboard"
echo "   Monitor application logs"