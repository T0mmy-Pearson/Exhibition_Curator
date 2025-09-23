import { Request, Response } from 'express';
import { MetMuseumService } from '../services/metMuseum';
import { FitzwilliamMuseumService } from '../services/fitzwilliamMuseum';
import { StandardizedArtwork } from '../types/artwork';

const metService = MetMuseumService.getInstance();
const fitzwilliamService = FitzwilliamMuseumService.getInstance();

export const searchArtworks = async (req: Request, res: Response) => {
  try {
    const { 
      q, 
      source = 'all', // 'met', 'rijks', 'fitzwilliam', or 'all'
      department, 
      hasImages = 'true',
      isHighlight,
      limit = '20' 
    } = req.query;

    const parsedLimit = Math.min(parseInt(limit as string) || 20, 100); // Max 100 results
    let allArtworks: StandardizedArtwork[] = [];

    // Search Met Museum if source is 'met' or 'all'
    if (source === 'met' || source === 'all') {
      try {
        const metArtworks = await metService.searchStandardizedArtworks({
          q: q as string,
          departmentId: department ? parseInt(department as string) : undefined,
          hasImages: hasImages === 'true',
          isHighlight: isHighlight === 'true' ? true : undefined,
          limit: parsedLimit
        });
        allArtworks.push(...metArtworks);
      } catch (error) {
        console.error('Met Museum search failed:', error);
        // Continue with other sources
      }
    }

    // TODO: Add Rijksmuseum search when source is 'rijks' or 'all'
    if (source === 'rijks' || source === 'all') {
      // Rijksmuseum integration to be implemented
    }

    // Search Fitzwilliam Museum if source is 'fitzwilliam' or 'all'
    if (source === 'fitzwilliam' || source === 'all') {
      try {
        const fitzwilliamResponse = await fitzwilliamService.searchStandardizedArtworks({
          query: q as string,
          department: department as string,
          size: parsedLimit
        });
        allArtworks.push(...fitzwilliamResponse.artworks);
      } catch (error) {
        console.error('Fitzwilliam Museum search failed:', error);
        // Continue with other sources
      }
    }

    // Shuffle results if searching multiple sources
    if (source === 'all') {
      allArtworks = allArtworks.sort(() => 0.5 - Math.random());
    }

    // Limit final results
    const limitedResults = allArtworks.slice(0, parsedLimit);

    res.json({
      total: limitedResults.length,
      query: q,
      source,
      artworks: limitedResults
    });

  } catch (error) {
    console.error('Error searching artworks:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to search artworks'
    });
  }
};

export const getArtworkById = async (req: Request, res: Response) => {
  try {
    const { artwork_id } = req.params;
    
    // Parse the artwork ID format: "met:12345", "rijks:SK-A-1234", or "fitzwilliam:uuid"
    const [source, objectId] = artwork_id.split(':');
    
    if (!source || !objectId) {
      return res.status(400).json({
        error: 'Invalid artwork ID format',
        message: 'Artwork ID should be in format "source:objectId" (e.g., "met:12345", "fitzwilliam:uuid")'
      });
    }

    let artwork: StandardizedArtwork;

    switch (source) {
      case 'met':
        const metArtwork = await metService.getArtworkById(parseInt(objectId));
        artwork = metService.standardizeArtwork(metArtwork);
        break;
      
      case 'rijks':
        // TODO: Implement Rijksmuseum artwork retrieval
        return res.status(501).json({
          error: 'Not implemented',
          message: 'Rijksmuseum artwork retrieval not yet implemented'
        });
      
      case 'fitzwilliam':
        const fitzwilliamArtwork = await fitzwilliamService.getArtworkByUuid(objectId);
        artwork = fitzwilliamService.convertToStandardized(fitzwilliamArtwork);
        break;
      
      default:
        return res.status(400).json({
          error: 'Invalid source',
          message: 'Source must be "met", "rijks", or "fitzwilliam"'
        });
    }

    res.json(artwork);

  } catch (error) {
    console.error('Error fetching artwork:', error);
    
    if (error instanceof Error && error.message.includes('Failed to fetch artwork')) {
      return res.status(404).json({
        error: 'Artwork not found',
        message: 'The requested artwork could not be found'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch artwork details'
    });
  }
};

export const getRandomArtworks = async (req: Request, res: Response) => {
  try {
    const { count = '20', source = 'all' } = req.query;
    const parsedCount = Math.min(parseInt(count as string) || 20, 50); // Max 50 random artworks
    
    let allArtworks: StandardizedArtwork[] = [];

    // Get random artworks from Met Museum
    if (source === 'met' || source === 'all') {
      try {
        const metArtworks = await metService.getRandomArtworks(parsedCount);
        const standardized = metArtworks.map(artwork => metService.standardizeArtwork(artwork));
        allArtworks.push(...standardized);
      } catch (error) {
        console.error('Met Museum random artworks failed:', error);
      }
    }

    // TODO: Add Rijksmuseum random artworks
    if (source === 'rijks' || source === 'all') {
      // Rijksmuseum random artworks to be implemented
    }

    // Shuffle if multiple sources
    if (source === 'all') {
      allArtworks = allArtworks.sort(() => 0.5 - Math.random());
    }

    const limitedResults = allArtworks.slice(0, parsedCount);

    res.json({
      count: limitedResults.length,
      source,
      artworks: limitedResults
    });

  } catch (error) {
    console.error('Error getting random artworks:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get random artworks'
    });
  }
};

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const { source = 'all' } = req.query;
    
    const departments: any = {};

    // Get Met Museum departments
    if (source === 'met' || source === 'all') {
      try {
        const metDepartments = await metService.getDepartments();
        departments.met = metDepartments;
      } catch (error) {
        console.error('Failed to fetch Met Museum departments:', error);
        departments.met = [];
      }
    }

    // TODO: Add Rijksmuseum departments
    if (source === 'rijks' || source === 'all') {
      departments.rijks = []; // To be implemented
    }

    res.json(departments);

  } catch (error) {
    console.error('Error getting departments:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get museum departments'
    });
  }
};

// Met Museum specific endpoints
export const searchMetMuseum = async (req: Request, res: Response) => {
  try {
    const { 
      q, 
      departmentId, 
      hasImages = 'true',
      isHighlight,
      limit = '20' 
    } = req.query;

    const artworks = await metService.searchStandardizedArtworks({
      q: q as string,
      departmentId: departmentId ? parseInt(departmentId as string) : undefined,
      hasImages: hasImages === 'true',
      isHighlight: isHighlight === 'true' ? true : undefined,
      limit: Math.min(parseInt(limit as string) || 20, 100)
    });

    res.json({
      total: artworks.length,
      query: q,
      source: 'met',
      artworks
    });

  } catch (error) {
    console.error('Error searching Met Museum:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to search Met Museum'
    });
  }
};

export const getMetArtwork = async (req: Request, res: Response) => {
  try {
    const { object_id } = req.params;
    const objectId = parseInt(object_id);

    if (isNaN(objectId)) {
      return res.status(400).json({
        error: 'Invalid object ID',
        message: 'Object ID must be a number'
      });
    }

    const metArtwork = await metService.getArtworkById(objectId);
    const standardized = metService.standardizeArtwork(metArtwork);

    res.json(standardized);

  } catch (error) {
    console.error('Error fetching Met Museum artwork:', error);
    
    if (error instanceof Error && error.message.includes('Failed to fetch artwork')) {
      return res.status(404).json({
        error: 'Artwork not found',
        message: 'The requested artwork could not be found in Met Museum'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch Met Museum artwork'
    });
  }
};

// Rijksmuseum specific endpoints (placeholders)
export const searchRijksmuseum = async (req: Request, res: Response) => {
  res.status(501).json({
    error: 'Not implemented',
    message: 'Rijksmuseum search not yet implemented'
  });
};

export const getRijksArtwork = async (req: Request, res: Response) => {
  res.status(501).json({
    error: 'Not implemented', 
    message: 'Rijksmuseum artwork retrieval not yet implemented'
  });
};

// Fitzwilliam Museum specific endpoints
export const searchFitzwilliam = async (req: Request, res: Response) => {
  try {
    const { 
      query, 
      page = '1', 
      size = '20',
      department,
      maker,
      materials,
      techniques,
      categories,
      dateFrom,
      dateTo 
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const sizeNum = Math.min(parseInt(size as string) || 20, 100);

    const result = await fitzwilliamService.searchStandardizedArtworks({
      query: query as string,
      page: pageNum,
      size: sizeNum,
      department: department as string,
      maker: maker as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    });

    res.json({
      artworks: result.artworks,
      pagination: {
        page: result.page,
        size: sizeNum,
        total: result.total,
        totalPages: result.totalPages
      },
      query,
      source: 'fitzwilliam'
    });

  } catch (error) {
    console.error('Error searching Fitzwilliam Museum:', error);
    
    if (error instanceof Error && error.message.includes('authentication failed')) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Fitzwilliam Museum API authentication failed. Please check your credentials.'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to search Fitzwilliam Museum'
    });
  }
};

export const getFitzwilliamArtwork = async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;

    if (!uuid) {
      return res.status(400).json({
        error: 'Invalid UUID',
        message: 'UUID is required'
      });
    }

    const fitzwilliamArtwork = await fitzwilliamService.getArtworkByUuid(uuid);
    const standardized = fitzwilliamService.convertToStandardized(fitzwilliamArtwork);

    res.json(standardized);

  } catch (error) {
    console.error('Error fetching Fitzwilliam Museum artwork:', error);
    
    if (error instanceof Error && error.message.includes('authentication failed')) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Fitzwilliam Museum API authentication failed. Please check your credentials.'
      });
    }
    
    if (error instanceof Error && error.message.includes('Failed to fetch artwork')) {
      return res.status(404).json({
        error: 'Artwork not found',
        message: 'The requested artwork could not be found in Fitzwilliam Museum'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch Fitzwilliam Museum artwork'
    });
  }
};