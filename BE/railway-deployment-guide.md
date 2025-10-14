# Railway Deployment Guide for Exhibition Curator Backend

## 🚂 Railway Deployment Steps

### 1. Prepare Your Backend for Production

First, let's create the necessary production configuration files.

### 2. Create Production Environment Variables

Create a `.env.production` file (don't commit this):

```bash
# MongoDB Atlas Connection
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT Configuration  
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars

# Server Configuration
PORT=3000
NODE_ENV=production

# CORS Origins (your frontend URL)
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# API Configuration
API_BASE_URL=https://your-backend.railway.app
```

### 3. Update package.json for Production

Add these scripts to your `be/package.json`:

```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "dev": "ts-node src/server.ts",
    "railway:build": "npm run build",
    "railway:start": "npm start"
  }
}
```

### 4. Create Railway Configuration

Create `railway.toml` in your `/be` folder:

```toml
[build]
builder = "nixpacks"
buildCommand = "npm run railway:build"

[deploy]
startCommand = "npm run railway:start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
```

### 5. Railway Deployment Process

#### Step 1: Sign up for Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Connect your GitHub repository

#### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `Exhibition_Curator` repository
4. Select the `/be` folder as the root directory

#### Step 3: Configure Environment Variables
In Railway dashboard:
1. Go to your project → Variables tab
2. Add all your environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `CORS_ORIGIN`

#### Step 4: Configure Build Settings
1. Go to Settings → Build
2. Set Root Directory: `/be`
3. Set Build Command: `npm run railway:build`
4. Set Start Command: `npm run railway:start`

#### Step 5: Deploy
1. Push your changes to GitHub
2. Railway will automatically build and deploy
3. Your API will be available at: `https://your-app-name.railway.app`

### 6. Update Frontend Configuration

Update your frontend to use the production API URL:

Create `curator-fe/.env.production`:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-name.railway.app
```

### 7. Test Your Deployment

Test these endpoints:
- `GET https://your-backend.railway.app/api/` (health check)
- `POST https://your-backend.railway.app/api/auth/register`
- `POST https://your-backend.railway.app/api/auth/login`

## 🔧 Alternative: Render Deployment

If you prefer Render:

1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Create "Web Service"
4. Configure:
   - Root Directory: `/be`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variables in Render dashboard

## 🌍 Frontend Deployment Options

For your Next.js frontend, I recommend:

### Vercel (Best for Next.js)
- Built by Next.js creators
- Automatic deployments from Git
- Excellent performance and CDN
- Free tier available

### Netlify
- Great for static sites and JAMstack
- Automatic deployments
- Good free tier

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas database is accessible from anywhere (0.0.0.0/0)
- [ ] Environment variables are configured
- [ ] CORS is configured for production domains
- [ ] JWT secret is secure (32+ characters)
- [ ] Error handling is production-ready
- [ ] Logging is configured
- [ ] Health check endpoint exists

## 🚨 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **CORS**: Restrict to your frontend domain only
3. **MongoDB**: Use MongoDB Atlas IP whitelist if possible
4. **JWT Secret**: Use a cryptographically secure random string
5. **Rate Limiting**: Consider adding rate limiting middleware

## 🔄 Continuous Deployment

Both Railway and Render support automatic deployments:
- Push to `main` branch → Automatic deployment
- Environment variables managed in dashboard
- Build logs and deployment status visible
- Easy rollback to previous versions

Would you like me to help you set up the deployment files and configuration?