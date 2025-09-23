import { Router } from 'express';
import { 
  searchArtworks, 
  getArtworkById, 
  getRandomArtworks,
  getDepartments,
  searchMetMuseum,
  searchRijksmuseum,
  getMetArtwork,
  getRijksArtwork
} from '../controllers/artworks';

export const artworksRouter = Router();

// All artwork routes are public (museum data is public)
// General artwork search and discovery
artworksRouter.get('/search', searchArtworks);
artworksRouter.get('/random', getRandomArtworks);
artworksRouter.get('/departments', getDepartments);
artworksRouter.get('/:artwork_id', getArtworkById);

// Museum-specific routes
artworksRouter.get('/met/search', searchMetMuseum);
artworksRouter.get('/met/:object_id', getMetArtwork);
artworksRouter.get('/rijks/search', searchRijksmuseum);
artworksRouter.get('/rijks/:object_id', getRijksArtwork);