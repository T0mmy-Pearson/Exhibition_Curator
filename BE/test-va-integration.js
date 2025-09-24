// Test script specifically for V&A Museum integration
const axios = require('axios');

const API_BASE_URL = 'http://localhost:9090/api';

async function testVAIntegration() {
  console.log('🎨 Testing V&A Museum Integration in Exhibition Curator API\n');
  
  try {
    // Test 1: Search V&A artworks specifically
    console.log('1. Testing V&A specific search...');
    const vaSearchResponse = await axios.get(`${API_BASE_URL}/artworks/search`, {
      params: {
        q: 'ceramic',
        source: 'va',
        limit: 3
      }
    });
    console.log('V&A search results:', vaSearchResponse.data.total);
    console.log('V&A artworks found:', vaSearchResponse.data.artworks.length);
    
    if (vaSearchResponse.data.artworks.length > 0) {
      const firstVAWork = vaSearchResponse.data.artworks[0];
      console.log('First V&A artwork:');
      console.log('- ID:', firstVAWork.id);
      console.log('- Title:', firstVAWork.title);
      console.log('- Artist:', firstVAWork.artist);
      console.log('- Source:', firstVAWork.source);
      console.log('');

      // Test 2: Get specific V&A artwork by ID
      console.log('2. Testing V&A artwork by ID...');
      try {
        const artworkResponse = await axios.get(`${API_BASE_URL}/artworks/${firstVAWork.id}`);
        console.log('Retrieved V&A artwork:', artworkResponse.data.title);
        console.log('- Medium:', artworkResponse.data.medium);
        console.log('- Date:', artworkResponse.data.date);
        console.log('- Image URL:', artworkResponse.data.imageUrl ? 'Available' : 'None');
      } catch (error) {
        console.log('Error retrieving specific artwork:', error.response?.status, error.response?.data?.message);
      }
    }
    console.log('');

    // Test 3: Search all sources including V&A
    console.log('3. Testing search across all sources (including V&A)...');
    const allSearchResponse = await axios.get(`${API_BASE_URL}/artworks/search`, {
      params: {
        q: 'sculpture',
        source: 'all',
        limit: 10
      }
    });
    console.log('All sources search results:', allSearchResponse.data.total);
    
    const sourceBreakdown = {};
    allSearchResponse.data.artworks.forEach(artwork => {
      sourceBreakdown[artwork.source] = (sourceBreakdown[artwork.source] || 0) + 1;
    });
    console.log('Source breakdown:', sourceBreakdown);
    console.log('');

    // Test 4: Get random V&A artworks
    console.log('4. Testing random V&A artworks...');
    try {
      const randomVAResponse = await axios.get(`${API_BASE_URL}/artworks/random`, {
        params: {
          source: 'va',
          count: 5
        }
      });
      console.log('Random V&A artworks:', randomVAResponse.data.count);
      if (randomVAResponse.data.artworks.length > 0) {
        console.log('Sample titles:');
        randomVAResponse.data.artworks.forEach((artwork, index) => {
          console.log(`  ${index + 1}. ${artwork.title} by ${artwork.artist}`);
        });
      }
    } catch (error) {
      console.log('Error getting random V&A artworks:', error.response?.status, error.response?.data?.message);
    }
    console.log('');

    // Test 5: Test mixed sources random artworks
    console.log('5. Testing random artworks from all sources (including V&A)...');
    try {
      const randomAllResponse = await axios.get(`${API_BASE_URL}/artworks/random`, {
        params: {
          source: 'all',
          count: 8
        }
      });
      console.log('Random mixed artworks:', randomAllResponse.data.count);
      
      const randomSourceBreakdown = {};
      randomAllResponse.data.artworks.forEach(artwork => {
        randomSourceBreakdown[artwork.source] = (randomSourceBreakdown[artwork.source] || 0) + 1;
      });
      console.log('Random source breakdown:', randomSourceBreakdown);
    } catch (error) {
      console.log('Error getting random mixed artworks:', error.response?.status, error.response?.data?.message);
    }
    console.log('');

    console.log('✅ V&A Museum integration tests completed!');
    
  } catch (error) {
    console.error('❌ Error during V&A integration testing:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Make sure the server is running on http://localhost:9090');
    }
  }
}

// Run the tests
testVAIntegration();