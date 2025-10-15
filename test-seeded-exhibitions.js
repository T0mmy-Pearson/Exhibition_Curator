#!/usr/bin/env node

/**
 * Exhibition Controller Test with Seeded User Data
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

async function testGetExistingExhibitions() {
  console.log('\n📋 Testing Get Existing Exhibitions (from seeded data)...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (result.ok) {
    console.log('✅ Get exhibitions successful');
    console.log(`   Total exhibitions: ${result.data.exhibitions?.length || 0}`);
    
    if (result.data.exhibitions?.length > 0) {
      const first = result.data.exhibitions[0];
      console.log(`   First exhibition: "${first.title}"`);
      console.log(`   Theme: ${first.theme}`);
      console.log(`   Artworks: ${first.artworks?.length || 0}`);
      console.log(`   Public: ${first.isPublic}`);
    }
    return true;
  } else {
    console.log('❌ Get exhibitions failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testCreateNewExhibition() {
  console.log('\n🎨 Testing Create New Exhibition...');
  
  const exhibitionData = {
    title: 'Test Exhibition - Modern Art Collection',
    description: 'A curated collection of modern artworks for testing purposes',
    theme: 'Modern Art',
    isPublic: false,
    tags: ['modern', 'testing', 'curated']
  };
  
  console.log('Creating exhibition with data:', exhibitionData);
  
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
    console.log(`   Theme: ${result.data.exhibition.theme}`);
    console.log(`   Public: ${result.data.exhibition.isPublic}`);
    return true;
  } else {
    console.log('❌ Create exhibition failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, JSON.stringify(result.data, null, 2));
    return false;
  }
}

async function testGetPublicExhibitions() {
  console.log('\n🌍 Testing Get Public Exhibitions...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions/public?limit=5`, {
    method: 'GET'
  });
  
  if (result.ok) {
    console.log('✅ Get public exhibitions successful');
    console.log(`   Total found: ${result.data.exhibitions?.length || 0}`);
    
    if (result.data.exhibitions?.length > 0) {
      const first = result.data.exhibitions[0];
      console.log(`   First public exhibition: "${first.title}"`);
      console.log(`   Curator: ${first.curator?.username}`);
      console.log(`   Artworks: ${first.artworksCount}`);
    }
    return true;
  } else {
    console.log('❌ Get public exhibitions failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function runSeededUserTests() {
  console.log('🚀 Exhibition Controller Tests with Seeded Data');
  console.log('==============================================');
  
  // Login with seeded user
  const loginSuccess = await loginUser();
  if (!loginSuccess) {
    console.log('\n⚠️  Cannot proceed without valid authentication');
    process.exit(1);
  }
  
  const results = [];
  
  // Test various exhibition functions
  results.push(await testGetExistingExhibitions());
  results.push(await testCreateNewExhibition());
  results.push(await testGetPublicExhibitions());
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=====================');
  const testNames = [
    'Get Existing Exhibitions',
    'Create New Exhibition', 
    'Get Public Exhibitions'
  ];
  
  let passed = 0;
  results.forEach((result, index) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testNames[index]}`);
    if (result) passed++;
  });
  
  console.log(`\n🎯 Overall: ${passed}/${results.length} tests passed`);
  
  if (passed === results.length) {
    console.log('🎉 Exhibition Controller is working with the seeded database!');
  } else {
    console.log('⚠️  Some tests failed. The Exhibition Controller needs debugging.');
  }
}

runSeededUserTests().catch(console.error);