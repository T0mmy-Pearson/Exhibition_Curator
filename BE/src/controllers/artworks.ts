import { Request, Response } from 'express';
import { MetMuseumService } from '../services/metMuseum';
import { VAMuseumService } from '../services/vaMuseum';
import { RijksmuseumService } from '../services/rijksmuseum';
import { StandardizedArtwork } from '../types/artwork';

const metService = MetMuseumService.getInstance();
const vaService = VAMuseumService.getInstance();
const rijksService = RijksmuseumService.getInstance();

export const searchArtworks = async (req: Request, res: Response) => {
  try {
    const { 
      q, 
      source = 'all', // 'met', 'va', or 'all'
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
        // Add timeout wrapper for Met Museum search
        const metSearchPromise = metService.searchStandardizedArtworks({
          q: q as string,
          departmentId: department ? parseInt(department as string) : undefined,
          hasImages: hasImages === 'true',
          isHighlight: isHighlight === 'true' ? true : undefined,
          limit: parsedLimit
        });
        
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Met Museum search timed out')), 25000) // 25 second timeout
        );
        
        const metArtworks = await Promise.race([metSearchPromise, timeoutPromise]);
        allArtworks.push(...metArtworks);
        console.log(`Met Museum: Successfully retrieved ${metArtworks.length} artworks`);
      } catch (error: any) {
        console.error('Met Museum search failed:', error.message);
        
        // If only searching Met Museum, return appropriate error
        if (source === 'met') {
          if (error.message.includes('timed out')) {
            return res.status(408).json({
              error: 'Met Museum search is taking too long. Try a more specific search term or search all museums.',
              artworks: [],
              total: 0,
              source: 'met',
              suggestion: 'Try searching "All Museums" to include faster V&A Museum results'
            });
          } else if (error.message.includes('temporarily unavailable') || error.message.includes('rate limit')) {
            return res.status(503).json({
              error: 'Met Museum service temporarily unavailable. Please try again in a few minutes or search all museums.',
              artworks: [],
              total: 0,
              source: 'met',
              suggestion: 'Try searching "All Museums" to include V&A Museum results'
            });
          } else {
            return res.status(502).json({
              error: 'Met Museum service currently unavailable. Please try again later or search all museums.',
              artworks: [],
              total: 0,
              source: 'met',
              suggestion: 'Try searching "All Museums" to include V&A Museum results'
            });
          }
        }
        // Continue with other sources if searching 'all'
      }
    }

    // Rijksmuseum temporarily disabled - IIIF integration complex
    // Can be re-enabled when IIIF identifier mapping is resolved
    if (source === 'rijks') {
      return res.status(501).json({
        error: 'Not implemented',
        message: 'Rijksmuseum integration temporarily disabled',
        count: 0,
        source: 'rijks',
        museum: 'Rijksmuseum'
      });
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

    // Search Met 
    if (source === 'met' || source === 'all') {
      try {
        let metArtworks: StandardizedArtwork[] = [];
        
        if (searchType === 'title' || searchType === 'both') {
          // Met 'title=true' parameter for title searches
          const titleResults = await metService.searchStandardizedArtworks({
            q: query as string,
            title: true,
            hasImages: hasImages === 'true',
            limit: Math.ceil(parsedLimit / (searchType === 'both' ? 2 : 1))
          });
          metArtworks.push(...titleResults);
        }

        if (searchType === 'artist' || searchType === 'both') {
          // Met 'artistOrCulture=true' for artist searches
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
    
    // Parse the artwork ID format: "met:12345", "rijks:SK-A-1234", or "va:systemNumber"
    const [source, objectId] = artwork_id.split(':');
    
    if (!source || !objectId) {
      return res.status(400).json({
        error: 'Invalid artwork ID format',
        message: 'Artwork ID should be in format "source:objectId" (e.g., "met:12345", "va:O123456")'
      });
    }

    let artwork: StandardizedArtwork;

    switch (source) {
      case 'met':
        const metArtwork = await metService.getArtworkById(parseInt(objectId));
        artwork = metService.standardizeArtwork(metArtwork);
        break;
      
      case 'rijks':
        const rijksArtwork = await rijksService.getArtworkById(objectId);
        artwork = await rijksService.standardizeArtwork(rijksArtwork);
      
      case 'va':
        const vaArtwork = await vaService.getArtworkById(objectId);
        artwork = vaService.standardizeArtwork(vaArtwork);
        break;
      
      default:
        return res.status(400).json({
          error: 'Invalid source',
          message: 'Source must be "met", "rijks", or "va"'
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

    // Get random artworks from Rijksmuseum
    if (source === 'rijks' || source === 'all') {
      try {
        const rijksArtworks = await rijksService.getRandomArtworks(parsedCount);
        allArtworks.push(...rijksArtworks);
      } catch (error) {
        console.error('Rijksmuseum random artworks failed:', error);
      }
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

// Rijksmuseum specific endpoints
export const searchRijksmuseum = async (req: Request, res: Response) => {
  try {
    const { 
      q, 
      creator, 
      type, 
      technique, 
      material, 
      hasImages = 'true',
      limit = '20' 
    } = req.query;

    const parsedLimit = Math.min(parseInt(limit as string) || 20, 100);

    const artworks = await rijksService.searchStandardizedArtworks({
      q: q as string,
      creator: creator as string,
      type: type as string,
      imageAvailable: hasImages === 'true',
      limit: parsedLimit
    });

    res.json({
      artworks,
      count: artworks.length,
      source: 'rijks',
      museum: 'Rijksmuseum'
    });
  } catch (error: any) {
    console.error('Error searching Rijksmuseum:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'Failed to search Rijksmuseum artworks',
      details: error.message
    });
  }
};

export const getRijksArtwork = async (req: Request, res: Response) => {
  try {
    const { object_id } = req.params;
    
    const rijksArtwork = await rijksService.getArtworkById(object_id);
    const standardized = rijksService.standardizeArtwork(rijksArtwork);
    
    res.json({
      artwork: standardized,
      source: 'rijks',
      museum: 'Rijksmuseum'
    });
  } catch (error: any) {
    console.error('Error fetching Rijksmuseum artwork:', error);
    if (error.message.includes('404')) {
      return res.status(404).json({
        error: 'Artwork not found',
        message: `Artwork with ID ${req.params.object_id} not found in Rijksmuseum`
      });
    }
    res.status(500).json({
      error: 'Fetch failed',
      message: 'Failed to fetch Rijksmuseum artwork',
      details: error.message
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

export const searchRijksByTitleOrArtist = async (req: Request, res: Response) => {
  try {
    const { 
      query, 
      searchType = 'both',
      hasImages = 'true',
      type,
      limit = '20' 
    } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Query parameter is required'
      });
    }

    const parsedLimit = Math.min(parseInt(limit as string), 100);
    let allArtworks: StandardizedArtwork[] = [];

    if (searchType === 'title' || searchType === 'both') {
      try {
        const titleResults = await rijksService.searchStandardizedArtworks({
          q: query as string, // In Rijksmuseum, the main 'q' parameter searches titles
          imageAvailable: hasImages === 'true',
          type: type as string,
          limit: Math.ceil(parsedLimit / (searchType === 'both' ? 2 : 1))
        });
        allArtworks.push(...titleResults);
      } catch (error) {
        console.error('Error searching Rijksmuseum by title:', error);
      }
    }

    if (searchType === 'artist' || searchType === 'both') {
      try {
        const artistResults = await rijksService.searchStandardizedArtworks({
          creator: query as string, // Use creator parameter for artist search
          imageAvailable: hasImages === 'true',
          type: type as string,
          limit: Math.ceil(parsedLimit / (searchType === 'both' ? 2 : 1))
        });
        allArtworks.push(...artistResults);
      } catch (error) {
        console.error('Error searching Rijksmuseum by artist:', error);
      }
    }

    // Remove duplicates based on artwork ID
    const uniqueArtworks = allArtworks.filter((artwork, index, self) => 
      index === self.findIndex(a => a.id === artwork.id)
    );

    // Limit results
    const limitedArtworks = uniqueArtworks.slice(0, parsedLimit);

    res.json({
      artworks: limitedArtworks,
      count: limitedArtworks.length,
      source: 'rijks',
      museum: 'Rijksmuseum',
      searchType,
      query: query as string
    });

  } catch (error) {
    console.error('Error in Rijksmuseum title/artist search:', error);
    res.status(500).json({
      error: 'Internal server error', 
      message: 'Failed to search Rijksmuseum by title or artist'
    });
  }
};