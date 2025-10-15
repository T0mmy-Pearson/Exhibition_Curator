"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RijksmuseumService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
class RijksmuseumService {
    constructor() {
        this.baseUrl = config_1.config.museum.rijksApiUrl;
    }
    static getInstance() {
        if (!RijksmuseumService.instance) {
            RijksmuseumService.instance = new RijksmuseumService();
        }
        return RijksmuseumService.instance;
    }
    /**
     * Extract IIIF identifier from D1_Digital_Object access points in E36_Visual_Item
     * Following Rijksmuseum's Linked Art structure:
     * E22_Human-Made_Object -> shows -> E36_Visual_Item -> digitally_shown_by -> D1_Digital_Object -> access_point
     */
    async extractIIIFIdentifier(rijksArtwork) {
        try {
            console.log(`🔍 Extracting IIIF for object: ${rijksArtwork.id}`);
            // Look for E36_Visual_Item references in the E22_Human-Made_Object
            const visualItems = rijksArtwork.shows || [];
            console.log(`Found ${visualItems.length} visual items in shows array`);
            for (let i = 0; i < visualItems.length; i++) {
                const visualItem = visualItems[i];
                console.log(`Processing visual item ${i + 1}:`, visualItem);
                // If visualItem is just a reference, we need to fetch the full data
                if (visualItem.id && visualItem.type === 'VisualItem') {
                    console.log(`Fetching VisualItem data from: ${visualItem.id}`);
                    try {
                        const visualItemResponse = await axios_1.default.get(visualItem.id, {
                            headers: {
                                'Accept': 'application/ld+json',
                                'User-Agent': 'Exhibition-Curator/1.0 (Educational Project)'
                            },
                            timeout: 10000
                        });
                        const fullVisualItem = visualItemResponse.data;
                        if (fullVisualItem) {
                            console.log(`VisualItem structure:`, JSON.stringify(fullVisualItem, null, 2));
                            // Look for D1_Digital_Object in digitally_shown_by
                            const digitalObjects = fullVisualItem.digitally_shown_by || [];
                            console.log(`Found ${digitalObjects.length} digital objects in VisualItem`);
                            for (const digitalObject of digitalObjects) {
                                console.log(`Digital Object:`, JSON.stringify(digitalObject, null, 2));
                                // Look for access points to IIIF services
                                const accessPoints = digitalObject.access_point || [];
                                for (const accessPoint of accessPoints) {
                                    const url = accessPoint.id || accessPoint['@id'];
                                    if (url && url.includes('iiif.micr.io')) {
                                        // Extract identifier from IIIF URL
                                        const match = url.match(/iiif\.micr\.io\/([^\/]+)/);
                                        if (match && match[1]) {
                                            console.log(`✅ Found IIIF identifier: ${match[1]} from URL: ${url}`);
                                            return match[1];
                                        }
                                    }
                                }
                            }
                        }
                    }
                    catch (error) {
                        console.warn(`Failed to fetch VisualItem ${visualItem.id}: ${error.message}`);
                        if (error.response) {
                            console.warn(`Response status: ${error.response.status}, data:`, error.response.data);
                        }
                    }
                }
                // Also check if the visual item data is already embedded
                else if (visualItem.digitally_shown_by) {
                    const digitalObjects = visualItem.digitally_shown_by || [];
                    for (const digitalObject of digitalObjects) {
                        const accessPoints = digitalObject.access_point || [];
                        for (const accessPoint of accessPoints) {
                            const url = accessPoint.id || accessPoint['@id'];
                            if (url && url.includes('iiif.micr.io')) {
                                const match = url.match(/iiif\.micr\.io\/([^\/]+)/);
                                if (match && match[1]) {
                                    console.log(`Found embedded IIIF identifier: ${match[1]}`);
                                    return match[1];
                                }
                            }
                        }
                    }
                }
            }
            return null;
        }
        catch (error) {
            console.warn('Failed to extract IIIF identifier:', error);
            return null;
        }
    }
    /**
     * Search artworks in Rijksmuseum collection
     */
    async searchArtworks(params) {
        try {
            const searchParams = {};
            if (params.title)
                searchParams.title = params.title;
            if (params.creator)
                searchParams.creator = params.creator;
            if (params.creationDate)
                searchParams.creationDate = params.creationDate;
            if (params.type)
                searchParams.type = params.type;
            if (params.technique)
                searchParams.technique = params.technique;
            if (params.material)
                searchParams.material = params.material;
            if (params.description)
                searchParams.description = params.description;
            if (params.imageAvailable !== undefined) {
                searchParams.imageAvailable = params.imageAvailable.toString();
            }
            if (params.pageToken)
                searchParams.pageToken = params.pageToken;
            const response = await axios_1.default.get(`https://data.rijksmuseum.nl/search/collection`, {
                params: searchParams,
                // Removed timeout to prevent frontend timeouts
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Exhibition-Curator/1.0 (Educational Project)'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Error searching Rijksmuseum:', error.response?.status || error.message);
            throw new Error('Failed to search Rijksmuseum');
        }
    }
    /**
     * Get artwork by ID from Rijksmuseum
     */
    async getArtworkById(objectId) {
        try {
            // Rijksmuseum uses persistent identifiers - use Linked Art format
            const response = await axios_1.default.get(`https://data.rijksmuseum.nl/${objectId}`, {
                // Removed timeout to prevent frontend timeouts
                headers: {
                    'Accept': 'application/ld+json',
                    'User-Agent': 'Exhibition-Curator/1.0 (Educational Project)'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching Rijksmuseum artwork:', error.response?.status || error.message);
            throw new Error(`Failed to fetch artwork ${objectId} from Rijksmuseum`);
        }
    }
    /**
     * Convert Rijksmuseum artwork to standardized format (Linked Art format)
     */
    async standardizeArtwork(rijksArtwork) {
        // Extract object ID from the ID URL
        const objectId = rijksArtwork.id?.split('/').pop() || '';
        // Extract title from identified_by array
        const title = rijksArtwork.identified_by?.find((id) => id.type === 'Name' && id.classified_as?.some((c) => c.id === 'http://vocab.getty.edu/aat/300404670' || // primary name
            c.id === 'http://vocab.getty.edu/aat/300417207' // title
        ))?.content || rijksArtwork._label || 'Untitled';
        // Extract artist/creator from produced_by.referred_to_by
        const artist = rijksArtwork.produced_by?.referred_to_by?.find((ref) => ref.type === 'LinguisticObject' && ref.classified_as?.some((c) => c.id === 'http://vocab.getty.edu/aat/300435416' // attribution qualifier
        ))?.content || 'Unknown Artist';
        // Extract date from timespan
        const timespan = rijksArtwork.produced_by?.timespan;
        let date;
        if (timespan) {
            const year = timespan.identified_by?.find((id) => id.type === 'Name')?.content;
            if (year) {
                date = year;
            }
            else if (timespan.begin_of_the_begin) {
                const startYear = new Date(timespan.begin_of_the_begin).getFullYear();
                const endYear = timespan.end_of_the_end ? new Date(timespan.end_of_the_end).getFullYear() : startYear;
                date = startYear === endYear ? `${startYear}` : `${startYear}-${endYear}`;
            }
        }
        // Extract techniques from produced_by.technique
        const techniques = rijksArtwork.produced_by?.technique?.map((t) => t.identified_by?.find((id) => id.type === 'Name')?.content || t._label).filter(Boolean).join(', ');
        // Extract materials from made_of
        const materials = rijksArtwork.made_of?.map((m) => m.identified_by?.find((id) => id.type === 'Name')?.content || m._label).filter(Boolean).join(', ');
        // Extract dimensions
        const dimensions = rijksArtwork.dimension?.map((d) => `${d.value} ${d.unit?.identified_by?.find((id) => id.type === 'Name')?.content || 'cm'}`).join(' x ');
        // Extract object number for image retrieval
        const objectNumber = rijksArtwork.identified_by?.find((id) => id.type === 'Identifier' && id.classified_as?.some((c) => c.id === 'http://vocab.getty.edu/aat/300312355' // object number
        ))?.content;
        // Extract IIIF identifier for images
        const iiifIdentifier = await this.extractIIIFIdentifier(rijksArtwork);
        const imageUrl = iiifIdentifier
            ? `https://iiif.micr.io/${iiifIdentifier}/full/max/0/default.jpg`
            : undefined;
        const smallImageUrl = iiifIdentifier
            ? `https://iiif.micr.io/${iiifIdentifier}/full/400,/0/default.jpg`
            : undefined;
        // Extract object type from classified_as
        const objectType = rijksArtwork.classified_as?.find((c) => c.type === 'Type' && c._label)?._label;
        // Extract subjects/themes from shows
        const subjects = rijksArtwork.shows?.flatMap((s) => s.about?.map((a) => a._label || a.identified_by?.find((id) => id.type === 'Name')?.content) || []).filter(Boolean);
        return {
            id: `rijks:${objectId}`,
            source: 'rijks',
            title,
            artist,
            date,
            medium: techniques || materials || undefined,
            dimensions,
            department: objectType,
            description: rijksArtwork.referred_to_by?.find((ref) => ref.type === 'LinguisticObject' && ref.classified_as?.some((c) => c.id === 'http://vocab.getty.edu/aat/300080091' // description
            ))?.content,
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
            materials: rijksArtwork.made_of?.map((m) => m.identified_by?.find((id) => id.type === 'Name')?.content || m._label).filter(Boolean) || [],
            techniques: rijksArtwork.produced_by?.technique?.map((t) => t.identified_by?.find((id) => id.type === 'Name')?.content || t._label).filter(Boolean) || []
        };
    }
    /**
     * Search and return standardized artworks
     */
    async searchStandardizedArtworks(params) {
        try {
            // Since Rijksmuseum doesn't have a general 'q' parameter, 
            // we need to try multiple search strategies
            let searchResponse = null;
            // Strategy 1: If we have specific parameters, use them
            if (params.creator || params.type) {
                const searchParams = {};
                if (params.creator)
                    searchParams.creator = params.creator;
                if (params.type)
                    searchParams.type = params.type;
                if (params.imageAvailable !== undefined) {
                    searchParams.imageAvailable = params.imageAvailable;
                }
                try {
                    searchResponse = await this.searchArtworks(searchParams);
                }
                catch (error) {
                    console.log(`Rijksmuseum specific search failed, trying general search`);
                }
            }
            // Strategy 2: If we have a general query, try multiple approaches
            if (params.q && (!searchResponse || !searchResponse.orderedItems || searchResponse.orderedItems.length === 0)) {
                // Try searching by title first
                try {
                    const titleSearchParams = { title: params.q };
                    if (params.imageAvailable !== undefined) {
                        titleSearchParams.imageAvailable = params.imageAvailable;
                    }
                    searchResponse = await this.searchArtworks(titleSearchParams);
                }
                catch (error) {
                    console.log(`Rijksmuseum title search failed for "${params.q}"`);
                }
                // If title search didn't work or had no results, try creator search
                if (!searchResponse || !searchResponse.orderedItems || searchResponse.orderedItems.length === 0) {
                    try {
                        const creatorSearchParams = { creator: params.q };
                        if (params.imageAvailable !== undefined) {
                            creatorSearchParams.imageAvailable = params.imageAvailable;
                        }
                        searchResponse = await this.searchArtworks(creatorSearchParams);
                    }
                    catch (error) {
                        console.log(`Rijksmuseum creator search failed for "${params.q}"`);
                    }
                }
                // If still no results, try description search as last resort
                if (!searchResponse || !searchResponse.orderedItems || searchResponse.orderedItems.length === 0) {
                    try {
                        const descriptionSearchParams = { description: params.q };
                        if (params.imageAvailable !== undefined) {
                            descriptionSearchParams.imageAvailable = params.imageAvailable;
                        }
                        searchResponse = await this.searchArtworks(descriptionSearchParams);
                    }
                    catch (error) {
                        console.log(`Rijksmuseum description search failed for "${params.q}"`);
                    }
                }
            }
            // Strategy 3: If all searches failed, try a general type search for common art types
            if (!searchResponse || !searchResponse.orderedItems || searchResponse.orderedItems.length === 0) {
                try {
                    const fallbackSearchParams = { type: 'painting' };
                    if (params.imageAvailable !== undefined) {
                        fallbackSearchParams.imageAvailable = params.imageAvailable;
                    }
                    searchResponse = await this.searchArtworks(fallbackSearchParams);
                    console.log(`Rijksmuseum using fallback search for paintings`);
                }
                catch (error) {
                    console.log(`Rijksmuseum fallback search failed`);
                }
            }
            if (!searchResponse || !searchResponse.orderedItems || searchResponse.orderedItems.length === 0) {
                return [];
            }
            const limit = params.limit || 20;
            const selectedItems = searchResponse.orderedItems.slice(0, limit);
            console.log(`Rijksmuseum: Starting to fetch ${selectedItems.length} artworks...`);
            // Fetch details for each artwork in parallel (optimized for performance)
            const fetchPromises = selectedItems.map(async (item, index) => {
                try {
                    // Extract object ID from the Rijksmuseum ID URL
                    const objectId = item.id.split('/').pop();
                    if (!objectId)
                        return null;
                    const rijksArtwork = await this.getArtworkById(objectId);
                    const standardized = await this.standardizeArtwork(rijksArtwork);
                    // Log progress for every 5th item
                    if (index % 5 === 0) {
                        console.log(`Rijksmuseum: Processing item ${index + 1}/${selectedItems.length}`);
                    }
                    return standardized;
                }
                catch (error) {
                    console.warn(`Failed to fetch Rijksmuseum artwork ${item.id}, skipping:`, error.message);
                    return null;
                }
            });
            // Wait for all promises to resolve and filter out nulls
            const results = await Promise.all(fetchPromises);
            const artworks = results.filter(artwork => artwork !== null);
            console.log(`Rijksmuseum: Successfully retrieved ${artworks.length} artworks`);
            return artworks;
        }
        catch (error) {
            console.error('Error searching standardized Rijksmuseum artworks:', error);
            throw new Error('Failed to search artworks from Rijksmuseum');
        }
    }
    /**
     * Get random artworks (Rijksmuseum doesn't have a specific random endpoint,
     * so we'll search for common terms and randomize)
     */
    async getRandomArtworks(count = 20) {
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
            const artworks = [];
            for (const item of selected) {
                try {
                    const objectId = item.id.split('/').pop();
                    if (!objectId)
                        continue;
                    const rijksArtwork = await this.getArtworkById(objectId);
                    const standardized = await this.standardizeArtwork(rijksArtwork);
                    artworks.push(standardized);
                    // Small delay between requests
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                catch (error) {
                    console.warn(`Failed to fetch random Rijksmuseum artwork ${item.id}, skipping`);
                }
            }
            return artworks;
        }
        catch (error) {
            console.error('Error getting random Rijksmuseum artworks:', error);
            throw new Error('Failed to get random artworks from Rijksmuseum');
        }
    }
}
exports.RijksmuseumService = RijksmuseumService;
//# sourceMappingURL=rijksmuseum.js.map