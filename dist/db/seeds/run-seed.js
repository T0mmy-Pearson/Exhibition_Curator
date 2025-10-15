"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const connection_1 = require("../connection");
const User_1 = require("../../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const sampleUsers = [
    {
        username: 'artlover123',
        email: 'artlover@example.com',
        password: 'password123',
        firstName: 'Alice',
        lastName: 'Johnson',
        bio: 'Passionate about classical and contemporary art',
        exhibitions: [
            {
                title: 'Renaissance Masters',
                description: 'A curated collection of Renaissance masterpieces',
                theme: 'Renaissance',
                isPublic: true,
                tags: ['renaissance', 'classical', 'painting'],
                artworks: [
                    {
                        artworkId: '436532',
                        title: 'The Annunciation',
                        artist: 'Gerard David',
                        date: 'ca. 1506',
                        medium: 'Oil on wood',
                        imageUrl: 'https://images.metmuseum.org/CRDImages/ep/original/DT1567.jpg',
                        primaryImageSmall: 'https://images.metmuseum.org/CRDImages/ep/web-large/DT1567.jpg',
                        description: 'Flemish painting depicting the Annunciation',
                        museumSource: 'met',
                        addedAt: new Date()
                    }
                ]
            }
        ],
        favoriteArtworks: [
            {
                artworkId: '436532',
                title: 'The Annunciation',
                artist: 'Gerard David',
                imageUrl: 'https://images.metmuseum.org/CRDImages/ep/original/DT1567.jpg',
                museumSource: 'met',
                addedAt: new Date()
            }
        ]
    },
    {
        username: 'curator_mike',
        email: 'mike@museum.com',
        password: 'password123',
        firstName: 'Michael',
        lastName: 'Rodriguez',
        bio: 'Professional museum curator specializing in modern art',
        exhibitions: [
            {
                title: 'Modern Abstractions',
                description: 'Exploring abstract art movements of the 20th century',
                theme: 'Modern',
                isPublic: true,
                tags: ['modern', 'abstract', 'contemporary'],
                artworks: []
            },
            {
                title: 'Private Collection',
                description: 'My personal favorite pieces',
                theme: 'Personal',
                isPublic: false,
                tags: ['personal', 'favorites'],
                artworks: []
            }
        ],
        favoriteArtworks: []
    }
];
async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');
        // Connect to database
        await (0, connection_1.connectDB)();
        // Clear existing data
        console.log('🗑️  Clearing existing users...');
        await User_1.User.deleteMany({});
        // Insert sample users
        console.log('👥 Creating sample users...');
        for (const userData of sampleUsers) {
            const { password, ...otherData } = userData;
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            const user = new User_1.User({
                ...otherData,
                password: hashedPassword
            });
            await user.save();
            console.log(`✅ Created user: ${userData.username}`);
        }
        console.log('🎉 Database seeding completed successfully!');
        console.log(`📊 Created ${sampleUsers.length} users with exhibitions and favorites`);
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
    }
    finally {
        await (0, connection_1.disconnectDB)();
    }
}
// Run the seeder if this file is executed directly
if (require.main === module) {
    seedDatabase();
}
//# sourceMappingURL=run-seed.js.map