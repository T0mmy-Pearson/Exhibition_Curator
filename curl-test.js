#!/usr/bin/env node

/**
 * Simple curl-based test for exhibition creation
 */

const { spawn } = require('child_process');

async function testWithCurl() {
  console.log('🧪 Testing exhibition creation with curl...\n');
  
  // First, get the auth token
  console.log('1. Getting auth token...');
  const loginCmd = spawn('curl', [
    '-s',
    '-X', 'POST',
    'http://localhost:9090/api/auth/login',
    '-H', 'Content-Type: application/json',
    '-d', '{"email":"test.auth@example.com","password":"securepassword123"}'
  ]);
  
  let loginData = '';
  loginCmd.stdout.on('data', (data) => {
    loginData += data.toString();
  });
  
  loginCmd.on('close', (code) => {
    if (code !== 0) {
      console.log('❌ Login failed');
      return;
    }
    
    try {
      const loginResponse = JSON.parse(loginData);
      const token = loginResponse.token;
      
      if (!token) {
        console.log('❌ No token received');
        console.log('Login response:', loginData);
        return;
      }
      
      console.log('✅ Token received:', token.substring(0, 20) + '...');
      
      // Now test exhibition creation
      console.log('\n2. Creating exhibition...');
      const createCmd = spawn('curl', [
        '-v',
        '-X', 'POST',
        'http://localhost:9090/api/exhibitions',
        '-H', 'Content-Type: application/json',
        '-H', `Authorization: Bearer ${token}`,
        '-d', JSON.stringify({
          title: 'Curl Test Exhibition',
          description: 'Testing with curl',
          theme: 'Test Theme',
          isPublic: false,
          tags: ['curl', 'test']
        })
      ]);
      
      let createData = '';
      let createError = '';
      
      createCmd.stdout.on('data', (data) => {
        createData += data.toString();
      });
      
      createCmd.stderr.on('data', (data) => {
        createError += data.toString();
      });
      
      createCmd.on('close', (code) => {
        console.log('\n📊 Create Exhibition Results:');
        console.log('Exit code:', code);
        console.log('Response data:', createData);
        console.log('Error/Verbose output:', createError);
        
        if (createData) {
          try {
            const parsed = JSON.parse(createData);
            console.log('Parsed response:', JSON.stringify(parsed, null, 2));
          } catch (e) {
            console.log('Could not parse response as JSON');
          }
        }
      });
      
    } catch (e) {
      console.log('❌ Failed to parse login response:', e.message);
      console.log('Raw response:', loginData);
    }
  });
}

testWithCurl();