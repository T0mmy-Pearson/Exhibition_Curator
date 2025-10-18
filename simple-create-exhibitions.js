const https = require('https');

// Exhibition data to create
const exhibitions = [
  { title: "Renaissance Masterpieces", description: "A curated collection of Renaissance paintings and sculptures.", theme: "Renaissance Art", tags: ["renaissance", "painting"], isPublic: true },
  { title: "Impressionist Visions", description: "Explore the light and color of French Impressionism.", theme: "Impressionism", tags: ["impressionism", "french"], isPublic: true },
  { title: "Modern Abstract Expressions", description: "Bold forms and revolutionary techniques of 20th century abstract art.", theme: "Abstract Art", tags: ["abstract", "modern"], isPublic: true },
  { title: "Ancient Civilizations", description: "Artifacts from ancient Egypt, Greece, and Rome.", theme: "Ancient Art", tags: ["ancient", "egypt"], isPublic: true },
  { title: "Asian Art Traditions", description: "Traditional and contemporary works from Asia.", theme: "Asian Art", tags: ["asian", "traditional"], isPublic: true }
];

async function createExhibitions() {
  console.log('🔐 Logging in...');
  
  // Login first
  const loginData = JSON.stringify({
    email: 't.pearson0209@gmail.com',
    password: 'testtest123'
  });

  const loginOptions = {
    hostname: 'exhibition-curator-backend.onrender.com',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(loginOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          const token = response.token;
          console.log('✅ Login successful!');
          
          // Create exhibitions
          createExhibitionsWithToken(token).then(resolve).catch(reject);
        } else {
          reject(new Error(`Login failed: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(loginData);
    req.end();
  });
}

async function createExhibitionsWithToken(token) {
  console.log('🎨 Creating exhibitions...\n');
  
  for (const exhibition of exhibitions) {
    await new Promise((resolve, reject) => {
      const postData = JSON.stringify(exhibition);
      
      const options = {
        hostname: 'exhibition-curator-backend.onrender.com',
        port: 443,
        path: '/api/exhibitions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 201) {
            const created = JSON.parse(data);
            console.log(`✅ Created: ${exhibition.title} (ID: ${created._id})`);
          } else {
            console.log(`❌ Failed: ${exhibition.title} - ${res.statusCode} ${data}`);
          }
          resolve();
        });
      });

      req.on('error', (error) => {
        console.log(`❌ Error: ${exhibition.title} - ${error.message}`);
        resolve();
      });

      req.write(postData);
      req.end();
    });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n🎉 Done! Check your exhibitions at /profile');
}

createExhibitions().catch(console.error);