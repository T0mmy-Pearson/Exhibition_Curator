"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FitzwilliamMuseumService = void 0;
const axios_1 = __importDefault(require("axios"));
const FITZWILLIAM_BASE_URL = process.env.FITZWILLIAM_MUSEUM_API_URL || 'https://data.fitzmuseum.cam.ac.uk/api/v1';
const FITZWILLIAM_API_KEY = process.env.FITZWILLIAM_MUSEUM_API_KEY;
const FITZWILLIAM_USERNAME = process.env.FITZWILLIAM_USERNAME;
const FITZWILLIAM_PASSWORD = process.env.FITZWILLIAM_PASSWORD;
class FitzwilliamMuseumService {
    constructor() {
        this.authToken = null;
    }
    static getInstance() {
        if (!FitzwilliamMuseumService.instance) {
            FitzwilliamMuseumService.instance = new FitzwilliamMuseumService();
        }
        return FitzwilliamMuseumService.instance;
    }
    /**
     * Authenticate with the Fitzwilliam API
     */
    async authenticate() {
        if (this.authToken) {
            return this.authToken;
        }
        // If we have username and password, try programmatic login
        if (FITZWILLIAM_USERNAME && FITZWILLIAM_PASSWORD) {
            try {
                const loginResponse = await axios_1.default.post(`${FITZWILLIAM_BASE_URL.replace('/v1', '')}/login`, {
                    email: FITZWILLIAM_USERNAME,
                    password: FITZWILLIAM_PASSWORD
                });
                // Extract token from response - this might be in different locations
                this.authToken = loginResponse.data.token ||
                    loginResponse.data.access_token ||
                    loginResponse.headers['authorization'] ||
                    loginResponse.headers['x-auth-token'];
                if (this.authToken) {
                    return this.authToken;
                }
            }
            catch (error) {
                console.error('Fitzwilliam programmatic login failed:', error);
            }
        }
        // If we have an API key/bearer token, use it
        if (FITZWILLIAM_API_KEY) {
            this.authToken = FITZWILLIAM_API_KEY;
            return this.authToken;
        }
        throw new Error('No Fitzwilliam authentication credentials available. Please set FITZWILLIAM_API_KEY or FITZWILLIAM_USERNAME/FITZWILLIAM_PASSWORD');
    }
    /**
     * Get the headers for API requests
     */
    async getHeaders() {
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };
        try {
            const token = await this.authenticate();
            if (token) {
                // Try different authentication header formats
                if (token.startsWith('Bearer ')) {
                    headers['Authorization'] = token;
                }
                else {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }
        }
        catch (error) {
            console.warn('Fitzwilliam authentication failed, continuing without auth:', error);
        }
        return headers;
    }
    /**
     * Search artworks in Fitzwilliam Museum
     */
    async searchArtworks(params) {
        try {
            const queryParams = {
                page: params.page || 1,
                size: params.size || 20,
                ...params
            };
            // If no specific query, search for objects with images
            if (!params.query) {
                queryParams.images = 1;
            }
            const headers = await this.getHeaders();
            const response = await axios_1.default.get(`${FITZWILLIAM_BASE_URL}/objects`, {
                params: queryParams,
                headers
            });
            return response.data;
        }
        catch (error) {
            console.error('Error searching Fitzwilliam Museum:', error);
            if (axios_1.default.isAxiosError(error) && error.response?.status === 401) {
                throw new Error('Fitzwilliam Museum API authentication failed. Please check your API key.');
            }
            throw new Error('Failed to search Fitzwilliam Museum');
        }
    }
    /**
     * Get artwork details by UUID
     */
    async getArtworkByUuid(uuid) {
        try {
            const headers = await this.getHeaders();
            const response = await axios_1.default.get(`${FITZWILLIAM_BASE_URL}/objects/${uuid}`, {
                headers
            });
            return response.data.data;
        }
        catch (error) {
            console.error(`Error fetching Fitzwilliam Museum artwork ${uuid}:`, error);
            if (axios_1.default.isAxiosError(error) && error.response?.status === 401) {
                throw new Error('Fitzwilliam Museum API authentication failed. Please check your API key.');
            }
            throw new Error(`Failed to fetch artwork ${uuid} from Fitzwilliam Museum`);
        }
    }
    /**
     * Get random artworks with images
     */
    async getRandomArtworks(count = 20) {
        try {
            const searchResponse = await this.searchArtworks({
                images: 1,
                size: count * 2, // Get more to filter for quality
                sort: 'random'
            });
            if (!searchResponse.data || searchResponse.data.length === 0) {
                return [];
            }
            // Filter artworks that have good image data and return requested count
            const filteredArtworks = searchResponse.data
                .filter(artwork => artwork.multimedia && artwork.multimedia.length > 0)
                .slice(0, count);
            return filteredArtworks;
        }
        catch (error) {
            console.error('Error fetching random Fitzwilliam artworks:', error);
            return [];
        }
    }
    /**
     * Convert Fitzwilliam artwork to standardized format
     */
    convertToStandardized(artwork) {
        // Extract main image
        const mainImage = artwork.multimedia?.[0];
        const imageUrl = mainImage?.processed?.large?.location ||
            mainImage?.processed?.medium?.location ||
            mainImage?.processed?.original?.location;
        const smallImageUrl = mainImage?.processed?.preview?.location ||
            mainImage?.processed?.medium?.location;
        // Extract artist information
        const creator = artwork.lifecycle?.creation?.[0];
        const artist = creator?.maker?.[0]?.summary_title || 'Unknown Artist';
        // Extract date information
        const dateInfo = creator?.date?.[0];
        const date = dateInfo?.value ||
            (dateInfo?.earliest && dateInfo?.latest ?
                `${dateInfo.earliest}-${dateInfo.latest}` :
                dateInfo?.earliest || dateInfo?.latest) ||
            'Unknown Date';
        // Extract title
        const title = artwork.summary_title ||
            artwork.title?.[0]?.value ||
            'Untitled';
        // Extract medium/materials
        const materials = artwork.materials?.map(m => m.summary_title).join(', ');
        const techniques = artwork.techniques?.map(t => t.summary_title).join(', ');
        const medium = [materials, techniques].filter(Boolean).join('; ') || 'Unknown Medium';
        // Extract dimensions
        const dimensions = artwork.measurements?.dimensions
            ?.map(d => `${d.dimension}: ${d.value} ${d.units}`)
            .join('; ') || 'Unknown Dimensions';
        // Extract description
        const description = artwork.note
            ?.filter(note => note.type !== 'admin')
            ?.map(note => note.value)
            .join(' ') || '';
        // Extract accession number
        const accessionNumber = artwork.identifier
            ?.find(id => id.type === 'accession number' || id.accession_number)
            ?.value || artwork.identifier?.[0]?.accession_number || artwork.priref;
        return {
            id: artwork.uuid,
            title,
            artist,
            date,
            medium,
            dimensions,
            department: artwork.department?.summary_title || artwork.type?.summary_title,
            description,
            imageUrl,
            smallImageUrl,
            additionalImages: artwork.multimedia?.slice(1).map(img => img.processed?.large?.location ||
                img.processed?.medium?.location ||
                img.processed?.original?.location).filter((url) => Boolean(url)) || [],
            museumUrl: artwork.uri,
            isHighlight: false, // Fitzwilliam doesn't have highlight flag
            isPublicDomain: true, // Most Fitzwilliam content is open access
            tags: [
                ...(artwork.categories?.map(c => c.summary_title).filter((title) => Boolean(title)) || []),
                ...(artwork.techniques?.map(t => t.summary_title).filter((title) => Boolean(title)) || []),
                ...(artwork.materials?.map(m => m.summary_title).filter((title) => Boolean(title)) || [])
            ],
            source: 'fitzwilliam',
            // Fitzwilliam specific fields
            priref: artwork.priref,
            uuid: artwork.uuid,
            identifier: artwork.identifier
        };
    }
    /**
     * Search and convert to standardized format
     */
    async searchStandardizedArtworks(params) {
        try {
            const searchResponse = await this.searchArtworks({
                ...params,
                images: 1 // Only get objects with images
            });
            const standardizedArtworks = searchResponse.data.map(artwork => this.convertToStandardized(artwork));
            return {
                artworks: standardizedArtworks,
                total: searchResponse.meta.total,
                page: searchResponse.meta.current_page,
                totalPages: searchResponse.meta.last_page
            };
        }
        catch (error) {
            console.error('Error searching standardized Fitzwilliam artworks:', error);
            throw error;
        }
    }
    /**
     * Get departments/categories available in Fitzwilliam
     */
    async getDepartments() {
        try {
            // Since Fitzwilliam doesn't have a dedicated departments endpoint,
            // we can search for common department types
            const commonDepartments = [
                'Paintings, Drawings and Prints',
                'Applied Arts',
                'Antiquities',
                'Coins and Medals',
                'Manuscripts and Printed Books'
            ];
            return commonDepartments;
        }
        catch (error) {
            console.error('Error fetching Fitzwilliam departments:', error);
            return [];
        }
    }
}
exports.FitzwilliamMuseumService = FitzwilliamMuseumService;
//# sourceMappingURL=fitzwilliamMuseum.js.map