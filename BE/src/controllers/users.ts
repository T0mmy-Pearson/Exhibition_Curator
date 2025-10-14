import { Request, Response, NextFunction } from 'express';
import * as userModel from '../models/users';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    email: string;
  };
}

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

export const getUserExhibitions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.params;
    const requestingUserId = req.user?.userId;
    
    // If no user_id provided, get exhibitions for the authenticated user
    const targetUserId = user_id || requestingUserId;
    
    if (!targetUserId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'User ID is required'
      });
    }

    // Fetch user with exhibitions
    const user = await userModel.fetchUserById(targetUserId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    // If requesting someone else's exhibitions, only return public ones
    let exhibitions = user.exhibitions || [];
    
    if (user_id && user_id !== requestingUserId) {
      exhibitions = exhibitions.filter((exhibition: any) => exhibition.isPublic);
    }

    // Format exhibitions response
    const formattedExhibitions = exhibitions.map((exhibition: any) => ({
      id: exhibition._id,
      title: exhibition.title,
      description: exhibition.description,
      theme: exhibition.theme,
      isPublic: exhibition.isPublic,
      shareableLink: exhibition.shareableLink,
      artworksCount: exhibition.artworks?.length || 0,
      coverImageUrl: exhibition.coverImageUrl,
      tags: exhibition.tags || [],
      createdAt: exhibition.createdAt,
      updatedAt: exhibition.updatedAt,
      // Include artwork details if it's the user's own exhibitions
      ...((!user_id || user_id === requestingUserId) && {
        artworks: exhibition.artworks || []
      })
    }));

    res.status(200).json({
      message: 'Exhibitions retrieved successfully',
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      },
      exhibitions: formattedExhibitions,
      total: formattedExhibitions.length
    });

  } catch (err) {
    next(err);
  }
};

export const getUserFavorites = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.params;
    const requestingUserId = req.user?.userId;
    
    // If no user_id provided, get favorites for the authenticated user
    const targetUserId = user_id || requestingUserId;
    
    if (!targetUserId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'User ID is required'
      });
    }

    // Fetch user with favorites
    const user = await userModel.fetchUserById(targetUserId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    // Get query parameters for filtering and pagination
    const { 
      page = '1', 
      limit = '20', 
      museum, 
      search,
      sortBy = 'addedAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    let favorites = user.favoriteArtworks || [];

    // Filter by museum source if specified
    if (museum && typeof museum === 'string') {
      favorites = favorites.filter((artwork: any) => 
        artwork.museumSource === museum
      );
    }

    // Search in title or artist if specified
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      favorites = favorites.filter((artwork: any) => 
        artwork.title?.toLowerCase().includes(searchLower) ||
        artwork.artist?.toLowerCase().includes(searchLower) ||
        artwork.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort favorites
    favorites.sort((a: any, b: any) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        case 'artist':
          aValue = a.artist || '';
          bValue = b.artist || '';
          break;
        case 'addedAt':
        default:
          aValue = new Date(a.addedAt || a.createdAt);
          bValue = new Date(b.addedAt || b.createdAt);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const total = favorites.length;
    const paginatedFavorites = favorites.slice(skip, skip + limitNum);

    // Format favorites response
    const formattedFavorites = paginatedFavorites.map((artwork: any) => ({
      artworkId: artwork.artworkId,
      title: artwork.title,
      artist: artwork.artist,
      date: artwork.date,
      medium: artwork.medium,
      department: artwork.department,
      culture: artwork.culture,
      period: artwork.period,
      dimensions: artwork.dimensions,
      imageUrl: artwork.imageUrl,
      primaryImageSmall: artwork.primaryImageSmall,
      additionalImages: artwork.additionalImages || [],
      objectURL: artwork.objectURL,
      tags: artwork.tags || [],
      description: artwork.description,
      museumSource: artwork.museumSource,
      isHighlight: artwork.isHighlight,
      addedAt: artwork.addedAt
    }));

    res.status(200).json({
      message: 'Favorites retrieved successfully',
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      },
      favorites: formattedFavorites,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: skip + limitNum < total,
        hasPrev: pageNum > 1
      },
      filters: {
        museum: museum || null,
        search: search || null,
        sortBy,
        sortOrder
      }
    });

  } catch (err) {
    next(err);
  }
};

export const getUserProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const user = await userModel.fetchUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    // Format user profile response (exclude sensitive data)
    const profile = {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      favoriteCount: user.favoriteArtworks?.length || 0,
      exhibitionCount: user.exhibitions?.length || 0
    };

    res.status(200).json({
      message: 'Profile retrieved successfully',
      profile
    });

  } catch (err) {
    next(err);
  }
};

export const updateUserProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { firstName, lastName, bio, email } = req.body;

    // Validate input
    const updates: any = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (bio !== undefined) updates.bio = bio;
    if (email !== undefined) updates.email = email;

    // Update user profile
    const updatedUser = await userModel.updateUserById(userId, updates);

    if (!updatedUser) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    // Format response (exclude sensitive data)
    const profile = {
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      bio: updatedUser.bio,
      profileImageUrl: updatedUser.profileImageUrl,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    res.status(200).json({
      message: 'Profile updated successfully',
      profile
    });

  } catch (err) {
    next(err);
  }
};