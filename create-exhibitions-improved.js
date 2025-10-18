const fetch = require('node-fetch');
const { AbortController } = require('node-abort-controller');

// Configuration
const API_BASE_URL = 'https://exhibition-curator-backend.onrender.com/api';
const USER_EMAIL = 't.pearson0209@gmail.com';
const USER_PASSWORD = 'testtest123';
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Create a fetch wrapper with timeout
function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  return fetch(url, {
    ...options,
    signal: controller.signal
  }).finally(() => {
    clearTimeout(id);
  });
}

// Exhibition data to create
const exhibitions = [
  {
    title: "Renaissance Masterpieces",
    description: "A curated collection of Renaissance paintings and sculptures showcasing the artistic revolution of the 14th to 17th centuries.",
    theme: "Renaissance Art",
    tags: ["renaissance", "painting", "sculpture", "classical"],
    isPublic: true
  },
  {
    title: "Impressionist Visions",
    description: "Explore the light and color of French Impressionism through works that captured fleeting moments and changing atmospheres.",
    theme: "Impressionism",
    tags: ["impressionism", "french", "light", "color"],
    isPublic: true
  },
  {
    title: "Modern Abstract Expressions",
    description: "Bold forms and revolutionary techniques that defined 20th century abstract art and changed how we perceive reality.",
    theme: "Abstract Art",
    tags: ["abstract", "modern", "20th century", "experimental"],
    isPublic: true
  },
  {
    title: "Ancient Civilizations",
    description: "Artifacts and artworks from ancient Egypt, Greece, and Rome that tell the stories of humanity's earliest civilizations.",
    theme: "Ancient Art",
    tags: ["ancient", "egypt", "greece", "rome", "artifacts"],
    isPublic: true
  },
  {
    title: "Asian Art Traditions",
    description: "Traditional and contemporary works from China, Japan, Korea, and India showcasing diverse Asian artistic heritage.",
    theme: "Asian Art",
    tags: ["asian", "traditional", "contemporary", "cultural"],
    isPublic: true
  },
  {
    title: "Contemporary Photography",
    description: "Modern photographic works that explore themes of identity, society, and the human condition in the digital age.",
    theme: "Photography",
    tags: ["photography", "contemporary", "digital", "society"],
    isPublic: true
  }
];

async function loginAndCreateExhibitions() {
  try {
    console.log('🔐 Logging in as', USER_EMAIL);
    console.log('⏱️  Timeout set to 30 seconds...');
    
    // Login to get authentication token
    const loginResponse = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: USER_EMAIL,
        password: USER_PASSWORD
      })
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.text();
      throw new Error(`Login failed: ${loginResponse.status} ${errorData}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    console.log('✅ Login successful!');
    console.log('🎨 Creating exhibitions...\n');

    // Create each exhibition
    let successCount = 0;
    let failCount = 0;

    for (const exhibition of exhibitions) {
      try {
        console.log(`Creating: "${exhibition.title}"`);
        
        const createResponse = await fetchWithTimeout(`${API_BASE_URL}/exhibitions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(exhibition)
        }, 15000); // 15 second timeout for each exhibition

        if (createResponse.ok) {
          const createdExhibition = await createResponse.json();
          console.log(`✅ Created: ${exhibition.title} (ID: ${createdExhibition._id})`);
          successCount++;
        } else {
          const errorData = await createResponse.text();
          console.log(`❌ Failed: ${exhibition.title} - ${createResponse.status} ${errorData}`);
          failCount++;
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log(`⏱️  Timeout creating ${exhibition.title}`);
        } else {
          console.log(`❌ Error creating ${exhibition.title}:`, error.message);
        }
        failCount++;
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully created: ${successCount} exhibitions`);
    console.log(`❌ Failed to create: ${failCount} exhibitions`);
    
    if (successCount > 0) {
      console.log(`\n🎉 Your exhibitions are ready! You can view them at:`);
      console.log(`🌐 Search: https://exhibition-curator-frontend.vercel.app/search?mode=exhibitions`);
      console.log(`👤 Profile: https://exhibition-curator-frontend.vercel.app/profile`);
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Login request timed out. The backend might be slow or unavailable.');
    } else {
      console.error('❌ Script failed:', error.message);
    }
    
    console.log('\n💡 Troubleshooting tips:');
    console.log('- Check if the backend is running: https://exhibition-curator-backend.onrender.com/api/health');
    console.log('- Verify your credentials are correct');
    console.log('- Try again in a few minutes if the server is starting up');
    
    process.exit(1);
  }
}

// Run the script
console.log('🚀 Starting exhibition creation script...');
console.log('🌐 Backend URL:', API_BASE_URL);
loginAndCreateExhibitions();