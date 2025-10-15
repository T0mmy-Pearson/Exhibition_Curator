#!/usr/bin/env node

/**
 * Simple Exhibition Creation Test
 * Focuses on debugging the create exhibition issue
 */

const API_BASE = 'http://localhost:9090/api';

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
    return { status: response.status, data, ok: response.ok, response };
  } catch (error) {
    return { status: 0, data: { error: error.message }, ok: false };
  }
}

async function loginAndTest() {
  console.log('🔑 Logging in...');
  
  // Login first
  const loginResult = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'test.auth@example.com',
      password: 'securepassword123'
    })
  });
  
  if (!loginResult.ok) {
    console.log('❌ Login failed:', loginResult.data);
    return;
  }
  
  const authToken = loginResult.data.token;
  console.log('✅ Login successful');
  
  // Test create exhibition with detailed logging
  console.log('\n🎨 Testing Create Exhibition...');
  
  const exhibitionData = {
    title: 'Debug Test Exhibition',
    description: 'A test exhibition for debugging',
    theme: 'Debug Theme',
    isPublic: false,
    tags: ['debug', 'test'],
    coverImageUrl: ''
  };
  
  console.log('Sending exhibition data:', JSON.stringify(exhibitionData, null, 2));
  
  const createResult = await makeRequest(`${API_BASE}/exhibitions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(exhibitionData)
  });
  
  console.log('Create exhibition response status:', createResult.status);
  console.log('Create exhibition response data:', JSON.stringify(createResult.data, null, 2));
  
  if (createResult.ok) {
    console.log('✅ Exhibition created successfully!');
    console.log('Exhibition ID:', createResult.data.exhibition._id);
    
    // Test getting the exhibitions to confirm it was created
    console.log('\n📋 Testing Get Exhibitions...');
    const getResult = await makeRequest(`${API_BASE}/exhibitions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('Get exhibitions response:', JSON.stringify(getResult.data, null, 2));
    
  } else {
    console.log('❌ Exhibition creation failed');
    console.log('Full response headers:', createResult.response?.headers);
  }
}

loginAndTest().catch(console.error);