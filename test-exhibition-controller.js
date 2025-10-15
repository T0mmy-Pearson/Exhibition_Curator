#!/usr/bin/env node

/**
 * Exhibition Controller Test Script
 * Tests all exhibition CRUD operations and advanced features
 */

const API_BASE = 'http://localhost:9090/api';

// Test user credentials
const testUser = {
  email: 'test.auth@example.com',
  password: 'securepassword123'
};

let authToken = '';
let userId = '';
let testExhibitionId = '';
let shareableLink = '';

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { status: 0, data: { error: error.message }, ok: false };
  }
}

async function loginUser() {
  console.log('🔑 Logging in test user...');
  
  const result = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password
    })
  });
  
  if (result.ok && result.data.token) {
    authToken = result.data.token;
    userId = result.data.user.id;
    console.log('✅ Login successful');
    console.log(`   User ID: ${userId}`);
    return true;
  } else {
    console.log('❌ Login failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testCreateExhibition() {
  console.log('\n🎨 Testing Create Exhibition...');
  
  const exhibitionData = {
    title: 'Test Exhibition - Modern Art Collection',
    description: 'A curated collection of modern artworks for testing purposes',
    theme: 'Modern Art',
    isPublic: false,
    tags: ['modern', 'testing', 'curated'],
    coverImageUrl: 'https://example.com/cover.jpg'
  };
  
  const result = await makeRequest(`${API_BASE}/exhibitions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(exhibitionData)
  });
  
  if (result.ok && result.data.exhibition) {
    testExhibitionId = result.data.exhibition._id;
    console.log('✅ Create exhibition successful');
    console.log(`   Exhibition ID: ${testExhibitionId}`);
    console.log(`   Title: ${result.data.exhibition.title}`);
    console.log(`   Public: ${result.data.exhibition.isPublic}`);
    console.log(`   Tags: ${result.data.exhibition.tags?.join(', ')}`);
    return true;
  } else {
    console.log('❌ Create exhibition failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testGetUserExhibitions() {
  console.log('\n📋 Testing Get User Exhibitions...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (result.ok) {
    console.log('✅ Get user exhibitions successful');
    console.log(`   Total exhibitions: ${result.data.exhibitions?.length || 0}`);
    
    if (result.data.exhibitions?.length > 0) {
      const first = result.data.exhibitions[0];
      console.log(`   First exhibition: ${first.title}`);
      console.log(`   Artworks: ${first.artworks?.length || 0}`);
    }
    return true;
  } else {
    console.log('❌ Get user exhibitions failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testUpdateExhibition() {
  console.log('\n✏️  Testing Update Exhibition...');
  
  const updates = {
    title: 'Updated Test Exhibition - Contemporary Art',
    description: 'Updated description with more details',
    theme: 'Contemporary Art',
    tags: ['contemporary', 'updated', 'testing']
  };
  
  const result = await makeRequest(`${API_BASE}/exhibitions/${testExhibitionId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(updates)
  });
  
  if (result.ok && result.data.exhibition) {
    console.log('✅ Update exhibition successful');
    console.log(`   Updated title: ${result.data.exhibition.title}`);
    console.log(`   Updated theme: ${result.data.exhibition.theme}`);
    console.log(`   Updated tags: ${result.data.exhibition.tags?.join(', ')}`);
    return true;
  } else {
    console.log('❌ Update exhibition failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testAddArtworkToExhibition() {
  console.log('\n🖼️  Testing Add Artwork to Exhibition...');
  
  const artworkData = {
    artworkId: 'met:123456',
    title: 'Test Artwork',
    artist: 'Test Artist',
    date: '2023',
    medium: 'Oil on canvas',
    imageUrl: 'https://example.com/artwork.jpg',
    museumSource: 'met',
    tags: ['painting', 'modern']
  };
  
  const result = await makeRequest(`${API_BASE}/exhibitions/${testExhibitionId}/artworks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ artworkData })
  });
  
  if (result.ok && result.data.exhibition) {
    console.log('✅ Add artwork to exhibition successful');
    console.log(`   Exhibition: ${result.data.exhibition.title}`);
    console.log(`   Artworks count: ${result.data.exhibition.artworks?.length || 0}`);
    
    if (result.data.exhibition.artworks?.length > 0) {
      const artwork = result.data.exhibition.artworks[0];
      console.log(`   Added artwork: ${artwork.title} by ${artwork.artist}`);
    }
    return true;
  } else {
    console.log('❌ Add artwork to exhibition failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testShareExhibition() {
  console.log('\n🔗 Testing Share Exhibition...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions/${testExhibitionId}/share`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (result.ok && result.data.exhibition) {
    shareableLink = result.data.exhibition.shareableLink;
    console.log('✅ Share exhibition successful');
    console.log(`   Exhibition is now public: ${result.data.exhibition.isPublic}`);
    console.log(`   Shareable link: ${shareableLink}`);
    console.log(`   Full URL: ${result.data.shareableUrl}`);
    return true;
  } else {
    console.log('❌ Share exhibition failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testGetSharedExhibition() {
  console.log('\n🌐 Testing Get Shared Exhibition...');
  
  if (!shareableLink) {
    console.log('❌ No shareable link available - skipping test');
    return false;
  }
  
  const result = await makeRequest(`${API_BASE}/exhibitions/shared/${shareableLink}`, {
    method: 'GET'
    // No auth needed for public exhibitions
  });
  
  if (result.ok && result.data.exhibition) {
    console.log('✅ Get shared exhibition successful');
    console.log(`   Title: ${result.data.exhibition.title}`);
    console.log(`   Curator: ${result.data.exhibition.curator?.username}`);
    console.log(`   Artworks: ${result.data.exhibition.artworksCount}`);
    console.log(`   Public: ${result.data.exhibition.isPublic}`);
    return true;
  } else {
    console.log('❌ Get shared exhibition failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testGetPublicExhibitions() {
  console.log('\n🌍 Testing Get Public Exhibitions...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions/public?limit=5&sortBy=createdAt&sortOrder=desc`, {
    method: 'GET'
    // No auth needed
  });
  
  if (result.ok) {
    console.log('✅ Get public exhibitions successful');
    console.log(`   Total found: ${result.data.exhibitions?.length || 0}`);
    console.log(`   Page: ${result.data.pagination?.page}`);
    console.log(`   Limit: ${result.data.pagination?.limit}`);
    
    if (result.data.exhibitions?.length > 0) {
      const first = result.data.exhibitions[0];
      console.log(`   First exhibition: ${first.title}`);
      console.log(`   Curator: ${first.curator?.username}`);
    }
    return true;
  } else {
    console.log('❌ Get public exhibitions failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testSearchExhibitions() {
  console.log('\n🔍 Testing Search Exhibitions...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions/search?q=Test&publicOnly=true&limit=5`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (result.ok) {
    console.log('✅ Search exhibitions successful');
    console.log(`   Query: ${result.data.query}`);
    console.log(`   Results found: ${result.data.exhibitions?.length || 0}`);
    console.log(`   Public only: ${result.data.filters?.publicOnly}`);
    
    if (result.data.exhibitions?.length > 0) {
      const first = result.data.exhibitions[0];
      console.log(`   First result: ${first.title}`);
      console.log(`   Curator: ${first.curator?.username}`);
    }
    return true;
  } else {
    console.log('❌ Search exhibitions failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testGetFeaturedExhibitions() {
  console.log('\n⭐ Testing Get Featured Exhibitions...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions/featured?limit=3`, {
    method: 'GET'
  });
  
  if (result.ok) {
    console.log('✅ Get featured exhibitions successful');
    console.log(`   Featured exhibitions: ${result.data.exhibitions?.length || 0}`);
    console.log(`   Criteria: ${result.data.criteria}`);
    
    if (result.data.exhibitions?.length > 0) {
      const first = result.data.exhibitions[0];
      console.log(`   Featured: ${first.title}`);
      console.log(`   Artworks: ${first.artworksCount}`);
      console.log(`   Reason: ${first.featuredReason}`);
    }
    return true;
  } else {
    console.log('❌ Get featured exhibitions failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testGetTrendingExhibitions() {
  console.log('\n📈 Testing Get Trending Exhibitions...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions/trending?limit=3&days=30`, {
    method: 'GET'
  });
  
  if (result.ok) {
    console.log('✅ Get trending exhibitions successful');
    console.log(`   Trending exhibitions: ${result.data.exhibitions?.length || 0}`);
    console.log(`   Period: ${result.data.period}`);
    console.log(`   Criteria: ${result.data.criteria}`);
    
    if (result.data.exhibitions?.length > 0) {
      const first = result.data.exhibitions[0];
      console.log(`   Trending: ${first.title}`);
      console.log(`   Days since activity: ${first.daysSinceActivity}`);
    }
    return true;
  } else {
    console.log('❌ Get trending exhibitions failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testUnshareExhibition() {
  console.log('\n🔒 Testing Unshare Exhibition...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions/${testExhibitionId}/share`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (result.ok && result.data.exhibition) {
    console.log('✅ Unshare exhibition successful');
    console.log(`   Exhibition is now private: ${!result.data.exhibition.isPublic}`);
    console.log(`   Shareable link: ${result.data.exhibition.shareableLink || 'null'}`);
    return true;
  } else {
    console.log('❌ Unshare exhibition failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testDeleteExhibition() {
  console.log('\n🗑️  Testing Delete Exhibition...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions/${testExhibitionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (result.ok || result.status === 204) {
    console.log('✅ Delete exhibition successful');
    console.log(`   Exhibition ${testExhibitionId} deleted`);
    return true;
  } else {
    console.log('❌ Delete exhibition failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data?.error || result.data?.message || 'Unknown error'}`);
    return false;
  }
}

async function checkServerConnection() {
  console.log('🔌 Checking server connection...');
  
  const result = await makeRequest(`${API_BASE}`);
  
  if (result.ok) {
    console.log('✅ Server is running');
    console.log(`   API: ${result.data.message}`);
    return true;
  } else {
    console.log('❌ Server connection failed');
    console.log('   Make sure the backend server is running on port 9090');
    return false;
  }
}

async function runExhibitionControllerTests() {
  console.log('🚀 Exhibition Curator - Exhibition Controller Tests');
  console.log('================================================');
  
  // Check server connection first
  const serverRunning = await checkServerConnection();
  if (!serverRunning) {
    process.exit(1);
  }
  
  // Login first
  const loginSuccess = await loginUser();
  if (!loginSuccess) {
    console.log('\n⚠️  Cannot proceed without valid authentication');
    process.exit(1);
  }
  
  const results = [];
  
  // Test all exhibition controller functions
  results.push(await testCreateExhibition());
  results.push(await testGetUserExhibitions());
  results.push(await testUpdateExhibition());
  results.push(await testAddArtworkToExhibition());
  results.push(await testShareExhibition());
  results.push(await testGetSharedExhibition());
  results.push(await testGetPublicExhibitions());
  results.push(await testSearchExhibitions());
  results.push(await testGetFeaturedExhibitions());
  results.push(await testGetTrendingExhibitions());
  results.push(await testUnshareExhibition());
  results.push(await testDeleteExhibition());
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=====================');
  const testNames = [
    'Create Exhibition',
    'Get User Exhibitions',
    'Update Exhibition',
    'Add Artwork to Exhibition',
    'Share Exhibition',
    'Get Shared Exhibition',
    'Get Public Exhibitions',
    'Search Exhibitions',
    'Get Featured Exhibitions',
    'Get Trending Exhibitions',
    'Unshare Exhibition',
    'Delete Exhibition'
  ];
  
  let passed = 0;
  results.forEach((result, index) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testNames[index]}`);
    if (result) passed++;
  });
  
  console.log(`\n🎯 Overall: ${passed}/${results.length} tests passed`);
  
  if (passed === results.length) {
    console.log('🎉 All exhibition controller tests passed! The functionality is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the error messages above for details.');
  }
}

// Run the tests
runExhibitionControllerTests().catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
});