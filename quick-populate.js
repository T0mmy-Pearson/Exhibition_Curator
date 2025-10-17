#!/usr/bin/env node

/**
 * Quick script to add a few artworks to each exhibition
 */

const API_BASE_URL = 'https://exhibition-curator-backend.onrender.com/api';
const USER_EMAIL = 't.pearson0209@gmail.com';
const USER_PASSWORD = 'testtest123';

// Simplified mappings with single search terms
const exhibitionMappings = [
  { keywords: ['cats'], searchTerm: 'cat', maxArtworks: 3 },
  { keywords: ['renaissance'], searchTerm: 'leonardo', maxArtworks: 4 },
  { keywords: ['digital', 'ai'], searchTerm: 'modern', maxArtworks: 3 },
  { keywords: ['ocean'], searchTerm: 'sea', maxArtworks: 3 },
  { keywords: ['impressionist'], searchTerm: 'monet', maxArtworks: 4 },
  { keywords: ['street'], searchTerm: 'contemporary', maxArtworks: 3 },
  { keywords: ['ancient'], searchTerm: 'ancient', maxArtworks: 4 },
  { keywords: ['japanese'], searchTerm: 'japanese', maxArtworks: 3 },
  { keywords: ['portraits'], searchTerm: 'portrait', maxArtworks: 3 },
  { keywords: ['space'], searchTerm: 'star', maxArtworks: 2 },
  { keywords: ['music'], searchTerm: 'music', maxArtworks: 3 },
  { keywords: ['food'], searchTerm: 'fruit', maxArtworks: 3 }
];

async function authenticate() {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: USER_EMAIL, password: USER_PASSWORD })
  });
  
  if (!response.ok) throw new Error('Auth failed');
  const data = await response.json();
  return data.token;
}

async function getExhibitions(token) {
  const response = await fetch(`${API_BASE_URL}/exhibitions`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('Failed to get exhibitions');
  const data = await response.json();
  return data.exhibitions;
}

async function searchArtworks(searchTerm) {
  const params = new URLSearchParams({ q: searchTerm, hasImages: 'true', limit: '5' });
  const response = await fetch(`${API_BASE_URL}/artworks/search?${params}`);
  
  if (!response.ok) return [];
  const data = await response.json();
  return data.artworks || [];
}

async function addArtwork(token, exhibitionId, artwork) {
  const artworkData = {
    artworkId: artwork.id || artwork.objectID?.toString() || `temp_${Date.now()}`,
    title: artwork.title || 'Untitled',
    artist: artwork.artistDisplayName || artwork.artist || 'Unknown',
    date: artwork.objectDate || artwork.date || '',
    medium: artwork.medium || '',
    imageUrl: artwork.primaryImage || artwork.imageUrl || '',
    museumSource: artwork.source || 'met'
  };

  const response = await fetch(`${API_BASE_URL}/exhibitions/${exhibitionId}/artworks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(artworkData)
  });

  return response.ok;
}

async function main() {
  console.log('🎨 Quick Artwork Population');
  console.log('===========================');
  
  try {
    const token = await authenticate();
    console.log('✅ Authenticated');
    
    const exhibitions = await getExhibitions(token);
    console.log(`📚 Found ${exhibitions.length} exhibitions`);
    
    let totalAdded = 0;
    
    for (const exhibition of exhibitions) {
      console.log(`\n🎨 Processing: "${exhibition.title}"`);
      
      // Find matching search mapping
      const mapping = exhibitionMappings.find(m => 
        m.keywords.some(keyword => 
          exhibition.title.toLowerCase().includes(keyword)
        )
      );
      
      if (!mapping) {
        console.log('   ⚠️  No mapping found - skipping');
        continue;
      }
      
      // Search for artworks
      console.log(`   🔍 Searching for: "${mapping.searchTerm}"`);
      const artworks = await searchArtworks(mapping.searchTerm);
      
      if (artworks.length === 0) {
        console.log('   ❌ No artworks found');
        continue;
      }
      
      // Add artworks
      const selectedArtworks = artworks.slice(0, mapping.maxArtworks);
      let added = 0;
      
      for (const artwork of selectedArtworks) {
        const success = await addArtwork(token, exhibition._id, artwork);
        if (success) {
          added++;
          console.log(`   ✅ Added: "${artwork.title}"`);
        }
        await new Promise(resolve => setTimeout(resolve, 200)); // Small delay
      }
      
      totalAdded += added;
      console.log(`   📊 Added ${added}/${selectedArtworks.length} artworks`);
    }
    
    console.log(`\n🎉 Complete! Added ${totalAdded} artworks total`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();