"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoritesRouter = void 0;
const express_1 = require("express");
const favorites_1 = require("../controllers/favorites");
const auth_1 = require("../middleware/auth");
exports.favoritesRouter = (0, express_1.Router)();
// All favorites routes require authentication
exports.favoritesRouter.use(auth_1.authenticateToken);
exports.favoritesRouter.get('/', favorites_1.getUserFavorites);
exports.favoritesRouter.post('/', favorites_1.addToFavorites);
exports.favoritesRouter.delete('/:artwork_id', favorites_1.removeFromFavorites);
exports.favoritesRouter.get('/search', favorites_1.searchFavorites);
//# sourceMappingURL=favorites.js.map