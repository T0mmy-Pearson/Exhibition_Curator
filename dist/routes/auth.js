"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const auth_2 = require("../middleware/auth");
exports.authRouter = (0, express_1.Router)();
// Public routes
exports.authRouter.post('/register', auth_1.register);
exports.authRouter.post('/login', auth_1.login);
// Protected routes
exports.authRouter.post('/logout', auth_2.authenticateToken, auth_1.logout);
exports.authRouter.post('/refresh', auth_2.authenticateToken, auth_1.refreshToken);
exports.authRouter.get('/me', auth_2.authenticateToken, auth_1.getCurrentUser);
//# sourceMappingURL=auth.js.map