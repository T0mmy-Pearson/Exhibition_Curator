import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { 
  searchArtworks, 
  getArtworkById, 
  getRandomArtworks,
  getDepartments,
  searchMetMuseum,
  searchRijksmuseum,
  getMetArtwork,
  getRijksArtwork,
  searchByTitleOrArtist,
  searchMetByTitleOrArtist,
  searchRijksByTitleOrArtist,
  searchVAMuseum,
  searchVAByTitleOrArtist,
  getVAArtwork
} from '../controllers/artworks';

export const artworksRouter = Router();

// Search-specific rate limiter (more permissive than general rate limiter)
const isDevelopment = process.env.NODE_ENV === 'development';
const searchLimiter = rateLimit({
  windowMs: isDevelopment ? 30000 : 300000, // 30s dev, 5min prod
  max: isDevelopment ? 500 : 50, // 500 dev, 50 prod
  message: {
    error: 'Too many search requests',
    message: `Search rate limit exceeded. Please wait before searching again.`,
    retryAfter: isDevelopment ? 30 : 300
  }
});

// All artwork routes are public (museum data is public)
// General artwork search and discovery (with rate limiting)
artworksRouter.get('/search', searchLimiter, searchArtworks);
artworksRouter.get('/search/title-artist', searchLimiter, searchByTitleOrArtist);
artworksRouter.get('/random', getRandomArtworks);
artworksRouter.get('/departments', getDepartments);
artworksRouter.get('/:artwork_id', getArtworkById);

// Museum-specific routes (with rate limiting for searches)
artworksRouter.get('/met/search', searchLimiter, searchMetMuseum);
artworksRouter.get('/met/search/title-artist', searchLimiter, searchMetByTitleOrArtist);
artworksRouter.get('/met/:object_id', getMetArtwork);
artworksRouter.get('/rijks/search', searchLimiter, searchRijksmuseum);
artworksRouter.get('/rijks/search/title-artist', searchLimiter, searchRijksByTitleOrArtist);
artworksRouter.get('/rijks/:object_id', getRijksArtwork);
artworksRouter.get('/va/search', searchLimiter, searchVAMuseum);
artworksRouter.get('/va/search/title-artist', searchLimiter, searchVAByTitleOrArtist);
artworksRouter.get('/va/:system_number', getVAArtwork);