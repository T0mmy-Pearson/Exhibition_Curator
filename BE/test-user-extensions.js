#!/usr/bin/env node

/**
 * User Controller Extensions Test Script
 * Tests getUserExhibitions and getUserFavorites functionality
 */

const API_BASE = 'http://localhost:9090/api';

// Test user credentials
const testUser = {
  email: 'test.auth@example.com',
  password: 'securepassword123'
};

let authToken = '';
let userId = '';

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
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    console.log('❌ Login failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testGetCurrentUserExhibitions() {
  console.log('\n🎨 Testing Get Current User Exhibitions...');
  
  const result = await makeRequest(`${API_BASE}/users/me/exhibitions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (result.ok) {
    console.log('✅ Get current user exhibitions successful');
    console.log(`   User: ${result.data.user.username}`);
    console.log(`   Total exhibitions: ${result.data.total}`);
    console.log(`   Exhibitions: ${result.data.exhibitions.length} found`);
    
    if (result.data.exhibitions.length > 0) {
      console.log('   First exhibition:');
      const first = result.data.exhibitions[0];
      console.log(`     - Title: ${first.title || 'Untitled'}`);
      console.log(`     - Artworks: ${first.artworksCount}`);
      console.log(`     - Public: ${first.isPublic}`);
      console.log(`     - Created: ${first.createdAt}`);
    }
    return true;
  } else {
    console.log('❌ Get current user exhibitions failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testGetUserExhibitionsById() {
  console.log('\n🎨 Testing Get User Exhibitions by ID...');
  
  const result = await makeRequest(`${API_BASE}/users/${userId}/exhibitions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (result.ok) {
    console.log('✅ Get user exhibitions by ID successful');
    console.log(`   User: ${result.data.user.username}`);
    console.log(`   Total exhibitions: ${result.data.total}`);
    console.log(`   Exhibitions: ${result.data.exhibitions.length} found`);
    return true;
  } else {
    console.log('❌ Get user exhibitions by ID failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testGetCurrentUserFavorites() {
  console.log('\n❤️  Testing Get Current User Favorites...');
  
  const result = await makeRequest(`${API_BASE}/users/me/favorites`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (result.ok) {
    console.log('✅ Get current user favorites successful');
    console.log(`   User: ${result.data.user.username}`);
    console.log(`   Total favorites: ${result.data.pagination.total}`);
    console.log(`   Page: ${result.data.pagination.page}/${result.data.pagination.totalPages}`);
    console.log(`   Favorites on this page: ${result.data.favorites.length}`);
    
    if (result.data.favorites.length > 0) {
      console.log('   First favorite:');
      const first = result.data.favorites[0];
      console.log(`     - Title: ${first.title || 'Untitled'}`);
      console.log(`     - Artist: ${first.artist || 'Unknown'}`);
      console.log(`     - Museum: ${first.museumSource}`);
      console.log(`     - Added: ${first.addedAt}`);
    }
    return true;
  } else {
    console.log('❌ Get current user favorites failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testGetUserFavoritesById() {
  console.log('\n❤️  Testing Get User Favorites by ID...');
  
  const result = await makeRequest(`${API_BASE}/users/${userId}/favorites`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (result.ok) {
    console.log('✅ Get user favorites by ID successful');
    console.log(`   User: ${result.data.user.username}`);
    console.log(`   Total favorites: ${result.data.pagination.total}`);
    console.log(`   Favorites on this page: ${result.data.favorites.length}`);
    return true;
  } else {
    console.log('❌ Get user favorites by ID failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testFavoritesWithFilters() {
  console.log('\n🔍 Testing Favorites with Filters...');
  
  // Test with pagination and sorting
  const result = await makeRequest(`${API_BASE}/users/me/favorites?page=1&limit=5&sortBy=title&sortOrder=asc`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (result.ok) {
    console.log('✅ Favorites with filters successful');
    console.log(`   Applied filters:`);
    console.log(`     - Page: ${result.data.pagination.page}`);
    console.log(`     - Limit: ${result.data.pagination.limit}`);
    console.log(`     - Sort by: ${result.data.filters.sortBy}`);
    console.log(`     - Sort order: ${result.data.filters.sortOrder}`);
    console.log(`   Results: ${result.data.favorites.length} favorites`);
    return true;
  } else {
    console.log('❌ Favorites with filters failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testUnauthorizedAccess() {
  console.log('\n🔒 Testing Unauthorized Access...');
  
  const result = await makeRequest(`${API_BASE}/users/me/exhibitions`, {
    method: 'GET'
    // No authorization header
  });
  
  if (!result.ok && result.status === 401) {
    console.log('✅ Unauthorized access properly rejected');
    console.log(`   Status: ${result.status}`);
    console.log(`   Message: ${result.data.msg || result.data.message}`);
    return true;
  } else {
    console.log('❌ Unauthorized access test failed - should have been rejected');
    console.log(`   Status: ${result.status}`);
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

async function runUserControllerExtensionsTests() {
  console.log('🚀 Exhibition Curator - User Controller Extensions Tests');
  console.log('======================================================');
  
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
  
  // Test all user controller extensions
  results.push(await testGetCurrentUserExhibitions());
  results.push(await testGetUserExhibitionsById());
  results.push(await testGetCurrentUserFavorites());
  results.push(await testGetUserFavoritesById());
  results.push(await testFavoritesWithFilters());
  results.push(await testUnauthorizedAccess());
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=====================');
  const testNames = [
    'Get Current User Exhibitions',
    'Get User Exhibitions by ID',
    'Get Current User Favorites',
    'Get User Favorites by ID',
    'Favorites with Filters',
    'Unauthorized Access Handling'
  ];
  
  let passed = 0;
  results.forEach((result, index) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testNames[index]}`);
    if (result) passed++;
  });
  
  console.log(`\n🎯 Overall: ${passed}/${results.length} tests passed`);
  
  if (passed === results.length) {
    console.log('🎉 All user controller extension tests passed! The functionality is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the error messages above for details.');
  }
}

// Run the tests
runUserControllerExtensionsTests().catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
});