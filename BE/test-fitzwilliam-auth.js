#!/usr/bin/env node

/**
 * Test script for Fitzwilliam Museum API authentication
 * Run with: node test-fitzwilliam-auth.js
 */

const axios = require('axios');
require('dotenv').config();

const FITZWILLIAM_BASE_URL = process.env.FITZWILLIAM_MUSEUM_API_URL || 'https://data.fitzmuseum.cam.ac.uk/api/v1';
const FITZWILLIAM_API_KEY = process.env.FITZWILLIAM_MUSEUM_API_KEY;
const FITZWILLIAM_USERNAME = process.env.FITZWILLIAM_USERNAME;
const FITZWILLIAM_PASSWORD = process.env.FITZWILLIAM_PASSWORD;

async function testFitzwilliamAuth() {
  console.log('🏛️  Testing Fitzwilliam Museum API Authentication\n');

  // Test 1: Direct API key
  if (FITZWILLIAM_API_KEY && FITZWILLIAM_API_KEY !== 'your-fitzwilliam-api-key-here') {
    console.log('📝 Testing with API Key...');
    try {
      const response = await axios.get(`${FITZWILLIAM_BASE_URL}/objects?size=1`, {
        headers: {
          'Authorization': `Bearer ${FITZWILLIAM_API_KEY}`,
          'Accept': 'application/json'
        }
      });
      console.log('✅ API Key authentication successful!');
      console.log(`📊 Found ${response.data.meta?.total || 'unknown'} total objects`);
      if (response.data.data?.[0]) {
        console.log(`🎨 Sample artwork: ${response.data.data[0].summary_title || 'Unknown title'}\n`);
      }
      return true;
    } catch (error) {
      console.log('❌ API Key authentication failed');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.data?.message || error.message}`);
      }
      console.log('');
    }
  } else {
    console.log('⏭️  No API key configured, skipping API key test\n');
  }

  // Test 2: Username/Password login
  if (FITZWILLIAM_USERNAME && FITZWILLIAM_PASSWORD && 
      FITZWILLIAM_USERNAME !== 'your-fitzwilliam-email@example.com') {
    console.log('🔐 Testing with Username/Password...');
    try {
      // Try to login programmatically
      const loginResponse = await axios.post(`${FITZWILLIAM_BASE_URL.replace('/v1', '')}/login`, {
        email: FITZWILLIAM_USERNAME,
        password: FITZWILLIAM_PASSWORD
      });

      console.log('✅ Login successful!');
      const token = loginResponse.data.token || 
                   loginResponse.data.access_token ||
                   loginResponse.headers['authorization'] ||
                   loginResponse.headers['x-auth-token'];

      if (token) {
        console.log('🎫 Token obtained, testing API access...');
        const response = await axios.get(`${FITZWILLIAM_BASE_URL}/objects?size=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        console.log('✅ Username/Password authentication successful!');
        console.log(`📊 Found ${response.data.meta?.total || 'unknown'} total objects`);
        console.log(`💡 Your token: ${token.substring(0, 20)}...`);
        console.log('💡 Add this to your .env file as FITZWILLIAM_MUSEUM_API_KEY\n');
        return true;
      } else {
        console.log('❌ Login succeeded but no token found in response');
        console.log('🔍 Check the login response structure\n');
      }
    } catch (error) {
      console.log('❌ Username/Password authentication failed');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.data?.message || error.message}`);
      }
      console.log('');
    }
  } else {
    console.log('⏭️  No username/password configured, skipping login test\n');
  }

  // Test 3: No auth (should fail)
  console.log('🚫 Testing without authentication (should fail)...');
  try {
    await axios.get(`${FITZWILLIAM_BASE_URL}/objects?size=1`);
    console.log('⚠️  Unexpected: API worked without authentication!');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly requires authentication (401 Unauthorized)');
    } else {
      console.log(`❓ Unexpected error: ${error.response?.status || error.message}`);
    }
  }

  console.log('\n📋 Next Steps:');
  console.log('1. If you got a token above, add it to your .env file');
  console.log('2. If not, check the Fitzwilliam website for API keys in your account');
  console.log('3. Look in browser dev tools for authentication headers');
  console.log('4. Contact the museum if you need API access');
  
  return false;
}

// Run the test
if (require.main === module) {
  testFitzwilliamAuth().catch(console.error);
}

module.exports = { testFitzwilliamAuth };