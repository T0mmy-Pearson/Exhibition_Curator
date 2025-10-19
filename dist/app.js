"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const connection_1 = require("./db/connection");
const api_1 = require("./routes/api");
const errors_1 = require("./errors");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
// Connect to MongoDB
(0, connection_1.connectDB)();
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
// Rate limiting - different limits for development vs production
const isDevelopment = process.env.NODE_ENV === 'development';
// General rate limiter - very permissive for testing
const generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || (isDevelopment ? '60000' : '60000')), // 1min both
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || (isDevelopment ? '1000' : '1000')), // 1000 both
    message: {
        error: 'Too many requests',
        message: `Too many requests from this IP, please try again later.`,
        retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || (isDevelopment ? '60000' : '900000')) / 1000)
    }
});
// More permissive rate limiter for artwork/exhibition searches
const searchLimiter = (0, express_rate_limit_1.default)({
    windowMs: isDevelopment ? 30000 : 30000, // 30s both
    max: isDevelopment ? 500 : 500, // 500 both
    message: {
        error: 'Too many search requests',
        message: `Search rate limit exceeded. Please wait before searching again.`,
        retryAfter: isDevelopment ? 30 : 300
    }
});
// Temporarily disable rate limiting for testing
// app.use(generalLimiter);
// Body parsing middleware
app.use(express_1.default.json());
// Routes
app.use('/api', api_1.apiRouter);
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Exhibition Curator API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        rateLimits: {
            general: {
                windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || (isDevelopment ? '60000' : '900000')),
                maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || (isDevelopment ? '1000' : '100'))
            },
            search: {
                windowMs: isDevelopment ? 30000 : 300000,
                maxRequests: isDevelopment ? 500 : 50
            }
        },
        endpoints: {
            users: '/api/users',
            artworks: '/api/artworks',
            exhibitions: '/api/exhibitions'
        }
    });
});
// Error handling middleware
app.use(errors_1.handleCustomErrors);
app.use(errors_1.handleServerErrors);
// 404 handler
app.all('*', (req, res) => {
    res.status(404).json({ msg: 'Route not found' });
});
//# sourceMappingURL=app.js.map