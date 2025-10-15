# Database Access Guide

## Current Database Configuration
- **Local MongoDB**: `mongodb://localhost:27017/exhibition_curator`
- **Test Database**: `mongodb://localhost:27017/exhibition_curator_test`

## 1. MongoDB Compass (Visual GUI) - RECOMMENDED

### Installation
```bash
# Download from: https://www.mongodb.com/products/compass
# Or install via Homebrew:
brew install --cask mongodb-compass
```

### Connection
1. Open MongoDB Compass
2. Use connection string: `mongodb://localhost:27017/exhibition_curator`
3. Click "Connect"
4. Navigate to `exhibition_curator` database

### What You'll See
- **users** collection with your user accounts, exhibitions, and favorites
- **Other collections** as you add more data

## 2. MongoDB Shell (Command Line)

### Connect to Database
```bash
# Connect to your exhibition curator database
mongosh mongodb://localhost:27017/exhibition_curator
```

### Useful Commands
```javascript
// Show all databases
show dbs

// Use your database
use exhibition_curator

// Show collections
show collections

// View all users
db.users.find().pretty()

// Count users
db.users.countDocuments()

// Find specific user by email
db.users.findOne({email: "test@example.com"})

// View user with exhibitions and favorites
db.users.findOne(
  {email: "test@example.com"}, 
  {password: 0}  // Exclude password field
)

// Exit
exit
```

## 3. Postman Integration

Postman can't directly connect to MongoDB, but you can use it to test your API endpoints that interact with the database:

### Test API Endpoints
```
Base URL: http://localhost:9090/api

Authentication:
POST http://localhost:9090/api/auth/register
POST http://localhost:9090/api/auth/login

User Data:
GET http://localhost:9090/api/auth/me
Headers: Authorization: Bearer YOUR_JWT_TOKEN

Favorites:
GET http://localhost:9090/api/favorites
Headers: Authorization: Bearer YOUR_JWT_TOKEN
```

## 4. VS Code MongoDB Extension

Install the MongoDB extension for VS Code:
1. Open VS Code Extensions (Cmd+Shift+X)
2. Search for "MongoDB for VS Code"
3. Install the official MongoDB extension
4. Connect using: `mongodb://localhost:27017/exhibition_curator`

## 5. Quick Database Inspection Script

Run this to see your current data:
```bash
# From the be/ directory
node -e "
const { MongoClient } = require('mongodb');
async function inspect() {
  const client = new MongoClient('mongodb://localhost:27017/exhibition_curator');
  await client.connect();
  const db = client.db();
  const collections = await db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));
  
  if (collections.find(c => c.name === 'users')) {
    const userCount = await db.collection('users').countDocuments();
    console.log('User count:', userCount);
    
    const sampleUser = await db.collection('users').findOne({}, {projection: {password: 0}});
    console.log('Sample user:', JSON.stringify(sampleUser, null, 2));
  }
  
  await client.close();
}
inspect().catch(console.error);
"
```

## 6. Database Status Check

Check if MongoDB is running:
```bash
# Check MongoDB service status
brew services list | grep mongodb

# Check if database is accessible
mongosh --eval "db.adminCommand('ping')" mongodb://localhost:27017/exhibition_curator
```

## Recommended Workflow

1. **Development**: Use MongoDB Compass for visual exploration
2. **Testing**: Use your API test scripts (`npm run test-auth`)
3. **Debugging**: Use mongosh for quick queries
4. **API Testing**: Use Postman to test your endpoints

## Your Current Database Structure

Based on your User model, your documents look like this:
```javascript
{
  "_id": ObjectId("..."),
  "username": "testuser",
  "email": "test@example.com",
  "password": "hashed_password",
  "firstName": "Test",
  "lastName": "User",
  "exhibitions": [
    {
      "_id": ObjectId("..."),
      "title": "My Exhibition",
      "artworks": [
        {
          "artworkId": "met:12345",
          "title": "The Starry Night",
          "artist": "Vincent van Gogh",
          // ... more artwork fields
        }
      ]
    }
  ],
  "favoriteArtworks": [
    {
      "artworkId": "met:67890",
      "title": "The Mona Lisa",
      // ... more artwork fields
    }
  ],
  "createdAt": "2025-09-23T...",
  "updatedAt": "2025-09-23T..."
}
```