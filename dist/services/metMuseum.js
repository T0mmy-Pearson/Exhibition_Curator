"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetMuseumService = void 0;
const axios_1 = __importDefault(require("axios"));
const MET_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';
class MetMuseumService {
    constructor() {
        this.consecutiveFailures = 0;
        this.lastFailureTime = 0;
        this.maxConsecutiveFailures = 5;
        this.cooldownPeriod = 60000; // 1 minute
    }
    static getInstance() {
        if (!MetMuseumService.instance) {
            MetMuseumService.instance = new MetMuseumService();
        }
        return MetMuseumService.instance;
    }
    /**
     * Get all departments from Met Museum
     */
    async getDepartments() {
        try {
            const response = await axios_1.default.get(`${MET_BASE_URL}/departments`);
            return response.data.departments;
        }
        catch (error) {
            console.error('Error fetching Met Museum departments:', error);
            throw new Error('Failed to fetch departments from Met Museum');
        }
    }
    /**
     * Search artworks in Met Museum
     */
    async searchArtworks(params) {
        // Check if service is in cooldown
        if (this.isInCooldown()) {
            throw new Error(`Met Museum service temporarily unavailable due to rate limiting. Please try again later.`);
        }
        try {
            const response = await axios_1.default.get(`${MET_BASE_URL}/search`, {
                params,
                timeout: 15000, // 15 second timeout for search
                headers: {
                    'User-Agent': 'Exhibition-Curator/1.0 (Educational Project)',
                    'Accept': 'application/json'
                }
            });
            this.recordSuccess();
            return response.data;
        }
        catch (error) {
            this.recordFailure();
            const statusCode = error.response?.status;
            console.error('Error searching Met Museum:', statusCode || error.message);
            if (statusCode >= 500 && statusCode < 600) {
                throw new Error(`Met Museum server temporarily unavailable (${statusCode}). Please try again later.`);
            }
            else if (statusCode === 403 || statusCode === 429) {
                throw new Error('Met Museum rate limit exceeded. Please try again later.');
            }
            else {
                throw new Error('Failed to search Met Museum');
            }
        }
    }
    /**
     * Get artwork details by object ID with retry logic and circuit breaker
     */
    async getArtworkById(objectID, retryCount = 3) {
        // Check if service is in cooldown
        if (this.isInCooldown()) {
            throw new Error(`Met Museum service temporarily unavailable due to rate limiting. Please try again later.`);
        }
        for (let attempt = 1; attempt <= retryCount; attempt++) {
            try {
                // Add delay between requests to avoid rate limiting
                if (attempt > 1) {
                    await this.delay(1000 * attempt); // Progressive delay: 1s, 2s, 3s
                }
                const response = await axios_1.default.get(`${MET_BASE_URL}/objects/${objectID}`, {
                    timeout: 10000, // 10 second timeout
                    headers: {
                        'User-Agent': 'Exhibition-Curator/1.0 (Educational Project)',
                        'Accept': 'application/json'
                    }
                });
                // Record success
                this.recordSuccess();
                return response.data;
            }
            catch (error) {
                console.error(`Error fetching Met Museum artwork ${objectID} (attempt ${attempt}/${retryCount}):`, error.response?.status || error.message);
                // Record failure for circuit breaker
                this.recordFailure();
                // Handle different types of errors
                const statusCode = error.response?.status;
                if (statusCode === 403 || statusCode === 429) {
                    // Rate limiting errors - shorter delays for individual requests
                    if (attempt < retryCount) {
                        const delay = Math.min(1000 * attempt, 2000); // Max 2 second delay
                        console.log(`Rate limited (${statusCode}), waiting ${delay}ms before retry...`);
                        await this.delay(delay);
                        continue;
                    }
                }
                else if (statusCode >= 500 && statusCode < 600) {
                    // Server errors (500, 502, 503, etc.)
                    if (attempt < retryCount) {
                        const delay = Math.min(1000 * attempt, 1500); // Max 1.5 second delay
                        console.log(`Server error (${statusCode}), waiting ${delay}ms before retry...`);
                        await this.delay(delay);
                        continue;
                    }
                }
                // If final attempt or non-retryable error, throw
                if (attempt === retryCount) {
                    throw new Error(`Failed to fetch artwork ${objectID} from Met Museum after ${retryCount} attempts`);
                }
            }
        }
        throw new Error(`Failed to fetch artwork ${objectID} from Met Museum`);
    }
    /**
     * Helper method to add delays between requests
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Check if service is in cooldown due to consecutive failures
     */
    isInCooldown() {
        if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
            const timeSinceLastFailure = Date.now() - this.lastFailureTime;
            if (timeSinceLastFailure < this.cooldownPeriod) {
                return true;
            }
            else {
                // Reset after cooldown period
                this.consecutiveFailures = 0;
            }
        }
        return false;
    }
    /**
     * Record a successful request
     */
    recordSuccess() {
        this.consecutiveFailures = 0;
    }
    /**
     * Record a failed request
     */
    recordFailure() {
        this.consecutiveFailures++;
        this.lastFailureTime = Date.now();
    }
    /**
     * Get random artworks with images
     */
    async getRandomArtworks(count = 20) {
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
            const artworks = [];
            for (const id of selectedIds) {
                try {
                    const artwork = await this.getArtworkById(id);
                    if (artwork.primaryImage) { // Only include artworks with images
                        artworks.push(artwork);
                    }
                }
                catch (error) {
                    // Skip failed requests
                    console.warn(`Failed to fetch artwork ${id}, skipping`);
                }
            }
            return artworks;
        }
        catch (error) {
            console.error('Error getting random Met Museum artworks:', error);
            throw new Error('Failed to get random artworks from Met Museum');
        }
    }
    /**
     * Convert Met Museum artwork to standardized format
     */
    standardizeArtwork(metArtwork) {
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
    async searchStandardizedArtworks(params) {
        // Wrap entire operation with shorter timeout for better UX
        return await Promise.race([
            this.performSearchStandardizedArtworks(params),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Met Museum search timed out after 20 seconds')), 20000))
        ]);
    }
    async performSearchStandardizedArtworks(params) {
        try {
            const searchResponse = await this.searchArtworks({
                ...params,
                hasImages: params.hasImages !== false // Default to true
            });
            if (!searchResponse.objectIDs || searchResponse.objectIDs.length === 0) {
                return [];
            }
            const limit = params.limit || 20;
            // Smart selection: take a mix of early results (likely more relevant) 
            // and some from the middle to get variety
            const totalResults = searchResponse.objectIDs.length;
            const selectedIds = [];
            // Take first 60% from the beginning (most relevant)
            const earlyCount = Math.ceil(limit * 0.6);
            selectedIds.push(...searchResponse.objectIDs.slice(0, earlyCount));
            // Take remaining 40% from middle section for variety
            const remainingCount = limit - earlyCount;
            if (remainingCount > 0 && totalResults > earlyCount) {
                const middleStart = Math.floor(totalResults * 0.2);
                const middleEnd = Math.floor(totalResults * 0.6);
                const middleSection = searchResponse.objectIDs.slice(middleStart, middleEnd);
                // Take every nth item to get variety
                const step = Math.max(1, Math.floor(middleSection.length / remainingCount));
                for (let i = 0; i < remainingCount && i * step < middleSection.length; i++) {
                    selectedIds.push(middleSection[i * step]);
                }
            }
            const artworks = [];
            console.log(`Met Museum: Selected ${selectedIds.length} artworks from ${totalResults} total results`);
            // Fetch details for each artwork with optimized batching
            console.log(`Met Museum: Starting to fetch ${selectedIds.length} artworks in batches...`);
            const batchSize = 5; // Process 5 artworks at a time
            const batches = [];
            for (let i = 0; i < selectedIds.length; i += batchSize) {
                const batch = selectedIds.slice(i, i + batchSize);
                batches.push(batch);
            }
            for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
                const batch = batches[batchIndex];
                // Dynamic delay between batches based on failure rate
                if (batchIndex > 0) {
                    const baseDelay = 1000;
                    const failureMultiplier = Math.min(this.consecutiveFailures, 3); // Max 3x multiplier
                    const dynamicDelay = baseDelay * (1 + failureMultiplier * 0.5); // 1s, 1.5s, 2s, 2.5s
                    await this.delay(dynamicDelay);
                }
                // Process batch with Promise.allSettled for parallel requests
                const batchPromises = batch.map(async (id, indexInBatch) => {
                    try {
                        // Small staggered delay within batch to avoid simultaneous requests
                        if (indexInBatch > 0) {
                            await this.delay(indexInBatch * 200);
                        }
                        const metArtwork = await this.getArtworkById(id, 2); // Reduce retries to 2
                        return this.standardizeArtwork(metArtwork);
                    }
                    catch (error) {
                        console.warn(`Failed to fetch artwork ${id}, skipping:`, error.message);
                        return null;
                    }
                });
                const batchResults = await Promise.allSettled(batchPromises);
                // Add successful results to artworks array
                batchResults.forEach((result) => {
                    if (result.status === 'fulfilled' && result.value !== null) {
                        artworks.push(result.value);
                    }
                });
                console.log(`Met Museum: Completed batch ${batchIndex + 1}/${batches.length}, total artworks: ${artworks.length}`);
                // Aggressive early exit conditions
                const successRate = artworks.length / ((batchIndex + 1) * batchSize);
                const totalProcessed = (batchIndex + 1) * batchSize;
                // Exit if we have enough artworks (at least 10 or 25% of requested)
                if (artworks.length >= Math.max(10, limit * 0.25)) {
                    console.log(`Met Museum: Got sufficient results (${artworks.length}), stopping early`);
                    break;
                }
                // Exit if success rate is too low (less than 50% and we have some results)
                if (successRate < 0.5 && artworks.length >= 5 && totalProcessed >= 20) {
                    console.log(`Met Museum: Low success rate (${(successRate * 100).toFixed(1)}%), stopping early with ${artworks.length} artworks`);
                    break;
                }
                // Exit if circuit breaker is about to trigger
                if (this.consecutiveFailures >= this.maxConsecutiveFailures - 1) {
                    console.log(`Met Museum: Approaching rate limit threshold, stopping early`);
                    break;
                }
            }
            return artworks;
        }
        catch (error) {
            console.error('Error searching standardized artworks:', error);
            throw new Error('Failed to search artworks from Met Museum');
        }
    }
}
exports.MetMuseumService = MetMuseumService;
//# sourceMappingURL=metMuseum.js.map