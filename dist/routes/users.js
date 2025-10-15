"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const users_1 = require("../controllers/users");
const auth_1 = require("../middleware/auth");
exports.usersRouter = (0, express_1.Router)();
// All user routes require authentication (auth routes are separate)
exports.usersRouter.use(auth_1.authenticateToken);
// User management
exports.usersRouter.get('/', users_1.getUsers);
exports.usersRouter.get('/:user_id', users_1.getUserById);
exports.usersRouter.patch('/:user_id', users_1.updateUser);
exports.usersRouter.delete('/:user_id', users_1.deleteUser);
// Current user's exhibitions and favorites (no user_id needed)
exports.usersRouter.get('/me/exhibitions', users_1.getUserExhibitions);
exports.usersRouter.get('/me/favorites', users_1.getUserFavorites);
// Other user's exhibitions and favorites (user_id required)
exports.usersRouter.get('/:user_id/exhibitions', users_1.getUserExhibitions);
exports.usersRouter.get('/:user_id/favorites', users_1.getUserFavorites);
//# sourceMappingURL=users.js.map