# 🚀 Exhibition Curator - Render Deployment Steps

## Phase 1: Backend Deployment to Render

### Step 1: Sign Up & Connect Repository
1. **Go to [render.com](https://render.com)**
2. **Click "Get Started"** → Sign up with GitHub
3. **Authorize Render** to access your repositories
4. **Find "Exhibition_Curator"** repository in the list

### Step 2: Create Web Service
1. **Click "New +"** → **"Web Service"**
2. **Connect Repository**: Select `Exhibition_Curator`
3. **Configure Service**:
   ```
   Name: exhibition-curator-backend
   Root Directory: be
   Environment: Node
   Region: Oregon (US West) or closest to you
   Branch: main
   ```

### Step 3: Configure Build & Deploy
```
Build Command: npm install && npm run build
Start Command: npm start
```

### Step 4: Add Environment Variables
In the "Environment Variables" section, add these **exactly**:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | `mongodb+srv://t3stus3r:testpass123@exhibitioncurator.6c3lcn8.mongodb.net/exhibition_curator?retryWrites=true&w=majority&appName=ExhibitionCurator` |
| `JWT_SECRET` | `VT9K9Au6h/OgOp6AYGVICkAI+QnABf4Ii1okvbjMzFY=` |
| `CORS_ORIGIN` | `https://exhibition-curator-frontend.vercel.app` |
| `MET_MUSEUM_API_URL` | `https://collectionapi.metmuseum.org/public/collection/v1` |
| `VA_MUSEUM_API_URL` | `https://api.vam.ac.uk/v2` |

### Step 5: Deploy Backend
1. **Click "Create Web Service"**
2. **Wait for deployment** (5-10 minutes)
3. **Copy your backend URL** (something like `https://exhibition-curator-backend.onrender.com`)

### ✅ Verify Backend Deployment
Test your backend URL:
```bash
curl https://your-backend-url.onrender.com/api/
```
Should return: `{"message": "Exhibition Curator API", ...}`

---

## Phase 2: Frontend Deployment to Vercel

### Step 1: Create Production Environment File
1. **In your local project**, create `curator-fe/.env.production`:
```bash
# Replace with your actual Render backend URL
NEXT_PUBLIC_API_URL=https://exhibition-curator-backend.onrender.com
```

### Step 2: Commit and Push
```bash
cd /Users/t.person/Northcoders/Exhibition_Curator
git add .
git commit -m "feat: add production environment configuration for Render deployment"
git push origin main
```

### Step 3: Deploy to Vercel
1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up with GitHub**
3. **Click "Add New..."** → **"Project"**
4. **Import** your `Exhibition_Curator` repository
5. **Configure**:
   ```
   Framework Preset: Next.js
   Root Directory: curator-fe
   Build Command: npm run build (default)
   Output Directory: .next (default)
   Install Command: npm install (default)
   ```

### Step 4: Add Environment Variable
1. **Before deploying**, click **"Environment Variables"**
2. **Add**:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-actual-render-backend-url.onrender.com`
3. **Click "Deploy"**

### Step 5: Update CORS Settings
1. **Copy your Vercel frontend URL** (e.g., `https://exhibition-curator-frontend.vercel.app`)
2. **Go back to Render** → Your backend service → **Environment**
3. **Update `CORS_ORIGIN`** with your actual Vercel URL
4. **Redeploy** your backend service

---

## Phase 3: Testing & Verification

### Test Backend Health
```bash
curl https://your-backend.onrender.com/api/
```

### Test User Registration
```bash
curl -X POST https://your-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'
```

### Test Frontend
1. **Visit your Vercel URL**
2. **Test registration/login**
3. **Search for artworks**
4. **Test favorites functionality**
5. **Check profile page**

---

## 🎯 Your URLs

After deployment, you'll have:
- **Backend API**: `https://exhibition-curator-backend.onrender.com`
- **Frontend App**: `https://exhibition-curator-frontend.vercel.app`
- **Database**: MongoDB Atlas (already configured)

---

## 🔧 Troubleshooting

### Common Issues:

**"Service Unavailable"**
- Check Render logs in dashboard
- Verify environment variables are set correctly
- Ensure MongoDB URI is accessible

**"CORS Error"** 
- Update `CORS_ORIGIN` with exact Vercel URL
- Redeploy backend after CORS change

**"Build Failed"**
- Check if TypeScript compiles locally: `npm run build`
- Verify all dependencies in package.json

**"Database Connection Failed"**
- Test MongoDB URI locally
- Check MongoDB Atlas network access settings

### Quick Fixes:
```bash
# Test backend locally with production settings
cd be && NODE_ENV=production npm start

# Test frontend build locally  
cd curator-fe && npm run build
```

---

## 🎉 Success!

Once everything is deployed and working:
1. **Share your live app** with friends and portfolio reviewers
2. **Continue developing** - pushes to main auto-deploy
3. **Monitor usage** in Render and Vercel dashboards
4. **Consider custom domains** for professional presentation

Your Exhibition Curator is now live in production! 🎨✨