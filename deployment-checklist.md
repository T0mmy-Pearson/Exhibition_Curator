# 🚀 Production Deployment Checklist

## Pre-Deployment Preparation

### Backend (Render) - RECOMMENDED
- [ ] Create production MongoDB Atlas cluster
- [ ] Configure MongoDB Atlas network access (IP whitelist)
- [ ] Generate secure JWT secret (32+ characters)
- [ ] Create `.env.production` from template
- [ ] Test local production build: `npm run build && npm start`
- [ ] Verify TypeScript compilation: `npm run build`

### Frontend (Vercel/Netlify)  
- [ ] Create `.env.production` with backend URL
- [ ] Test production build: `npm run build`
- [ ] Update API endpoints to use `NEXT_PUBLIC_API_URL`

## Render Deployment Steps (RECOMMENDED)

### 1. Backend Deployment
1. **Sign up for Render**: https://render.com
2. **Connect GitHub**: Link your Exhibition_Curator repository
3. **Create Web Service**: "New +" → "Web Service"
4. **Configure Settings**:
   - Root Directory: `be`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. **Add Environment Variables**:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Secure random string (32+ chars)
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `CORS_ORIGIN`: Your frontend domain
6. **Deploy**: Render will auto-build and deploy
7. **Get URL**: Note your Render app URL (e.g., `https://exhibition-curator-backend.onrender.com`)

## Alternative: Railway Deployment Steps

### 1. Backend Deployment (Alternative)
1. **Sign up for Railway**: https://railway.app
2. **Connect GitHub**: Link your Exhibition_Curator repository
3. **Create New Project**: "Deploy from GitHub repo"
4. **Configure Root Directory**: Set to `/be`
5. **Add Environment Variables**: Same as Render above
6. **Deploy**: Railway will auto-build and deploy
7. **Get URL**: Note your Railway app URL (e.g., `https://exhibition-curator-backend.railway.app`)

### 2. Frontend Deployment (Vercel)
1. **Sign up for Vercel**: https://vercel.com
2. **Import Project**: Connect your GitHub repo
3. **Configure Root Directory**: Set to `/curator-fe`
4. **Add Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Your Railway backend URL
5. **Deploy**: Vercel will build and deploy automatically

## Post-Deployment Testing

### API Health Check
Test these endpoints with your production URL:

```bash
# Health check
curl https://your-backend.railway.app/api/

# User registration
curl -X POST https://your-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'

# User login
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

### Frontend Testing
- [ ] Visit your Vercel URL
- [ ] Test user registration/login
- [ ] Test artwork search
- [ ] Test favoriting functionality
- [ ] Test exhibition creation
- [ ] Test profile page

## Security Checklist

### MongoDB Atlas
- [ ] Database user has minimum required permissions
- [ ] Network access configured (consider IP restrictions)
- [ ] Connection string includes SSL options

### Backend Security
- [ ] JWT secret is cryptographically secure
- [ ] CORS configured for production domains only
- [ ] Environment variables not exposed in client
- [ ] Error messages don't leak sensitive information

### Frontend Security
- [ ] API URLs use HTTPS
- [ ] No sensitive data in client-side code
- [ ] Environment variables properly prefixed with `NEXT_PUBLIC_`

## Monitoring & Maintenance

### Railway Dashboard
- [ ] Monitor deployment logs
- [ ] Set up alerts for errors
- [ ] Monitor resource usage

### Vercel Dashboard  
- [ ] Monitor build/deployment status
- [ ] Check performance analytics
- [ ] Set up domain (optional)

## Troubleshooting Common Issues

### Backend Issues
- **Build fails**: Check TypeScript compilation locally
- **Database connection fails**: Verify MongoDB Atlas connection string
- **CORS errors**: Check CORS_ORIGIN environment variable
- **JWT errors**: Verify JWT_SECRET is set and secure

### Frontend Issues
- **API calls fail**: Check NEXT_PUBLIC_API_URL environment variable
- **Build fails**: Run `npm run build` locally to debug
- **Authentication issues**: Verify backend JWT configuration

## Quick Commands

### Local Testing
```bash
# Test backend production build
cd be && npm run build && NODE_ENV=production npm start

# Test frontend production build  
cd curator-fe && npm run build && npm start
```

### Update Production
```bash
# Backend: Push to main branch (auto-deploys)
git push origin main

# Frontend: Push to main branch (auto-deploys)
git push origin main
```

## 🎉 Success Metrics

Your deployment is successful when:
- [ ] Backend health endpoint returns 200 OK
- [ ] Frontend loads without errors
- [ ] Users can register and log in
- [ ] All core features work end-to-end
- [ ] No console errors in browser
- [ ] Database operations function correctly

## Next Steps After Deployment

1. **Custom Domain**: Configure custom domain for both backend and frontend
2. **SSL Certificate**: Ensure HTTPS is properly configured
3. **Analytics**: Add Google Analytics or similar
4. **Error Monitoring**: Set up Sentry or similar service
5. **Performance Monitoring**: Monitor API response times
6. **Backup Strategy**: Ensure MongoDB Atlas has proper backups
7. **CI/CD Pipeline**: Consider adding automated testing before deployment

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs  
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Next.js Deployment**: https://nextjs.org/docs/deployment