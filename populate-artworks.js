#!/usr/bin/env node

/**
 * Script to search for artworks and add them to Thomas Pearson's exhibitions
 * This will populate exhibitions with relevant artworks from museum APIs
 */

const API_BASE_URL = 'https://exhibition-curator-backend.onrender.com/api';

// User credentials
const USER_EMAIL = 't.pearson0209@gmail.com';
const USER_PASSWORD = 'testtest123';

// Exhibition themes mapped to search terms
const exhibitionSearchMappings = [
  {
    titleKeywords: ['Cats in Art', 'cats'],
    searchTerms: ['cat', 'feline', 'kitten'],
    maxArtworks: 8
  },
  {
    titleKeywords: ['Renaissance Masters', 'renaissance'],
    searchTerms: ['leonardo', 'michelangelo', 'raphael', 'renaissance'],
    maxArtworks: 10
  },
  {
    titleKeywords: ['Digital Dreams', 'AI', 'digital'],
    searchTerms: ['digital', 'computer', 'modern', 'contemporary'],
    maxArtworks: 6
  },
  {
    titleKeywords: ['Ocean Mysteries', 'ocean'],
    searchTerms: ['ocean', 'sea', 'marine', 'fish', 'water'],
    maxArtworks: 8
  },
  {
    titleKeywords: ['Impressionist Gardens', 'impressionist'],
    searchTerms: ['monet', 'impressionist', 'garden', 'flowers'],
    maxArtworks: 12
  },
  {
    titleKeywords: ['Street Art', 'street'],
    searchTerms: ['urban', 'street', 'graffiti', 'contemporary'],
    maxArtworks: 7
  },
  {
    titleKeywords: ['Ancient Civilizations', 'ancient'],
    searchTerms: ['ancient', 'egypt', 'greek', 'roman', 'sculpture'],
    maxArtworks: 10
  },
  {
    titleKeywords: ['Japanese Zen', 'japanese'],
    searchTerms: ['japanese', 'zen', 'asia', 'japan'],
    maxArtworks: 8
  },
  {
    titleKeywords: ['Portraits of Power', 'portraits'],
    searchTerms: ['portrait', 'king', 'queen', 'royal', 'emperor'],
    maxArtworks: 6
  },
  {
    titleKeywords: ['Space', 'science fiction'],
    searchTerms: ['space', 'moon', 'star', 'astronomy', 'cosmic'],
    maxArtworks: 5
  },
  {
    titleKeywords: ['Music', 'musical'],
    searchTerms: ['music', 'musician', 'instrument', 'dance'],
    maxArtworks: 8
  },
  {
    titleKeywords: ['Food', 'still life'],
    searchTerms: ['fruit', 'food', 'still life', 'kitchen'],
    maxArtworks: 7
  }
];

async function authenticateUser() {
  console.log('🔐 Authenticating user...');
  
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: USER_EMAIL,
      password: USER_PASSWORD
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Authentication failed: ${error}`);
  }

  const data = await response.json();
  console.log('✅ Authentication successful!');
  return data.token;
}

async function getUserExhibitions(token) {
  console.log('📚 Fetching user exhibitions...');
  
  const response = await fetch(`${API_BASE_URL}/exhibitions`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch exhibitions');
  }

  const data = await response.json();
  console.log(`✅ Found ${data.exhibitions.length} exhibitions`);
  return data.exhibitions;
}

async function searchArtworks(searchTerm, limit = 20) {
  console.log(`🔍 Searching for artworks: "${searchTerm}"`);
  
  const params = new URLSearchParams({
    q: searchTerm,
    hasImages: 'true',
    limit: limit.toString()
  });

  const response = await fetch(`${API_BASE_URL}/artworks/search?${params}`);
  
  if (!response.ok) {
    console.log(`⚠️  Search failed for "${searchTerm}"`);
    return [];
  }

  const data = await response.json();
  const artworks = data.artworks || [];
  console.log(`   Found ${artworks.length} artworks for "${searchTerm}"`);
  return artworks;
}

async function addArtworkToExhibition(token, exhibitionId, artwork) {
  const artworkData = {
    artworkId: artwork.id || artwork.objectID?.toString() || `temp_${Date.now()}`,
    title: artwork.title || 'Untitled',
    artist: artwork.artistDisplayName || artwork.artist || 'Unknown Artist',
    date: artwork.objectDate || artwork.date || '',
    medium: artwork.medium || '',
    department: artwork.department || '',
    culture: artwork.culture || '',
    dimensions: artwork.dimensions || '',
    imageUrl: artwork.primaryImage || artwork.imageUrl || '',
    primaryImageSmall: artwork.primaryImageSmall || artwork.smallImageUrl || '',
    additionalImages: artwork.additionalImages || [],
    objectURL: artwork.objectURL || '',
    tags: artwork.tags || [],
    description: artwork.description || '',
    museumSource: artwork.source || 'met',
    isHighlight: false
  };

  const response = await fetch(`${API_BASE_URL}/exhibitions/${exhibitionId}/artworks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(artworkData)
  });

  if (!response.ok) {
    const error = await response.text();
    console.log(`   ❌ Failed to add "${artwork.title}": ${error}`);
    return false;
  }

  console.log(`   ✅ Added: "${artwork.title}" by ${artwork.artistDisplayName || artwork.artist || 'Unknown'}`);
  return true;
}

async function populateExhibition(token, exhibition, searchMapping) {
  console.log(`\n🎨 Populating "${exhibition.title}"...`);
  
  let allArtworks = [];
  
  // Search for artworks using multiple search terms
  for (const searchTerm of searchMapping.searchTerms) {
    const artworks = await searchArtworks(searchTerm, 10);
    allArtworks = allArtworks.concat(artworks);
    
    // Small delay between searches
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Remove duplicates based on ID
  const uniqueArtworks = allArtworks.filter((artwork, index, self) => 
    index === self.findIndex(a => 
      (a.id || a.objectID) === (artwork.id || artwork.objectID)
    )
  );

  // Limit to max artworks for this exhibition
  const selectedArtworks = uniqueArtworks.slice(0, searchMapping.maxArtworks);

  console.log(`   📊 Found ${uniqueArtworks.length} unique artworks, adding ${selectedArtworks.length}`);

  let successCount = 0;
  
  for (const artwork of selectedArtworks) {
    try {
      const success = await addArtworkToExhibition(token, exhibition._id, artwork);
      if (success) successCount++;
      
      // Small delay between additions
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.log(`   ❌ Error adding artwork: ${error.message}`);
    }
  }

  console.log(`   🎉 Successfully added ${successCount}/${selectedArtworks.length} artworks to "${exhibition.title}"`);
  return successCount;
}

function findExhibitionMapping(exhibitionTitle) {
  return exhibitionSearchMappings.find(mapping => 
    mapping.titleKeywords.some(keyword => 
      exhibitionTitle.toLowerCase().includes(keyword.toLowerCase())
    )
  );
}

async function main() {
  console.log('🎨 Exhibition Curator - Adding Artworks to Exhibitions');
  console.log('====================================================');
  console.log(`📧 User: ${USER_EMAIL}`);
  console.log('');

  try {
    // Authenticate
    const token = await authenticateUser();
    
    // Get user's exhibitions
    const exhibitions = await getUserExhibitions(token);
    
    if (exhibitions.length === 0) {
      console.log('❌ No exhibitions found for user');
      return;
    }

    console.log('\n🎯 Starting artwork population...');
    
    let totalArtworksAdded = 0;
    let exhibitionsPopulated = 0;

    for (const exhibition of exhibitions) {
      try {
        const mapping = findExhibitionMapping(exhibition.title);
        
        if (!mapping) {
          console.log(`⚠️  No search mapping found for "${exhibition.title}" - skipping`);
          continue;
        }

        const artworksAdded = await populateExhibition(token, exhibition, mapping);
        totalArtworksAdded += artworksAdded;
        
        if (artworksAdded > 0) {
          exhibitionsPopulated++;
        }

        // Longer delay between exhibitions
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error populating "${exhibition.title}":`, error.message);
      }
    }

    console.log('\n🎉 Artwork population completed!');
    console.log('📊 Summary:');
    console.log(`   🎨 Total artworks added: ${totalArtworksAdded}`);
    console.log(`   📚 Exhibitions populated: ${exhibitionsPopulated}/${exhibitions.length}`);
    console.log(`   📖 Average artworks per exhibition: ${(totalArtworksAdded / exhibitionsPopulated).toFixed(1)}`);
    console.log('');
    console.log('💡 Your exhibitions now contain:');
    console.log('   🖼️  Real museum artworks with images');
    console.log('   👨‍🎨 Artist information and artwork details');
    console.log('   🏛️  Diverse content from multiple sources');
    console.log('   📱 Rich data for frontend testing');
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Handle unhandled promises
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
  process.exit(1);
});

main();