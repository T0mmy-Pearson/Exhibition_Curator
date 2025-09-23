import { Request, Response } from 'express';

export const register = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented', message: 'Registration not yet implemented' });
};

export const login = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented', message: 'Login not yet implemented' });
};

export const logout = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented', message: 'Logout not yet implemented' });
};

export const refreshToken = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented', message: 'Token refresh not yet implemented' });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented', message: 'Get current user not yet implemented' });
};