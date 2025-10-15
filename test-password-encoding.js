const mongoose = require('mongoose');

// Test different password encoding variations
const baseUri = 'mongodb+srv://t3stus3r:PASSWORD@exhibitioncurator.6c3lcn8.mongodb.net/exhibition_curator?retryWrites=true&w=majority&appName=ExhibitionCurator';

const passwordVariations = [
  'DtCZH%23Yae664ZsA',           // Current (# as %23)
  'DtCZH#Yae664ZsA',            // Raw # character
  'DtCZH%2523Yae664ZsA',        // Double-encoded %23
  encodeURIComponent('DtCZH#Yae664ZsA')  // JavaScript encoding
];

async function testPasswordVariations() {
  console.log('🔍 Testing different password encodings...\n');
  
  for (let i = 0; i < passwordVariations.length; i++) {
    const password = passwordVariations[i];
    const uri = baseUri.replace('PASSWORD', password);
    
    console.log(`🧪 Test ${i + 1}: Password encoding "${password}"`);
    
    try {
      await mongoose.connect(uri, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
      });
      
      console.log(`✅ SUCCESS with password: ${password}`);
      await mongoose.disconnect();
      break;
      
    } catch (error) {
      console.log(`❌ FAILED with password: ${password} (Error: ${error.message})`);
      try { await mongoose.disconnect(); } catch (e) {}
    }
    
    console.log('');
  }
  
  console.log('🔚 Password encoding test completed');
  process.exit(0);
}

testPasswordVariations();