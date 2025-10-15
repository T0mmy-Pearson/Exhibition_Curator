import { FitzwilliamSearchResponse, FitzwilliamArtwork, StandardizedArtwork } from '../types/artwork';
export declare class FitzwilliamMuseumService {
    private static instance;
    private authToken;
    static getInstance(): FitzwilliamMuseumService;
    /**
     * Authenticate with the Fitzwilliam API
     */
    private authenticate;
    /**
     * Get the headers for API requests
     */
    private getHeaders;
    /**
     * Search artworks in Fitzwilliam Museum
     */
    searchArtworks(params: {
        query?: string;
        page?: number;
        size?: number;
        sort?: string;
        images?: number;
        department?: string;
        type?: string;
        maker?: string;
        materials?: string;
        techniques?: string;
        categories?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<FitzwilliamSearchResponse>;
    /**
     * Get artwork details by UUID
     */
    getArtworkByUuid(uuid: string): Promise<FitzwilliamArtwork>;
    /**
     * Get random artworks with images
     */
    getRandomArtworks(count?: number): Promise<FitzwilliamArtwork[]>;
    /**
     * Convert Fitzwilliam artwork to standardized format
     */
    convertToStandardized(artwork: FitzwilliamArtwork): StandardizedArtwork;
    /**
     * Search and convert to standardized format
     */
    searchStandardizedArtworks(params: {
        query?: string;
        page?: number;
        size?: number;
        department?: string;
        maker?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<{
        artworks: StandardizedArtwork[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Get departments/categories available in Fitzwilliam
     */
    getDepartments(): Promise<string[]>;
}
//# sourceMappingURL=fitzwilliamMuseum.d.ts.map