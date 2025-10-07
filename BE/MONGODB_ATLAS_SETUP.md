# MongoDB Atlas Setup Guide

## 🚀 Quick MongoDB Atlas Setup for Exhibition Curator

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/atlas
2. Sign up for a free account
3. Create a new project called "Exhibition Curator"

### Step 2: Create a Free Cluster
1. Click "Build a Database"
2. Choose **FREE** tier (M0 Sandbox)
3. Select a cloud provider and region (closest to you)
4. Name your cluster (e.g., "exhibition-curator-dev")
5. Click "Create Cluster"

### Step 3: Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `exhibition_curator_dev`
5. Password: Generate a secure password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
   - Note: In production, you'd restrict this to specific IPs
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string - it will look like:
   ```
   mongodb+srv://exhibition_curator_dev:<password>@exhibition-curator-dev.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update Your .env File
Replace the current MONGODB_URI in your `.env` file:

```bash
# OLD (local MongoDB)
MONGODB_URI=mongodb://localhost:27017/exhibition_curator

# NEW (MongoDB Atlas)
MONGODB_URI=mongodb+srv://exhibition_curator_dev:YOUR_PASSWORD@exhibition-curator-dev.xxxxx.mongodb.net/exhibition_curator?retryWrites=true&w=majority
```

**Important Notes:**
- Replace `YOUR_PASSWORD` with the actual password you created
- Replace `xxxxx` with your actual cluster identifier
- Add the database name `exhibition_curator` at the end of the path

### Step 7: Test Connection
After updating your .env file, restart your server and check the console logs for:
```
✅ MongoDB connected successfully to development database
```

### Alternative: Use This Pre-configured Connection String
If you want to use a shared development database I can set up:

```bash
MONGODB_URI=mongodb+srv://dev_user:devPassword123@exhibition-curator.xxxxx.mongodb.net/exhibition_curator_dev?retryWrites=true&w=majority
```

## 🔧 Quick Test Commands

After setting up the database, test with:

```bash
# Restart the server
npm run dev

# Check database connection in logs
# Should see: "✅ MongoDB connected successfully to development database"

# Test the auth system (should work)
node test-auth-system.js

# Test exhibitions (should now work!)
node test-exhibition-controller.js
```

## 📋 Benefits of MongoDB Atlas

1. **No local setup required** - works immediately
2. **Always available** - accessible from anywhere
3. **Free tier** - 512MB storage, perfect for development
4. **Automatic backups** - data safety
5. **Monitoring** - built-in performance metrics
6. **Easy scaling** - upgrade when needed

## 🚨 Common Issues & Solutions

**Issue**: "MongoServerError: bad auth"
**Solution**: Double-check username/password in connection string

**Issue**: "MongooseTimeoutError" 
**Solution**: Check network access settings (allow 0.0.0.0/0)

**Issue**: "Cannot connect to database"
**Solution**: Verify connection string format and database name

---

**Next Steps**: Once you have MongoDB Atlas set up, update your .env file with the new connection string and we can continue testing the Exhibition Controller!