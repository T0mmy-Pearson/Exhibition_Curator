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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.refreshToken = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel = __importStar(require("../models/users"));
// User registration
const register = async (req, res, next) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;
        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Username, email, and password are required'
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                error: 'Invalid password',
                message: 'Password must be at least 6 characters long'
            });
        }
        // Check if user already exists
        const existingUserByEmail = await userModel.fetchUserByEmail(email);
        if (existingUserByEmail) {
            return res.status(409).json({
                error: 'User already exists',
                message: 'A user with this email already exists'
            });
        }
        const existingUserByUsername = await userModel.fetchUserByUsername(username);
        if (existingUserByUsername) {
            return res.status(409).json({
                error: 'User already exists',
                message: 'A user with this username already exists'
            });
        }
        // Create user
        const newUser = await userModel.insertUser({
            username,
            email,
            password,
            firstName,
            lastName
        });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            userId: newUser._id,
            username: newUser.username,
            email: newUser.email
        }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
        // Return user data (without password) and token
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                fullName: newUser.fullName,
                bio: newUser.bio,
                profileImageUrl: newUser.profileImageUrl,
                createdAt: newUser.createdAt
            },
            token
        });
    }
    catch (err) {
        next(err);
    }
};
exports.register = register;
// User login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !password) {
            return res.status(400).json({
                error: 'Missing credentials',
                message: 'Email and password are required'
            });
        }
        // Find user by email (including password for validation)
        const user = await userModel.fetchUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Invalid email or password'
            });
        }
        // Validate password
        const isPasswordValid = await userModel.validatePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Invalid email or password'
            });
        }
        // Update last login time
        await userModel.updateUserById(user._id.toString(), {
            lastLoginAt: new Date()
        });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            username: user.username,
            email: user.email
        }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
        // Return user data (without password) and token
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                bio: user.bio,
                profileImageUrl: user.profileImageUrl,
                lastLoginAt: new Date(),
                createdAt: user.createdAt
            },
            token
        });
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
// User logout (client-side token removal, server-side validation)
const logout = async (req, res) => {
    try {
        // In a JWT system, logout is primarily handled client-side by removing the token
        // We can optionally implement a blacklist for tokens, but for now, we'll just confirm logout
        res.status(200).json({
            message: 'Logout successful',
            instruction: 'Please remove the JWT token from your client'
        });
    }
    catch (err) {
        res.status(500).json({
            error: 'Logout failed',
            message: 'An error occurred during logout'
        });
    }
};
exports.logout = logout;
// Refresh JWT token
const refreshToken = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid token'
            });
        }
        // Fetch current user data
        const user = await userModel.fetchUserById(userId);
        // Generate new JWT token
        const newToken = jsonwebtoken_1.default.sign({
            userId: user._id,
            username: user.username,
            email: user.email
        }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
        res.status(200).json({
            message: 'Token refreshed successfully',
            token: newToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                bio: user.bio,
                profileImageUrl: user.profileImageUrl,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt
            }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.refreshToken = refreshToken;
// Get current authenticated user profile
const getCurrentUser = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid token'
            });
        }
        // Fetch user data
        const user = await userModel.fetchUserById(userId);
        res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                bio: user.bio,
                profileImageUrl: user.profileImageUrl,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt,
                exhibitionsCount: user.exhibitions?.length || 0,
                favoritesCount: user.favoriteArtworks?.length || 0,
                preferences: user.preferences
            }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getCurrentUser = getCurrentUser;
//# sourceMappingURL=auth.js.map