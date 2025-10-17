import { Request, Response, NextFunction } from 'express';
import * as exhibitionModel from '../models/exhibitions';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    email: string;
  };
}

export const getExhibitions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    const exhibitions = await exhibitionModel.fetchUserExhibitions(userId);
    
    // Enhance exhibitions with curator info
    const user = await import('../models/User').then(m => m.User.findById(userId).select('username firstName lastName'));
    const enhancedExhibitions = exhibitions.map((exhibition: any) => ({
      ...exhibition.toObject(),
      curator: {
        username: user?.username,
        fullName: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
      }
    }));
    
    res.status(200).json({ exhibitions: enhancedExhibitions });
  } catch (err) {
    next(err);
  }
};

export const getExhibitionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { exhibition_id } = req.params;
    const userId = (req as any).user?.userId;
    const exhibition = await exhibitionModel.fetchExhibitionById(userId, exhibition_id);
    
    // Enhance exhibition with curator info
    const user = await import('../models/User').then(m => m.User.findById(userId).select('username firstName lastName'));
    const enhancedExhibition = {
      ...exhibition.toObject(),
      curator: {
        username: user?.username,
        fullName: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
      }
    };
    
    res.status(200).json({ exhibition: enhancedExhibition });
  } catch (err) {
    next(err);
  }
};

export const createExhibition = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Add body parsing check
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Request body is empty or invalid'
      });
    }
    
    const { title, description, theme, isPublic = false, tags, coverImageUrl } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Exhibition title is required'
      });
    }
    
    const exhibition = await exhibitionModel.insertExhibition(userId, {
      title,
      description,
      theme,
      isPublic,
      tags,
      coverImageUrl
    });
    
    // Enhance exhibition with curator info
    const user = await import('../models/User').then(m => m.User.findById(userId).select('username firstName lastName'));
    const enhancedExhibition = {
      ...exhibition.toObject(),
      curator: {
        username: user?.username,
        fullName: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
      }
    };
    
    res.status(201).json({ exhibition: enhancedExhibition });
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
    const userId = (req as any).user?.userId;
    
    // Handle artwork data - it can be directly in body or wrapped in artworkData
    const artworkData = req.body.artworkData || req.body;
    
    // Map objectID to artworkId for consistency with schema
    if (artworkData.objectID && !artworkData.artworkId) {
      artworkData.artworkId = artworkData.objectID;
    }
    
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

// Update artwork position or notes within exhibition
export const updateArtworkInExhibition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { exhibition_id, artwork_id } = req.params;
    const { position, notes, displayOrder, curatorNotes } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Get the exhibition
    const exhibition = await exhibitionModel.fetchExhibitionById(userId, exhibition_id);
    
    // Find the artwork in the exhibition by artworkId
    const artworkIndex = exhibition.artworks.findIndex((artwork: any) => artwork.artworkId === artwork_id);
    
    if (artworkIndex === -1) {
      return res.status(404).json({
        error: 'Artwork not found',
        message: 'Artwork not found in this exhibition'
      });
    }

    // Update artwork properties
    if (position !== undefined) exhibition.artworks[artworkIndex].position = position;
    if (notes !== undefined) exhibition.artworks[artworkIndex].notes = notes;
    if (curatorNotes !== undefined) exhibition.artworks[artworkIndex].curatorNotes = curatorNotes;
    if (displayOrder !== undefined) exhibition.artworks[artworkIndex].displayOrder = displayOrder;

    // Update the exhibition
    const updatedExhibition = await exhibitionModel.updateExhibitionById(userId, exhibition_id, {
      artworks: exhibition.artworks,
      updatedAt: new Date()
    } as any);

    res.status(200).json({
      message: 'Artwork updated successfully',
      exhibition: updatedExhibition,
      updatedArtwork: exhibition.artworks[artworkIndex]
    });

  } catch (err) {
    next(err);
  }
};

export const getPublicExhibitions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = '1', 
      limit = '20', 
      theme, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    let exhibitions;

    // If search query provided, use search function
    if (search && typeof search === 'string') {
      exhibitions = await exhibitionModel.searchExhibitions(search, true, limitNum, offset);
    } else {
      exhibitions = await exhibitionModel.fetchPublicExhibitions(limitNum, offset);
    }

    // Filter by theme if specified
    if (theme && typeof theme === 'string') {
      exhibitions = exhibitions.filter((exhibition: any) => 
        exhibition.theme?.toLowerCase().includes(theme.toLowerCase())
      );
    }

    // Sort exhibitions
    exhibitions.sort((a: any, b: any) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        case 'curator':
          aValue = a.curator?.username || '';
          bValue = b.curator?.username || '';
          break;
        case 'artworkCount':
          aValue = a.artworks?.length || 0;
          bValue = b.artworks?.length || 0;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Format exhibitions for response
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
      curator: exhibition.curator
    }));

    res.status(200).json({
      message: 'Public exhibitions retrieved successfully',
      exhibitions: formattedExhibitions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: formattedExhibitions.length,
        totalPages: Math.ceil(formattedExhibitions.length / limitNum),
        hasNext: formattedExhibitions.length === limitNum,
        hasPrev: pageNum > 1
      },
      filters: {
        theme: theme || null,
        search: search || null,
        sortBy,
        sortOrder
      }
    });

  } catch (err) {
    next(err);
  }
};

export const getSharedExhibition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shareable_link } = req.params;
    const shareableLink = shareable_link;

    if (!shareableLink) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Shareable link is required'
      });
    }

    const exhibition = await exhibitionModel.fetchExhibitionByShareableLink(shareableLink);

    if (!exhibition) {
      return res.status(404).json({
        error: 'Exhibition not found',
        message: 'The exhibition you are looking for does not exist or is not public'
      });
    }

    // Format exhibition for response
    const formattedExhibition = {
      id: exhibition._id,
      title: exhibition.title,
      description: exhibition.description,
      theme: exhibition.theme,
      isPublic: exhibition.isPublic,
      shareableLink: exhibition.shareableLink,
      artworks: exhibition.artworks || [],
      artworksCount: exhibition.artworks?.length || 0,
      coverImageUrl: exhibition.coverImageUrl,
      tags: exhibition.tags || [],
      createdAt: exhibition.createdAt,
      updatedAt: exhibition.updatedAt,
      curator: exhibition.curator
    };

    res.status(200).json({
      message: 'Shared exhibition retrieved successfully',
      exhibition: formattedExhibition
    });

  } catch (err) {
    if (err instanceof Error && err.message === 'Exhibition not found') {
      return res.status(404).json({
        error: 'Exhibition not found',
        message: 'The exhibition you are looking for does not exist or is not public'
      });
    }
    next(err);
  }
};

export const shareExhibition = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { exhibition_id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Update exhibition to be public
    const exhibition = await exhibitionModel.updateExhibitionById(userId, exhibition_id, {
      isPublic: true
    });

    res.status(200).json({
      message: 'Exhibition shared successfully',
      exhibition: {
        id: exhibition._id,
        title: exhibition.title,
        isPublic: exhibition.isPublic,
        shareableLink: exhibition.shareableLink
      },
      shareableUrl: `${req.protocol}://${req.get('host')}/shared/${exhibition.shareableLink}`
    });

  } catch (err) {
    if (err instanceof Error && err.message === 'Exhibition not found') {
      return res.status(404).json({
        error: 'Exhibition not found',
        message: 'The exhibition you are trying to share does not exist'
      });
    }
    next(err);
  }
};

export const unshareExhibition = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { exhibition_id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Update exhibition to be private
    const exhibition = await exhibitionModel.updateExhibitionById(userId, exhibition_id, {
      isPublic: false
    });

    res.status(200).json({
      message: 'Exhibition unshared successfully',
      exhibition: {
        id: exhibition._id,
        title: exhibition.title,
        isPublic: exhibition.isPublic,
        shareableLink: exhibition.shareableLink
      }
    });

  } catch (err) {
    if (err instanceof Error && err.message === 'Exhibition not found') {
      return res.status(404).json({
        error: 'Exhibition not found',
        message: 'The exhibition you are trying to unshare does not exist'
      });
    }
    next(err);
  }
};

export const searchExhibitions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { 
      q: query,
      page = '1',
      limit = '20',
      publicOnly = 'false',
      theme,
      curator,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const userId = req.user?.userId;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;
    const isPublicOnly = publicOnly === 'true';

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Search query is required'
      });
    }

    // Search exhibitions
    let exhibitions = await exhibitionModel.searchExhibitions(query, isPublicOnly, limitNum * 3, 0); // Get more results to filter

    // Additional filtering
    if (theme && typeof theme === 'string') {
      exhibitions = exhibitions.filter((exhibition: any) => 
        exhibition.theme?.toLowerCase().includes(theme.toLowerCase())
      );
    }

    if (curator && typeof curator === 'string') {
      exhibitions = exhibitions.filter((exhibition: any) => 
        exhibition.curator?.username?.toLowerCase().includes(curator.toLowerCase())
      );
    }

    // Sort exhibitions
    exhibitions.sort((a: any, b: any) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        case 'curator':
          aValue = a.curator?.username || '';
          bValue = b.curator?.username || '';
          break;
        case 'artworkCount':
          aValue = a.artworks?.length || 0;
          bValue = b.artworks?.length || 0;
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const total = exhibitions.length;
    const paginatedExhibitions = exhibitions.slice(offset, offset + limitNum);

    // Format exhibitions for response
    const formattedExhibitions = paginatedExhibitions.map((exhibition: any) => ({
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
      curator: exhibition.curator,
      // Only include full artworks for user's own exhibitions
      ...(exhibition.curator?.username === userId && {
        artworks: exhibition.artworks || []
      })
    }));

    res.status(200).json({
      message: 'Exhibition search completed successfully',
      query,
      exhibitions: formattedExhibitions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: offset + limitNum < total,
        hasPrev: pageNum > 1
      },
      filters: {
        publicOnly: isPublicOnly,
        theme: theme || null,
        curator: curator || null,
        sortBy,
        sortOrder
      }
    });

  } catch (err) {
    next(err);
  }
};

export const getFeaturedExhibitions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = '10' } = req.query;
    const limitNum = parseInt(limit as string, 10);

    // Get public exhibitions and apply featured logic
    const exhibitions = await exhibitionModel.fetchPublicExhibitions(limitNum * 2, 0);

    // Featured exhibitions logic: exhibitions with more artworks, recent activity, or specific tags
    const featuredExhibitions = exhibitions
      .filter((exhibition: any) => {
        const artworkCount = exhibition.artworks?.length || 0;
        const hasGoodTags = exhibition.tags?.some((tag: string) => 
          ['featured', 'curated', 'highlight', 'masterpiece', 'collection'].includes(tag.toLowerCase())
        );
        const recentlyUpdated = new Date(exhibition.updatedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
        
        return artworkCount >= 3 || hasGoodTags || recentlyUpdated;
      })
      .sort((a: any, b: any) => {
        // Sort by artwork count and recency
        const aScore = (a.artworks?.length || 0) + (new Date(a.updatedAt).getTime() / 1000000000);
        const bScore = (b.artworks?.length || 0) + (new Date(b.updatedAt).getTime() / 1000000000);
        return bScore - aScore;
      })
      .slice(0, limitNum);

    // Format exhibitions for response
    const formattedExhibitions = featuredExhibitions.map((exhibition: any) => ({
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
      curator: exhibition.curator,
      featuredReason: 'High quality content with significant artwork collection'
    }));

    res.status(200).json({
      message: 'Featured exhibitions retrieved successfully',
      exhibitions: formattedExhibitions,
      total: formattedExhibitions.length,
      criteria: 'Selected based on artwork count, recent activity, and curator tags'
    });

  } catch (err) {
    next(err);
  }
};

export const getTrendingExhibitions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = '10', days = '7' } = req.query;
    const limitNum = parseInt(limit as string, 10);
    const daysNum = parseInt(days as string, 10);

    // Get public exhibitions
    const exhibitions = await exhibitionModel.fetchPublicExhibitions(limitNum * 2, 0);

    // Trending logic: recently created or updated exhibitions
    const cutoffDate = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);
    
    const trendingExhibitions = exhibitions
      .filter((exhibition: any) => {
        const createdRecently = new Date(exhibition.createdAt) > cutoffDate;
        const updatedRecently = new Date(exhibition.updatedAt) > cutoffDate;
        const hasArtworks = (exhibition.artworks?.length || 0) > 0;
        
        return (createdRecently || updatedRecently) && hasArtworks;
      })
      .sort((a: any, b: any) => {
        // Sort by most recent activity and artwork count
        const aTime = Math.max(new Date(a.createdAt).getTime(), new Date(a.updatedAt).getTime());
        const bTime = Math.max(new Date(b.createdAt).getTime(), new Date(b.updatedAt).getTime());
        const aScore = aTime + (a.artworks?.length || 0) * 24 * 60 * 60 * 1000; // Boost for artwork count
        const bScore = bTime + (b.artworks?.length || 0) * 24 * 60 * 60 * 1000;
        
        return bScore - aScore;
      })
      .slice(0, limitNum);

    // Format exhibitions for response
    const formattedExhibitions = trendingExhibitions.map((exhibition: any) => ({
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
      curator: exhibition.curator,
      trendingScore: Math.max(new Date(exhibition.createdAt).getTime(), new Date(exhibition.updatedAt).getTime()),
      daysSinceActivity: Math.floor((Date.now() - Math.max(new Date(exhibition.createdAt).getTime(), new Date(exhibition.updatedAt).getTime())) / (24 * 60 * 60 * 1000))
    }));

    res.status(200).json({
      message: 'Trending exhibitions retrieved successfully',
      exhibitions: formattedExhibitions,
      total: formattedExhibitions.length,
      period: `Last ${daysNum} days`,
      criteria: 'Selected based on recent creation or update activity with active curation'
    });

  } catch (err) {
    next(err);
  }
};