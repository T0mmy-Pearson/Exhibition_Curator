import { connectDB } from '../connection';
import { User } from '../../models/User';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

// Generate a shareable link for exhibitions
function generateShareableLink(title: string, userId: string): string {
  const cleanTitle = title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 30);
  const userIdShort = userId.substring(userId.length - 6);
  const randomId = randomBytes(4).toString('hex');
  return `${cleanTitle}-${userIdShort}-${randomId}`;
}

// Mock artwork data from various museums and periods
const mockArtworks = [
  // Renaissance Masterpieces
  {
    artworkId: 'met-436532',
    title: 'The Last Supper Study',
    artist: 'Leonardo da Vinci',
    date: '1495-1498',
    medium: 'Oil on canvas',
    department: 'European Paintings',
    culture: 'Italian',
    period: 'Renaissance',
    dimensions: '460 cm × 880 cm',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ep/web-large/DT1931.jpg',
    objectURL: 'https://www.metmuseum.org/art/collection/search/436532',
    tags: ['renaissance', 'religious', 'mural', 'masterpiece'],
    description: 'One of the most famous works of Christian art',
    museumSource: 'met',
    isHighlight: true
  },
  {
    artworkId: 'met-437133',
    title: 'Venus and Mars',
    artist: 'Sandro Botticelli',
    date: '1483',
    medium: 'Tempera on wood',
    department: 'European Paintings',
    culture: 'Italian',
    period: 'Renaissance',
    dimensions: '69 cm × 173.4 cm',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ep/web-large/DT1932.jpg',
    objectURL: 'https://www.metmuseum.org/art/collection/search/437133',
    tags: ['mythology', 'renaissance', 'love', 'classical'],
    description: 'Depicts the Roman gods Venus and Mars in an intimate scene',
    museumSource: 'met',
    isHighlight: true
  },

  // Impressionist Works
  {
    artworkId: 'met-436121',
    title: 'Water Lilies',
    artist: 'Claude Monet',
    date: '1919',
    medium: 'Oil on canvas',
    department: 'European Paintings',
    culture: 'French',
    period: 'Impressionism',
    dimensions: '100 cm × 200 cm',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ep/web-large/DT1933.jpg',
    objectURL: 'https://www.metmuseum.org/art/collection/search/436121',
    tags: ['impressionism', 'nature', 'garden', 'series'],
    description: 'Part of Monet\'s famous water lily series from Giverny',
    museumSource: 'met',
    isHighlight: true
  },
  {
    artworkId: 'met-437890',
    title: 'The Dance Class',
    artist: 'Edgar Degas',
    date: '1874',
    medium: 'Oil on canvas',
    department: 'European Paintings',
    culture: 'French',
    period: 'Impressionism',
    dimensions: '85 cm × 75 cm',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ep/web-large/DT1934.jpg',
    objectURL: 'https://www.metmuseum.org/art/collection/search/437890',
    tags: ['ballet', 'dance', 'impressionism', 'movement'],
    description: 'Captures the grace and discipline of ballet dancers',
    museumSource: 'met',
    isHighlight: false
  },

  // Modern Art
  {
    artworkId: 'met-489223',
    title: 'The Starry Night Over the Rhône',
    artist: 'Vincent van Gogh',
    date: '1888',
    medium: 'Oil on canvas',
    department: 'European Paintings',
    culture: 'Dutch',
    period: 'Post-Impressionism',
    dimensions: '72.5 cm × 92 cm',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ep/web-large/DT1935.jpg',
    objectURL: 'https://www.metmuseum.org/art/collection/search/489223',
    tags: ['post-impressionism', 'night', 'stars', 'river'],
    description: 'Van Gogh\'s masterful depiction of the night sky',
    museumSource: 'met',
    isHighlight: true
  },
  {
    artworkId: 'met-488776',
    title: 'Les Demoiselles d\'Avignon',
    artist: 'Pablo Picasso',
    date: '1907',
    medium: 'Oil on canvas',
    department: 'Modern Art',
    culture: 'Spanish',
    period: 'Cubism',
    dimensions: '243.9 cm × 233.7 cm',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ma/web-large/DT1936.jpg',
    objectURL: 'https://www.metmuseum.org/art/collection/search/488776',
    tags: ['cubism', 'revolutionary', 'modern', 'abstract'],
    description: 'A revolutionary work that helped launch the Cubist movement',
    museumSource: 'met',
    isHighlight: true
  },

  // Ancient Art
  {
    artworkId: 'met-544501',
    title: 'Bust of Nefertiti',
    artist: 'Thutmose',
    date: '1345 BCE',
    medium: 'Limestone and stucco',
    department: 'Egyptian Art',
    culture: 'Egyptian',
    period: 'Ancient Egypt',
    dimensions: '47 cm height',
    imageUrl: 'https://images.metmuseum.org/CRDImages/eg/web-large/DT1937.jpg',
    objectURL: 'https://www.metmuseum.org/art/collection/search/544501',
    tags: ['ancient', 'egypt', 'portrait', 'royal'],
    description: 'Iconic sculpture of the ancient Egyptian queen',
    museumSource: 'met',
    isHighlight: true
  },
  {
    artworkId: 'met-254890',
    title: 'Greek Amphora with Black Figures',
    artist: 'Unknown Greek Artisan',
    date: '530 BCE',
    medium: 'Terracotta',
    department: 'Greek and Roman Art',
    culture: 'Greek',
    period: 'Ancient Greece',
    dimensions: '45 cm height',
    imageUrl: 'https://images.metmuseum.org/CRDImages/gr/web-large/DT1938.jpg',
    objectURL: 'https://www.metmuseum.org/art/collection/search/254890',
    tags: ['ancient', 'greece', 'pottery', 'mythology'],
    description: 'Black-figure pottery depicting mythological scenes',
    museumSource: 'met',
    isHighlight: false
  },

  // Asian Art
  {
    artworkId: 'met-779821',
    title: 'The Great Wave off Kanagawa',
    artist: 'Katsushika Hokusai',
    date: '1831',
    medium: 'Woodblock print',
    department: 'Asian Art',
    culture: 'Japanese',
    period: 'Edo Period',
    dimensions: '25.7 cm × 37.9 cm',
    imageUrl: 'https://images.metmuseum.org/CRDImages/as/web-large/DT1939.jpg',
    objectURL: 'https://www.metmuseum.org/art/collection/search/779821',
    tags: ['japanese', 'woodblock', 'nature', 'waves'],
    description: 'The most famous work of Japanese art in the world',
    museumSource: 'met',
    isHighlight: true
  },
  {
    artworkId: 'met-778654',
    title: 'Spring Morning in the Han Palace',
    artist: 'Qiu Ying',
    date: '1540',
    medium: 'Ink and color on silk',
    department: 'Asian Art',
    culture: 'Chinese',
    period: 'Ming Dynasty',
    dimensions: '30.6 cm × 574.1 cm',
    imageUrl: 'https://images.metmuseum.org/CRDImages/as/web-large/DT1940.jpg',
    objectURL: 'https://www.metmuseum.org/art/collection/search/778654',
    tags: ['chinese', 'court', 'scroll', 'palace'],
    description: 'Detailed depiction of court life in ancient China',
    museumSource: 'met',
    isHighlight: false
  },

  // Contemporary Art
  {
    artworkId: 'met-891234',
    title: 'Campbell\'s Soup Cans',
    artist: 'Andy Warhol',
    date: '1962',
    medium: 'Acrylic on canvas',
    department: 'Contemporary Art',
    culture: 'American',
    period: 'Pop Art',
    dimensions: '51 cm × 41 cm each',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ma/web-large/DT1941.jpg',
    objectURL: 'https://www.metmuseum.org/art/collection/search/891234',
    tags: ['pop-art', 'consumer', 'american', 'series'],
    description: 'Iconic work of American Pop Art',
    museumSource: 'met',
    isHighlight: true
  }
];

// Comprehensive user data with varied backgrounds and interests
const mockUsers = [
  {
    username: 'artlover123',
    email: 'artlover@example.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Chen',
    bio: 'Art history enthusiast and museum curator. Passionate about Renaissance art and contemporary installations.',
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616c45f4d14?w=400',
    preferences: {
      defaultExhibitionPrivacy: false,
      emailNotifications: true,
      preferredMuseums: ['met', 'louvre', 'moma'],
      interests: ['renaissance', 'contemporary', 'sculpture']
    }
  },
  {
    username: 'curator_mike',
    email: 'mike.curator@museum.org',
    password: 'curatorpass456',
    firstName: 'Michael',
    lastName: 'Rodriguez',
    bio: 'Professional museum curator with 15 years experience. Specializing in modern and contemporary art movements.',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    preferences: {
      defaultExhibitionPrivacy: true,
      emailNotifications: true,
      preferredMuseums: ['moma', 'guggenheim', 'whitney'],
      interests: ['modern', 'contemporary', 'abstract']
    }
  },
  {
    username: 'history_buff',
    email: 'historian@university.edu',
    password: 'historybuff789',
    firstName: 'Dr. Emily',
    lastName: 'Watson',
    bio: 'Art historian and professor. Research focus on ancient civilizations and their artistic expressions.',
    profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    preferences: {
      defaultExhibitionPrivacy: false,
      emailNotifications: false,
      preferredMuseums: ['met', 'british-museum', 'louvre'],
      interests: ['ancient', 'archaeological', 'classical']
    }
  },
  {
    username: 'impressionist_fan',
    email: 'claude@artmail.com',
    password: 'monet123',
    firstName: 'Claude',
    lastName: 'Moreau',
    bio: 'French art enthusiast living in Paris. Deeply fascinated by Impressionist painters and their techniques.',
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    preferences: {
      defaultExhibitionPrivacy: false,
      emailNotifications: true,
      preferredMuseums: ['orsay', 'orangerie', 'marmottan'],
      interests: ['impressionism', 'post-impressionism', 'plein-air']
    }
  },
  {
    username: 'modern_artist',
    email: 'artist@studio.com',
    password: 'createart999',
    firstName: 'Jordan',
    lastName: 'Kim',
    bio: 'Contemporary artist and gallery owner. Always exploring new artistic movements and emerging talents.',
    profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    preferences: {
      defaultExhibitionPrivacy: true,
      emailNotifications: true,
      preferredMuseums: ['moma', 'whitney', 'lacma'],
      interests: ['contemporary', 'digital-art', 'installations']
    }
  },
  {
    username: 'ancient_arts',
    email: 'archaeology@dig.org',
    password: 'ancientart111',
    firstName: 'Professor',
    lastName: 'Alexandria',
    bio: 'Archaeologist and ancient art specialist. Documenting and preserving ancient artistic treasures.',
    profileImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    preferences: {
      defaultExhibitionPrivacy: false,
      emailNotifications: false,
      preferredMuseums: ['met', 'british-museum', 'egyptian-museum'],
      interests: ['ancient', 'egypt', 'mesopotamia', 'greece']
    }
  }
];

// Rich exhibition data with diverse themes and content
const exhibitionTemplates = [
  {
    title: 'Renaissance Masters: Light and Shadow',
    description: 'An exploration of chiaroscuro techniques in Renaissance painting, featuring works by Leonardo, Caravaggio, and their contemporaries.',
    theme: 'Renaissance',
    isPublic: true,
    tags: ['renaissance', 'chiaroscuro', 'italian-art', 'technique'],
    artworkIds: ['met-436532', 'met-437133']
  },
  {
    title: 'Impressionist Gardens: Nature in Paint',
    description: 'Journey through the gardens that inspired the Impressionists, from Monet\'s Giverny to Renoir\'s countryside scenes.',
    theme: 'Impressionism',
    isPublic: true,
    tags: ['impressionism', 'nature', 'gardens', 'outdoor-painting'],
    artworkIds: ['met-436121', 'met-437890']
  },
  {
    title: 'Cubism Revolution: Breaking Reality',
    description: 'The revolutionary movement that changed art forever. Explore how Picasso and others shattered traditional perspective.',
    theme: 'Modern Art',
    isPublic: false,
    tags: ['cubism', 'modern', 'revolutionary', 'abstract'],
    artworkIds: ['met-488776']
  },
  {
    title: 'Ancient Civilizations: Art Through Time',
    description: 'A journey through ancient artistic expressions, from Egyptian sculptures to Greek pottery.',
    theme: 'Ancient Art',
    isPublic: true,
    tags: ['ancient', 'civilizations', 'archaeology', 'historical'],
    artworkIds: ['met-544501', 'met-254890']
  },
  {
    title: 'Eastern Aesthetics: Asian Art Treasures',
    description: 'Discover the beauty and philosophy of Asian art traditions, from Japanese prints to Chinese scroll paintings.',
    theme: 'Asian Art',
    isPublic: true,
    tags: ['asian', 'japanese', 'chinese', 'philosophy'],
    artworkIds: ['met-779821', 'met-778654']
  },
  {
    title: 'Pop Art Explosion: Consumer Culture in Art',
    description: 'The bold, colorful world of Pop Art that transformed everyday objects into high art.',
    theme: 'Contemporary',
    isPublic: false,
    tags: ['pop-art', 'consumer', 'american', 'warhol'],
    artworkIds: ['met-891234']
  },
  {
    title: 'Post-Impressionist Visions: Beyond Reality',
    description: 'Van Gogh, Cézanne, and Gauguin pushed beyond Impressionism to create new artistic languages.',
    theme: 'Post-Impressionism',
    isPublic: true,
    tags: ['post-impressionism', 'van-gogh', 'expression', 'color'],
    artworkIds: ['met-489223']
  },
  {
    title: 'Private Collection: Hidden Gems',
    description: 'A curated selection of lesser-known masterpieces that deserve recognition.',
    theme: 'Mixed',
    isPublic: false,
    tags: ['hidden-gems', 'discovery', 'curated', 'rare'],
    artworkIds: ['met-437890', 'met-254890', 'met-778654']
  }
];

async function seedMockDatabase() {
  try {
    console.log('🌱 Starting comprehensive mock database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    
    console.log('👥 Creating mock users with exhibitions and favorites...');
    
    for (let i = 0; i < mockUsers.length; i++) {
      const userData = mockUsers[i];
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create exhibitions for this user
      const userExhibitions = [];
      const numExhibitions = Math.floor(Math.random() * 3) + 1; // 1-3 exhibitions per user
      
      for (let j = 0; j < numExhibitions; j++) {
        const template = exhibitionTemplates[(i * 2 + j) % exhibitionTemplates.length];
        
        // Create artworks array for this exhibition
        const exhibitionArtworks = template.artworkIds.map(artworkId => {
          const artwork = mockArtworks.find(a => a.artworkId === artworkId);
          return {
            ...artwork,
            addedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
          };
        }).filter(Boolean);
        
        const exhibition = {
          title: template.title + (j > 0 ? ` Vol. ${j + 1}` : ''),
          description: template.description,
          theme: template.theme,
          isPublic: template.isPublic && Math.random() > 0.3, // 70% chance of being public if template is public
          tags: template.tags,
          artworks: exhibitionArtworks,
          shareableLink: template.isPublic ? generateShareableLink(template.title, 'user' + i) : undefined,
          createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Random date within last 60 days
          updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)   // Random date within last 7 days
        };
        
        userExhibitions.push(exhibition);
      }
      
      // Create favorite artworks for this user
      const numFavorites = Math.floor(Math.random() * 8) + 2; // 2-9 favorites per user
      const favoriteArtworks = [];
      const shuffledArtworks = [...mockArtworks].sort(() => Math.random() - 0.5);
      
      for (let k = 0; k < Math.min(numFavorites, shuffledArtworks.length); k++) {
        favoriteArtworks.push({
          ...shuffledArtworks[k],
          addedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Random date within last 90 days
        });
      }
      
      // Create user with all data
      const user = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        bio: userData.bio,
        profileImageUrl: userData.profileImageUrl,
        exhibitions: userExhibitions,
        favoriteArtworks: favoriteArtworks,
        preferences: userData.preferences,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within last year
        lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)    // Random date within last week
      });
      
      await user.save();
      console.log(`✅ Created user: ${userData.username}`);
      console.log(`   📚 Exhibitions: ${userExhibitions.length}`);
      console.log(`   ❤️  Favorites: ${favoriteArtworks.length}`);
    }
    
    // Create summary statistics
    const totalUsers = await User.countDocuments();
    const totalExhibitions = await User.aggregate([
      { $project: { exhibitionCount: { $size: '$exhibitions' } } },
      { $group: { _id: null, total: { $sum: '$exhibitionCount' } } }
    ]);
    const totalFavorites = await User.aggregate([
      { $project: { favoriteCount: { $size: '$favoriteArtworks' } } },
      { $group: { _id: null, total: { $sum: '$favoriteCount' } } }
    ]);
    const publicExhibitions = await User.aggregate([
      { $unwind: '$exhibitions' },
      { $match: { 'exhibitions.isPublic': true } },
      { $count: 'total' }
    ]);
    
    console.log('\n📊 Database Seeding Complete!');
    console.log('===============================');
    console.log(`👥 Total Users: ${totalUsers}`);
    console.log(`📚 Total Exhibitions: ${totalExhibitions[0]?.total || 0}`);
    console.log(`🌍 Public Exhibitions: ${publicExhibitions[0]?.total || 0}`);
    console.log(`❤️  Total Favorites: ${totalFavorites[0]?.total || 0}`);
    console.log(`🎨 Unique Artworks: ${mockArtworks.length}`);
    
    console.log('\n🔑 Test User Credentials:');
    console.log('========================');
    mockUsers.forEach(user => {
      console.log(`📧 ${user.email} / 🔒 ${user.password}`);
    });
    
    console.log('\n🎉 Mock database ready for testing and exploration!');
    
  } catch (error) {
    console.error('❌ Error seeding mock database:', error);
    throw error;
  }
}

export { seedMockDatabase };