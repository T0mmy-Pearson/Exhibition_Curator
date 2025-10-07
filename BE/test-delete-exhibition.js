#!/usr/bin/env node

/**
 * Simple Delete Exhibition Test
 */

const API_BASE = 'http://localhost:9090/api';

const testUser = {
  email: 'artlover@example.com',
  password: 'password123'
};

let authToken = '';
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
    
    const contentType = response.headers.get('content-type');
    let data = {};
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }
    
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { status: 0, data: { error: error.message }, ok: false };
  }
}

async function loginUser() {
  console.log('🔑 Logging in...');
  
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
    return true;
  } else {
    console.log('❌ Login failed');
    return false;
  }
}

async function createTestExhibition() {
  console.log('\n🎨 Creating test exhibition...');
  
  const exhibitionData = {
    title: 'Delete Test Exhibition',
    description: 'An exhibition to test deletion',
    theme: 'Testing',
    isPublic: false
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
    console.log('✅ Exhibition created');
    console.log(`   ID: ${testExhibitionId}`);
    return true;
  } else {
    console.log('❌ Exhibition creation failed');
    return false;
  }
}

async function deleteExhibition() {
  console.log('\n🗑️ Deleting exhibition...');
  
  const result = await makeRequest(`${API_BASE}/exhibitions/${testExhibitionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  console.log(`   Status: ${result.status}`);
  console.log(`   Response:`, result.data);
  
  if (result.status === 204) {
    console.log('✅ Delete successful');
    return true;
  } else {
    console.log('❌ Delete failed');
    return false;
  }
}

async function runTest() {
  console.log('🚀 Simple Delete Exhibition Test');
  console.log('================================');
  
  const loginSuccess = await loginUser();
  if (!loginSuccess) return;
  
  const createSuccess = await createTestExhibition();
  if (!createSuccess) return;
  
  const deleteSuccess = await deleteExhibition();
  
  if (deleteSuccess) {
    console.log('\n🎉 Delete test passed!');
  } else {
    console.log('\n❌ Delete test failed!');
  }
}

runTest().catch(console.error);