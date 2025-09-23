import { Request, Response, NextFunction } from 'express';
import * as exhibitionModel from '../models/exhibitions';

export const getExhibitions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    const exhibitions = await exhibitionModel.fetchUserExhibitions(userId);
    res.status(200).json({ exhibitions });
  } catch (err) {
    next(err);
  }
};

export const getExhibitionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { exhibition_id } = req.params;
    const userId = (req as any).user?.userId;
    const exhibition = await exhibitionModel.fetchExhibitionById(userId, exhibition_id);
    res.status(200).json({ exhibition });
  } catch (err) {
    next(err);
  }
};

export const createExhibition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, theme, isPublic = false, tags, coverImageUrl } = req.body;
    const userId = (req as any).user?.userId;
    const exhibition = await exhibitionModel.insertExhibition(userId, {
      title,
      description,
      theme,
      isPublic,
      tags,
      coverImageUrl
    });
    res.status(201).json({ exhibition });
  } catch (err) {
    next(err);
  }
};

export const updateExhibition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { exhibition_id } = req.params;
    const updates = req.body;
    const userId = (req as any).user?.userId;
    const exhibition = await exhibitionModel.updateExhibitionById(userId, exhibition_id, updates);
    res.status(200).json({ exhibition });
  } catch (err) {
    next(err);
  }
};

export const deleteExhibition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { exhibition_id } = req.params;
    const userId = (req as any).user?.userId;
    await exhibitionModel.removeExhibitionById(userId, exhibition_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const addArtworkToExhibition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { exhibition_id } = req.params;
    const { artworkData } = req.body;
    const userId = (req as any).user?.userId;
    const exhibition = await exhibitionModel.addArtworkToExhibition(userId, exhibition_id, artworkData);
    res.status(201).json({ exhibition });
  } catch (err) {
    next(err);
  }
};

export const removeArtworkFromExhibition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { exhibition_id, artwork_id } = req.params;
    const userId = (req as any).user?.userId;
    const exhibition = await exhibitionModel.removeArtworkFromExhibition(userId, exhibition_id, artwork_id);
    res.status(200).json({ exhibition });
  } catch (err) {
    next(err);
  }
};

// Placeholder functions for routes (to be implemented)
export const updateArtworkInExhibition = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented', message: 'Update artwork in exhibition not yet implemented' });
};

export const getPublicExhibitions = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented', message: 'Get public exhibitions not yet implemented' });
};

export const getSharedExhibition = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented', message: 'Get shared exhibition not yet implemented' });
};

export const shareExhibition = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented', message: 'Share exhibition not yet implemented' });
};

export const unshareExhibition = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented', message: 'Unshare exhibition not yet implemented' });
};

export const searchExhibitions = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented', message: 'Search exhibitions not yet implemented' });
};

export const getFeaturedExhibitions = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented', message: 'Get featured exhibitions not yet implemented' });
};

export const getTrendingExhibitions = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented', message: 'Get trending exhibitions not yet implemented' });
};