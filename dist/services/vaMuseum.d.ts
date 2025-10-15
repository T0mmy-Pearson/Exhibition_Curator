import { VASearchResponse, VAArtwork, StandardizedArtwork } from '../types/artwork';
export declare class VAMuseumService {
    private static instance;
    static getInstance(): VAMuseumService;
    /**
     * Search artworks in V&A Museum
     */
    searchArtworks(params: {
        q?: string;
        page_size?: number;
        page_offset?: number;
        images_exist?: number;
        order_by?: string;
        order_sort?: 'asc' | 'desc';
        id_material?: string;
        id_technique?: string;
        id_place?: string;
        made_after_year?: number;
        made_before_year?: number;
        response_format?: 'json' | 'csv';
    }): Promise<VASearchResponse>;
    /**
     * Get artwork details by system number
     */
    getArtworkById(systemNumber: string): Promise<VAArtwork>;
    /**
     * Get random artworks with images
     */
    getRandomArtworks(count?: number): Promise<VAArtwork[]>;
    /**
     * Convert V&A Museum artwork to standardized format
     */
    standardizeArtwork(vaArtwork: VAArtwork): StandardizedArtwork;
    /**
     * Search and return standardized artworks
     */
    searchStandardizedArtworks(params: {
        q?: string;
        images_exist?: boolean;
        materials?: string[];
        techniques?: string[];
        place?: string;
        dateAfter?: number;
        dateBefore?: number;
        limit?: number;
    }): Promise<StandardizedArtwork[]>;
    /**
     * Get clusters/facets for a search query
     */
    getClusters(params: {
        q?: string;
        cluster_type?: 'material' | 'technique' | 'place' | 'person' | 'style';
        cluster_size?: number;
    }): Promise<any>;
}
//# sourceMappingURL=vaMuseum.d.ts.map