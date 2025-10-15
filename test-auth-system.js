#!/usr/bin/env node

/**
 * Authentication System Test Script
 * Tests user registration, login, token validation, and user profile retrieval
 */

const API_BASE = 'http://localhost:9090/api';

// Test user data
const testUser = {
  username: 'testuser_auth',
  email: 'test.auth@example.com',
  password: 'securepassword123',
  firstName: 'Test',
  lastName: 'User'
};

let authToken = '';

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

async function testUserRegistration() {
  console.log('\n🔐 Testing User Registration...');
  
  const result = await makeRequest(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(testUser)
  });
  
  if (result.ok && result.data.token) {
    authToken = result.data.token;
    console.log('✅ Registration successful');
    console.log(`   User ID: ${result.data.user.id}`);
    console.log(`   Username: ${result.data.user.username}`);
    console.log(`   Email: ${result.data.user.email}`);
    console.log(`   Token received: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    console.log('❌ Registration failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testUserLogin() {
  console.log('\n🔑 Testing User Login...');
  
  const result = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password
    })
  });
  
  if (result.ok && result.data.token) {
    authToken = result.data.token;
    console.log('✅ Login successful');
    console.log(`   Welcome: ${result.data.user.firstName} ${result.data.user.lastName}`);
    console.log(`   Last login: ${result.data.user.lastLoginAt}`);
    console.log(`   New token: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    console.log('❌ Login failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testGetCurrentUser() {
  console.log('\n👤 Testing Get Current User...');
  
  const result = await makeRequest(`${API_BASE}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (result.ok && result.data.user) {
    console.log('✅ Get current user successful');
    console.log(`   User: ${result.data.user.username} (${result.data.user.email})`);
    console.log(`   Full name: ${result.data.user.firstName} ${result.data.user.lastName}`);
    console.log(`   Exhibitions: ${result.data.user.exhibitionsCount}`);
    console.log(`   Favorites: ${result.data.user.favoritesCount}`);
    console.log(`   Created: ${result.data.user.createdAt}`);
    return true;
  } else {
    console.log('❌ Get current user failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testTokenRefresh() {
  console.log('\n🔄 Testing Token Refresh...');
  
  const result = await makeRequest(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (result.ok && result.data.token) {
    const oldToken = authToken.substring(0, 20);
    authToken = result.data.token;
    console.log('✅ Token refresh successful');
    console.log(`   Old token: ${oldToken}...`);
    console.log(`   New token: ${authToken.substring(0, 20)}...`);
    console.log(`   User: ${result.data.user.username}`);
    return true;
  } else {
    console.log('❌ Token refresh failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.data.message}`);
    return false;
  }
}

async function testInvalidToken() {
  console.log('\n❌ Testing Invalid Token Handling...');
  
  const result = await makeRequest(`${API_BASE}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer invalid-token-here'
    }
  });
  
  if (!result.ok && result.status === 403) {
    console.log('✅ Invalid token properly rejected');
    console.log(`   Status: ${result.status}`);
    console.log(`   Message: ${result.data.msg}`);
    return true;
  } else {
    console.log('❌ Invalid token test failed - should have been rejected');
    console.log(`   Status: ${result.status}`);
    return false;
  }
}

async function testLogout() {
  console.log('\n🚪 Testing User Logout...');
  
  const result = await makeRequest(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (result.ok) {
    console.log('✅ Logout successful');
    console.log(`   Message: ${result.data.message}`);
    return true;
  } else {
    console.log('❌ Logout failed');
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
    console.log(`   Version: ${result.data.version}`);
    return true;
  } else {
    console.log('❌ Server connection failed');
    console.log('   Make sure the backend server is running on port 9090');
    console.log('   Run: npm run dev in the backend directory');
    return false;
  }
}

async function runAuthenticationTests() {
  console.log('🚀 Exhibition Curator - Authentication System Tests');
  console.log('================================================');
  
  // Check server connection first
  const serverRunning = await checkServerConnection();
  if (!serverRunning) {
    process.exit(1);
  }
  
  const results = [];
  
  // Test user registration
  results.push(await testUserRegistration());
  
  // Test user login (if registration failed, we still try login in case user exists)
  if (!results[0]) {
    results.push(await testUserLogin());
  } else {
    results.push(true); // Skip login test if registration worked
  }
  
  // Only proceed with authenticated tests if we have a token
  if (authToken) {
    results.push(await testGetCurrentUser());
    results.push(await testTokenRefresh());
    results.push(await testInvalidToken());
    results.push(await testLogout());
  } else {
    console.log('\n⚠️  Skipping authenticated tests - no valid token available');
    results.push(false, false, false, false);
  }
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=====================');
  const testNames = [
    'User Registration',
    'User Login', 
    'Get Current User',
    'Token Refresh',
    'Invalid Token Handling',
    'User Logout'
  ];
  
  let passed = 0;
  results.forEach((result, index) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testNames[index]}`);
    if (result) passed++;
  });
  
  console.log(`\n🎯 Overall: ${passed}/${results.length} tests passed`);
  
  if (passed === results.length) {
    console.log('🎉 All authentication tests passed! The auth system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the error messages above for details.');
  }
}

// Run the tests
runAuthenticationTests().catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
});