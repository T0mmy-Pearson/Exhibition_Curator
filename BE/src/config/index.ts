// Environment configuration utility
export interface AppConfig {
  nodeEnv: string;
  port: number;
  mongoUri: string;
  jwtSecret: string;
  corsOrigin: string | string[];
  rateLimiting: {
    windowMs: number;
    maxRequests: number;
  };
  museum: {
    metApiUrl: string;
    rijksApiKey: string;
    rijksApiUrl: string;
    vaApiUrl: string;
  };
}

export const getConfig = (): AppConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  // Validate required environment variables
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return {
    nodeEnv,
    port: parseInt(process.env.PORT || '9090', 10),
    mongoUri: process.env.MONGODB_URI!,
    jwtSecret: process.env.JWT_SECRET!,
    corsOrigin: nodeEnv === 'production' 
      ? (process.env.CORS_ORIGIN || 'https://your-frontend-domain.com').split(',')
      : ['http://localhost:3000', 'http://localhost:3001'],
    rateLimiting: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
    museum: {
      metApiUrl: process.env.MET_MUSEUM_API_URL || 'https://collectionapi.metmuseum.org/public/collection/v1',
      rijksApiKey: process.env.RIJKS_MUSEUM_API_KEY || '',
      rijksApiUrl: process.env.RIJKS_MUSEUM_API_URL || 'https://data.rijksmuseum.nl',
      vaApiUrl: process.env.VA_MUSEUM_API_URL || 'https://api.vam.ac.uk/v2',
    },
  };
};

export const config = getConfig();