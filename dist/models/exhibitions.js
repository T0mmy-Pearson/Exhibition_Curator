"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchExhibitions = exports.removeArtworkFromExhibition = exports.addArtworkToExhibition = exports.removeExhibitionById = exports.updateExhibitionById = exports.insertExhibition = exports.fetchExhibitionByShareableLink = exports.fetchExhibitionById = exports.fetchUserExhibitions = exports.fetchAllExhibitions = void 0;
// Fetch all exhibitions (optionally only public) && 
const fetchAllExhibitions = async (limit = 20, offset = 0) => {
    try {
        const users = await User_1.User.find({}, 'exhibitions username firstName lastName');
        let allExhibitions = users.flatMap(user => user.exhibitions
            .map(exhibition => ({
            ...exhibition.toObject(),
            curator: {
                username: user.username,
                fullName: user.fullName
            }
        })));
        // Sort by createdAt descending (most recent first)
        allExhibitions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        // Apply offset and limit
        allExhibitions = allExhibitions.slice(offset, offset + limit);
        return allExhibitions;
    }
    catch (error) {
        console.error('Error fetching all exhibitions:', error);
        throw new Error('Failed to fetch all exhibitions');
    }
};
exports.fetchAllExhibitions = fetchAllExhibitions;
const User_1 = require("./User");
// Fetch all exhibitions for a user
const fetchUserExhibitions = async (userId) => {
    try {
        const user = await User_1.User.findById(userId).select('exhibitions');
        if (!user) {
            throw new Error('User not found');
        }
        return user.exhibitions;
    }
    catch (error) {
        console.error('Error fetching user exhibitions:', error);
        throw new Error('Failed to fetch exhibitions');
    }
};
exports.fetchUserExhibitions = fetchUserExhibitions;
// Fetch single exhibition by ID
const fetchExhibitionById = async (userId, exhibitionId) => {
    try {
        const user = await User_1.User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const exhibition = user.exhibitions.find(ex => ex._id?.toString() === exhibitionId);
        if (!exhibition) {
            throw new Error('Exhibition not found');
        }
        return exhibition;
    }
    catch (error) {
        console.error('Error fetching exhibition by ID:', error);
        throw new Error('Exhibition not found');
    }
};
exports.fetchExhibitionById = fetchExhibitionById;
// Fetch public exhibition by shareable link
const fetchExhibitionByShareableLink = async (shareableLink) => {
    // This function is deprecated since isPublic is removed
    return null;
};
exports.fetchExhibitionByShareableLink = fetchExhibitionByShareableLink;
// Create new exhibition
const insertExhibition = async (userId, exhibitionData) => {
    try {
        const user = await User_1.User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        // Validate required fields
        if (!exhibitionData.title || exhibitionData.title.trim().length === 0) {
            throw new Error('Exhibition title is required');
        }
        const newExhibitionData = {
            title: exhibitionData.title,
            description: exhibitionData.description || '',
            theme: exhibitionData.theme || '',
            tags: exhibitionData.tags || [],
            coverImageUrl: exhibitionData.coverImageUrl || '',
            artworks: [], // Start with empty artworks array
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await user.addExhibition(newExhibitionData);
        // Return the newly created exhibition
        const updatedUser = await User_1.User.findById(userId);
        const newExhibition = updatedUser?.exhibitions[updatedUser.exhibitions.length - 1];
        return newExhibition;
    }
    catch (error) {
        console.error('Error creating exhibition:', error);
        throw new Error('Failed to create exhibition');
    }
};
exports.insertExhibition = insertExhibition;
// Update exhibition
const updateExhibitionById = async (userId, exhibitionId, updates) => {
    try {
        const user = await User_1.User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const exhibition = user.exhibitions.find(ex => ex._id?.toString() === exhibitionId);
        if (!exhibition) {
            throw new Error('Exhibition not found');
        }
        // Update exhibition fields
        Object.assign(exhibition, updates);
        exhibition.updatedAt = new Date();
        user.updatedAt = new Date();
        await user.save();
        return exhibition;
    }
    catch (error) {
        console.error('Error updating exhibition:', error);
        throw new Error('Failed to update exhibition');
    }
};
exports.updateExhibitionById = updateExhibitionById;
// Delete exhibition
const removeExhibitionById = async (userId, exhibitionId) => {
    try {
        const user = await User_1.User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const exhibitionIndex = user.exhibitions.findIndex(ex => ex._id?.toString() === exhibitionId);
        if (exhibitionIndex === -1) {
            throw new Error('Exhibition not found');
        }
        user.exhibitions.splice(exhibitionIndex, 1);
        user.updatedAt = new Date();
        await user.save();
    }
    catch (error) {
        console.error('Error deleting exhibition:', error);
        throw new Error('Failed to delete exhibition');
    }
};
exports.removeExhibitionById = removeExhibitionById;
// Add artwork to exhibition
const addArtworkToExhibition = async (userId, exhibitionId, artworkData) => {
    try {
        const user = await User_1.User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        await user.addArtworkToExhibition(exhibitionId, artworkData);
        // Return updated exhibition
        const updatedUser = await User_1.User.findById(userId);
        const exhibition = updatedUser?.exhibitions.find(ex => ex._id?.toString() === exhibitionId);
        return exhibition;
    }
    catch (error) {
        console.error('Error adding artwork to exhibition:', error);
        throw error;
    }
};
exports.addArtworkToExhibition = addArtworkToExhibition;
// Remove artwork from exhibition
const removeArtworkFromExhibition = async (userId, exhibitionId, artworkId) => {
    try {
        const user = await User_1.User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        await user.removeArtworkFromExhibition(exhibitionId, artworkId);
        // Return updated exhibition
        const updatedUser = await User_1.User.findById(userId);
        const exhibition = updatedUser?.exhibitions.find(ex => ex._id?.toString() === exhibitionId);
        return exhibition;
    }
    catch (error) {
        console.error('Error removing artwork from exhibition:', error);
        throw error;
    }
};
exports.removeArtworkFromExhibition = removeArtworkFromExhibition;
// Search exhibitions by title or theme
const searchExhibitions = async (query, limit = 20, offset = 0) => {
    try {
        const searchRegex = new RegExp(query, 'i');
        const matchConditions = {
            $or: [
                { 'exhibitions.title': searchRegex },
                { 'exhibitions.description': searchRegex },
                { 'exhibitions.theme': searchRegex },
                { 'exhibitions.tags': { $in: [searchRegex] } }
            ]
        };
        const users = await User_1.User.find(matchConditions)
            .select('exhibitions username firstName lastName')
            .skip(offset)
            .limit(limit);
        const matchingExhibitions = users.flatMap(user => user.exhibitions
            .filter(exhibition => {
            const matchesQuery = exhibition.title.match(searchRegex) ||
                exhibition.description?.match(searchRegex) ||
                exhibition.theme?.match(searchRegex) ||
                exhibition.tags?.some((tag) => tag.match(searchRegex));
            return matchesQuery;
        })
            .map(exhibition => ({
            ...exhibition.toObject(),
            curator: {
                username: user.username,
                fullName: user.fullName
            }
        })));
        return matchingExhibitions;
    }
    catch (error) {
        console.error('Error searching exhibitions:', error);
        throw new Error('Failed to search exhibitions');
    }
};
exports.searchExhibitions = searchExhibitions;
// Helper function to generate shareable links
function generateShareableLink(title, userId) {
    const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
    const timestamp = Date.now().toString(36);
    const userIdShort = userId.substring(userId.length - 6);
    return `${slug}-${userIdShort}-${timestamp}`;
}
//# sourceMappingURL=exhibitions.js.map