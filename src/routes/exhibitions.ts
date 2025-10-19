import { Router } from 'express';
import { 
  getExhibitions, 
  getAllExhibitions,
  getExhibitionById, 
  createExhibition, 
  updateExhibition, 
  deleteExhibition, 
  addArtworkToExhibition, 
  removeArtworkFromExhibition,
  updateArtworkInExhibition,
  getPublicExhibitions,
  getSharedExhibition,
  shareExhibition,
  unshareExhibition,
  searchExhibitions,
  getFeaturedExhibitions,
  getTrendingExhibitions
} from '../controllers/exhibitions';
import { authenticateToken } from '../middleware/auth';

export const exhibitionsRouter = Router();

// Public routes (no authentication required)
exhibitionsRouter.get('/public', getPublicExhibitions);
exhibitionsRouter.get('/public/:exhibition_id', getExhibitionById);
exhibitionsRouter.get('/shared/:shareable_link', getSharedExhibition);
exhibitionsRouter.get('/search', searchExhibitions);
exhibitionsRouter.get('/featured', getFeaturedExhibitions);
exhibitionsRouter.get('/trending', getTrendingExhibitions);


// All exhibitions (public route)
exhibitionsRouter.get('/', getAllExhibitions);

// Protected routes (authentication required)


// Personal exhibition management (protected)
// Protected routes (authentication required)
exhibitionsRouter.use(authenticateToken);
exhibitionsRouter.get('/user', getExhibitions);
exhibitionsRouter.post('/', createExhibition);
exhibitionsRouter.get('/:exhibition_id', getExhibitionById);
exhibitionsRouter.patch('/:exhibition_id', updateExhibition);
exhibitionsRouter.delete('/:exhibition_id', deleteExhibition);

// Artwork management within exhibitions
exhibitionsRouter.post('/:exhibition_id/artworks', addArtworkToExhibition);
exhibitionsRouter.patch('/:exhibition_id/artworks/:artwork_id', updateArtworkInExhibition);
exhibitionsRouter.delete('/:exhibition_id/artworks/:artwork_id', removeArtworkFromExhibition);

// Sharing functionality
exhibitionsRouter.post('/:exhibition_id/share', shareExhibition);
exhibitionsRouter.delete('/:exhibition_id/share', unshareExhibition);