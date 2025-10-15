"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFavorites = exports.getUserExhibitions = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const userModel = __importStar(require("../models/users"));
const getUsers = async (req, res, next) => {
    try {
        const users = await userModel.fetchUsers();
        res.status(200).json({ users });
    }
    catch (err) {
        next(err);
    }
};
exports.getUsers = getUsers;
const getUserById = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const user = await userModel.fetchUserById(user_id);
        res.status(200).json({ user });
    }
    catch (err) {
        next(err);
    }
};
exports.getUserById = getUserById;
const createUser = async (req, res, next) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;
        const user = await userModel.insertUser({ username, email, password, firstName, lastName });
        res.status(201).json({ user });
    }
    catch (err) {
        next(err);
    }
};
exports.createUser = createUser;
const updateUser = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const updates = req.body;
        const user = await userModel.updateUserById(user_id, updates);
        res.status(200).json({ user });
    }
    catch (err) {
        next(err);
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        await userModel.removeUserById(user_id);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.deleteUser = deleteUser;
const getUserExhibitions = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const requestingUserId = req.user?.userId;
        // If no user_id provided, get exhibitions for the authenticated user
        const targetUserId = user_id || requestingUserId;
        if (!targetUserId) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'User ID is required'
            });
        }
        // Fetch user with exhibitions
        const user = await userModel.fetchUserById(targetUserId);
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'The requested user does not exist'
            });
        }
        // If requesting someone else's exhibitions, only return public ones
        let exhibitions = user.exhibitions || [];
        if (user_id && user_id !== requestingUserId) {
            exhibitions = exhibitions.filter((exhibition) => exhibition.isPublic);
        }
        // Format exhibitions response
        const formattedExhibitions = exhibitions.map((exhibition) => ({
            id: exhibition._id,
            title: exhibition.title,
            description: exhibition.description,
            theme: exhibition.theme,
            isPublic: exhibition.isPublic,
            shareableLink: exhibition.shareableLink,
            artworksCount: exhibition.artworks?.length || 0,
            coverImageUrl: exhibition.coverImageUrl,
            tags: exhibition.tags || [],
            createdAt: exhibition.createdAt,
            updatedAt: exhibition.updatedAt,
            // Include artwork details if it's the user's own exhibitions
            ...((!user_id || user_id === requestingUserId) && {
                artworks: exhibition.artworks || []
            })
        }));
        res.status(200).json({
            message: 'Exhibitions retrieved successfully',
            user: {
                id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName
            },
            exhibitions: formattedExhibitions,
            total: formattedExhibitions.length
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getUserExhibitions = getUserExhibitions;
const getUserFavorites = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const requestingUserId = req.user?.userId;
        // If no user_id provided, get favorites for the authenticated user
        const targetUserId = user_id || requestingUserId;
        if (!targetUserId) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'User ID is required'
            });
        }
        // Fetch user with favorites
        const user = await userModel.fetchUserById(targetUserId);
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'The requested user does not exist'
            });
        }
        // Get query parameters for filtering and pagination
        const { page = '1', limit = '20', museum, search, sortBy = 'addedAt', sortOrder = 'desc' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        let favorites = user.favoriteArtworks || [];
        // Filter by museum source if specified
        if (museum && typeof museum === 'string') {
            favorites = favorites.filter((artwork) => artwork.museumSource === museum);
        }
        // Search in title or artist if specified
        if (search && typeof search === 'string') {
            const searchLower = search.toLowerCase();
            favorites = favorites.filter((artwork) => artwork.title?.toLowerCase().includes(searchLower) ||
                artwork.artist?.toLowerCase().includes(searchLower) ||
                artwork.tags?.some((tag) => tag.toLowerCase().includes(searchLower)));
        }
        // Sort favorites
        favorites.sort((a, b) => {
            let aValue, bValue;
            switch (sortBy) {
                case 'title':
                    aValue = a.title || '';
                    bValue = b.title || '';
                    break;
                case 'artist':
                    aValue = a.artist || '';
                    bValue = b.artist || '';
                    break;
                case 'addedAt':
                default:
                    aValue = new Date(a.addedAt || a.createdAt);
                    bValue = new Date(b.addedAt || b.createdAt);
                    break;
            }
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            }
            else {
                return aValue < bValue ? 1 : -1;
            }
        });
        // Apply pagination
        const total = favorites.length;
        const paginatedFavorites = favorites.slice(skip, skip + limitNum);
        // Format favorites response
        const formattedFavorites = paginatedFavorites.map((artwork) => ({
            artworkId: artwork.artworkId,
            title: artwork.title,
            artist: artwork.artist,
            date: artwork.date,
            medium: artwork.medium,
            department: artwork.department,
            culture: artwork.culture,
            period: artwork.period,
            dimensions: artwork.dimensions,
            imageUrl: artwork.imageUrl,
            primaryImageSmall: artwork.primaryImageSmall,
            additionalImages: artwork.additionalImages || [],
            objectURL: artwork.objectURL,
            tags: artwork.tags || [],
            description: artwork.description,
            museumSource: artwork.museumSource,
            isHighlight: artwork.isHighlight,
            addedAt: artwork.addedAt
        }));
        res.status(200).json({
            message: 'Favorites retrieved successfully',
            user: {
                id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName
            },
            favorites: formattedFavorites,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
                hasNext: skip + limitNum < total,
                hasPrev: pageNum > 1
            },
            filters: {
                museum: museum || null,
                search: search || null,
                sortBy,
                sortOrder
            }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getUserFavorites = getUserFavorites;
//# sourceMappingURL=users.js.map