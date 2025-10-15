"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VAMuseumService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
class VAMuseumService {
    static getInstance() {
        if (!VAMuseumService.instance) {
            VAMuseumService.instance = new VAMuseumService();
        }
        return VAMuseumService.instance;
    }
    /**
     * Search artworks in V&A Museum
     */
    async searchArtworks(params) {
        try {
            const searchParams = {
                ...params,
                response_format: 'json'
            };
            const response = await axios_1.default.get(`${config_1.config.museum.vaApiUrl}/objects/search`, {
                params: searchParams
            });
            return response.data;
        }
        catch (error) {
            console.error('Error searching V&A Museum:', error);
            throw new Error('Failed to search V&A Museum');
        }
    }
    /**
     * Get artwork details by system number
     */
    async getArtworkById(systemNumber) {
        try {
            const response = await axios_1.default.get(`${config_1.config.museum.vaApiUrl}/museumobject/${systemNumber}`);
            return response.data.record;
        }
        catch (error) {
            console.error(`Error fetching V&A Museum artwork ${systemNumber}:`, error);
            throw new Error(`Failed to fetch artwork ${systemNumber} from V&A Museum`);
        }
    }
    /**
     * Get random artworks with images
     */
    async getRandomArtworks(count = 20) {
        try {
            // Search for artworks with images
            const searchResponse = await this.searchArtworks({
                images_exist: 1,
                page_size: count * 2, // Get more than needed in case some fail to load
                q: 'art' // Generic search to get varied results
            });
            if (!searchResponse.records || searchResponse.records.length === 0) {
                return [];
            }
            // V&A returns full records in search results when format is JSON
            const artworks = searchResponse.records.slice(0, count);
            return artworks;
        }
        catch (error) {
            console.error('Error getting random V&A Museum artworks:', error);
            throw new Error('Failed to get random artworks from V&A Museum');
        }
    }
    /**
     * Convert V&A Museum artwork to standardized format
     */
    standardizeArtwork(vaArtwork) {
        // Extract primary title
        const primaryTitle = vaArtwork._primaryTitle || 'Untitled';
        // Extract artist information
        let artist = 'Unknown Artist';
        let artistBio = undefined;
        if (vaArtwork._primaryMaker?.name) {
            artist = vaArtwork._primaryMaker.name;
        }
        else if (Array.isArray(vaArtwork.artistMakerPerson) && vaArtwork.artistMakerPerson.length > 0) {
            const primaryArtist = vaArtwork.artistMakerPerson[0];
            artist = primaryArtist.name?.text || 'Unknown Artist';
            artistBio = primaryArtist.note || undefined;
        }
        else if (Array.isArray(vaArtwork.artistMakerOrganisations) && vaArtwork.artistMakerOrganisations.length > 0) {
            const primaryOrg = vaArtwork.artistMakerOrganisations[0];
            artist = primaryOrg.name?.text || 'Unknown Artist';
        }
        // Extract date information
        let date = vaArtwork._primaryDate || undefined;
        if (!date && Array.isArray(vaArtwork.productionDates) && vaArtwork.productionDates.length > 0) {
            date = vaArtwork.productionDates[0].date?.text;
        }
        // Extract materials and techniques
        const materials = Array.isArray(vaArtwork.materials)
            ? vaArtwork.materials.map((m) => m.text).join(', ')
            : '';
        const techniques = Array.isArray(vaArtwork.techniques)
            ? vaArtwork.techniques.map((t) => t.text).join(', ')
            : '';
        const medium = vaArtwork.materialsAndTechniques || [materials, techniques].filter(Boolean).join('; ');
        // Extract dimensions
        let dimensions = undefined;
        if (vaArtwork.dimensionsSummary) {
            dimensions = vaArtwork.dimensionsSummary;
        }
        // Extract image URLs
        let imageUrl = undefined;
        let smallImageUrl = undefined;
        if (vaArtwork._primaryImageId) {
            // Construct IIIF URLs
            const iiifBase = `https://framemark.vam.ac.uk/collections/${vaArtwork._primaryImageId}`;
            imageUrl = `${iiifBase}/full/!800,800/0/default.jpg`;
            smallImageUrl = `${iiifBase}/full/!200,200/0/default.jpg`;
        }
        // Extract object type
        const objectType = vaArtwork.objectType;
        // Extract places of origin
        const culture = vaArtwork._primaryPlace ||
            (Array.isArray(vaArtwork.placesOfOrigin) ? vaArtwork.placesOfOrigin[0]?.place?.text : undefined);
        // Extract accession number
        const accessionNumber = vaArtwork.accessionNumber;
        return {
            id: `va:${vaArtwork.systemNumber}`,
            source: 'va',
            title: primaryTitle,
            artist: artist,
            artistBio: artistBio,
            culture: culture,
            date: date,
            medium: medium,
            dimensions: dimensions,
            department: objectType,
            description: vaArtwork.briefDescription || vaArtwork.physicalDescription,
            imageUrl: imageUrl,
            smallImageUrl: smallImageUrl,
            additionalImages: [], // V&A doesn't provide additional images in basic response
            museumUrl: `https://collections.vam.ac.uk/item/${vaArtwork.systemNumber}/`,
            isHighlight: false, // V&A doesn't have a highlight field
            isPublicDomain: true, // Most V&A content is public domain
            tags: [
                ...(Array.isArray(vaArtwork.materials) ? vaArtwork.materials.map((m) => m.text) : []),
                ...(Array.isArray(vaArtwork.techniques) ? vaArtwork.techniques.map((t) => t.text) : []),
                ...(vaArtwork.objectType ? [vaArtwork.objectType] : [])
            ].filter(Boolean),
            // V&A Museum specific fields
            systemNumber: vaArtwork.systemNumber,
            accessionNumber: accessionNumber,
            accessionYear: vaArtwork.accessionYear
        };
    }
    /**
     * Search and return standardized artworks
     */
    async searchStandardizedArtworks(params) {
        try {
            const searchParams = {
                q: params.q,
                images_exist: params.images_exist !== false ? 1 : undefined,
                made_after_year: params.dateAfter,
                made_before_year: params.dateBefore,
                page_size: params.limit || 20
            };
            // Add material filters if provided
            if (params.materials && params.materials.length > 0) {
                // V&A uses controlled vocabulary IDs, but we'll search by text for simplicity
                searchParams.q = `${searchParams.q || ''} ${params.materials.join(' ')}`.trim();
            }
            const searchResponse = await this.searchArtworks(searchParams);
            if (!searchResponse.records || searchResponse.records.length === 0) {
                return [];
            }
            // Convert to standardized format
            const artworks = searchResponse.records.map((vaArtwork) => this.standardizeArtwork(vaArtwork));
            return artworks;
        }
        catch (error) {
            console.error('Error searching standardized artworks:', error);
            throw new Error('Failed to search artworks from V&A Museum');
        }
    }
    /**
     * Get clusters/facets for a search query
     */
    async getClusters(params) {
        try {
            const endpoint = params.cluster_type
                ? `${config_1.config.museum.vaApiUrl}/objects/clusters/${params.cluster_type}/search`
                : `${config_1.config.museum.vaApiUrl}/objects/clusters/search`;
            const response = await axios_1.default.get(endpoint, { params });
            return response.data;
        }
        catch (error) {
            console.error('Error getting V&A clusters:', error);
            throw new Error('Failed to get clusters from V&A Museum');
        }
    }
}
exports.VAMuseumService = VAMuseumService;
//# sourceMappingURL=vaMuseum.js.map