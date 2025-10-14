// API configuration for the Exhibition Curator frontend

// Get the API base URL from environment variables
// For production, set NEXT_PUBLIC_API_URL=https://your-backend.railway.app
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ? 
  `${process.env.NEXT_PUBLIC_API_URL}/api` : 
  'http://localhost:9090/api';

// API endpoints
export const API_ENDPOINTS = {
  // Health check
  HEALTH: `${API_BASE_URL.replace('/api', '')}/api/health`,
  
  // General artwork endpoints
  SEARCH_ARTWORKS: `${API_BASE_URL}/artworks/search`,
  SEARCH_BY_TITLE_ARTIST: `${API_BASE_URL}/artworks/search/title-artist`,
  RANDOM_ARTWORKS: `${API_BASE_URL}/artworks/random`,
  GET_ARTWORK: `${API_BASE_URL}/artworks`,
  
  // Museum-specific endpoints
  MET_SEARCH: `${API_BASE_URL}/artworks/met/search`,
  MET_TITLE_ARTIST: `${API_BASE_URL}/artworks/met/search/title-artist`,
  VA_SEARCH: `${API_BASE_URL}/artworks/va/search`,
  VA_TITLE_ARTIST: `${API_BASE_URL}/artworks/va/search/title-artist`,
  RIJKS_SEARCH: `${API_BASE_URL}/artworks/rijks/search`,
  RIJKS_TITLE_ARTIST: `${API_BASE_URL}/artworks/rijks/search/title-artist`,

  
  // Authentication endpoints
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/auth/register`,
  AUTH_LOGOUT: `${API_BASE_URL}/auth/logout`,
  AUTH_ME: `${API_BASE_URL}/auth/me`,
  
  // User endpoints
  USERS: `${API_BASE_URL}/users`,
  USER_PROFILE: `${API_BASE_URL}/users/me/profile`,
  USER_FAVORITES: `${API_BASE_URL}/favorites`,
  USER_EXHIBITIONS: `${API_BASE_URL}/users/me/exhibitions`,
  
  // Favorites endpoints
  FAVORITES_ADD: `${API_BASE_URL}/favorites`,
  FAVORITES_REMOVE: (artworkId: string) => `${API_BASE_URL}/favorites/${artworkId}`,
  
  // Exhibition endpoints  
  EXHIBITIONS: `${API_BASE_URL}/exhibitions`,
  EXHIBITION_DELETE: (id: string) => `${API_BASE_URL}/exhibitions/${id}`,
};

// API configuration
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 120000, // 2 minutes - increased for Rijksmuseum hybrid approach
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>) => {
  const url = new URL(endpoint);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }
  
  return url.toString();
};

// Helper function for API requests with proper error handling
export const apiRequest = async (
  url: string, 
  options: RequestInit = {}
): Promise<unknown> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...API_CONFIG.HEADERS,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      throw error;
    }
    
    throw new Error('An unexpected error occurred');
  }
};

export default API_CONFIG;