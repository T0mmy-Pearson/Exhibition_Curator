import { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser, getUserExhibitions, getUserFavorites } from '../controllers/users';
import { authenticateToken } from '../middleware/auth';

export const usersRouter = Router();

// All user routes require authentication (auth routes are separate)
usersRouter.use(authenticateToken);

// User management
usersRouter.get('/', getUsers);
usersRouter.get('/:user_id', getUserById);
usersRouter.patch('/:user_id', updateUser);
usersRouter.delete('/:user_id', deleteUser);

// User-specific exhibitions and favorites
usersRouter.get('/:user_id/exhibitions', getUserExhibitions);
usersRouter.get('/:user_id/favorites', getUserFavorites);