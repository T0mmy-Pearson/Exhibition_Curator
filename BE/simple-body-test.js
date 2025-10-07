#!/usr/bin/env node

/**
 * Test body parsing with a simple request
 */

async function testBodyParsing() {
  console.log('Testing body parsing...\n');
  
  // First test - simple endpoint without auth
  console.log('1. Testing simple endpoint (no auth)...');
  
  try {
    const response1 = await fetch('http://localhost:9090/api', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data1 = await response1.json();
    console.log('✅ API root endpoint works:', data1.message);
  } catch (error) {
    console.log('❌ API root endpoint failed:', error.message);
    return;
  }
  
  // Login to get token
  console.log('\n2. Logging in...');
  let token;
  
  try {
    const loginResponse = await fetch('http://localhost:9090/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test.auth@example.com',
        password: 'securepassword123'
      })
    });
    
    const loginData = await loginResponse.json();
    token = loginData.token;
    
    if (!token) {
      console.log('❌ Login failed:', loginData);
      return;
    }
    
    console.log('✅ Login successful');
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return;
  }
  
  // Test getting exhibitions (should work)
  console.log('\n3. Testing GET exhibitions (should work)...');
  
  try {
    const getResponse = await fetch('http://localhost:9090/api/exhibitions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const getData = await getResponse.json();
    console.log('✅ GET exhibitions works:', getData);
  } catch (error) {
    console.log('❌ GET exhibitions failed:', error.message);
  }
  
  // Test POST with minimal body
  console.log('\n4. Testing POST with minimal data...');
  
  const testPayload = {
    title: 'Simple Test'
  };
  
  console.log('Sending payload:', testPayload);
  
  try {
    const postResponse = await fetch('http://localhost:9090/api/exhibitions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('POST response status:', postResponse.status);
    console.log('POST response headers:', [...postResponse.headers.entries()]);
    
    const postData = await postResponse.text(); // Get as text first
    console.log('POST response body (raw):', postData);
    
    try {
      const parsedData = JSON.parse(postData);
      console.log('POST response body (parsed):', parsedData);
    } catch (e) {
      console.log('Could not parse response as JSON');
    }
    
  } catch (error) {
    console.log('❌ POST exhibitions failed:', error.message);
  }
}

testBodyParsing().catch(console.error);