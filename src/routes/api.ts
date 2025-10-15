import { Router } from 'express';
import { usersRouter } from './users';
import { artworksRouter } from './artworks';
import { exhibitionsRouter } from './exhibitions';
import { authRouter } from './auth';
import { favoritesRouter } from './favorites';

export const apiRouter = Router();

// Authentication routes
apiRouter.use('/auth', authRouter);

// User management routes
apiRouter.use('/users', usersRouter);

// Artwork search and discovery routes
apiRouter.use('/artworks', artworksRouter);

// Exhibition management routes
apiRouter.use('/exhibitions', exhibitionsRouter);

// Favorites management routes
apiRouter.use('/favorites', favoritesRouter);

apiRouter.get('/', (req, res) => {
  res.json({
    message: 'Exhibition Curator API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      artworks: '/api/artworks',
      exhibitions: '/api/exhibitions',
      favorites: '/api/favorites'
    }
  });
});