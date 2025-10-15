# Production Database Setup Guide

## MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Sign up for a free account or log in
3. Create a new project called "Exhibition-Curator"

### 2. Create a Cluster
1. Click "Build a Database"
2. Choose the **FREE** tier (M0 Sandbox)
3. Select a cloud provider and region (choose one close to your users)
4. Name your cluster (e.g., "exhibition-curator-prod")
5. Click "Create Cluster"

### 3. Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password (save these!)
5. Set database user privileges to "Read and write to any database"
6. Click "Add User"

### 4. Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow access from anywhere" (0.0.0.0/0)
4. For production: Add specific IP addresses where your app will run
5. Click "Confirm"

### 5. Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" as driver and version 4.1 or later
5. Copy the connection string

### 6. Update Environment Variables

Replace the placeholders in `.env.production`:

```bash
# Replace with your actual connection string
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.abcde.mongodb.net/exhibition_curator_prod?retryWrites=true&w=majority

# Generate a secure JWT secret (32+ characters)
JWT_SECRET=your-super-secure-jwt-secret-for-production-make-it-very-long-and-random
```

### 7. Database Structure

The application will automatically create the following collections:
- `users` - User accounts and profiles
- `exhibitions` - User-created exhibitions
- `artworks` - Cached artwork data
- `favorites` - User favorite artworks

### 8. Environment-Specific Configuration

**Development (.env):**
```bash
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/exhibition_curator
```

**Production (.env.production):**
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://...your-atlas-connection...
```

### 9. Running in Production Mode

```bash
# Set environment to production
export NODE_ENV=production

# Start the application
npm run start:prod
```

### 10. Security Best Practices

1. **Strong Passwords**: Use complex passwords for database users
2. **IP Whitelisting**: Restrict access to specific IPs in production
3. **Environment Variables**: Never commit real credentials to git
4. **JWT Secret**: Use a long, random string for JWT_SECRET
5. **SSL**: Enable SSL/TLS for database connections (Atlas does this automatically)

### 11. Monitoring and Backup

MongoDB Atlas provides:
- Automatic backups
- Performance monitoring
- Real-time metrics
- Alerting capabilities

Access these through the Atlas dashboard.

### 12. Cost Considerations

- **Free Tier (M0)**: 512 MB storage, shared RAM and vCPU
- **Paid Tiers**: Start from $9/month for dedicated resources
- **Data Transfer**: Free within the same region

### 13. Troubleshooting

Common issues:
- **Connection timeout**: Check network access settings
- **Authentication failed**: Verify username/password
- **Database not found**: Database will be created automatically on first connection
- **IP blocked**: Add your IP to the whitelist

For more detailed setup, visit: https://docs.atlas.mongodb.com/getting-started/