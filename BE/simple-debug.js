#!/usr/bin/env node

/**
 * Simple Exhibition Debug Test
 * Minimal test to debug the 500 error
 */

async function simpleTest() {
  console.log('🔍 Simple Exhibition Creation Debug...\n');
  
  try {
    // 1. Login
    console.log('1. Logging in...');
    const loginResponse = await fetch('http://localhost:9090/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'exhib.test@example.com',
        password: 'testpassword123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');
    
    // 2. Simple exhibition creation
    console.log('\n2. Creating exhibition...');
    
    const simpleExhibition = {
      title: 'Debug Exhibition'
    };
    
    console.log('Sending data:', JSON.stringify(simpleExhibition, null, 2));
    
    const createResponse = await fetch('http://localhost:9090/api/exhibitions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(simpleExhibition)
    });
    
    console.log('Response status:', createResponse.status);
    console.log('Response status text:', createResponse.statusText);
    
    const responseText = await createResponse.text();
    console.log('Response body (raw):', responseText);
    
    if (responseText) {
      try {
        const parsed = JSON.parse(responseText);
        console.log('Response body (parsed):', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Could not parse response as JSON');
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }
}

simpleTest();