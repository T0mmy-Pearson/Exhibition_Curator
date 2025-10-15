const mongoose = require('mongoose');

// Let's try the exact connection string from Atlas connect dialog
const testUris = [
  // Current format
  'mongodb+srv://t3stus3r:DtCZH%23Yae664ZsA@exhibitioncurator.6c3lcn8.mongodb.net/exhibition_curator?retryWrites=true&w=majority&appName=ExhibitionCurator',
  
  // Without database name
  'mongodb+srv://t3stus3r:DtCZH%23Yae664ZsA@exhibitioncurator.6c3lcn8.mongodb.net/?retryWrites=true&w=majority&appName=ExhibitionCurator',
  
  // Without appName
  'mongodb+srv://t3stus3r:DtCZH%23Yae664ZsA@exhibitioncurator.6c3lcn8.mongodb.net/exhibition_curator?retryWrites=true&w=majority',
  
  // Minimal format
  'mongodb+srv://t3stus3r:DtCZH%23Yae664ZsA@exhibitioncurator.6c3lcn8.mongodb.net/exhibition_curator'
];

async function testConnectionFormats() {
  console.log('🔍 Testing different connection string formats...\n');
  
  for (let i = 0; i < testUris.length; i++) {
    const uri = testUris[i];
    
    console.log(`🧪 Test ${i + 1}:`);
    console.log(`URI: ${uri.replace(/:[^@]*@/, ':****@')}`);
    
    try {
      await mongoose.connect(uri, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
      });
      
      console.log(`✅ SUCCESS!`);
      
      const db = mongoose.connection.db;
      console.log(`📊 Connected to database: ${db.databaseName}`);
      
      await mongoose.disconnect();
      console.log('🔚 Test completed - found working connection!');
      process.exit(0);
      
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      console.log(`   Code: ${error.code || 'N/A'}`);
      try { await mongoose.disconnect(); } catch (e) {}
    }
    
    console.log('');
  }
  
  console.log('🔚 All connection format tests completed - none worked');
  process.exit(1);
}

testConnectionFormats();