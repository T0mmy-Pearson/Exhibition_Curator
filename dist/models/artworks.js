"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFavoriteArtwork = exports.insertFavoriteArtwork = exports.fetchFavoriteArtworks = exports.fetchArtworkById = exports.searchArtworks = exports.searchRijksmuseumArtworks = exports.searchMetMuseumArtworks = void 0;
const axios_1 = __importDefault(require("axios"));
const User_1 = require("./User");
// Metropolitan Museum of Art API integration
const searchMetMuseumArtworks = async (params) => {
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
        const searchResponse = await axios_1.default.get(searchUrl);
        const objectIDs = searchResponse.data.objectIDs || [];
        // Limit results
        const limit = params.limit || 20;
        const offset = params.offset || 0;
        const paginatedIDs = objectIDs.slice(offset, offset + limit);
        // Fetch detailed information for each artwork
        const artworkPromises = paginatedIDs.map(async (id) => {
            try {
                const response = await axios_1.default.get(`${metApiUrl}/objects/${id}`);
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
                    tags: artwork.tags?.map((tag) => tag.term) || [],
                    description: artwork.objectName || '',
                    museumSource: 'met'
                };
            }
            catch (error) {
                console.error(`Error fetching artwork ${id}:`, error);
                return null;
            }
        });
        const artworks = await Promise.all(artworkPromises);
        return artworks.filter(artwork => artwork !== null);
    }
    catch (error) {
        console.error('Error searching Met Museum:', error);
        throw new Error('Failed to search Met Museum artworks');
    }
};
exports.searchMetMuseumArtworks = searchMetMuseumArtworks;
// Rijksmuseum API integration (requires API key)
const searchRijksmuseumArtworks = async (params) => {
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
        const response = await axios_1.default.get(searchUrl);
        const artObjects = response.data.artObjects || [];
        return artObjects.map((artwork) => ({
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
    }
    catch (error) {
        console.error('Error searching Rijksmuseum:', error);
        return []; // Return empty array instead of throwing to allow graceful fallback
    }
};
exports.searchRijksmuseumArtworks = searchRijksmuseumArtworks;
// Combined search across multiple museum APIs
const searchArtworks = async (params) => {
    try {
        const [metArtworks, rijksArtworks] = await Promise.allSettled([
            (0, exports.searchMetMuseumArtworks)(params),
            (0, exports.searchRijksmuseumArtworks)(params)
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
            if (a.imageUrl && !b.imageUrl)
                return -1;
            if (!a.imageUrl && b.imageUrl)
                return 1;
            // Then sort by title alphabetically
            return a.title.localeCompare(b.title);
        });
    }
    catch (error) {
        console.error('Error in combined artwork search:', error);
        throw new Error('Failed to search artworks');
    }
};
exports.searchArtworks = searchArtworks;
// Fetch single artwork by ID and source
const fetchArtworkById = async (artworkId, source) => {
    try {
        if (source === 'met' || !source) {
            // Try Met Museum first
            try {
                const metApiUrl = process.env.MET_MUSEUM_API_URL || 'https://collectionapi.metmuseum.org/public/collection/v1';
                const response = await axios_1.default.get(`${metApiUrl}/objects/${artworkId}`);
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
                    tags: artwork.tags?.map((tag) => tag.term) || [],
                    description: artwork.objectName || '',
                    museumSource: 'met'
                };
            }
            catch (metError) {
                if (source === 'met')
                    throw metError;
            }
        }
        if (source === 'rijks' || !source) {
            // Try Rijksmuseum
            const rijksApiKey = process.env.RIJKS_MUSEUM_API_KEY;
            const rijksApiUrl = process.env.RIJKS_MUSEUM_API_URL || 'https://www.rijksmuseum.nl/api/en/collection';
            if (rijksApiKey) {
                try {
                    const response = await axios_1.default.get(`${rijksApiUrl}/${artworkId}?key=${rijksApiKey}`);
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
                }
                catch (rijksError) {
                    if (source === 'rijks')
                        throw rijksError;
                }
            }
        }
        throw new Error('Artwork not found');
    }
    catch (error) {
        console.error('Error fetching artwork by ID:', error);
        throw new Error('Artwork not found');
    }
};
exports.fetchArtworkById = fetchArtworkById;
// User favorites management (now uses embedded documents)
const fetchFavoriteArtworks = async (userId) => {
    try {
        const user = await User_1.User.findById(userId).select('favoriteArtworks');
        if (!user) {
            throw new Error('User not found');
        }
        return user.favoriteArtworks;
    }
    catch (error) {
        console.error('Error fetching favorite artworks:', error);
        throw new Error('Failed to fetch favorite artworks');
    }
};
exports.fetchFavoriteArtworks = fetchFavoriteArtworks;
const insertFavoriteArtwork = async (userId, artworkData) => {
    try {
        const user = await User_1.User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        await user.addToFavorites(artworkData);
        return { message: 'Artwork added to favorites' };
    }
    catch (error) {
        console.error('Error adding artwork to favorites:', error);
        throw error;
    }
};
exports.insertFavoriteArtwork = insertFavoriteArtwork;
const removeFavoriteArtwork = async (userId, artworkId) => {
    try {
        const user = await User_1.User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        await user.removeFromFavorites(artworkId);
        return { message: 'Artwork removed from favorites' };
    }
    catch (error) {
        console.error('Error removing artwork from favorites:', error);
        throw error;
    }
};
exports.removeFavoriteArtwork = removeFavoriteArtwork;
//# sourceMappingURL=artworks.js.map