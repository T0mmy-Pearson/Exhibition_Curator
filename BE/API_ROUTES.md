# Exhibition Curator API - Complete Route Specification

## Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user profile

## User Routes
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:user_id` - Get user profile
- `PATCH /api/users/:user_id` - Update user profile
- `DELETE /api/users/:user_id` - Delete user account
- `GET /api/users/:user_id/exhibitions` - Get user's exhibitions
- `GET /api/users/:user_id/favorites` - Get user's favorite artworks

## Exhibition Routes
### Personal Exhibitions (Protected)
- `GET /api/exhibitions` - Get current user's exhibitions
- `POST /api/exhibitions` - Create new exhibition
- `GET /api/exhibitions/:exhibition_id` - Get exhibition details
- `PATCH /api/exhibitions/:exhibition_id` - Update exhibition
- `DELETE /api/exhibitions/:exhibition_id` - Delete exhibition

### Exhibition Artwork Management
- `POST /api/exhibitions/:exhibition_id/artworks` - Add artwork to exhibition
- `DELETE /api/exhibitions/:exhibition_id/artworks/:artwork_id` - Remove artwork from exhibition
- `PATCH /api/exhibitions/:exhibition_id/artworks/:artwork_id` - Update artwork in exhibition (notes, position)

### Public Exhibitions
- `GET /api/exhibitions/public` - Get all public exhibitions
- `GET /api/exhibitions/public/:exhibition_id` - Get public exhibition details
- `GET /api/exhibitions/shared/:shareable_link` - Get exhibition by shareable link
- `POST /api/exhibitions/:exhibition_id/share` - Make exhibition public/generate link
- `DELETE /api/exhibitions/:exhibition_id/share` - Make exhibition private

### Exhibition Search & Discovery
- `GET /api/exhibitions/search` - Search public exhibitions
- `GET /api/exhibitions/featured` - Get featured exhibitions
- `GET /api/exhibitions/trending` - Get trending exhibitions

## Artwork Routes
### External API Integration
- `GET /api/artworks/search` - Search artworks across museum APIs
- `GET /api/artworks/:artwork_id` - Get artwork details by ID
- `GET /api/artworks/random` - Get random artworks
- `GET /api/artworks/departments` - Get available departments/categories

### Museum-Specific Routes
- `GET /api/artworks/met/search` - Search Met Museum specifically
- `GET /api/artworks/rijks/search` - Search Rijksmuseum specifically
- `GET /api/artworks/met/:object_id` - Get Met Museum artwork
- `GET /api/artworks/rijks/:object_id` - Get Rijksmuseum artwork

### Favorites Management
- `GET /api/favorites` - Get current user's favorites
- `POST /api/favorites` - Add artwork to favorites
- `DELETE /api/favorites/:artwork_id` - Remove from favorites
- `GET /api/favorites/search` - Search within user's favorites

## Social Features (Future)
- `POST /api/exhibitions/:exhibition_id/like` - Like an exhibition
- `DELETE /api/exhibitions/:exhibition_id/like` - Unlike an exhibition
- `GET /api/exhibitions/:exhibition_id/likes` - Get exhibition likes
- `POST /api/exhibitions/:exhibition_id/comments` - Comment on exhibition
- `GET /api/exhibitions/:exhibition_id/comments` - Get exhibition comments
- `DELETE /api/comments/:comment_id` - Delete comment

## Analytics Routes (Future)
- `GET /api/analytics/exhibitions/views` - Get exhibition view stats
- `GET /api/analytics/artworks/popular` - Get popular artworks
- `GET /api/analytics/users/activity` - Get user activity stats

## Admin Routes (Future)
- `GET /api/admin/users` - Get all users with stats
- `GET /api/admin/exhibitions` - Get all exhibitions
- `POST /api/admin/exhibitions/:exhibition_id/feature` - Feature an exhibition
- `DELETE /api/admin/exhibitions/:exhibition_id` - Delete any exhibition
- `GET /api/admin/stats` - Get platform statistics