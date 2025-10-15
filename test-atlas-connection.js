const mongoose = require('mongoose');

// Load production environment
process.env.NODE_ENV = 'production';
require('dotenv').config({ path: '.env.production' });

const mongoUri = process.env.MONGODB_URI;

console.log('🔍 Testing MongoDB Atlas Connection...');
console.log('📝 Environment:', process.env.NODE_ENV);
console.log('🔗 Connection URI (masked):', mongoUri ? mongoUri.replace(/:[^@]*@/, ':****@') : 'UNDEFINED');

async function testConnection() {
  try {
    console.log('\n🔌 Attempting to connect to MongoDB Atlas...');
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB Atlas connection successful!');
    
    const connection = mongoose.connection;
    console.log(`📊 Database: ${connection.db?.databaseName}`);
    console.log(`🌍 Host: ${connection.host}:${connection.port}`);
    
    // Test a simple operation
    const collections = await connection.db.listCollections().toArray();
    console.log(`📁 Collections found: ${collections.length}`);
    collections.forEach(col => console.log(`  - ${col.name}`));
    
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:');
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 8000) {
      console.error('\n🚨 Atlas Authentication Error (Code 8000)');
      console.error('This usually means:');
      console.error('  1. Username is incorrect');
      console.error('  2. Password is incorrect');
      console.error('  3. User doesn\'t have proper database permissions');
      console.error('  4. IP address not whitelisted in Network Access');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Connection test completed');
    process.exit(0);
  }
}

testConnection();