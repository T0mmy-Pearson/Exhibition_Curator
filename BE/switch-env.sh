#!/bin/bash

# Environment Switcher for Exhibition Curator

show_help() {
    echo "🎨 Exhibition Curator - Environment Switcher"
    echo "============================================"
    echo ""
    echo "Usage: ./switch-env.sh [ENVIRONMENT]"
    echo ""
    echo "Environments:"
    echo "  dev         Switch to development environment"
    echo "  prod        Switch to production environment"
    echo "  test        Switch to test environment"
    echo ""
    echo "Commands:"
    echo "  status      Show current environment"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./switch-env.sh dev"
    echo "  ./switch-env.sh prod"
    echo "  ./switch-env.sh status"
}

show_status() {
    echo "📊 Current Environment Status"
    echo "============================"
    echo "NODE_ENV: ${NODE_ENV:-'not set'}"
    
    if [ -f ".env" ]; then
        echo "✅ .env file exists"
        if grep -q "NODE_ENV=" .env; then
            env_value=$(grep "NODE_ENV=" .env | cut -d'=' -f2)
            echo "📁 .env NODE_ENV: $env_value"
        fi
    else
        echo "❌ .env file not found"
    fi
    
    if [ -f ".env.production" ]; then
        echo "✅ .env.production file exists"
    else
        echo "❌ .env.production file not found"
    fi
}

switch_to_dev() {
    echo "🔄 Switching to development environment..."
    export NODE_ENV=development
    
    if [ -f ".env" ]; then
        # Update NODE_ENV in .env file
        sed -i.bak 's/NODE_ENV=.*/NODE_ENV=development/' .env
        echo "✅ Updated .env file"
    fi
    
    echo "🔌 Using local MongoDB: mongodb://localhost:27017/exhibition_curator"
    echo "✅ Switched to development environment"
}

switch_to_prod() {
    echo "🔄 Switching to production environment..."
    export NODE_ENV=production
    
    if [ ! -f ".env.production" ]; then
        echo "❌ .env.production file not found!"
        echo "📝 Please create .env.production with production settings"
        echo "📖 See PRODUCTION_DATABASE_SETUP.md for instructions"
        exit 1
    fi
    
    echo "☁️  Using production MongoDB Atlas database"
    echo "✅ Switched to production environment"
    echo ""
    echo "🚀 To start production server:"
    echo "   npm run start:prod"
}

switch_to_test() {
    echo "🔄 Switching to test environment..."
    export NODE_ENV=test
    
    if [ -f ".env" ]; then
        # Update NODE_ENV in .env file
        sed -i.bak 's/NODE_ENV=.*/NODE_ENV=test/' .env
        echo "✅ Updated .env file"
    fi
    
    echo "🧪 Using test MongoDB: mongodb://localhost:27017/exhibition_curator_test"
    echo "✅ Switched to test environment"
}

# Main script logic
case "$1" in
    "dev"|"development")
        switch_to_dev
        ;;
    "prod"|"production")
        switch_to_prod
        ;;
    "test")
        switch_to_test
        ;;
    "status")
        show_status
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        echo "❌ Unknown environment: $1"
        echo ""
        show_help
        exit 1
        ;;
esac