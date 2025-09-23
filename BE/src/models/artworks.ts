import axios from 'axios';
import { User } from './User';

interface SearchParams {
  query?: string;
  department?: string;
  medium?: string;
  hasImages?: boolean;
  isOnView?: boolean;
  limit?: number;
  offset?: number;
}

interface MetArtwork {
  objectID: number;
  title: string;
  artistDisplayName: string;
  objectDate: string;
  medium: string;
  department: string;
  culture: string;
  period: string;
  dimensions: string;
  primaryImage: string;
  primaryImageSmall: string;
  additionalImages: string[];
  objectURL: string;
  tags: { term: string }[];
  [key: string]: any;
}

// Metropolitan Museum of Art API integration
export const searchMetMuseumArtworks = async (params: SearchParams) => {
  try {
    const metApiUrl = process.env.MET_MUSEUM_API_URL || 'https://collectionapi.metmuseum.org/public/collection/v1';
    
    // Build search query
    let searchUrl = `${metApiUrl}/search?`;
    const queryParams = [];
    
    if (params.query) {
      queryParams.push(`q=${encodeURIComponent(params.query)}`);
    }
    if (params.department) {
      queryParams.push(`departmentId=${params.department}`);
    }
    if (params.hasImages) {
      queryParams.push('hasImages=true');
    }
    if (params.isOnView) {
      queryParams.push('isOnView=true');
    }
    
    searchUrl += queryParams.join('&');
    
    const searchResponse = await axios.get(searchUrl);
    const objectIDs = searchResponse.data.objectIDs || [];
    
    // Limit results
    const limit = params.limit || 20;
    const offset = params.offset || 0;
    const paginatedIDs = objectIDs.slice(offset, offset + limit);
    
    // Fetch detailed information for each artwork
    const artworkPromises = paginatedIDs.map(async (id: number) => {
      try {
        const response = await axios.get(`${metApiUrl}/objects/${id}`);
        const artwork = response.data;
        
        return {
          artworkId: artwork.objectID.toString(),
          title: artwork.title || 'Untitled',
          artist: artwork.artistDisplayName || 'Unknown Artist',
          date: artwork.objectDate || '',
          medium: artwork.medium || '',
          department: artwork.department || '',
          culture: artwork.culture || '',
          period: artwork.period || '',
          dimensions: artwork.dimensions || '',
          imageUrl: artwork.primaryImage || '',
          primaryImageSmall: artwork.primaryImageSmall || '',
          additionalImages: artwork.additionalImages || [],
          objectURL: artwork.objectURL || '',
          tags: artwork.tags?.map((tag: any) => tag.term) || [],
          description: artwork.objectName || '',
          museumSource: 'met'
        };
      } catch (error) {
        console.error(`Error fetching artwork ${id}:`, error);
        return null;
      }
    });
    
    const artworks = await Promise.all(artworkPromises);
    return artworks.filter(artwork => artwork !== null);
    
  } catch (error) {
    console.error('Error searching Met Museum:', error);
    throw new Error('Failed to search Met Museum artworks');
  }
};

// Rijksmuseum API integration (requires API key)
export const searchRijksmuseumArtworks = async (params: SearchParams) => {
  try {
    const rijksApiKey = process.env.RIJKS_MUSEUM_API_KEY;
    const rijksApiUrl = process.env.RIJKS_MUSEUM_API_URL || 'https://www.rijksmuseum.nl/api/en/collection';
    
    if (!rijksApiKey) {
      console.warn('Rijksmuseum API key not configured');
      return [];
    }
    
    const queryParams = [`key=${rijksApiKey}`];
    
    if (params.query) {
      queryParams.push(`q=${encodeURIComponent(params.query)}`);
    }
    if (params.hasImages) {
      queryParams.push('imgonly=true');
    }
    
    const limit = params.limit || 20;
    const offset = params.offset || 0;
    queryParams.push(`p=${Math.floor(offset / limit) + 1}`);
    queryParams.push(`ps=${limit}`);
    
    const searchUrl = `${rijksApiUrl}?${queryParams.join('&')}`;
    const response = await axios.get(searchUrl);
    
    const artObjects = response.data.artObjects || [];
    
    return artObjects.map((artwork: any) => ({
      artworkId: artwork.objectNumber,
      title: artwork.title,
      artist: artwork.principalOrFirstMaker || 'Unknown Artist',
      date: artwork.dating?.presentingDate || '',
      medium: artwork.technique || '',
      department: artwork.classification || '',
      culture: '',
      period: artwork.dating?.period || '',
      dimensions: '',
      imageUrl: artwork.webImage?.url || '',
      primaryImageSmall: artwork.headerImage?.url || '',
      additionalImages: [],
      objectURL: artwork.links?.web || '',
      tags: artwork.productionPlaces || [],
      description: artwork.longTitle || artwork.title,
      museumSource: 'rijks'
    }));
    
  } catch (error) {
    console.error('Error searching Rijksmuseum:', error);
    return []; // Return empty array instead of throwing to allow graceful fallback
  }
};

// Combined search across multiple museum APIs
export const searchArtworks = async (params: SearchParams) => {
  try {
    const [metArtworks, rijksArtworks] = await Promise.allSettled([
      searchMetMuseumArtworks(params),
      searchRijksmuseumArtworks(params)
    ]);
    
    const allArtworks = [];
    
    if (metArtworks.status === 'fulfilled') {
      allArtworks.push(...metArtworks.value);
    }
    
    if (rijksArtworks.status === 'fulfilled') {
      allArtworks.push(...rijksArtworks.value);
    }
    
    // Sort by relevance (could be improved with better scoring)
    return allArtworks.sort((a, b) => {
      // Prioritize artworks with images
      if (a.imageUrl && !b.imageUrl) return -1;
      if (!a.imageUrl && b.imageUrl) return 1;
      
      // Then sort by title alphabetically
      return a.title.localeCompare(b.title);
    });
    
  } catch (error) {
    console.error('Error in combined artwork search:', error);
    throw new Error('Failed to search artworks');
  }
};

// Fetch single artwork by ID and source
export const fetchArtworkById = async (artworkId: string, source?: string) => {
  try {
    if (source === 'met' || !source) {
      // Try Met Museum first
      try {
        const metApiUrl = process.env.MET_MUSEUM_API_URL || 'https://collectionapi.metmuseum.org/public/collection/v1';
        const response = await axios.get(`${metApiUrl}/objects/${artworkId}`);
        const artwork = response.data;
        
        return {
          artworkId: artwork.objectID.toString(),
          title: artwork.title || 'Untitled',
          artist: artwork.artistDisplayName || 'Unknown Artist',
          date: artwork.objectDate || '',
          medium: artwork.medium || '',
          department: artwork.department || '',
          culture: artwork.culture || '',
          period: artwork.period || '',
          dimensions: artwork.dimensions || '',
          imageUrl: artwork.primaryImage || '',
          primaryImageSmall: artwork.primaryImageSmall || '',
          additionalImages: artwork.additionalImages || [],
          objectURL: artwork.objectURL || '',
          tags: artwork.tags?.map((tag: any) => tag.term) || [],
          description: artwork.objectName || '',
          museumSource: 'met'
        };
      } catch (metError) {
        if (source === 'met') throw metError;
      }
    }
    
    if (source === 'rijks' || !source) {
      // Try Rijksmuseum
      const rijksApiKey = process.env.RIJKS_MUSEUM_API_KEY;
      const rijksApiUrl = process.env.RIJKS_MUSEUM_API_URL || 'https://www.rijksmuseum.nl/api/en/collection';
      
      if (rijksApiKey) {
        try {
          const response = await axios.get(`${rijksApiUrl}/${artworkId}?key=${rijksApiKey}`);
          const artwork = response.data.artObject;
          
          return {
            artworkId: artwork.objectNumber,
            title: artwork.title,
            artist: artwork.principalOrFirstMaker || 'Unknown Artist',
            date: artwork.dating?.presentingDate || '',
            medium: artwork.technique || '',
            department: artwork.classification || '',
            culture: '',
            period: artwork.dating?.period || '',
            dimensions: '',
            imageUrl: artwork.webImage?.url || '',
            primaryImageSmall: artwork.headerImage?.url || '',
            additionalImages: [],
            objectURL: artwork.links?.web || '',
            tags: artwork.productionPlaces || [],
            description: artwork.longTitle || artwork.title,
            museumSource: 'rijks'
          };
        } catch (rijksError) {
          if (source === 'rijks') throw rijksError;
        }
      }
    }
    
    throw new Error('Artwork not found');
    
  } catch (error) {
    console.error('Error fetching artwork by ID:', error);
    throw new Error('Artwork not found');
  }
};

// User favorites management (now uses embedded documents)
export const fetchFavoriteArtworks = async (userId: string) => {
  try {
    const user = await User.findById(userId).select('favoriteArtworks');
    if (!user) {
      throw new Error('User not found');
    }
    return user.favoriteArtworks;
  } catch (error) {
    console.error('Error fetching favorite artworks:', error);
    throw new Error('Failed to fetch favorite artworks');
  }
};

export const insertFavoriteArtwork = async (userId: string, artworkData: any) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    await user.addToFavorites(artworkData);
    return { message: 'Artwork added to favorites' };
  } catch (error) {
    console.error('Error adding artwork to favorites:', error);
    throw error;
  }
};

export const removeFavoriteArtwork = async (userId: string, artworkId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    await user.removeFromFavorites(artworkId);
    return { message: 'Artwork removed from favorites' };
  } catch (error) {
    console.error('Error removing artwork from favorites:', error);
    throw error;
  }
};