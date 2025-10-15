// Test script for Metropolitan Museum of Art API
// Documentation: https://metmuseum.github.io/

const axios = require('axios');

const MET_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';

async function testMetMuseumAPI() {
  console.log('🎨 Testing Metropolitan Museum of Art API\n');
  
  try {
    // Test 1: Get all department IDs
    console.log('1. Testing /departments endpoint...');
    const deptResponse = await axios.get(`${MET_BASE_URL}/departments`);
    console.log('Departments found:', deptResponse.data.departments.length);
    console.log('Sample departments:', deptResponse.data.departments.slice(0, 3));
    console.log('');

    // Test 2: Search for artworks
    console.log('2. Testing /search endpoint with query "van gogh"...');
    const searchResponse = await axios.get(`${MET_BASE_URL}/search`, {
      params: {
        q: 'van gogh',
        hasImages: true
      }
    });
    console.log('Total results:', searchResponse.data.total);
    console.log('Object IDs (first 10):', searchResponse.data.objectIDs?.slice(0, 10));
    console.log('');

    // Test 3: Get details for a specific artwork
    if (searchResponse.data.objectIDs && searchResponse.data.objectIDs.length > 0) {
      const objectId = searchResponse.data.objectIDs[0];
      console.log(`3. Testing /objects/${objectId} endpoint...`);
      
      const objectResponse = await axios.get(`${MET_BASE_URL}/objects/${objectId}`);
      const artwork = objectResponse.data;
      
      console.log('Artwork Details:');
      console.log('- Object ID:', artwork.objectID);
      console.log('- Title:', artwork.title);
      console.log('- Artist:', artwork.artistDisplayName);
      console.log('- Culture:', artwork.culture);
      console.log('- Date:', artwork.objectDate);
      console.log('- Medium:', artwork.medium);
      console.log('- Dimensions:', artwork.dimensions);
      console.log('- Department:', artwork.department);
      console.log('- Has Image:', !!artwork.primaryImage);
      console.log('- Primary Image URL:', artwork.primaryImage);
      console.log('- Additional Images:', artwork.additionalImages?.length || 0);
      console.log('- Gallery Number:', artwork.GalleryNumber);
      console.log('- Object URL:', artwork.objectURL);
      console.log('');

      // Show the full structure (truncated)
      console.log('4. Full artwork object keys:');
      console.log(Object.keys(artwork).sort());
      console.log('');
    }

    // Test 4: Search with different parameters
    console.log('5. Testing search with department filter...');
    const paintingSearch = await axios.get(`${MET_BASE_URL}/search`, {
      params: {
        q: 'painting',
        departmentId: 11, // European Paintings
        hasImages: true
      }
    });
    console.log('European Paintings with "painting" query:', paintingSearch.data.total);
    console.log('');

    // Test 5: Search for highlights
    console.log('6. Testing search for museum highlights...');
    const highlightSearch = await axios.get(`${MET_BASE_URL}/search`, {
      params: {
        isHighlight: true,
        hasImages: true
      }
    });
    console.log('Museum highlights with images:', highlightSearch.data.total);
    console.log('Sample highlight IDs:', highlightSearch.data.objectIDs?.slice(0, 5));
    console.log('');

  } catch (error) {
    console.error('❌ API Test Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Test different search scenarios
async function testSearchScenarios() {
  console.log('🔍 Testing different search scenarios...\n');
  
  const searchQueries = [
    { q: 'monet', description: 'Artist search' },
    { q: 'landscape', description: 'Subject search' },
    { q: 'sculpture', description: 'Medium search' },
    { q: 'greek', description: 'Culture search' }
  ];

  for (const query of searchQueries) {
    try {
      console.log(`Testing: ${query.description} - "${query.q}"`);
      const response = await axios.get(`${MET_BASE_URL}/search`, {
        params: {
          q: query.q,
          hasImages: true
        }
      });
      console.log(`Results: ${response.data.total} artworks`);
      console.log('');
    } catch (error) {
      console.error(`Error testing ${query.q}:`, error.message);
    }
  }
}

// Run the tests
async function runAllTests() {
  await testMetMuseumAPI();
  await testSearchScenarios();
  
  console.log('✅ Met Museum API testing complete!');
  console.log('');
  console.log('Key findings:');
  console.log('- Base URL: https://collectionapi.metmuseum.org/public/collection/v1');
  console.log('- No API key required');
  console.log('- Search returns object IDs, then fetch individual objects');
  console.log('- Rich metadata including images, artist info, dimensions');
  console.log('- Support for filtering by department, highlights, images');
}

runAllTests();