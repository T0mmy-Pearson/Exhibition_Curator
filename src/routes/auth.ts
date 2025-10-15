import { Router } from 'express';
import { register, login, logout, refreshToken, getCurrentUser } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

export const authRouter = Router();

// Public routes
authRouter.post('/register', register);
authRouter.post('/login', login);

// Protected routes
authRouter.post('/logout', authenticateToken, logout);
authRouter.post('/refresh', authenticateToken, refreshToken);
authRouter.get('/me', authenticateToken, getCurrentUser);