# Render Deployment Guide for Exhibition Curator Backend

## 🌐 Render Deployment Steps

### 1. Prepare Your Backend for Production

Your backend is already configured for production deployment with the existing files.

### 2. Create Production Environment Variables

Create a `.env.production` file (don't commit this):

```bash
# MongoDB Atlas Connection
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT Configuration  
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars

# Server Configuration
PORT=10000
NODE_ENV=production

# CORS Origins (your frontend URL)
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# API Configuration
API_BASE_URL=https://your-backend.onrender.com
```

### 3. Create Render Configuration

Create `render.yaml` in your `/be` folder for Infrastructure as Code (optional):

```yaml
services:
  - type: web
    name: exhibition-curator-backend
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
    rootDir: ./be
```

### 4. Render Deployment Process

#### Step 1: Sign up for Render
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Connect your GitHub repository

#### Step 2: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your `Exhibition_Curator` repository
3. Configure the following settings:

**Basic Settings:**
- **Name**: `exhibition-curator-backend`
- **Root Directory**: `be`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`

**Build & Deploy Settings:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

#### Step 3: Configure Environment Variables
In the Render dashboard, add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Your secure JWT secret (32+ chars) |
| `CORS_ORIGIN` | Your frontend domain (e.g., `https://your-app.vercel.app`) |

#### Step 4: Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy
3. Your API will be available at: `https://your-service-name.onrender.com`

## 🔧 Render-Specific Configuration

### Auto-Deploy Settings
- **Auto-Deploy**: Enable for automatic deployments on push to main
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Health Checks
Render automatically monitors your service health. Your app should respond to HTTP requests on the configured port.

### Custom Domain (Optional)
1. Go to Settings → Custom Domains
2. Add your custom domain
3. Configure DNS records as instructed

## 📱 Frontend Deployment (Vercel)

Update your frontend configuration for Render backend:

### Create `.env.production` in curator-fe:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com
```

### Deploy to Vercel:
1. Sign up at [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set Root Directory to `curator-fe`
4. Add environment variable: `NEXT_PUBLIC_API_URL`
5. Deploy

## 🔍 Testing Your Deployment

Test these endpoints with your Render URL:

```bash
# Health check
curl https://your-backend.onrender.com/api/

# User registration
curl -X POST https://your-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'

# User login  
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

## 🚨 Render-Specific Considerations

### Free Tier Limitations
- **Sleep Mode**: Services sleep after 15 minutes of inactivity
- **Cold Starts**: First request after sleep takes longer
- **Build Time**: Limited build minutes per month
- **Bandwidth**: 100GB/month outbound transfer

### Performance Optimization
```javascript
// Add to your server.ts for better cold start handling
const PORT = process.env.PORT || 10000;

// Keep alive ping (optional for free tier)
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    // Self-ping to prevent sleeping (use sparingly on free tier)
    // http.get(`${process.env.API_BASE_URL}/api/health`);
  }, 14 * 60 * 1000); // Every 14 minutes
}
```

### Database Connection Optimization
Your existing MongoDB connection pooling is already optimized for Render.

## 🔐 Security Best Practices for Render

### Environment Variables
- Set all sensitive data in Render dashboard
- Never commit `.env.production` files
- Use Render's built-in environment variable encryption

### HTTPS
- Render provides automatic HTTPS certificates
- All traffic is encrypted by default

### CORS Configuration
```typescript
// Your existing config in be/src/config/index.ts is already correct
corsOrigin: nodeEnv === 'production' 
  ? (process.env.CORS_ORIGIN || 'https://your-frontend-domain.com').split(',')
  : ['http://localhost:3000', 'http://localhost:3001'],
```

## 📊 Monitoring & Logs

### Render Dashboard
- **Logs**: Real-time and historical logs available
- **Metrics**: CPU, memory, and response time monitoring  
- **Events**: Deployment and service events
- **Alerts**: Configure email alerts for service issues

### Log Monitoring
```bash
# View live logs (if you have Render CLI)
render logs -f your-service-name

# Or use the web dashboard logs section
```

## 🔄 Deployment Workflow

### Automatic Deployments
1. Push to `main` branch
2. Render detects changes
3. Runs build command
4. Deploys new version
5. Health check validates deployment

### Manual Deployments
1. Go to Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"
3. Monitor build logs
4. Verify deployment

## 💡 Render vs Railway Comparison

| Feature | Render | Railway |
|---------|--------|---------|
| Free Tier | 750 hours/month | 500 hours/month |
| Cold Starts | Yes (15 min) | No on paid plans |
| Build Time | Limited | Generous |
| Custom Domains | Free HTTPS | Free HTTPS |
| Database | Add-ons available | Built-in PostgreSQL |
| Monitoring | Built-in | Built-in |

## 🚀 Production Checklist for Render

- [ ] MongoDB Atlas cluster configured
- [ ] Environment variables set in Render dashboard
- [ ] Build and start commands configured
- [ ] CORS origin set to frontend domain
- [ ] Health check endpoint working (`/api/`)
- [ ] Custom domain configured (optional)
- [ ] Monitoring and alerts set up
- [ ] Frontend deployed with correct API URL

## 📖 Additional Resources

- **Render Docs**: https://render.com/docs
- **Node.js Guide**: https://render.com/docs/deploy-node-express-app  
- **Environment Variables**: https://render.com/docs/environment-variables
- **Custom Domains**: https://render.com/docs/custom-domains
- **Monitoring**: https://render.com/docs/monitoring-your-service