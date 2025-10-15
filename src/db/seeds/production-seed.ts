import { connectDB } from '../connection';
import { User } from '../../models/User';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

// Generate secure random passwords for production
function generateSecurePassword(): string {
  return randomBytes(16).toString('hex');
}

const productionUsers = [
  {
    username: 'admin_curator',
    email: 'admin@exhibitioncurator.com',
    password: generateSecurePassword(),
    firstName: 'Admin',
    lastName: 'Curator',
    bio: 'Exhibition Curator Administrator',
    role: 'admin',
    exhibitions: [],
    favoriteArtworks: []
  },
  {
    username: 'demo_user',
    email: 'demo@exhibitioncurator.com', 
    password: 'ExhibitionDemo2025!', // Known password for demo purposes
    firstName: 'Demo',
    lastName: 'User',
    bio: 'Demonstration account for Exhibition Curator',
    exhibitions: [
      {
        title: 'Welcome Exhibition',
        description: 'A sample exhibition to showcase the platform',
        theme: 'Demo',
        isPublic: true,
        tags: ['demo', 'sample', 'welcome'],
        artworks: []
      }
    ],
    favoriteArtworks: []
  }
];

async function seedProductionDatabase() {
  try {
    console.log('🌱 Starting PRODUCTION database seeding...');
    console.log('🔐 Environment:', process.env.NODE_ENV);
    
    // Connect to database (will use environment-appropriate connection)
    await connectDB();
    
    // Check if users already exist
    const existingUsers = await User.countDocuments({});
    if (existingUsers > 0) {
      console.log(`⚠️  Found ${existingUsers} existing users in database`);
      console.log('🗑️  Clearing existing users...');
      await User.deleteMany({});
    }
    
    // Insert production users
    console.log('👥 Creating production users...');
    
    const createdUsers = [];
    
    for (const userData of productionUsers) {
      const { password, ...otherData } = userData;
      const hashedPassword = await bcrypt.hash(password, 12); // Higher salt rounds for production
      
      const user = new User({
        ...otherData,
        password: hashedPassword,
        createdAt: new Date(),
        lastLoginAt: null
      });
      
      await user.save();
      console.log(`✅ Created user: ${userData.username}`);
      
      // Store credentials for output (excluding admin password for security)
      if (userData.username !== 'admin_curator') {
        createdUsers.push({
          username: userData.username,
          email: userData.email,
          password: password
        });
      } else {
        createdUsers.push({
          username: userData.username,
          email: userData.email,
          password: '[SECURE_RANDOM - Check logs]'
        });
        console.log(`🔑 Admin password for ${userData.username}: ${password}`);
      }
    }
    
    console.log('🎉 Production database seeded successfully!');
    console.log(`📊 Created ${productionUsers.length} production users`);
    console.log('');
    console.log('📋 User Accounts Created:');
    createdUsers.forEach(user => {
      console.log(`   • ${user.username} (${user.email}) - Password: ${user.password}`);
    });
    console.log('');
    console.log('🔐 SECURITY NOTES:');
    console.log('   • Admin password is randomly generated and shown above');
    console.log('   • Demo password is fixed for demonstration purposes');
    console.log('   • Change passwords after first login in production!');
    
  } catch (error) {
    console.error('❌ Error seeding production database:', error);
    process.exit(1);
  } finally {
    // Close connection
    process.exit(0);
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedProductionDatabase();
}

export { seedProductionDatabase };