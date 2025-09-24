import axios from 'axios';
import { MetDepartment, MetSearchResponse, MetArtwork, StandardizedArtwork } from '../types/artwork';

const MET_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';

export class MetMuseumService {
  private static instance: MetMuseumService;

  public static getInstance(): MetMuseumService {
    if (!MetMuseumService.instance) {
      MetMuseumService.instance = new MetMuseumService();
    }
    return MetMuseumService.instance;
  }

  /**
   * Get all departments from Met Museum
   */
  async getDepartments(): Promise<MetDepartment[]> {
    try {
      const response = await axios.get(`${MET_BASE_URL}/departments`);
      return response.data.departments;
    } catch (error) {
      console.error('Error fetching Met Museum departments:', error);
      throw new Error('Failed to fetch departments from Met Museum');
    }
  }

  /**
   * Search artworks in Met Museum
   */
  async searchArtworks(params: {
    q?: string;
    isHighlight?: boolean;
    title?: boolean;
    tags?: boolean;
    departmentId?: number;
    isOnView?: boolean;
    artistOrCulture?: boolean;
    medium?: string;
    hasImages?: boolean;
    geoLocation?: string;
    dateBegin?: number;
    dateEnd?: number;
  }): Promise<MetSearchResponse> {
    try {
      const response = await axios.get(`${MET_BASE_URL}/search`, { params });
      return response.data;
    } catch (error) {
      console.error('Error searching Met Museum:', error);
      throw new Error('Failed to search Met Museum');
    }
  }

  /**
   * Get artwork details by object ID
   */
  async getArtworkById(objectID: number): Promise<MetArtwork> {
    try {
      const response = await axios.get(`${MET_BASE_URL}/objects/${objectID}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching Met Museum artwork ${objectID}:`, error);
      throw new Error(`Failed to fetch artwork ${objectID} from Met Museum`);
    }
  }

  /**
   * Get random artworks with images
   */
  async getRandomArtworks(count: number = 20): Promise<MetArtwork[]> {
    try {
      // Search for highlighted works first
      const searchResponse = await this.searchArtworks({
        hasImages: true,
        isHighlight: true
      });

      if (!searchResponse.objectIDs || searchResponse.objectIDs.length === 0) {
        // Fallback to any artworks with images
        const fallbackSearch = await this.searchArtworks({
          hasImages: true,
          q: 'painting'
        });
        if (!fallbackSearch.objectIDs) {
          return [];
        }
        searchResponse.objectIDs = fallbackSearch.objectIDs;
      }

      // Randomly select object IDs
      const shuffled = searchResponse.objectIDs.sort(() => 0.5 - Math.random());
      const selectedIds = shuffled.slice(0, count);

      // Fetch artwork details
      const artworks: MetArtwork[] = [];
      for (const id of selectedIds) {
        try {
          const artwork = await this.getArtworkById(id);
          if (artwork.primaryImage) { // Only include artworks with images
            artworks.push(artwork);
          }
        } catch (error) {
          // Skip failed requests
          console.warn(`Failed to fetch artwork ${id}, skipping`);
        }
      }

      return artworks;
    } catch (error) {
      console.error('Error getting random Met Museum artworks:', error);
      throw new Error('Failed to get random artworks from Met Museum');
    }
  }

  /**
   * Convert Met Museum artwork to standardized format
   */
  standardizeArtwork(metArtwork: MetArtwork): StandardizedArtwork {
    return {
      id: `met:${metArtwork.objectID}`,
      source: 'met',
      title: metArtwork.title || 'Untitled',
      artist: metArtwork.artistDisplayName || 'Unknown Artist',
      artistBio: metArtwork.artistDisplayBio || undefined,
      culture: metArtwork.culture || undefined,
      date: metArtwork.objectDate || undefined,
      medium: metArtwork.medium || undefined,
      dimensions: metArtwork.dimensions || undefined,
      department: metArtwork.department || undefined,
      imageUrl: metArtwork.primaryImage || undefined,
      smallImageUrl: metArtwork.primaryImageSmall || undefined,
      additionalImages: metArtwork.additionalImages || [],
      museumUrl: metArtwork.objectURL || undefined,
      isHighlight: metArtwork.isHighlight || false,
      isPublicDomain: metArtwork.isPublicDomain || false,
      tags: metArtwork.tags?.map(tag => tag.term) || [],
      // Met Museum specific fields
      objectID: metArtwork.objectID,
      accessionNumber: metArtwork.accessionNumber || undefined,
      creditLine: metArtwork.creditLine || undefined,
      galleryNumber: metArtwork.GalleryNumber || undefined
    };
  }

  /**
   * Search and return standardized artworks
   */
  async searchStandardizedArtworks(params: {
    q?: string;
    departmentId?: number;
    hasImages?: boolean;
    isHighlight?: boolean;
    title?: boolean;
    artistOrCulture?: boolean;
    limit?: number;
  }): Promise<StandardizedArtwork[]> {
    try {
      const searchResponse = await this.searchArtworks({
        ...params,
        hasImages: params.hasImages !== false // Default to true
      });

      if (!searchResponse.objectIDs || searchResponse.objectIDs.length === 0) {
        return [];
      }

      const limit = params.limit || 20;
      const selectedIds = searchResponse.objectIDs.slice(0, limit);
      const artworks: StandardizedArtwork[] = [];

      // Fetch details for each artwork
      for (const id of selectedIds) {
        try {
          const metArtwork = await this.getArtworkById(id);
          const standardized = this.standardizeArtwork(metArtwork);
          artworks.push(standardized);
        } catch (error) {
          console.warn(`Failed to fetch artwork ${id}, skipping`);
        }
      }

      return artworks;
    } catch (error) {
      console.error('Error searching standardized artworks:', error);
      throw new Error('Failed to search artworks from Met Museum');
    }
  }
}