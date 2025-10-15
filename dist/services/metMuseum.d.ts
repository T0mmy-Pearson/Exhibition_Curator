import { MetDepartment, MetSearchResponse, MetArtwork, StandardizedArtwork } from '../types/artwork';
export declare class MetMuseumService {
    private static instance;
    private consecutiveFailures;
    private lastFailureTime;
    private readonly maxConsecutiveFailures;
    private readonly cooldownPeriod;
    static getInstance(): MetMuseumService;
    /**
     * Get all departments from Met Museum
     */
    getDepartments(): Promise<MetDepartment[]>;
    /**
     * Search artworks in Met Museum
     */
    searchArtworks(params: {
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
    }): Promise<MetSearchResponse>;
    /**
     * Get artwork details by object ID with retry logic and circuit breaker
     */
    getArtworkById(objectID: number, retryCount?: number): Promise<MetArtwork>;
    /**
     * Helper method to add delays between requests
     */
    private delay;
    /**
     * Check if service is in cooldown due to consecutive failures
     */
    private isInCooldown;
    /**
     * Record a successful request
     */
    private recordSuccess;
    /**
     * Record a failed request
     */
    private recordFailure;
    /**
     * Get random artworks with images
     */
    getRandomArtworks(count?: number): Promise<MetArtwork[]>;
    /**
     * Convert Met Museum artwork to standardized format
     */
    standardizeArtwork(metArtwork: MetArtwork): StandardizedArtwork;
    /**
     * Search and return standardized artworks
     */
    searchStandardizedArtworks(params: {
        q?: string;
        departmentId?: number;
        hasImages?: boolean;
        isHighlight?: boolean;
        title?: boolean;
        artistOrCulture?: boolean;
        limit?: number;
    }): Promise<StandardizedArtwork[]>;
    private performSearchStandardizedArtworks;
}
//# sourceMappingURL=metMuseum.d.ts.map