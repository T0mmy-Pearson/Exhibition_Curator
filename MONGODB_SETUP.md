# MongoDB Setup Guide for Exhibition Curator API

## Option 1: Local MongoDB Installation (Recommended for Development)

### macOS Installation

#### Method 1: Using Homebrew (Recommended)
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB as a service
brew services start mongodb/brew/mongodb-community

# To stop MongoDB later
# brew services stop mongodb/brew/mongodb-community
```

#### Method 2: Manual Installation
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Extract the archive to `/usr/local/mongodb`
3. Add MongoDB to your PATH:
   ```bash
   echo 'export PATH="/usr/local/mongodb/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```
4. Create data directory:
   ```bash
   sudo mkdir -p /usr/local/var/mongodb
   sudo mkdir -p /usr/local/var/log/mongodb
   sudo chown $(whoami) /usr/local/var/mongodb
   sudo chown $(whoami) /usr/local/var/log/mongodb
   ```
5. Start MongoDB:
   ```bash
   mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --fork
   ```

### Verify Installation
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Connect to MongoDB shell
mongosh

# In the MongoDB shell, test basic commands:
show dbs
use exhibition_curator
db.test.insertOne({name: "test"})
db.test.find()
exit
```

### Configure Local MongoDB for the Project

1. **Create the database:**
   ```bash
   mongosh
   ```
   ```javascript
   use exhibition_curator
   use exhibition_curator_test
   exit
   ```

2. **Update your .env file:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   # Environment variables
   NODE_ENV=development
   PORT=9090
   MONGODB_URI=mongodb://localhost:27017/exhibition_curator
   TEST_MONGODB_URI=mongodb://localhost:27017/exhibition_curator_test

   # JWT Secret (generate a secure random string)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Museum API Keys
   MET_MUSEUM_API_URL=https://collectionapi.metmuseum.org/public/collection/v1
   RIJKS_MUSEUM_API_KEY=your-rijks-api-key-here
   RIJKS_MUSEUM_API_URL=https://www.rijksmuseum.nl/api/en/collection

   # Rate limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

---

## Option 2: MongoDB Atlas (Cloud Database)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/atlas
2. Click "Try Free" and create an account
3. Create a new project (e.g., "Exhibition Curator")

### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0 Sandbox)
3. Select a cloud provider and region (choose closest to you)
4. Name your cluster (e.g., "exhibition-curator-cluster")
5. Click "Create Cluster"

### Step 3: Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, click "Add Current IP Address"
4. For broader access, use "0.0.0.0/0" (less secure, only for development)
5. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" driver and version "4.1 or later"
5. Copy the connection string

### Step 6: Update Environment Variables
Update your `.env` file:
```env
# Use your Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/exhibition_curator?retryWrites=true&w=majority
TEST_MONGODB_URI=mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/exhibition_curator_test?retryWrites=true&w=majority
```

Replace:
- `username` with your database username
- `password` with your database password
- `cluster-name.xxxxx` with your actual cluster address

---

## Step 3: Start Your Application

### 1. Install Dependencies (if not done already)
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

### 3. Test the Connection
The application will attempt to connect to MongoDB when it starts. You should see:
```
MongoDB connected successfully
Exhibition Curator API listening on port 9090...
```

### 4. Test API Endpoints
```bash
# Test the root endpoint
curl http://localhost:9090/

# Test user registration
curl -X POST http://localhost:9090/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

---

## Step 4: Museum API Setup

### Metropolitan Museum API
- No API key required
- Already configured in the application
- Base URL: https://collectionapi.metmuseum.org/public/collection/v1

### Rijksmuseum API (Optional)
1. Visit: https://data.rijksmuseum.nl/object-metadata/api/
2. Register for a free API key
3. Add your API key to the `.env` file:
   ```env
   RIJKS_MUSEUM_API_KEY=your-actual-api-key-here
   ```

---

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**
   ```bash
   # Check if MongoDB is running (local)
   brew services list | grep mongodb
   
   # Restart MongoDB
   brew services restart mongodb/brew/mongodb-community
   ```

2. **Port Already in Use**
   ```bash
   # Find what's using port 9090
   lsof -i :9090
   
   # Kill the process or change PORT in .env
   PORT=3000
   ```

3. **Authentication Errors (Atlas)**
   - Double-check username/password in connection string
   - Verify IP address is whitelisted
   - Ensure database user has correct permissions

4. **Network Timeout (Atlas)**
   - Check your internet connection
   - Verify network access settings in Atlas
   - Try adding 0.0.0.0/0 to allowed IP addresses temporarily

### Useful MongoDB Commands:
```bash
# Connect to local MongoDB
mongosh

# Connect to Atlas
mongosh "mongodb+srv://cluster-name.xxxxx.mongodb.net/exhibition_curator" --username your-username

# Show all databases
show dbs

# Switch to your database
use exhibition_curator

# Show collections
show collections

# View users collection
db.users.find().pretty()

# Drop database (be careful!)
db.dropDatabase()
```

---

## Next Steps

Once MongoDB is set up and running:

1. **Test the API endpoints** using the examples above
2. **Create a frontend application** to interact with the API
3. **Add more museum APIs** for richer content
4. **Implement advanced features** like search, filtering, and social sharing
5. **Deploy to production** using services like Heroku, Vercel, or AWS

Your Exhibition Curator API is now ready with a fully embedded MongoDB document structure!