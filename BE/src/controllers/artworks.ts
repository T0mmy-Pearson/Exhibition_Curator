import { Request, Response } from 'express';
import { MetMuseumService } from '../services/metMuseum';
import { StandardizedArtwork } from '../types/artwork';

const metService = MetMuseumService.getInstance();

export const searchArtworks = async (req: Request, res: Response) => {
  try {
    const { 
      q, 
      source = 'all', // 'met', 'rijks', or 'all'
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
    
    // Parse the artwork ID format: "met:12345" or "rijks:SK-A-1234"
    const [source, objectId] = artwork_id.split(':');
    
    if (!source || !objectId) {
      return res.status(400).json({
        error: 'Invalid artwork ID format',
        message: 'Artwork ID should be in format "source:objectId" (e.g., "met:12345")'
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
      
      default:
        return res.status(400).json({
          error: 'Invalid source',
          message: 'Source must be "met" or "rijks"'
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