# Exhibition Curator API

A Node.js Express backend API for managing virtual museum exhibitions. This API allows users to search artworks from multiple museum APIs, create personalized exhibitions, and manage curated collections.

## Features

- **User Authentication**: Registration, login, and JWT-based authentication
- **Artwork Search**: Integration with multiple museum APIs (Metropolitan Museum of Art, Rijksmuseum)
- **Exhibition Management**: Create, update, and manage virtual exhibitions
- **Favorites System**: Save and organize favorite artworks
- **RESTful API Design**: Following best practices with comprehensive error handling

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB (with embedded document structure)
- **Authentication**: JWT, bcrypt
- **External APIs**: Metropolitan Museum of Art API, Rijksmuseum API
- **Testing**: Jest, Supertest
- **Security**: Helmet, CORS, Rate limiting

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher) - local installation or MongoDB Atlas
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd exhibition-curator-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- MongoDB connection URI
- JWT secret
- Museum API keys

4. Ensure MongoDB is running (local or cloud):
```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas cloud service
```

5. Build the TypeScript code:
```bash
npm run build
```

### Running the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

#### Running Tests
```bash
npm test
```

#### Watch Mode for Tests
```bash
npm run test:watch
```

## API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login

### Users
- `GET /api/users` - Get all users (protected)
- `GET /api/users/:user_id` - Get user by ID (protected)
- `PATCH /api/users/:user_id` - Update user (protected)
- `DELETE /api/users/:user_id` - Delete user (protected)

### Artworks
- `GET /api/artworks/search` - Search artworks with filters
- `GET /api/artworks/:artwork_id` - Get artwork details
- `GET /api/artworks/favorites/:user_id` - Get user's favorite artworks (protected)
- `POST /api/artworks/favorites` - Add artwork to favorites (protected)
- `DELETE /api/artworks/favorites/:artwork_id` - Remove from favorites (protected)

### Exhibitions
- `GET /api/exhibitions/public/:exhibition_id` - View public exhibition
- `GET /api/exhibitions` - Get user's exhibitions (protected)
- `GET /api/exhibitions/:exhibition_id` - Get exhibition details (protected)
- `POST /api/exhibitions` - Create new exhibition (protected)
- `PATCH /api/exhibitions/:exhibition_id` - Update exhibition (protected)
- `DELETE /api/exhibitions/:exhibition_id` - Delete exhibition (protected)
- `POST /api/exhibitions/:exhibition_id/artworks` - Add artwork to exhibition (protected)
- `DELETE /api/exhibitions/:exhibition_id/artworks/:artwork_id` - Remove artwork from exhibition (protected)

## Database Structure

The application uses MongoDB with an embedded document structure:

### User Document Structure
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  bio: String,
  profileImageUrl: String,
  isActive: Boolean,
  exhibitions: [
    {
      _id: ObjectId,
      title: String,
      description: String,
      theme: String,
      isPublic: Boolean,
      shareableLink: String,
      artworks: [
        {
          artworkId: String,
          title: String,
          artist: String,
          date: String,
          medium: String,
          imageUrl: String,
          museumSource: String,
          addedAt: Date
        }
      ],
      createdAt: Date,
      updatedAt: Date,
      tags: [String],
      coverImageUrl: String
    }
  ],
  favoriteArtworks: [
    {
      artworkId: String,
      title: String,
      artist: String,
      imageUrl: String,
      museumSource: String,
      addedAt: Date
    }
  ],
  preferences: {
    defaultExhibitionPrivacy: Boolean,
    emailNotifications: Boolean,
    preferredMuseums: [String],
    interests: [String]
  },
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}
```

This structure follows the requirement for a **single document per user, with exhibitions embedded, and artworks embedded within exhibitions**.

## Museum APIs Integration

### Metropolitan Museum of Art API
- **Base URL**: `https://collectionapi.metmuseum.org/public/collection/v1`
- **Features**: Search objects, get object details, filter by department
- **Rate Limits**: No API key required, reasonable rate limits

### Rijksmuseum API
- **Base URL**: `https://www.rijksmuseum.nl/api/en/collection`
- **Features**: Search collection, get object details, high-quality images
- **Rate Limits**: API key required, 10,000 requests/day

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository.