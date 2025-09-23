#!/bin/bash

echo "🚀 Exhibition Curator API - MongoDB Setup Test"
echo "=============================================="

# Check if MongoDB is running locally
echo "📋 Checking MongoDB connection..."

# Test local MongoDB connection
if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    echo "✅ Local MongoDB is running"
    LOCAL_MONGO=true
else
    echo "❌ Local MongoDB is not running"
    LOCAL_MONGO=false
fi

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file found"
    
    # Check for required environment variables
    if grep -q "MONGODB_URI" .env; then
        echo "✅ MONGODB_URI is configured"
    else
        echo "❌ MONGODB_URI not found in .env"
    fi
    
    if grep -q "JWT_SECRET" .env; then
        echo "✅ JWT_SECRET is configured"
    else
        echo "❌ JWT_SECRET not found in .env"
    fi
else
    echo "❌ .env file not found"
    echo "💡 Please copy .env.example to .env and configure it"
fi

# Check if node_modules exist
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies not installed"
    echo "💡 Run: npm install"
fi

# Test TypeScript compilation
echo "🔧 Testing TypeScript compilation..."
if npm run build > /dev/null 2>&1; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    echo "💡 Run: npm run build for details"
fi

echo ""
echo "🎯 Quick Start Commands:"
echo "1. Install MongoDB: brew install mongodb-community@7.0"
echo "2. Start MongoDB: brew services start mongodb/brew/mongodb-community"
echo "3. Copy environment: cp .env.example .env"
echo "4. Start development: npm run dev"
echo ""
echo "📚 For detailed setup instructions, see: MONGODB_SETUP.md"