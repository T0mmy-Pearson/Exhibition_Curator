"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.artworksRouter = void 0;
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const artworks_1 = require("../controllers/artworks");
exports.artworksRouter = (0, express_1.Router)();
// Search-specific rate limiter (more permissive than general rate limiter)
const isDevelopment = process.env.NODE_ENV === 'development';
const searchLimiter = (0, express_rate_limit_1.default)({
    windowMs: isDevelopment ? 30000 : 300000, // 30s dev, 5min prod
    max: isDevelopment ? 500 : 50, // 500 dev, 50 prod
    message: {
        error: 'Too many search requests',
        message: `Search rate limit exceeded. Please wait before searching again.`,
        retryAfter: isDevelopment ? 30 : 300
    }
});
// All artwork routes are public (museum data is public)
// General artwork search and discovery (temporarily disable rate limiting)
exports.artworksRouter.get('/search', artworks_1.searchArtworks);
exports.artworksRouter.get('/search/title-artist', artworks_1.searchByTitleOrArtist);
exports.artworksRouter.get('/random', artworks_1.getRandomArtworks);
exports.artworksRouter.get('/departments', artworks_1.getDepartments);
exports.artworksRouter.get('/:artwork_id', artworks_1.getArtworkById);
// Museum-specific routes (temporarily disable rate limiting)
exports.artworksRouter.get('/met/search', artworks_1.searchMetMuseum);
exports.artworksRouter.get('/met/search/title-artist', artworks_1.searchMetByTitleOrArtist);
exports.artworksRouter.get('/met/:object_id', artworks_1.getMetArtwork);
exports.artworksRouter.get('/rijks/search', artworks_1.searchRijksmuseum);
exports.artworksRouter.get('/rijks/search/title-artist', artworks_1.searchRijksByTitleOrArtist);
exports.artworksRouter.get('/rijks/:object_id', artworks_1.getRijksArtwork);
exports.artworksRouter.get('/va/search', artworks_1.searchVAMuseum);
exports.artworksRouter.get('/va/search/title-artist', artworks_1.searchVAByTitleOrArtist);
exports.artworksRouter.get('/va/:system_number', artworks_1.getVAArtwork);
//# sourceMappingURL=artworks.js.map