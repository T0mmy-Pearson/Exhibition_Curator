# 🚀 Production Database Setup - Complete Guide

## ✅ What We've Set Up

### 📁 Environment Configuration Files
- **`.env`** - Development environment (local MongoDB)
- **`.env.production`** - Production environment (MongoDB Atlas)
- **`switch-env.sh`** - Environment switcher utility
- **`setup-production.sh`** - Production setup automation

### 🛠️ Enhanced Scripts
- **`npm run start:prod`** - Start in production mode
- **`npm run build:prod`** - Build for production
- **`npm run deploy`** - Build and deploy
- **`npm run seed:prod`** - Seed production database

### 🔧 Database Connection Improvements
- Environment-specific configuration loading
- Enhanced connection options for production
- Better error handling and logging
- Connection pooling optimization

## 🎯 Next Steps: Setting Up MongoDB Atlas

### 1. Create MongoDB Atlas Account
1. Visit [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Sign up for a free account
3. Create a new project: "Exhibition-Curator"

### 2. Create a Free Cluster
1. Click "Build a Database"
2. Choose **M0 Sandbox** (FREE tier)
3. Select your preferred cloud provider and region
4. Name your cluster: `exhibition-curator-prod`

### 3. Configure Database User
1. Go to **Database Access**
2. Add new database user
3. Choose **Password** authentication
4. Create username/password (save these!)
5. Grant "Read and write to any database"

### 4. Configure Network Access
1. Go to **Network Access**
2. Add IP address
3. For development: "Allow access from anywhere" (0.0.0.0/0)
4. For production: Add specific server IPs

### 5. Get Connection String
1. Go to **Database** → **Connect**
2. Choose "Connect your application"
3. Select **Node.js** driver
4. Copy the connection string

### 6. Update Production Environment
Edit `.env.production`:
```bash
# Replace with your actual Atlas connection string
MONGODB_URI=mongodb+srv://your-username:your-password@exhibition-curator-prod.xxxxx.mongodb.net/exhibition_curator_prod?retryWrites=true&w=majority

# Generate a secure JWT secret (32+ characters)
JWT_SECRET=your-super-secure-production-jwt-secret-here-make-it-very-long-and-random

# Your frontend domain (when deployed)
CORS_ORIGIN=https://your-frontend-domain.com
```

## 🚀 Quick Setup Commands

### Environment Management
```bash
# Check current environment
./switch-env.sh status

# Switch to development
./switch-env.sh dev

# Switch to production
./switch-env.sh prod

# View help
./switch-env.sh help
```

### Production Deployment
```bash
# 1. Set up production environment
./setup-production.sh

# 2. Build for production
npm run build:prod

# 3. Start production server
npm run start:prod

# OR combined deploy command
npm run deploy
```

### Development Commands
```bash
# Start development server
npm run dev

# Start with built files (development)
npm run start:dev

# Run tests
npm test

# Seed development database
npm run seed
```

## 🔍 Environment Status Check

Current environment status:
- **Development**: Local MongoDB at `localhost:27017`
- **Production**: MongoDB Atlas (when configured)
- **Test**: Local test database

## 📊 Database Collections

The application will automatically create these collections:

| Collection | Purpose | Environment |
|-----------|---------|-------------|
| `users` | User accounts and profiles | All |
| `exhibitions` | User-created exhibitions | All |
| `artworks` | Cached artwork data | All |
| `favorites` | User favorite artworks | All |

## 🔐 Security Features

### Development
- Local MongoDB (no authentication required)
- Relaxed CORS settings
- Development JWT secret

### Production
- MongoDB Atlas with authentication
- Restricted CORS origins
- Secure JWT secret
- Connection pooling
- SSL/TLS encryption (automatic with Atlas)

## 🏗️ Architecture Overview

```
Frontend (Next.js) → Backend API (Express) → Database (MongoDB)
                                          ↗ Development: Local MongoDB
                                          ↘ Production: MongoDB Atlas
```

## 📈 Monitoring & Maintenance

### MongoDB Atlas Dashboard
- Real-time performance metrics
- Automatic backups
- Alerting capabilities
- Query performance insights

### Application Monitoring
- Connection status logging
- Environment detection
- Error tracking
- Performance metrics

## 🆘 Troubleshooting

### Common Issues
- **"Database connection failed"**: Check MONGODB_URI and network access
- **"Authentication failed"**: Verify username/password in connection string
- **"Connection timeout"**: Check IP whitelist in Atlas
- **"Environment not switching"**: Run `./switch-env.sh status` to debug

### Debug Commands
```bash
# Check environment variables
node -e "console.log(process.env.NODE_ENV, process.env.MONGODB_URI)"

# Test database connection
node -e "require('./dist/db/connection.js').connectDB().then(() => console.log('OK'))"
```

## 🎉 You're Ready!

Your application now supports:
- ✅ **Development** environment with local MongoDB
- ✅ **Production** environment ready for MongoDB Atlas
- ✅ **Easy environment switching**
- ✅ **Production-ready security settings**
- ✅ **Automated setup scripts**

**Next Step**: Configure your MongoDB Atlas cluster and update `.env.production` with your connection string!