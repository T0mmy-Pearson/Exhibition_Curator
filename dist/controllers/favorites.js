"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchFavorites = exports.removeFromFavorites = exports.addToFavorites = exports.getUserFavorites = void 0;
const User_1 = require("../models/User");
// Get current user's favorite artworks
const getUserFavorites = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required'
            });
        }
        const user = await User_1.User.findById(userId).select('favoriteArtworks');
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User account not found'
            });
        }
        res.status(200).json({
            favorites: user.favoriteArtworks,
            total: user.favoriteArtworks.length
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getUserFavorites = getUserFavorites;
// Add artwork to user's favorites
const addToFavorites = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        // Accept either wrapped artworkData or direct fields for frontend compatibility
        const artworkData = req.body.artworkData || req.body;
        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required'
            });
        }
        // Validate artwork data
        if (!artworkData || !artworkData.artworkId || !artworkData.title) {
            return res.status(400).json({
                error: 'Invalid artwork data',
                message: 'Artwork ID and title are required'
            });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User account not found'
            });
        }
        // Check if artwork is already in favorites
        const alreadyFavorited = user.favoriteArtworks.some((artwork) => artwork.artworkId === artworkData.artworkId);
        if (alreadyFavorited) {
            return res.status(409).json({
                error: 'Already favorited',
                message: 'This artwork is already in your favorites'
            });
        }
        // Add to favorites
        await user.addToFavorites({
            ...artworkData,
            addedAt: new Date()
        });
        res.status(201).json({
            message: 'Artwork added to favorites successfully',
            artwork: artworkData
        });
    }
    catch (err) {
        if (err instanceof Error && err.message === 'Artwork already in favorites') {
            return res.status(409).json({
                error: 'Already favorited',
                message: 'This artwork is already in your favorites'
            });
        }
        next(err);
    }
};
exports.addToFavorites = addToFavorites;
// Remove artwork from user's favorites
const removeFromFavorites = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const { artwork_id } = req.params;
        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required'
            });
        }
        if (!artwork_id) {
            return res.status(400).json({
                error: 'Missing artwork ID',
                message: 'Artwork ID is required'
            });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User account not found'
            });
        }
        // Check if artwork exists in favorites
        const artworkExists = user.favoriteArtworks.some((artwork) => artwork.artworkId === artwork_id);
        if (!artworkExists) {
            return res.status(404).json({
                error: 'Artwork not found',
                message: 'This artwork is not in your favorites'
            });
        }
        // Remove from favorites
        await user.removeFromFavorites(artwork_id);
        res.status(200).json({
            message: 'Artwork removed from favorites successfully'
        });
    }
    catch (err) {
        next(err);
    }
};
exports.removeFromFavorites = removeFromFavorites;
// Search within user's favorite artworks
const searchFavorites = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const { q, artist, medium, department, source } = req.query;
        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required'
            });
        }
        const user = await User_1.User.findById(userId).select('favoriteArtworks');
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User account not found'
            });
        }
        let filteredFavorites = user.favoriteArtworks;
        // Apply search filters
        if (q) {
            const searchTerm = q.toLowerCase();
            filteredFavorites = filteredFavorites.filter((artwork) => artwork.title?.toLowerCase().includes(searchTerm) ||
                artwork.artist?.toLowerCase().includes(searchTerm) ||
                artwork.description?.toLowerCase().includes(searchTerm) ||
                artwork.tags?.some((tag) => tag.toLowerCase().includes(searchTerm)));
        }
        if (artist) {
            const artistTerm = artist.toLowerCase();
            filteredFavorites = filteredFavorites.filter((artwork) => artwork.artist?.toLowerCase().includes(artistTerm));
        }
        if (medium) {
            const mediumTerm = medium.toLowerCase();
            filteredFavorites = filteredFavorites.filter((artwork) => artwork.medium?.toLowerCase().includes(mediumTerm));
        }
        if (department) {
            const departmentTerm = department.toLowerCase();
            filteredFavorites = filteredFavorites.filter((artwork) => artwork.department?.toLowerCase().includes(departmentTerm));
        }
        if (source) {
            filteredFavorites = filteredFavorites.filter((artwork) => artwork.museumSource === source);
        }
        res.status(200).json({
            favorites: filteredFavorites,
            total: filteredFavorites.length,
            totalFavorites: user.favoriteArtworks.length,
            query: { q, artist, medium, department, source }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.searchFavorites = searchFavorites;
//# sourceMappingURL=favorites.js.map