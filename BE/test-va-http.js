// Simple HTTP test for V&A integration
const axios = require('axios');

async function testVAHTTPIntegration() {
  console.log('🎨 Testing V&A Museum HTTP Integration\n');
  
  try {
    // Test 1: Simple V&A search
    console.log('1. Testing V&A search via HTTP...');
    const response = await axios.get('http://localhost:9090/api/artworks/search', {
      params: {
        q: 'ceramic',
        source: 'va',
        limit: 3
      }
    });
    
    console.log('Status:', response.status);
    console.log('Total results:', response.data.total);
    console.log('Artworks returned:', response.data.artworks.length);
    
    if (response.data.artworks.length > 0) {
      console.log('First artwork:', {
        id: response.data.artworks[0].id,
        title: response.data.artworks[0].title,
        artist: response.data.artworks[0].artist,
        source: response.data.artworks[0].source
      });
    }
    
    console.log('✅ V&A HTTP integration test passed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else {
      console.error('Server may not be running on http://localhost:9090');
    }
  }
}

testVAHTTPIntegration();