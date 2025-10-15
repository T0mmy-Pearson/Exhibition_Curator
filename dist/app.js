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
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
// Body parsing middleware
app.use(express_1.default.json());
// Routes
app.use('/api', api_1.apiRouter);
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Exhibition Curator API',
        version: '1.0.0',
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