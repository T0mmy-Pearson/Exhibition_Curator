#!/usr/bin/env node

/**
 * Quick test to verify the add artwork to exhibition functionality
 */

const API_BASE_URL = 'https://exhibition-curator-backend.onrender.com/api';
const USER_EMAIL = 't.pearson0209@gmail.com';
const USER_PASSWORD = 'testtest123';

async function testAddArtworkToExhibition() {
  console.log('🧪 Testing Add Artwork to Exhibition API');
  console.log('==========================================');
  
  try {
    // 1. Authenticate
    console.log('🔐 Authenticating...');
    const authResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: USER_EMAIL, password: USER_PASSWORD })
    });
    
    if (!authResponse.ok) throw new Error('Auth failed');
    const authData = await authResponse.json();
    const token = authData.token;
    console.log('✅ Authenticated successfully');

    // 2. Get exhibitions
    console.log('📚 Fetching exhibitions...');
    const exhibitionsResponse = await fetch(`${API_BASE_URL}/exhibitions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!exhibitionsResponse.ok) throw new Error('Failed to get exhibitions');
    const exhibitionsData = await exhibitionsResponse.json();
    const exhibitions = exhibitionsData.exhibitions;
    
    if (exhibitions.length === 0) {
      console.log('❌ No exhibitions found');
      return;
    }
    
    console.log(`✅ Found ${exhibitions.length} exhibitions`);
    const firstExhibition = exhibitions[0];
    console.log(`🎨 Using exhibition: "${firstExhibition.title}"`);

    // 3. Search for an artwork
    console.log('🔍 Searching for artwork...');
    const artworkResponse = await fetch(`${API_BASE_URL}/artworks/search?q=cat&hasImages=true&limit=1`);
    
    if (!artworkResponse.ok) throw new Error('Failed to search artworks');
    const artworkData = await artworkResponse.json();
    const artworks = artworkData.artworks;
    
    if (artworks.length === 0) {
      console.log('❌ No artworks found');
      return;
    }
    
    const artwork = artworks[0];
    console.log(`✅ Found artwork: "${artwork.title}" by ${artwork.artistDisplayName || 'Unknown'}`);

    // 4. Add artwork to exhibition
    console.log('➕ Adding artwork to exhibition...');
    const artworkPayload = {
      artworkId: artwork.id || artwork.objectID?.toString() || `temp_${Date.now()}`,
      title: artwork.title || 'Untitled',
      artist: artwork.artistDisplayName || artwork.artist || 'Unknown',
      date: artwork.objectDate || artwork.date || '',
      medium: artwork.medium || '',
      imageUrl: artwork.primaryImage || artwork.imageUrl || '',
      museumSource: artwork.source || 'met'
    };

    const addResponse = await fetch(`${API_BASE_URL}/exhibitions/${firstExhibition._id}/artworks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(artworkPayload)
    });

    if (!addResponse.ok) {
      const errorText = await addResponse.text();
      throw new Error(`Failed to add artwork: ${errorText}`);
    }

    const addData = await addResponse.json();
    console.log('✅ Successfully added artwork to exhibition!');
    console.log(`📊 Exhibition now has ${addData.exhibition.artworks.length} artworks`);
    
    console.log('\n🎉 Test completed successfully!');
    console.log('💡 The ArtworkCard "Add to Exhibition" button should now work in the frontend');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAddArtworkToExhibition();