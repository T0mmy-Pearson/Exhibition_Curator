#!/usr/bin/env node

/**
 * Comprehensive Exhibition Controller Tests
 * Tests all 12 exhibition controller functions with real database
 */

const API_BASE = 'http://localhost:9090/api';

// Using the seeded user credentials
const testUser = {
  email: 'artlover@example.com',
  password: 'password123'
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
  console.log('🔑 Logging in with seeded user...');
  
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
    console.log(`   User: ${result.data.user.username} (${result.data.user.email})`);
    console.log(`   User ID: ${userId}`);
    return true;
  } else {
    console.log('❌ Login failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

// Test 1: Get User Exhibitions
async function testGetExhibitions() {
  console.log('\n📋 Test 1: Get User Exhibitions...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (result.ok) {
    console.log('✅ Get exhibitions successful');
    console.log(`   Total exhibitions: ${result.data.exhibitions?.length || 0}`);
    return true;
  } else {
    console.log('❌ Get exhibitions failed');
    console.log(`   Status: ${result.status}`);
    return false;
  }
}

// Test 2: Create Exhibition
async function testCreateExhibition() {
  console.log('\n🎨 Test 2: Create Exhibition...');
  
  const exhibitionData = {
    title: 'Test Exhibition - Comprehensive Testing',
    description: 'A comprehensive test exhibition for all controller functions',
    theme: 'Testing',
    isPublic: true,
    tags: ['testing', 'comprehensive', 'automation'],
    coverImageUrl: 'https://example.com/test-cover.jpg'
  };
  
  const result = await makeRequest(`${API_BASE}/exhibitions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(exhibitionData)
  });
  
  if (result.ok && result.data.exhibition) {
    testExhibitionId = result.data.exhibition._id;
    console.log('✅ Create exhibition successful');
    console.log(`   Exhibition ID: ${testExhibitionId}`);
    console.log(`   Title: ${result.data.exhibition.title}`);
    return true;
  } else {
    console.log('❌ Create exhibition failed');
    console.log(`   Status: ${result.status}`);
    return false;
  }
}

// Test 3: Get Exhibition by ID
async function testGetExhibitionById() {
  console.log('\n🔍 Test 3: Get Exhibition by ID...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions/${testExhibitionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (result.ok && result.data.exhibition) {
    console.log('✅ Get exhibition by ID successful');
    console.log(`   Title: ${result.data.exhibition.title}`);
    console.log(`   Theme: ${result.data.exhibition.theme}`);
    return true;
  } else {
    console.log('❌ Get exhibition by ID failed');
    console.log(`   Status: ${result.status}`);
    return false;
  }
}

// Test 4: Update Exhibition
async function testUpdateExhibition() {
  console.log('\n✏️ Test 4: Update Exhibition...');
  
  const updates = {
    description: 'Updated description for comprehensive testing',
    tags: ['testing', 'comprehensive', 'automation', 'updated']
  };
  
  const result = await makeRequest(`${API_BASE}/exhibitions/${testExhibitionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(updates)
  });
  
  if (result.ok && result.data.exhibition) {
    console.log('✅ Update exhibition successful');
    console.log(`   Updated description: ${result.data.exhibition.description}`);
    console.log(`   Updated tags: ${result.data.exhibition.tags?.join(', ')}`);
    return true;
  } else {
    console.log('❌ Update exhibition failed');
    console.log(`   Status: ${result.status}`);
    return false;
  }
}

// Test 5: Add Artwork to Exhibition
async function testAddArtworkToExhibition() {
  console.log('\n🖼️ Test 5: Add Artwork to Exhibition...');
  
  const artworkData = {
    artworkId: 'test-artwork-001',
    title: 'Test Artwork',
    artist: 'Test Artist',
    date: '2024',
    medium: 'Digital',
    imageUrl: 'https://example.com/test-artwork.jpg',
    department: 'Testing Department',
    culture: 'Test Culture',
    period: 'Modern',
    dimensions: '100x100 pixels',
    objectURL: 'https://example.com/artwork',
    museumSource: 'other',
    curatorNotes: 'Added for comprehensive testing'
  };
  
  const result = await makeRequest(`${API_BASE}/exhibitions/${testExhibitionId}/artworks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(artworkData)
  });
  
  if (result.ok && result.data.exhibition) {
    console.log('✅ Add artwork successful');
    console.log(`   Artworks count: ${result.data.exhibition.artworks?.length || 0}`);
    return true;
  } else {
    console.log('❌ Add artwork failed');
    console.log(`   Status: ${result.status}`);
    return false;
  }
}

// Test 6: Update Artwork in Exhibition
async function testUpdateArtworkInExhibition() {
  console.log('\n🎭 Test 6: Update Artwork in Exhibition...');
  
  const updates = {
    curatorNotes: 'Updated curator notes for comprehensive testing'
  };
  
  const result = await makeRequest(`${API_BASE}/exhibitions/${testExhibitionId}/artworks/test-artwork-001`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(updates)
  });
  
  if (result.ok && result.data.exhibition) {
    console.log('✅ Update artwork successful');
    const artwork = result.data.exhibition.artworks?.find(a => a.objectID === 'test-artwork-001');
    console.log(`   Updated notes: ${artwork?.curatorNotes}`);
    return true;
  } else {
    console.log('❌ Update artwork failed');
    console.log(`   Status: ${result.status}`);
    return false;
  }
}

// Test 7: Share Exhibition
async function testShareExhibition() {
  console.log('\n🔗 Test 7: Share Exhibition...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions/${testExhibitionId}/share`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (result.ok && result.data.exhibition && result.data.exhibition.shareableLink) {
    shareableLink = result.data.exhibition.shareableLink;
    console.log('✅ Share exhibition successful');
    console.log(`   Shareable link: ${shareableLink}`);
    return true;
  } else {
    console.log('❌ Share exhibition failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, JSON.stringify(result.data, null, 2));
    return false;
  }
}

// Test 8: Get Shared Exhibition
async function testGetSharedExhibition() {
  console.log('\n📤 Test 8: Get Shared Exhibition...');
  console.log(`   Using shareable link: ${shareableLink}`);
  
  if (!shareableLink) {
    console.log('❌ No shareable link available from previous test');
    return false;
  }
  
  const result = await makeRequest(`${API_BASE}/exhibitions/shared/${shareableLink}`, {
    method: 'GET'
  });
  
  if (result.ok && result.data.exhibition) {
    console.log('✅ Get shared exhibition successful');
    console.log(`   Title: ${result.data.exhibition.title}`);
    console.log(`   Curator: ${result.data.exhibition.curatorUsername}`);
    return true;
  } else {
    console.log('❌ Get shared exhibition failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, JSON.stringify(result.data, null, 2));
    return false;
  }
}

// Test 9: Get Public Exhibitions
async function testGetPublicExhibitions() {
  console.log('\n🌍 Test 9: Get Public Exhibitions...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions/public?limit=5`, {
    method: 'GET'
  });
  
  if (result.ok && result.data.exhibitions) {
    console.log('✅ Get public exhibitions successful');
    console.log(`   Total found: ${result.data.exhibitions.length}`);
    return true;
  } else {
    console.log('❌ Get public exhibitions failed');
    console.log(`   Status: ${result.status}`);
    return false;
  }
}

// Test 10: Search Exhibitions
async function testSearchExhibitions() {
  console.log('\n🔍 Test 10: Search Exhibitions...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions/search?q=testing&limit=5`, {
    method: 'GET'
  });
  
  if (result.ok && result.data.exhibitions) {
    console.log('✅ Search exhibitions successful');
    console.log(`   Results found: ${result.data.exhibitions.length}`);
    return true;
  } else {
    console.log('❌ Search exhibitions failed');
    console.log(`   Status: ${result.status}`);
    return false;
  }
}

// Test 11: Get Featured Exhibitions
async function testGetFeaturedExhibitions() {
  console.log('\n⭐ Test 11: Get Featured Exhibitions...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions/featured?limit=5`, {
    method: 'GET'
  });
  
  if (result.ok && result.data.exhibitions) {
    console.log('✅ Get featured exhibitions successful');
    console.log(`   Featured found: ${result.data.exhibitions.length}`);
    return true;
  } else {
    console.log('❌ Get featured exhibitions failed');
    console.log(`   Status: ${result.status}`);
    return false;
  }
}

// Test 12: Get Trending Exhibitions
async function testGetTrendingExhibitions() {
  console.log('\n📈 Test 12: Get Trending Exhibitions...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions/trending?limit=5`, {
    method: 'GET'
  });
  
  if (result.ok && result.data.exhibitions) {
    console.log('✅ Get trending exhibitions successful');
    console.log(`   Trending found: ${result.data.exhibitions.length}`);
    return true;
  } else {
    console.log('❌ Get trending exhibitions failed');
    console.log(`   Status: ${result.status}`);
    return false;
  }
}

// Test 13: Unshare Exhibition
async function testUnshareExhibition() {
  console.log('\n🔒 Test 13: Unshare Exhibition...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions/${testExhibitionId}/share`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (result.ok) {
    console.log('✅ Unshare exhibition successful');
    return true;
  } else {
    console.log('❌ Unshare exhibition failed');
    console.log(`   Status: ${result.status}`);
    return false;
  }
}

// Test 14: Remove Artwork from Exhibition
async function testRemoveArtworkFromExhibition() {
  console.log('\n🗑️ Test 14: Remove Artwork from Exhibition...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions/${testExhibitionId}/artworks/test-artwork-001`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (result.ok && result.data.exhibition) {
    console.log('✅ Remove artwork successful');
    console.log(`   Remaining artworks: ${result.data.exhibition.artworks?.length || 0}`);
    return true;
  } else {
    console.log('❌ Remove artwork failed');
    console.log(`   Status: ${result.status}`);
    return false;
  }
}

// Test 15: Delete Exhibition
async function testDeleteExhibition() {
  console.log('\n🗑️ Test 15: Delete Exhibition...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions/${testExhibitionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (result.status === 204) {
    console.log('✅ Delete exhibition successful');
    return true;
  } else {
    console.log('❌ Delete exhibition failed');
    console.log(`   Status: ${result.status}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Comprehensive Exhibition Controller Tests');
  console.log('=============================================');
  
  // Login first
  const loginSuccess = await loginUser();
  if (!loginSuccess) {
    console.log('❌ Login failed, cannot continue tests');
    return;
  }
  
  const tests = [
    { name: 'Get User Exhibitions', fn: testGetExhibitions },
    { name: 'Create Exhibition', fn: testCreateExhibition },
    { name: 'Get Exhibition by ID', fn: testGetExhibitionById },
    { name: 'Update Exhibition', fn: testUpdateExhibition },
    { name: 'Add Artwork to Exhibition', fn: testAddArtworkToExhibition },
    { name: 'Update Artwork in Exhibition', fn: testUpdateArtworkInExhibition },
    { name: 'Share Exhibition', fn: testShareExhibition },
    { name: 'Get Shared Exhibition', fn: testGetSharedExhibition },
    { name: 'Get Public Exhibitions', fn: testGetPublicExhibitions },
    { name: 'Search Exhibitions', fn: testSearchExhibitions },
    { name: 'Get Featured Exhibitions', fn: testGetFeaturedExhibitions },
    { name: 'Get Trending Exhibitions', fn: testGetTrendingExhibitions },
    { name: 'Unshare Exhibition', fn: testUnshareExhibition },
    { name: 'Remove Artwork from Exhibition', fn: testRemoveArtworkFromExhibition },
    { name: 'Delete Exhibition', fn: testDeleteExhibition }
  ];
  
  let passed = 0;
  let failed = 0;
  const results = [];
  
  for (const test of tests) {
    try {
      const success = await test.fn();
      if (success) {
        passed++;
        results.push(`✅ PASS ${test.name}`);
      } else {
        failed++;
        results.push(`❌ FAIL ${test.name}`);
      }
    } catch (error) {
      failed++;
      results.push(`❌ ERROR ${test.name}: ${error.message}`);
    }
  }
  
  console.log('\n📊 Test Results Summary');
  console.log('=====================');
  results.forEach(result => console.log(result));
  
  console.log(`\n🎯 Overall: ${passed}/${passed + failed} tests passed`);
  
  if (failed === 0) {
    console.log('🎉 All Exhibition Controller functions are working perfectly!');
  } else {
    console.log(`⚠️  ${failed} test(s) failed. Review the implementation.`);
  }
}

// Run all tests
runAllTests().catch(console.error);