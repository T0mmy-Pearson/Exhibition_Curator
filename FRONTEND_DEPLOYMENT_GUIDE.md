# Frontend Production Deployment Guide

## Prerequisites
- Backend successfully deployed to Render
- Backend URL available (e.g., https://exhibition-curator-api.onrender.com)

## Production Environment Setup

1. **Create `.env.production` file in the `curator-fe/` directory:**
```bash
# Backend API URL - Update with your actual Render service URL
NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com

# Production environment identifier
NODE_ENV=production
```

## Vercel Deployment Steps

### 1. Prepare Repository
- Ensure your main branch includes the latest frontend changes
- Frontend should be in the `curator-fe/` directory

### 2. Vercel Configuration
- **Framework Preset**: Next.js
- **Root Directory**: `curator-fe`
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install`

### 3. Environment Variables
In Vercel dashboard, add these environment variables:
- `NEXT_PUBLIC_API_URL`: Your Render backend URL
- `NODE_ENV`: `production`

### 4. Domain Configuration
- Vercel will provide a default domain: `https://your-app.vercel.app`
- Configure custom domain if needed

## Post-Deployment Testing

### Test these key features:
1. **User Authentication**
   - Registration and login
   - JWT token handling

2. **Artwork Search**
   - Museum API integration
   - Search functionality

3. **User Profile**
   - Profile display and editing
   - Avatar upload (if implemented)

4. **Exhibitions**
   - Create, view, edit exhibitions
   - Add/remove artworks

5. **Favorites**
   - Add/remove artwork favorites
   - View favorites list

## Troubleshooting

### Common Issues:
- **API calls failing**: Check NEXT_PUBLIC_API_URL is correct
- **CORS errors**: Verify backend CORS configuration includes Vercel domain
- **Build failures**: Ensure all dependencies are in package.json

### Backend CORS Update
After deployment, you may need to update your backend's CORS configuration to include the Vercel domain:
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app' // Add Vercel domain
  ]
}));
```