#!/usr/bin/env node

/**
 * Script to add multiple fun exhibitions to Thomas Pearson's account
 * This will populate the database with diverse exhibition data for testing
 */

const API_BASE_URL = 'https://exhibition-curator-backend.onrender.com/api';

// User credentials
const USER_EMAIL = 't.pearson0209@gmail.com';
const USER_PASSWORD = 'testtest123';

// Fun exhibition data with diverse themes
const exhibitions = [
  {
    title: "Cats in Art",
    description: "An exploration of Cats in the history of Art",
    theme: "Animals",
    isPublic: true,
    tags: ["animals", "cats", "historical", "paintings"]
  },
  {
    title: "Renaissance Masters Reimagined",
    description: "A modern perspective on the greatest works of the Renaissance period, featuring da Vinci, Michelangelo, and Raphael",
    theme: "Renaissance",
    isPublic: true,
    tags: ["renaissance", "masters", "classical", "european"]
  },
  {
    title: "Digital Dreams: AI and Art",
    description: "Exploring the intersection of artificial intelligence and creative expression in the 21st century",
    theme: "Contemporary",
    isPublic: false,
    tags: ["digital", "ai", "technology", "modern"]
  },
  {
    title: "Ocean Mysteries",
    description: "Artworks inspired by the depths of our oceans, from ancient sea creatures to modern marine conservation",
    theme: "Nature",
    isPublic: true,
    tags: ["ocean", "marine", "nature", "conservation"]
  },
  {
    title: "Impressionist Gardens",
    description: "Monet's garden paintings and other impressionist works celebrating nature's beauty",
    theme: "Impressionism",
    isPublic: true,
    tags: ["impressionism", "gardens", "monet", "nature"]
  },
  {
    title: "Street Art Revolution",
    description: "From Banksy to local murals: how street art changed the urban landscape",
    theme: "Pop Art",
    isPublic: false,
    tags: ["street art", "urban", "graffiti", "contemporary"]
  },
  {
    title: "Ancient Civilizations",
    description: "Artifacts and artworks from Egypt, Greece, Rome, and Mesopotamia",
    theme: "Ancient Art",
    isPublic: true,
    tags: ["ancient", "egypt", "greece", "rome", "artifacts"]
  },
  {
    title: "Japanese Zen & Beauty",
    description: "Traditional Japanese art forms: from ink paintings to tea ceremony aesthetics",
    theme: "Asian Art",
    isPublic: true,
    tags: ["japanese", "zen", "traditional", "tea ceremony"]
  },
  {
    title: "Portraits of Power",
    description: "Royal portraits and political art throughout history",
    theme: "Historical",
    isPublic: false,
    tags: ["portraits", "royalty", "politics", "power"]
  },
  {
    title: "Space & Science Fiction",
    description: "Artistic visions of space exploration, aliens, and future worlds",
    theme: "Science Fiction",
    isPublic: true,
    tags: ["space", "sci-fi", "future", "exploration"]
  },
  {
    title: "Music & Visual Art",
    description: "When sound meets sight: artworks inspired by music and musicians",
    theme: "Mixed",
    isPublic: true,
    tags: ["music", "musicians", "synesthesia", "sound"]
  },
  {
    title: "Food in Art History",
    description: "From still life fruits to modern food photography - how cuisine inspired artists",
    theme: "Still Life",
    isPublic: false,
    tags: ["food", "still life", "cuisine", "culture"]
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

async function createExhibition(token, exhibitionData) {
  console.log(`📚 Creating exhibition: "${exhibitionData.title}"`);
  
  const response = await fetch(`${API_BASE_URL}/exhibitions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(exhibitionData)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`❌ Failed to create "${exhibitionData.title}": ${error}`);
    return null;
  }

  const data = await response.json();
  console.log(`✅ Created: "${exhibitionData.title}" (${exhibitionData.isPublic ? 'Public' : 'Private'})`);
  return data.exhibition;
}

async function main() {
  console.log('🎨 Exhibition Curator - Adding Fun Exhibitions');
  console.log('==============================================');
  console.log(`📧 User: ${USER_EMAIL}`);
  console.log(`🎯 Target: ${exhibitions.length} new exhibitions`);
  console.log('');

  try {
    // Authenticate
    const token = await authenticateUser();
    
    // Create exhibitions
    console.log('📚 Creating exhibitions...');
    console.log('');
    
    const createdExhibitions = [];
    
    for (const exhibitionData of exhibitions) {
      try {
        const exhibition = await createExhibition(token, exhibitionData);
        if (exhibition) {
          createdExhibitions.push(exhibition);
        }
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Error creating "${exhibitionData.title}":`, error.message);
      }
    }
    
    console.log('');
    console.log('🎉 Exhibition creation completed!');
    console.log(`📊 Successfully created: ${createdExhibitions.length}/${exhibitions.length} exhibitions`);
    console.log('');
    console.log('📋 Summary:');
    
    const publicCount = createdExhibitions.filter(e => e.isPublic).length;
    const privateCount = createdExhibitions.length - publicCount;
    
    console.log(`   🌐 Public exhibitions: ${publicCount}`);
    console.log(`   🔒 Private exhibitions: ${privateCount}`);
    console.log('');
    console.log('🎯 Themes covered:');
    const themes = [...new Set(createdExhibitions.map(e => e.theme))];
    themes.forEach(theme => console.log(`   • ${theme}`));
    console.log('');
    console.log('💡 You can now test:');
    console.log('   🔍 Search by theme, title, or tags');
    console.log('   🎨 Browse exhibitions in the frontend');
    console.log('   🌐 Public/private visibility');
    console.log('   📱 Different exhibition themes and content');
    
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