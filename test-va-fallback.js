/**
 * Test script for V&A Museum API as fallback
 * Run with: node test-va-fallback.js
 */

require('dotenv').config();
const { VAMuseumService } = require('./dist/services/vaMuseum');

async function testVAMuseum() {
  console.log('🏛️  Testing V&A Museum API as fallback...\n');
  
  const vaService = VAMuseumService.getInstance();
  
  try {
    console.log('🔍 Testing V&A search functionality...');
    const searchResult = await vaService.searchArtworks({
      q: 'monet',
      images: 1 // Only items with images
    });
    
    console.log(`✅ V&A Search successful: Found ${searchResult.info.record_count} results`);
    
    if (searchResult.records && searchResult.records.length > 0) {
      console.log('\n🖼️  Testing V&A artwork details...');
      const testRecords = searchResult.records.slice(0, 3); // Test with 3 artworks
      
      for (let i = 0; i < testRecords.length; i++) {
        const record = testRecords[i];
        console.log(`${i + 1}. ${record._primaryTitle || 'Untitled'} by ${record._primaryMaker?.name || 'Unknown'}`);
        console.log(`   System Number: ${record.systemNumber}`);
        console.log(`   Date: ${record._primaryDate || 'Unknown'}`);
        console.log(`   Image: ${record._primaryImageId ? 'Yes' : 'No'}`);
      }
    }
    
    console.log('\n🎨 Testing V&A standardized search...');
    const standardizedResults = await vaService.searchStandardizedArtworks({
      q: 'monet',
      limit: 5
    });
    
    console.log(`✅ V&A Standardized search successful: ${standardizedResults.length} artworks retrieved`);
    standardizedResults.forEach((artwork, index) => {
      console.log(`  ${index + 1}. ${artwork.title} by ${artwork.artist} (${artwork.source})`);
      console.log(`      ${artwork.imageUrl ? '🖼️ Has image' : '📝 No image'}`);
    });
    
  } catch (error) {
    console.error('❌ V&A Test failed:', error.message);
  }
}

// Run the test
testVAMuseum()
  .then(() => {
    console.log('\n✅ V&A Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ V&A Test failed with error:', error);
    process.exit(1);
  });