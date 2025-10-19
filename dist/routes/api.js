"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const users_1 = require("./users");
const artworks_1 = require("./artworks");
const exhibitions_1 = require("./exhibitions");
const auth_1 = require("./auth");
const favorites_1 = require("./favorites");
exports.apiRouter = (0, express_1.Router)();
// Authentication routes
exports.apiRouter.use('/auth', auth_1.authRouter);
// User management routes
exports.apiRouter.use('/users', users_1.usersRouter);
// Artwork search and discovery routes
exports.apiRouter.use('/artworks', artworks_1.artworksRouter);
// Exhibition management routes
exports.apiRouter.use('/exhibitions', exhibitions_1.exhibitionsRouter);
// Favorites management routes
exports.apiRouter.use('/favorites', favorites_1.favoritesRouter);
exports.apiRouter.get('/', (req, res) => {
    res.json({
        message: 'The Curator API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            artworks: '/api/artworks',
            exhibitions: '/api/exhibitions',
            favorites: '/api/favorites'
        }
    });
});
//# sourceMappingURL=api.js.map