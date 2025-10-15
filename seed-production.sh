#!/bin/bash

# Production Database Seeding Script
# This script safely seeds the production database with sample data

echo "🚀 Production Database Seeding"
echo "================================"

# Check if MongoDB Atlas connection string is configured
if grep -q "mongodb+srv://" .env.production; then
    echo "✅ MongoDB Atlas connection string found"
else
    echo "❌ ERROR: MongoDB Atlas connection string not found in .env.production"
    echo "Please configure your MONGODB_URI in .env.production"
    exit 1
fi

# Warning about data deletion
echo ""
echo "⚠️  WARNING: This will DELETE ALL existing users and data!"
echo "Are you sure you want to proceed? (y/N)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "🌱 Starting production database seeding..."
    
    # Build the project first
    echo "🔨 Building project..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful"
        
        # Run the production seed
        echo "🌱 Seeding production database..."
        npm run seed:prod
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "🎉 Production database seeded successfully!"
            echo ""
            echo "📋 Sample accounts created:"
            echo "   • artlover123 (artlover@example.com) - password: password123"
            echo "   • curator_mike (mike@museum.com) - password: password123"
            echo ""
            echo "🔐 IMPORTANT: Change these passwords in production!"
        else
            echo "❌ Seeding failed. Check the error messages above."
        fi
    else
        echo "❌ Build failed. Please fix compilation errors first."
    fi
else
    echo "❌ Seeding cancelled by user"
fi