import axios from 'axios';
import { config } from '../config';

// Rijksmuseum Old API interfaces (for images)
export interface RijksOldApiResponse {
  artObject: {
    id: string;
    objectNumber: string;
    title: string;
    webImage?: {
      guid: string;
      url: string;
      width: number;
      height: number;
    };
    hasImage: boolean;
  };
}

// Rijksmuseum New API interfaces (for metadata)
export interface RijksSearchResponse {
  '@context': string;
  id: string;
  type: string;
  partOf: {
    id: string;
    type: string;
    totalItems: number;
    first: {
      id: string;
      type: string;
    };
    last: {
      id: string;
      type: string;
    };
  };
  next?: {
    id: string;
    type: string;
  };
  prev?: {
    id: string;
    type: string;
  };
  orderedItems: Array<{
    id: string;
    type: string;
  }>;
}

export interface RijksArtwork {
  '@context': string;
  id: string;
  type: string;
  _label: string;
  classified_as?: Array<{
    id: string;
    type: string;
    _label: string;
  }>;
  identified_by?: Array<{
    type: string;
    content: string;
    classified_as?: Array<{
      id: string;
      type: string;
      _label: string;
    }>;
  }>;
  produced_by?: {
    type: string;
    carried_out_by?: Array<{
      id: string;
      type: string;
      _label: string;
    }>;
    timespan?: {
      type: string;
      begin_of_the_begin?: string;
      end_of_the_end?: string;
      _label?: string;
    };
    technique?: Array<{
      id: string;
      type: string;
      _label: string;
    }>;
    used_specific_object?: Array<{
      id: string;
      type: string;
      _label: string;
    }>;
  };
  dimension?: Array<{
    type: string;
    value: number;
    unit: {
      id: string;
      type: string;
      _label: string;
    };
    classified_as: Array<{
      id: string;
      type: string;
      _label: string;
    }>;
  }>;
  made_of?: Array<{
    id: string;
    type: string;
    _label: string;
  }>;
  shows?: Array<{
    type: string;
    _label?: string;
    about?: Array<{
      id: string;
      type: string;
      _label: string;
    }>;
  }>;
  subject_of?: Array<{
    type: string;
    digitally_carried_by?: Array<{
      type: string;
      access_point?: Array<{
        id: string;
        type: string;
      }>;
      classified_as?: Array<{
        id: string;
        type: string;
        _label: string;
      }>;
    }>;
  }>;
  current_owner?: {
    id: string;
    type: string;
    _label: string;
  };
  current_keeper?: {
    id: string;
    type: string;
    _label: string;
  };
  current_location?: {
    id: string;
    type: string;
    _label: string;
  };
}

export class RijksmuseumService {
  private static instance: RijksmuseumService;
  private readonly baseUrl: string;

  private constructor() {
    this.baseUrl = config.museum.rijksApiUrl;
  }

  public static getInstance(): RijksmuseumService {
    if (!RijksmuseumService.instance) {
      RijksmuseumService.instance = new RijksmuseumService();
    }
    return RijksmuseumService.instance;
  }

  /**
   * Fetch image URLs from the old Rijksmuseum API using object number
   */
  private async fetchImageFromOldApi(objectNumber: string): Promise<{ imageUrl?: string; smallImageUrl?: string }> {
    try {
      const response = await axios.get<RijksOldApiResponse>(
        `${config.museum.rijksOldApiUrl}/${objectNumber}`,
        {
          params: {
            key: config.museum.rijksApiKey,
            format: 'json'
          },
          timeout: 15000
        }
      );

      const webImage = response.data.artObject.webImage;
      if (webImage && webImage.url && webImage.url.trim() !== '') {
        // Generate different sized images from the Google API URL
        const baseImageUrl = webImage.url;
        const imageUrl = baseImageUrl; // Full size
        const smallImageUrl = baseImageUrl.replace('=s0', '=s400'); // 400px width

        return { imageUrl, smallImageUrl };
      }

      return {};
    } catch (error) {
      console.warn(`Failed to fetch image for object ${objectNumber}:`, error);
      return {};
    }
  }

  /**
   * Search artworks in Rijksmuseum collection
   */
  async searchArtworks(params: {
    title?: string;
    creator?: string;
    creationDate?: string;
    type?: string;
    technique?: string;
    material?: string;
    description?: string;
    imageAvailable?: boolean;
    pageToken?: string;
    limit?: number;
  }): Promise<RijksSearchResponse> {
    try {
      const searchParams: any = {};
      
      if (params.title) searchParams.title = params.title;
      if (params.creator) searchParams.creator = params.creator;
      if (params.creationDate) searchParams.creationDate = params.creationDate;
      if (params.type) searchParams.type = params.type;
      if (params.technique) searchParams.technique = params.technique;
      if (params.material) searchParams.material = params.material;
      if (params.description) searchParams.description = params.description;
      if (params.imageAvailable !== undefined) {
        searchParams.imageAvailable = params.imageAvailable.toString();
      }
      if (params.pageToken) searchParams.pageToken = params.pageToken;

      const response = await axios.get(`${this.baseUrl}/search/collection`, {
        params: searchParams,
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Exhibition-Curator/1.0 (Educational Project)'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Error searching Rijksmuseum:', error.response?.status || error.message);
      throw new Error('Failed to search Rijksmuseum');
    }
  }

  /**
   * Get artwork by ID from Rijksmuseum
   */
  async getArtworkById(objectId: string): Promise<RijksArtwork> {
    try {
      // Rijksmuseum uses persistent identifiers - use Linked Art format
      const response = await axios.get(`https://data.rijksmuseum.nl/${objectId}`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/ld+json',
          'User-Agent': 'Exhibition-Curator/1.0 (Educational Project)'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Error fetching Rijksmuseum artwork:', error.response?.status || error.message);
      throw new Error(`Failed to fetch artwork ${objectId} from Rijksmuseum`);
    }
  }

  /**
   * Convert Rijksmuseum artwork to standardized format (Linked Art format)
   */
  async standardizeArtwork(rijksArtwork: any): Promise<any> {
    // Extract object ID from the ID URL
    const objectId = rijksArtwork.id?.split('/').pop() || '';
    
    // Extract title from identified_by array
    const title = rijksArtwork.identified_by?.find((id: any) => 
      id.type === 'Name' && id.classified_as?.some((c: any) => 
        c.id === 'http://vocab.getty.edu/aat/300404670' || // primary name
        c.id === 'http://vocab.getty.edu/aat/300417207'    // title
      )
    )?.content || rijksArtwork._label || 'Untitled';

    // Extract artist/creator from produced_by.referred_to_by
    const artist = rijksArtwork.produced_by?.referred_to_by?.find((ref: any) =>
      ref.type === 'LinguisticObject' && ref.classified_as?.some((c: any) =>
        c.id === 'http://vocab.getty.edu/aat/300435416' // attribution qualifier
      )
    )?.content || 'Unknown Artist';

    // Extract date from timespan
    const timespan = rijksArtwork.produced_by?.timespan;
    let date: string | undefined;
    if (timespan) {
      const year = timespan.identified_by?.find((id: any) => 
        id.type === 'Name'
      )?.content;
      if (year) {
        date = year;
      } else if (timespan.begin_of_the_begin) {
        const startYear = new Date(timespan.begin_of_the_begin).getFullYear();
        const endYear = timespan.end_of_the_end ? new Date(timespan.end_of_the_end).getFullYear() : startYear;
        date = startYear === endYear ? `${startYear}` : `${startYear}-${endYear}`;
      }
    }

    // Extract techniques from produced_by.technique
    const techniques = rijksArtwork.produced_by?.technique?.map((t: any) => 
      t.identified_by?.find((id: any) => id.type === 'Name')?.content || t._label
    ).filter(Boolean).join(', ');

    // Extract materials from made_of
    const materials = rijksArtwork.made_of?.map((m: any) => 
      m.identified_by?.find((id: any) => id.type === 'Name')?.content || m._label
    ).filter(Boolean).join(', ');

    // Extract dimensions
    const dimensions = rijksArtwork.dimension?.map((d: any) => 
      `${d.value} ${d.unit?.identified_by?.find((id: any) => id.type === 'Name')?.content || 'cm'}`
    ).join(' x ');

    // Extract object number for image retrieval
    const objectNumber = rijksArtwork.identified_by?.find((id: any) => 
      id.type === 'Identifier' && id.classified_as?.some((c: any) =>
        c.id === 'http://vocab.getty.edu/aat/300312355' // object number
      )
    )?.content;

    // Fetch images from the old API using hybrid approach
    const { imageUrl, smallImageUrl } = objectNumber 
      ? await this.fetchImageFromOldApi(objectNumber)
      : { imageUrl: undefined, smallImageUrl: undefined };

    // Extract object type from classified_as
    const objectType = rijksArtwork.classified_as?.find((c: any) => 
      c.type === 'Type' && c._label
    )?._label;

    // Extract subjects/themes from shows
    const subjects = rijksArtwork.shows?.flatMap((s: any) => 
      s.about?.map((a: any) => a._label || a.identified_by?.find((id: any) => 
        id.type === 'Name'
      )?.content) || []
    ).filter(Boolean);

    return {
      id: `rijks:${objectId}`,
      source: 'rijks',
      title,
      artist,
      date,
      medium: techniques || materials || undefined,
      dimensions,
      department: objectType,
      description: rijksArtwork.referred_to_by?.find((ref: any) => 
        ref.type === 'LinguisticObject' && ref.classified_as?.some((c: any) =>
          c.id === 'http://vocab.getty.edu/aat/300080091' // description
        )
      )?.content,
      imageUrl,
      smallImageUrl,
      additionalImages: [],
      museumUrl: `https://www.rijksmuseum.nl/en/collection/${objectNumber || objectId}`,
      isHighlight: false, // Rijksmuseum doesn't provide this information
      isPublicDomain: true, // Most Rijksmuseum items are public domain
      tags: subjects || [],
      // Rijksmuseum specific fields
      objectNumber: objectNumber || objectId,
      creator: artist,
      materials: rijksArtwork.made_of?.map((m: any) => 
        m.identified_by?.find((id: any) => id.type === 'Name')?.content || m._label
      ).filter(Boolean) || [],
      techniques: rijksArtwork.produced_by?.technique?.map((t: any) => 
        t.identified_by?.find((id: any) => id.type === 'Name')?.content || t._label
      ).filter(Boolean) || []
    };
  }

  /**
   * Search and return standardized artworks
   */
  async searchStandardizedArtworks(params: {
    q?: string;
    creator?: string;
    type?: string;
    imageAvailable?: boolean;
    limit?: number;
  }): Promise<any[]> {
    try {
      // Since Rijksmuseum doesn't have a general 'q' parameter, 
      // we need to try multiple search strategies
      let searchResponse: RijksSearchResponse | null = null;
      
      // Strategy 1: If we have specific parameters, use them
      if (params.creator || params.type) {
        const searchParams: any = {};
        if (params.creator) searchParams.creator = params.creator;
        if (params.type) searchParams.type = params.type;
        if (params.imageAvailable !== undefined) {
          searchParams.imageAvailable = params.imageAvailable;
        }
        
        try {
          searchResponse = await this.searchArtworks(searchParams);
        } catch (error) {
          console.log(`Rijksmuseum specific search failed, trying general search`);
        }
      }
      
      // Strategy 2: If we have a general query, try multiple approaches
      if (params.q && (!searchResponse || !searchResponse.orderedItems || searchResponse.orderedItems.length === 0)) {
        // Try searching by title first
        try {
          const titleSearchParams: any = { title: params.q };
          if (params.imageAvailable !== undefined) {
            titleSearchParams.imageAvailable = params.imageAvailable;
          }
          searchResponse = await this.searchArtworks(titleSearchParams);
        } catch (error) {
          console.log(`Rijksmuseum title search failed for "${params.q}"`);
        }
        
        // If title search didn't work or had no results, try creator search
        if (!searchResponse || !searchResponse.orderedItems || searchResponse.orderedItems.length === 0) {
          try {
            const creatorSearchParams: any = { creator: params.q };
            if (params.imageAvailable !== undefined) {
              creatorSearchParams.imageAvailable = params.imageAvailable;
            }
            searchResponse = await this.searchArtworks(creatorSearchParams);
          } catch (error) {
            console.log(`Rijksmuseum creator search failed for "${params.q}"`);
          }
        }
        
        // If still no results, try description search as last resort
        if (!searchResponse || !searchResponse.orderedItems || searchResponse.orderedItems.length === 0) {
          try {
            const descriptionSearchParams: any = { description: params.q };
            if (params.imageAvailable !== undefined) {
              descriptionSearchParams.imageAvailable = params.imageAvailable;
            }
            searchResponse = await this.searchArtworks(descriptionSearchParams);
          } catch (error) {
            console.log(`Rijksmuseum description search failed for "${params.q}"`);
          }
        }
      }
      
      // Strategy 3: If all searches failed, try a general type search for common art types
      if (!searchResponse || !searchResponse.orderedItems || searchResponse.orderedItems.length === 0) {
        try {
          const fallbackSearchParams: any = { type: 'painting' };
          if (params.imageAvailable !== undefined) {
            fallbackSearchParams.imageAvailable = params.imageAvailable;
          }
          searchResponse = await this.searchArtworks(fallbackSearchParams);
          console.log(`Rijksmuseum using fallback search for paintings`);
        } catch (error) {
          console.log(`Rijksmuseum fallback search failed`);
        }
      }
      
      if (!searchResponse || !searchResponse.orderedItems || searchResponse.orderedItems.length === 0) {
        return [];
      }

      const limit = params.limit || 20;
      const selectedItems = searchResponse.orderedItems.slice(0, limit);
      const artworks: any[] = [];

      console.log(`Rijksmuseum: Starting to fetch ${selectedItems.length} artworks...`);

      // Fetch details for each artwork
      for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i];
        try {
          // Extract object ID from the Rijksmuseum ID URL
          const objectId = item.id.split('/').pop();
          if (!objectId) continue;

          const rijksArtwork = await this.getArtworkById(objectId);
          const standardized = await this.standardizeArtwork(rijksArtwork);
          artworks.push(standardized);

          // Log progress
          if (i % 5 === 0) {
            console.log(`Rijksmuseum: Fetched ${i + 1}/${selectedItems.length} artworks`);
          }

          // Add small delay to be respectful to the API
          if (i < selectedItems.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error: any) {
          console.warn(`Failed to fetch Rijksmuseum artwork ${item.id}, skipping:`, error.message);
        }
      }

      console.log(`Rijksmuseum: Successfully retrieved ${artworks.length} artworks`);
      return artworks;
    } catch (error) {
      console.error('Error searching standardized Rijksmuseum artworks:', error);
      throw new Error('Failed to search artworks from Rijksmuseum');
    }
  }

  /**
   * Get random artworks (Rijksmuseum doesn't have a specific random endpoint, 
   * so we'll search for common terms and randomize)
   */
  async getRandomArtworks(count: number = 20): Promise<any[]> {
    try {
      const randomTerms = ['painting', 'sculpture', 'drawing', 'print', 'ceramic', 'furniture'];
      const randomTerm = randomTerms[Math.floor(Math.random() * randomTerms.length)];
      
      const searchResponse = await this.searchArtworks({
        type: randomTerm,
        imageAvailable: true
      });

      if (!searchResponse.orderedItems || searchResponse.orderedItems.length === 0) {
        return [];
      }

      // Randomize the results
      const shuffled = searchResponse.orderedItems.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count);
      const artworks: any[] = [];

      for (const item of selected) {
        try {
          const objectId = item.id.split('/').pop();
          if (!objectId) continue;

          const rijksArtwork = await this.getArtworkById(objectId);
          const standardized = await this.standardizeArtwork(rijksArtwork);
          artworks.push(standardized);

          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`Failed to fetch random Rijksmuseum artwork ${item.id}, skipping`);
        }
      }

      return artworks;
    } catch (error) {
      console.error('Error getting random Rijksmuseum artworks:', error);
      throw new Error('Failed to get random artworks from Rijksmuseum');
    }
  }
}