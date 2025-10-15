"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exhibitionsRouter = void 0;
const express_1 = require("express");
const exhibitions_1 = require("../controllers/exhibitions");
const auth_1 = require("../middleware/auth");
exports.exhibitionsRouter = (0, express_1.Router)();
// Public routes (no authentication required)
exports.exhibitionsRouter.get('/public', exhibitions_1.getPublicExhibitions);
exports.exhibitionsRouter.get('/public/:exhibition_id', exhibitions_1.getExhibitionById);
exports.exhibitionsRouter.get('/shared/:shareable_link', exhibitions_1.getSharedExhibition);
exports.exhibitionsRouter.get('/search', exhibitions_1.searchExhibitions);
exports.exhibitionsRouter.get('/featured', exhibitions_1.getFeaturedExhibitions);
exports.exhibitionsRouter.get('/trending', exhibitions_1.getTrendingExhibitions);
// Protected routes (authentication required)
exports.exhibitionsRouter.use(auth_1.authenticateToken);
// Personal exhibition management
exports.exhibitionsRouter.get('/', exhibitions_1.getExhibitions);
exports.exhibitionsRouter.post('/', exhibitions_1.createExhibition);
exports.exhibitionsRouter.get('/:exhibition_id', exhibitions_1.getExhibitionById);
exports.exhibitionsRouter.patch('/:exhibition_id', exhibitions_1.updateExhibition);
exports.exhibitionsRouter.delete('/:exhibition_id', exhibitions_1.deleteExhibition);
// Artwork management within exhibitions
exports.exhibitionsRouter.post('/:exhibition_id/artworks', exhibitions_1.addArtworkToExhibition);
exports.exhibitionsRouter.patch('/:exhibition_id/artworks/:artwork_id', exhibitions_1.updateArtworkInExhibition);
exports.exhibitionsRouter.delete('/:exhibition_id/artworks/:artwork_id', exhibitions_1.removeArtworkFromExhibition);
// Sharing functionality
exports.exhibitionsRouter.post('/:exhibition_id/share', exhibitions_1.shareExhibition);
exports.exhibitionsRouter.delete('/:exhibition_id/share', exhibitions_1.unshareExhibition);
//# sourceMappingURL=exhibitions.js.map