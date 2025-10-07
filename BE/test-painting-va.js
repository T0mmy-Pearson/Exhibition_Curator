/**
 * Test script for 'painting' search using V&A as fallback
 * Run with: node test-painting-va.js
 */

require('dotenv').config();
const { VAMuseumService } = require('./dist/services/vaMuseum');

async function testVAPaintingSearch() {
  console.log('🏛️  Testing "painting" search with V&A Museum...\n');
  
  const vaService = VAMuseumService.getInstance();
  
  try {
    console.log('🔍 Starting V&A painting search...');
    const startTime = Date.now();
    
    const results = await vaService.searchStandardizedArtworks({
      q: 'painting',
      limit: 10
    });
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`✅ V&A search completed in ${duration.toFixed(1)} seconds`);
    console.log(`📊 Retrieved ${results.length} artworks:`);
    
    results.forEach((artwork, index) => {
      console.log(`  ${index + 1}. ${artwork.title} by ${artwork.artist}`);
      console.log(`      Date: ${artwork.date || 'Unknown'}`);
      console.log(`      Medium: ${artwork.medium || 'Unknown'}`);
      console.log(`      Image: ${artwork.imageUrl ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ V&A painting search failed:', error.message);
  }
}

// Run the test
testVAPaintingSearch()
  .then(() => {
    console.log('\n✅ V&A Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ V&A Test failed with error:', error);
    process.exit(1);
  });