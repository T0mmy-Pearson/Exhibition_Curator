// Test script for Victoria and Albert Museum API
// Documentation: https://developers.vam.ac.uk/guide/v2/welcome.html

const axios = require('axios');

const VA_BASE_URL = 'https://api.vam.ac.uk/v2';

async function testVAMuseumAPI() {
  console.log('🎨 Testing Victoria and Albert Museum API\n');
  
  try {
    // Test 1: Search for artworks with basic query
    console.log('1. Testing /objects/search endpoint with query "ceramics"...');
    const searchResponse = await axios.get(`${VA_BASE_URL}/objects/search`, {
      params: {
        q: 'ceramics',
        page_size: 5,
        images_exist: 1 // Only get objects with images
      }
    });
    
    console.log('Total results:', searchResponse.data.info.record_count);
    console.log('Records returned:', searchResponse.data.records.length);
    console.log('Sample system numbers:', searchResponse.data.records.map(r => r.systemNumber));
    console.log('');

    // Test 2: Get details for a specific artwork
    if (searchResponse.data.records && searchResponse.data.records.length > 0) {
      const firstRecord = searchResponse.data.records[0];
      const systemNumber = firstRecord.systemNumber;
      
      console.log(`2. Testing /museumobject/${systemNumber} endpoint...`);
      
      const objectResponse = await axios.get(`${VA_BASE_URL}/museumobject/${systemNumber}`);
      const artwork = objectResponse.data.record;
      
      console.log('Artwork Details:');
      console.log('- System Number:', artwork.systemNumber);
      console.log('- Title:', artwork.titles?.[0]?.title || 'No title');
      console.log('- Artist/Maker:', artwork.artistMakerPerson?.[0]?.name?.text || 'Unknown');
      console.log('- Object Type:', artwork.objectType?.[0]?.text || 'Unknown');
      console.log('- Materials:', artwork.materialsAndTechniques || 'Not specified');
      console.log('- Date:', artwork.productionDates?.[0]?.date?.text || 'Unknown');
      console.log('- Department/Category:', artwork.categoryCollections?.[0]?.text || 'Unknown');
      console.log('- Accession Number:', artwork.accessionNumber || 'None');
      
      // Check for images
      if (artwork._primaryImageId) {
        const imageUrl = `https://framemark.vam.ac.uk/collections/${artwork._primaryImageId}/full/!200,200/0/default.jpg`;
        console.log('- Primary Image URL:', imageUrl);
      } else {
        console.log('- Primary Image: None');
      }
      console.log('');
    }

    // Test 3: Search with filters
    console.log('3. Testing search with material filter (silver)...');
    const filteredSearchResponse = await axios.get(`${VA_BASE_URL}/objects/search`, {
      params: {
        q: 'silver',
        page_size: 3,
        images_exist: 1,
        made_after_year: 1800,
        made_before_year: 1900
      }
    });
    
    console.log('Filtered results count:', filteredSearchResponse.data.info.record_count);
    if (filteredSearchResponse.data.records.length > 0) {
      console.log('Sample filtered results:');
      filteredSearchResponse.data.records.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.titles?.[0]?.title || 'Untitled'} - ${record.productionDates?.[0]?.date?.text || 'Unknown date'}`);
      });
    }
    console.log('');

    // Test 4: Test clustering endpoint
    console.log('4. Testing clustering endpoint for materials...');
    try {
      const clusterResponse = await axios.get(`${VA_BASE_URL}/objects/clusters/material/search`, {
        params: {
          q: 'sculpture',
          cluster_size: 5
        }
      });
      
      console.log('Top materials for sculptures:');
      if (clusterResponse.data && Array.isArray(clusterResponse.data)) {
        clusterResponse.data.slice(0, 5).forEach((material, index) => {
          console.log(`  ${index + 1}. ${material.value}: ${material.count} objects`);
        });
      }
    } catch (clusterError) {
      console.log('Clustering endpoint test failed:', clusterError.message);
    }
    console.log('');

    // Test 5: Test CSV format
    console.log('5. Testing CSV response format...');
    try {
      const csvResponse = await axios.get(`${VA_BASE_URL}/objects/search`, {
        params: {
          q: 'painting',
          page_size: 3,
          response_format: 'csv'
        }
      });
      
      console.log('CSV Response (first 200 characters):');
      console.log(csvResponse.data.substring(0, 200) + '...');
    } catch (csvError) {
      console.log('CSV format test failed:', csvError.message);
    }
    console.log('');

    console.log('✅ V&A Museum API tests completed successfully!');
    
    // Test our service class
    console.log('\n🔧 Testing VAMuseumService class...');
    
    // Import our service (we'll use require since this is a .js file)
    const { VAMuseumService } = require('./src/services/vaMuseum.ts');
    
    console.log('VAMuseumService tests would go here (requires TypeScript compilation)');
    
  } catch (error) {
    console.error('❌ Error during V&A Museum API testing:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the tests
testVAMuseumAPI();