import { Router } from 'express';
import { getUserFavorites, addToFavorites, removeFromFavorites, searchFavorites } from '../controllers/favorites';
import { authenticateToken } from '../middleware/auth';

export const favoritesRouter = Router();

// All favorites routes require authentication
favoritesRouter.use(authenticateToken);

favoritesRouter.get('/', getUserFavorites);
favoritesRouter.post('/', addToFavorites);
favoritesRouter.delete('/:artwork_id', removeFromFavorites);
favoritesRouter.get('/search', searchFavorites);