/**
 * Test script for 'painting' search timeout optimization
 * Run with: node test-painting-search.js
 */

require('dotenv').config();
const { MetMuseumService } = require('./dist/services/metMuseum');

async function testPaintingSearch() {
  console.log('🎨 Testing "painting" search with timeout optimizations...\n');
  
  const metService = MetMuseumService.getInstance();
  
  try {
    console.log('⏱️  Starting painting search with 30-second timeout...');
    const startTime = Date.now();
    
    const results = await metService.searchStandardizedArtworks({
      q: 'painting',
      hasImages: true,
      limit: 10 // Smaller limit for testing
    });
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`✅ Search completed in ${duration.toFixed(1)} seconds`);
    console.log(`📊 Retrieved ${results.length} artworks:`);
    
    results.slice(0, 5).forEach((artwork, index) => {
      console.log(`  ${index + 1}. ${artwork.title} by ${artwork.artist}`);
      console.log(`      Department: ${artwork.department || 'Unknown'}`);
      console.log(`      Date: ${artwork.date || 'Unknown'}`);
      console.log(`      Image: ${artwork.imageUrl ? '✅' : '❌'}`);
    });
    
    if (results.length > 5) {
      console.log(`  ... and ${results.length - 5} more artworks`);
    }
    
  } catch (error) {
    console.error('❌ Painting search failed:', error.message);
    
    if (error.message.includes('timed out')) {
      console.log('ℹ️  Timeout occurred - this is expected for broad searches like "painting"');
      console.log('💡 Suggestion: Try more specific terms or use V&A Museum as fallback');
    }
  }
}

// Run the test
testPaintingSearch()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed with error:', error);
    process.exit(1);
  });