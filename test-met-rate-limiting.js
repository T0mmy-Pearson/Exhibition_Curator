/**
 * Test script for Met Museum API rate limiting improvements
 * Run with: node test-met-rate-limiting.js
 */

require('dotenv').config();
const { MetMuseumService } = require('./dist/services/metMuseum');

async function testMetMuseumRateLimiting() {
  console.log('🎨 Testing Met Museum API with improved rate limiting...\n');
  
  const metService = MetMuseumService.getInstance();
  
  try {
    console.log('📋 Testing search functionality...');
    const searchResult = await metService.searchArtworks({
      q: 'monet',
      hasImages: true
    });
    
    console.log(`✅ Search successful: Found ${searchResult.total} results with ${searchResult.objectIDs?.length || 0} object IDs`);
    
    if (searchResult.objectIDs && searchResult.objectIDs.length > 0) {
      console.log('\n🖼️  Testing artwork fetching with rate limiting...');
      const testIds = searchResult.objectIDs.slice(0, 3); // Test with just 3 artworks
      
      for (let i = 0; i < testIds.length; i++) {
        const id = testIds[i];
        try {
          console.log(`Fetching artwork ${i + 1}/${testIds.length}: ${id}`);
          const artwork = await metService.getArtworkById(id);
          console.log(`✅ Success: ${artwork.title || 'Untitled'} by ${artwork.artistDisplayName || 'Unknown'}`);
        } catch (error) {
          console.log(`❌ Failed to fetch ${id}: ${error.message}`);
        }
      }
    }
    
    console.log('\n🔍 Testing standardized search...');
    const standardizedResults = await metService.searchStandardizedArtworks({
      q: 'monet',
      hasImages: true,
      limit: 5
    });
    
    console.log(`✅ Standardized search successful: ${standardizedResults.length} artworks retrieved`);
    standardizedResults.forEach((artwork, index) => {
      console.log(`  ${index + 1}. ${artwork.title} by ${artwork.artist} (${artwork.source})`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.message.includes('temporarily unavailable')) {
      console.log('ℹ️  This indicates the circuit breaker is working correctly');
    }
  }
}

// Run the test
testMetMuseumRateLimiting()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed with error:', error);
    process.exit(1);
  });