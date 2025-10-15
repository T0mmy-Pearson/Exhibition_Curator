#!/usr/bin/env node

/**
 * Complete Exhibition Controller Test with User Registration
 * Handles both user registration and exhibition testing
 */

const API_BASE = 'http://localhost:9090/api';

// Test user data
const testUser = {
  username: 'exhib_test_user',
  email: 'exhib.test@example.com',
  password: 'testpassword123',
  firstName: 'Exhibition',
  lastName: 'Tester'
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

async function registerAndLoginUser() {
  console.log('🔐 Registering new test user...');
  
  // First try to register
  const registerResult = await makeRequest(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(testUser)
  });
  
  if (registerResult.ok && registerResult.data.token) {
    authToken = registerResult.data.token;
    userId = registerResult.data.user.id;
    console.log('✅ Registration successful');
    console.log(`   User ID: ${userId}`);
    console.log(`   Username: ${registerResult.data.user.username}`);
    return true;
  } else if (registerResult.status === 409) {
    // User already exists, try to login
    console.log('ℹ️  User already exists, trying login...');
    
    const loginResult = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    if (loginResult.ok && loginResult.data.token) {
      authToken = loginResult.data.token;
      userId = loginResult.data.user.id;
      console.log('✅ Login successful');
      console.log(`   User ID: ${userId}`);
      return true;
    } else {
      console.log('❌ Login failed');
      console.log(`   Status: ${loginResult.status}`);
      console.log(`   Error: ${loginResult.data.error || loginResult.data.message}`);
      return false;
    }
  } else {
    console.log('❌ Registration failed');
    console.log(`   Status: ${registerResult.status}`);
    console.log(`   Error: ${registerResult.data.error || registerResult.data.message}`);
    return false;
  }
}

async function testCreateExhibition() {
  console.log('\n🎨 Testing Create Exhibition...');
  
  const exhibitionData = {
    title: 'Atlas Test Exhibition',
    description: 'Testing exhibition creation with MongoDB Atlas',
    theme: 'Cloud Database',
    isPublic: false,
    tags: ['atlas', 'testing', 'mongodb'],
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

async function testShareExhibition() {
  console.log('\n🔗 Testing Share Exhibition...');
  
  if (!testExhibitionId) {
    console.log('❌ No exhibition ID available - skipping test');
    return false;
  }
  
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
    return true;
  } else {
    console.log('❌ Share exhibition failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
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

async function checkServerConnection() {
  console.log('🔌 Checking server connection...');
  
  const result = await makeRequest(`${API_BASE}`);
  
  if (result.ok) {
    console.log('✅ Server is running');
    console.log(`   API: ${result.data.message}`);
    return true;
  } else {
    console.log('❌ Server connection failed');
    return false;
  }
}

async function runCompleteExhibitionTests() {
  console.log('🚀 Exhibition Curator - Complete Exhibition Tests with Atlas');
  console.log('==========================================================');
  
  // Check server connection first
  const serverRunning = await checkServerConnection();
  if (!serverRunning) {
    process.exit(1);
  }
  
  // Register/login user
  const authSuccess = await registerAndLoginUser();
  if (!authSuccess) {
    console.log('\n⚠️  Cannot proceed without valid authentication');
    process.exit(1);
  }
  
  const results = [];
  
  // Test key exhibition functions
  results.push(await testCreateExhibition());
  results.push(await testGetUserExhibitions());
  results.push(await testShareExhibition());
  results.push(await testGetPublicExhibitions());
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=====================');
  const testNames = [
    'Create Exhibition',
    'Get User Exhibitions', 
    'Share Exhibition',
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
    console.log('🎉 MongoDB Atlas + Exhibition Controller working perfectly!');
    console.log('💾 Data is being stored in the cloud database successfully');
  } else {
    console.log('⚠️  Some tests failed. Check the error messages above.');
  }
}

// Run the tests
runCompleteExhibitionTests().catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
});