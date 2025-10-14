#!/usr/bin/env node

/**
 * Mock Database Seeding Script
 * Populates the database with rich, diverse mock data for testing
 */

const { seedMockDatabase } = require('./dist/db/seeds/mock-seed');

async function main() {
  console.log('🚀 Exhibition Curator - Mock Data Seeding');
  console.log('==========================================');
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.MONGODB_URI ? 'MongoDB Atlas' : 'Local MongoDB'}`);
  
  try {
    await seedMockDatabase();
    console.log('\n🎉 Success! Your database is now populated with rich mock data.');
    console.log('\n💡 What you can now test:');
    console.log('   🔍 Search exhibitions by theme, title, or tags');
    console.log('   👥 Login with any of the test user accounts');
    console.log('   📚 Browse public exhibitions from different curators');
    console.log('   🎨 Explore artworks from different periods and cultures');
    console.log('   ❤️  Check out user favorites and collections');
    console.log('   🌐 Test sharing functionality with public exhibitions');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

main();