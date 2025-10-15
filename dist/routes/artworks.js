"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.artworksRouter = void 0;
const express_1 = require("express");
const artworks_1 = require("../controllers/artworks");
exports.artworksRouter = (0, express_1.Router)();
// All artwork routes are public (museum data is public)
// General artwork search and discovery
exports.artworksRouter.get('/search', artworks_1.searchArtworks);
exports.artworksRouter.get('/search/title-artist', artworks_1.searchByTitleOrArtist);
exports.artworksRouter.get('/random', artworks_1.getRandomArtworks);
exports.artworksRouter.get('/departments', artworks_1.getDepartments);
exports.artworksRouter.get('/:artwork_id', artworks_1.getArtworkById);
// Museum-specific routes
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