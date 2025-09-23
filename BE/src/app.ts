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

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());

// Routes
app.use('/api', apiRouter);

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
app.use(handleCustomErrors);
app.use(handleServerErrors);

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({ msg: 'Route not found' });
});

export { app };