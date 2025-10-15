import { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser, getUserExhibitions, getUserFavorites, getUserProfile, updateUserProfile } from '../controllers/users';
import { authenticateToken } from '../middleware/auth';

export const usersRouter = Router();

// All user routes require authentication (auth routes are separate)
usersRouter.use(authenticateToken);

// User management
usersRouter.get('/', getUsers);
usersRouter.get('/:user_id', getUserById);
usersRouter.patch('/:user_id', updateUser);
usersRouter.delete('/:user_id', deleteUser);

// Current user profile management
usersRouter.get('/me/profile', getUserProfile);
usersRouter.patch('/me/profile', updateUserProfile);

// Current user's exhibitions and favorites (no user_id needed)
usersRouter.get('/me/exhibitions', getUserExhibitions);
usersRouter.get('/me/favorites', getUserFavorites);

// Other user's exhibitions and favorites (user_id required)
usersRouter.get('/:user_id/exhibitions', getUserExhibitions);
usersRouter.get('/:user_id/favorites', getUserFavorites);