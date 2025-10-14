#!/bin/bash

# 🚀 Exhibition Curator - Production Deployment Setup Script
# This script helps you prepare for production deployment

echo "🎨 Exhibition Curator - Production Setup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "be/package.json" ] || [ ! -f "curator-fe/package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the Exhibition_Curator root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Pre-deployment Checklist${NC}"
echo "=============================="

# Backend checks
echo -e "${YELLOW}Backend Checks:${NC}"

# Check if TypeScript builds successfully
echo -n "🔨 Building backend TypeScript... "
cd be
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Success${NC}"
else
    echo -e "${RED}❌ Failed - Fix TypeScript errors before deploying${NC}"
    cd ..
    exit 1
fi

# Check for required environment template
if [ -f ".env.production.template" ]; then
    echo -e "📋 Environment template found: ${GREEN}✅${NC}"
else
    echo -e "${RED}❌ .env.production.template not found${NC}"
fi

# Check for Railway config
if [ -f "railway.toml" ]; then
    echo -e "🚂 Railway config found: ${GREEN}✅${NC}"
else
    echo -e "${RED}❌ railway.toml not found${NC}"
fi

cd ..

# Frontend checks
echo -e "${YELLOW}Frontend Checks:${NC}"
echo -n "🔨 Building frontend... "
cd curator-fe
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Success${NC}"
else
    echo -e "${RED}❌ Failed - Fix build errors before deploying${NC}"
    cd ..
    exit 1
fi

# Check for frontend environment template
if [ -f ".env.production.template" ]; then
    echo -e "📋 Environment template found: ${GREEN}✅${NC}"
else
    echo -e "${RED}❌ .env.production.template not found${NC}"
fi

cd ..

echo ""
echo -e "${GREEN}🎉 Ready for Production Deployment!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. 🗄️  Set up MongoDB Atlas cluster (if not already done)"
echo "2. 🌐 Deploy backend to Render (RECOMMENDED):"
echo "   - Sign up at https://render.com"
echo "   - Create Web Service from GitHub repository"
echo "   - Set Root Directory to 'be'"
echo "   - Build Command: 'npm install && npm run build'"
echo "   - Start Command: 'npm start'"
echo "   - Add environment variables from .env.production.template"
echo ""
echo "3. ⚡ Deploy frontend to Vercel:"
echo "   - Sign up at https://vercel.com"
echo "   - Connect your GitHub repository"
echo "   - Deploy from /curator-fe folder"
echo "   - Add NEXT_PUBLIC_API_URL environment variable"
echo ""
echo -e "${YELLOW}📖 Full deployment guide: ./deployment-checklist.md${NC}"

# Generate JWT secret suggestion
echo ""
echo -e "${BLUE}🔐 Security Reminder:${NC}"
echo "Generate a secure JWT secret (copy this):"
echo -e "${GREEN}$(openssl rand -base64 32)${NC}"
echo ""
echo -e "${RED}⚠️  Remember: Never commit .env.production files!${NC}"