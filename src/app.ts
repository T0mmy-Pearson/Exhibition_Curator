import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './db/connection';
import { apiRouter } from './routes/api';
import { handleCustomErrors, handleServerErrors } from './errors';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting - different limits for development vs production
const isDevelopment = process.env.NODE_ENV === 'development';

// General rate limiter - more reasonable production limits for testing
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || (isDevelopment ? '60000' : '300000')), // 1min dev, 5min prod
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || (isDevelopment ? '1000' : '500')), // 1000 dev, 500 prod
  message: {
    error: 'Too many requests',
    message: `Too many requests from this IP, please try again later.`,
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || (isDevelopment ? '60000' : '900000')) / 1000)
  }
});

// More permissive rate limiter for artwork/exhibition searches
const searchLimiter = rateLimit({
  windowMs: isDevelopment ? 30000 : 120000, // 30s dev, 2min prod
  max: isDevelopment ? 500 : 200, // 500 dev, 200 prod
  message: {
    error: 'Too many search requests',
    message: `Search rate limit exceeded. Please wait before searching again.`,
    retryAfter: isDevelopment ? 30 : 300
  }
});

app.use(generalLimiter);

// Body parsing middleware
app.use(express.json());

// Routes
app.use('/api', apiRouter);

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
app.use(handleCustomErrors);
app.use(handleServerErrors);

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({ msg: 'Route not found' });
});

export { app };