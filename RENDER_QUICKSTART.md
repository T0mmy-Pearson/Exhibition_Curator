# 🚀 Quick Start: Deploy to Render

## Step-by-Step Render Deployment

### Prerequisites
✅ MongoDB Atlas cluster set up  
✅ GitHub repository ready  
✅ Code pushed to `main` branch

### 1. Backend to Render (5 minutes)

1. **Go to [render.com](https://render.com)** → Sign up with GitHub
2. **New Web Service** → Connect `Exhibition_Curator` repo
3. **Configure Service:**
   ```
   Name: exhibition-curator-backend
   Root Directory: be
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Environment Variables** (click "Advanced"):
   ```
   NODE_ENV = production
   PORT = 10000
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/exhibition-curator
   JWT_SECRET = (generate 32+ character secure string)
   CORS_ORIGIN = https://your-frontend-app.vercel.app
   ```

5. **Create Service** → Wait for deployment ✅

### 2. Frontend to Vercel (3 minutes)

1. **Go to [vercel.com](https://vercel.com)** → Sign up with GitHub
2. **Import Project** → Select `Exhibition_Curator` repo
3. **Configure:**
   ```
   Framework: Next.js
   Root Directory: curator-fe
   Build Command: npm run build
   Output Directory: .next
   ```

4. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL = https://your-backend-name.onrender.com
   ```

5. **Deploy** → Get your live URL ✅

### 3. Update CORS (1 minute)

1. Copy your Vercel frontend URL
2. Go back to Render → Your backend service → Environment
3. Update `CORS_ORIGIN` with your actual Vercel URL
4. Redeploy backend

### 🎉 You're Live!

- **Backend**: `https://your-backend.onrender.com`
- **Frontend**: `https://your-app.vercel.app`

### Quick Test Commands

```bash
# Test backend health
curl https://your-backend.onrender.com/api/

# Test user registration
curl -X POST https://your-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"test123"}'
```

### 🔧 Common Issues & Solutions

**Issue: "Service Unavailable"**
- Solution: Check Render logs, verify environment variables

**Issue: "CORS Error"**  
- Solution: Update CORS_ORIGIN with exact frontend URL

**Issue: "Database Connection Failed"**
- Solution: Verify MONGODB_URI and MongoDB Atlas network settings

**Issue: "JWT Error"**
- Solution: Ensure JWT_SECRET is set and 32+ characters

### 💡 Pro Tips

1. **Free Tier Sleep**: Render free services sleep after 15min inactivity
2. **Cold Starts**: First request after sleep takes ~30 seconds  
3. **Logs**: Use Render dashboard for real-time debugging
4. **Auto Deploy**: Push to main branch = automatic deployment

### 📱 Mobile Testing

Test on your phone:
- Frontend should work on mobile
- API calls should work from any device
- Authentication should persist properly

### 🔄 Development Workflow

```bash
# Make changes locally
git add .
git commit -m "feature: new functionality"
git push origin main

# Automatic deployments:
# ✅ Render rebuilds backend
# ✅ Vercel rebuilds frontend
```

That's it! Your Exhibition Curator is now live in production! 🎨✨