import { Request, Response, NextFunction } from 'express';
import * as userModel from '../models/users';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userModel.fetchUsers();
    res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.params;
    const user = await userModel.fetchUserById(user_id);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    const user = await userModel.insertUser({ username, email, password, firstName, lastName });
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.params;
    const updates = req.body;
    const user = await userModel.updateUserById(user_id, updates);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.params;
    await userModel.removeUserById(user_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getUserExhibitions = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented', message: 'Get user exhibitions not yet implemented' });
};

export const getUserFavorites = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented', message: 'Get user favorites not yet implemented' });
};