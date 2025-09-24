import { Request, Response } from 'express';
import { MetMuseumService } from '../services/metMuseum';
import { FitzwilliamMuseumService } from '../services/fitzwilliamMuseum';
import { VAMuseumService } from '../services/vaMuseum';
import { StandardizedArtwork } from '../types/artwork';

const metService = MetMuseumService.getInstance();
const fitzwilliamService = FitzwilliamMuseumService.getInstance();
const vaService = VAMuseumService.getInstance();

export const searchArtworks = async (req: Request, res: Response) => {
  try {
    const { 
      q, 
      source = 'all', // 'met', 'rijks', 'fitzwilliam', 'va', or 'all'
      department, 
      hasImages = 'true',
      isHighlight,
      limit = '20' 
    } = req.query;

    const parsedLimit = limit ? Math.min(parseInt(limit as string), 200) : 200; // Max 200 results, no default
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

    // Search V&A Museum if source is 'va' or 'all'
    if (source === 'va' || source === 'all') {
      try {
        const vaArtworks = await vaService.searchStandardizedArtworks({
          q: q as string,
          images_exist: hasImages === 'true',
          limit: parsedLimit
        });
        allArtworks.push(...vaArtworks);
      } catch (error) {
        console.error('V&A Museum search failed:', error);
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

export const searchByTitleOrArtist = async (req: Request, res: Response) => {
  try {
    const { 
      query,
      searchType = 'both', // 'title', 'artist', or 'both'
      source = 'all',
      hasImages = 'true',
      limit = '20' 
    } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Missing query parameter',
        message: 'Query parameter is required for title/artist search'
      });
    }

    const parsedLimit = limit ? Math.min(parseInt(limit as string), 200) : 200;
    let allArtworks: StandardizedArtwork[] = [];

    // Search Met Museum
    if (source === 'met' || source === 'all') {
      try {
        let metArtworks: StandardizedArtwork[] = [];
        
        if (searchType === 'title' || searchType === 'both') {
          // Met Museum uses 'title=true' parameter for title searches
          const titleResults = await metService.searchStandardizedArtworks({
            q: query as string,
            title: true,
            hasImages: hasImages === 'true',
            limit: Math.ceil(parsedLimit / (searchType === 'both' ? 2 : 1))
          });
          metArtworks.push(...titleResults);
        }

        if (searchType === 'artist' || searchType === 'both') {
          // Met Museum uses 'artistOrCulture=true' for artist searches
          const artistResults = await metService.searchStandardizedArtworks({
            q: query as string,
            artistOrCulture: true,
            hasImages: hasImages === 'true',
            limit: Math.ceil(parsedLimit / (searchType === 'both' ? 2 : 1))
          });
          metArtworks.push(...artistResults);
        }

        // Remove duplicates based on artwork ID
        const uniqueMetArtworks = metArtworks.filter((artwork, index, self) => 
          index === self.findIndex(a => a.id === artwork.id)
        );
        
        allArtworks.push(...uniqueMetArtworks);
      } catch (error) {
        console.error('Met Museum title/artist search failed:', error);
      }
    }

    // Search Fitzwilliam Museum
    if (source === 'fitzwilliam' || source === 'all') {
      try {
        // Fitzwilliam searches are generally broad, we'll filter results on our end
        const fitzwilliamResponse = await fitzwilliamService.searchStandardizedArtworks({
          query: query as string,
          size: parsedLimit
        });
        
        // Filter results based on searchType
        const filteredFitzwilliam = fitzwilliamResponse.artworks.filter(artwork => {
          const titleMatch = artwork.title && artwork.title.toLowerCase().includes((query as string).toLowerCase());
          const artistMatch = artwork.artist && artwork.artist.toLowerCase().includes((query as string).toLowerCase());
          
          if (searchType === 'title') return titleMatch;
          if (searchType === 'artist') return artistMatch;
          return titleMatch || artistMatch; // both
        });
        
        allArtworks.push(...filteredFitzwilliam);
      } catch (error) {
        console.error('Fitzwilliam Museum title/artist search failed:', error);
      }
    }

    // Search V&A Museum
    if (source === 'va' || source === 'all') {
      try {
        // V&A API doesn't have specific title/artist parameters, so we use general search
        // and filter results based on the response
        const vaArtworks = await vaService.searchStandardizedArtworks({
          q: query as string,
          images_exist: hasImages === 'true',
          limit: parsedLimit
        });
        
        // Filter V&A results based on searchType
        const filteredVAArtworks = vaArtworks.filter(artwork => {
          const titleMatch = artwork.title && artwork.title.toLowerCase().includes((query as string).toLowerCase());
          const artistMatch = artwork.artist && artwork.artist.toLowerCase().includes((query as string).toLowerCase());
          
          if (searchType === 'title') return titleMatch;
          if (searchType === 'artist') return artistMatch;
          return titleMatch || artistMatch; // both
        });
        
        allArtworks.push(...filteredVAArtworks);
      } catch (error) {
        console.error('V&A Museum title/artist search failed:', error);
      }
    }

    // Remove duplicates across all sources and shuffle if multiple sources
    const uniqueArtworks = allArtworks.filter((artwork, index, self) => 
      index === self.findIndex(a => a.id === artwork.id)
    );

    if (source === 'all') {
      uniqueArtworks.sort(() => 0.5 - Math.random());
    }

    // Limit final results
    const limitedResults = uniqueArtworks.slice(0, parsedLimit);

    res.json({
      total: limitedResults.length,
      query,
      searchType,
      source,
      artworks: limitedResults
    });

  } catch (error) {
    console.error('Error searching by title/artist:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to search by title or artist'
    });
  }
};

export const getArtworkById = async (req: Request, res: Response) => {
  try {
    const { artwork_id } = req.params;
    
    // Parse the artwork ID format: "met:12345", "rijks:SK-A-1234", "fitzwilliam:uuid", or "va:systemNumber"
    const [source, objectId] = artwork_id.split(':');
    
    if (!source || !objectId) {
      return res.status(400).json({
        error: 'Invalid artwork ID format',
        message: 'Artwork ID should be in format "source:objectId" (e.g., "met:12345", "fitzwilliam:uuid", "va:O123456")'
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
      
      case 'va':
        const vaArtwork = await vaService.getArtworkById(objectId);
        artwork = vaService.standardizeArtwork(vaArtwork);
        break;
      
      default:
        return res.status(400).json({
          error: 'Invalid source',
          message: 'Source must be "met", "rijks", "fitzwilliam", or "va"'
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
    const { count, source = 'all' } = req.query;
    const parsedCount = count ? Math.min(parseInt(count as string), 50) : 50; // Max 50 random artworks, no default
    
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

    // Get random artworks from V&A Museum
    if (source === 'va' || source === 'all') {
      try {
        const vaArtworks = await vaService.getRandomArtworks(parsedCount);
        const standardized = vaArtworks.map(artwork => vaService.standardizeArtwork(artwork));
        allArtworks.push(...standardized);
      } catch (error) {
        console.error('V&A Museum random artworks failed:', error);
      }
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
      limit 
    } = req.query;

    const artworks = await metService.searchStandardizedArtworks({
      q: q as string,
      departmentId: departmentId ? parseInt(departmentId as string) : undefined,
      hasImages: hasImages === 'true',
      isHighlight: isHighlight === 'true' ? true : undefined,
      limit: limit ? Math.min(parseInt(limit as string), 200) : 200
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
      size,
      department,
      maker,
      materials,
      techniques,
      categories,
      dateFrom,
      dateTo 
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const sizeNum = size ? Math.min(parseInt(size as string), 200) : 200;

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

// Individual museum title/artist search endpoints

export const searchMetByTitleOrArtist = async (req: Request, res: Response) => {
  try {
    const { 
      query, 
      searchType = 'both',
      hasImages = 'true',
      departmentId,
      limit 
    } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Query parameter is required'
      });
    }

    const parsedLimit = limit ? Math.min(parseInt(limit as string), 200) : 200;
    let allArtworks: StandardizedArtwork[] = [];

    if (searchType === 'title' || searchType === 'both') {
      const titleResults = await metService.searchStandardizedArtworks({
        q: query as string,
        title: true,
        hasImages: hasImages === 'true',
        departmentId: departmentId ? parseInt(departmentId as string) : undefined,
        limit: Math.ceil(parsedLimit / (searchType === 'both' ? 2 : 1))
      });
      allArtworks.push(...titleResults);
    }

    if (searchType === 'artist' || searchType === 'both') {
      const artistResults = await metService.searchStandardizedArtworks({
        q: query as string,
        artistOrCulture: true,
        hasImages: hasImages === 'true',
        departmentId: departmentId ? parseInt(departmentId as string) : undefined,
        limit: Math.ceil(parsedLimit / (searchType === 'both' ? 2 : 1))
      });
      allArtworks.push(...artistResults);
    }

    // Remove duplicates
    const uniqueArtworks = allArtworks.filter((artwork, index, self) => 
      index === self.findIndex(a => a.id === artwork.id)
    );

    // Limit final results
    const limitedResults = uniqueArtworks.slice(0, parsedLimit);

    res.json({
      total: limitedResults.length,
      query,
      searchType,
      source: 'met',
      artworks: limitedResults
    });

  } catch (error) {
    console.error('Error searching Met Museum by title/artist:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to search Met Museum by title or artist'
    });
  }
};

export const searchFitzwilliamByTitleOrArtist = async (req: Request, res: Response) => {
  try {
    const { 
      query, 
      searchType = 'both',
      page = '1',
      size,
      department,
      dateFrom,
      dateTo 
    } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Query parameter is required'
      });
    }

    const pageNum = parseInt(page as string) || 1;
    const sizeNum = size ? Math.min(parseInt(size as string), 200) : 200;

    // Fitzwilliam doesn't have specific title/artist parameters, so we search and filter
    const result = await fitzwilliamService.searchStandardizedArtworks({
      query: query as string,
      page: pageNum,
      size: sizeNum,
      department: department as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    });

    // Filter results based on searchType
    const filteredArtworks = result.artworks.filter(artwork => {
      const titleMatch = artwork.title && artwork.title.toLowerCase().includes((query as string).toLowerCase());
      const artistMatch = artwork.artist && artwork.artist.toLowerCase().includes((query as string).toLowerCase());
      
      if (searchType === 'title') return titleMatch;
      if (searchType === 'artist') return artistMatch;
      return titleMatch || artistMatch; // both
    });

    res.json({
      artworks: filteredArtworks,
      pagination: {
        page: result.page,
        size: sizeNum,
        total: filteredArtworks.length,
        totalPages: Math.ceil(filteredArtworks.length / sizeNum)
      },
      query,
      searchType,
      source: 'fitzwilliam'
    });

  } catch (error) {
    console.error('Error searching Fitzwilliam Museum by title/artist:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to search Fitzwilliam Museum by title or artist'
    });
  }
};

export const searchVAMuseum = async (req: Request, res: Response) => {
  try {
    const { 
      q, 
      images_exist = 'true',
      limit 
    } = req.query;

    const parsedLimit = limit ? Math.min(parseInt(limit as string), 200) : 200;

    const artworks = await vaService.searchStandardizedArtworks({
      q: q as string,
      images_exist: images_exist === 'true',
      limit: parsedLimit
    });

    res.json({
      total: artworks.length,
      query: q,
      source: 'va',
      artworks
    });

  } catch (error) {
    console.error('Error searching V&A Museum:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to search V&A Museum'
    });
  }
};

export const searchVAByTitleOrArtist = async (req: Request, res: Response) => {
  try {
    const { 
      query, 
      searchType = 'both',
      images_exist = 'true',
      limit 
    } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Query parameter is required'
      });
    }

    const parsedLimit = limit ? Math.min(parseInt(limit as string), 200) : 200;

    // V&A doesn't have specific title/artist parameters, so we search and filter
    const artworks = await vaService.searchStandardizedArtworks({
      q: query as string,
      images_exist: images_exist === 'true',
      limit: parsedLimit * 2 // Get more to account for filtering
    });

    // Filter results based on searchType
    const filteredArtworks = artworks.filter(artwork => {
      const titleMatch = artwork.title && artwork.title.toLowerCase().includes((query as string).toLowerCase());
      const artistMatch = artwork.artist && artwork.artist.toLowerCase().includes((query as string).toLowerCase());
      
      if (searchType === 'title') return titleMatch;
      if (searchType === 'artist') return artistMatch;
      return titleMatch || artistMatch; // both
    });

    // Limit final results
    const limitedResults = filteredArtworks.slice(0, parsedLimit);

    res.json({
      total: limitedResults.length,
      query,
      searchType,
      source: 'va',
      artworks: limitedResults
    });

  } catch (error) {
    console.error('Error searching V&A Museum by title/artist:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to search V&A Museum by title or artist'
    });
  }
};

export const getVAArtwork = async (req: Request, res: Response) => {
  try {
    const { system_number } = req.params;
    
    const artwork = await vaService.getArtworkById(system_number);
    
    if (!artwork) {
      return res.status(404).json({
        error: 'Artwork not found',
        message: `V&A artwork with system number "${system_number}" not found`
      });
    }

    res.json(artwork);

  } catch (error) {
    console.error('Error fetching V&A Museum artwork:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch V&A Museum artwork'
    });
  }
};