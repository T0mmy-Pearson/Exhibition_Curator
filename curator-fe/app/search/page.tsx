'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useLoginPrompt } from '../hooks/useLoginPrompt';
import ExhibitionSearch, { Exhibition } from '../components/ExhibitionSearch';
import ExhibitionList from '../components/ExhibitionList';
import ArtworkSearch from '../components/ArtworkSearch';
import ArtworkList from '../components/ArtworkList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import LoginPromptModal from '../components/LoginPromptModal';
import { StandardizedArtwork } from '../types/artwork';

type SearchMode = 'exhibitions' | 'artworks';

interface SearchFilters {
  query: string;
  theme: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  publicOnly: boolean;
}

export default function SearchPage() {
  const { token } = useAuth();
  const loginPrompt = useLoginPrompt();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get initial search mode from URL parameter, default to 'exhibitions'
  const initialMode = (searchParams.get('mode') as SearchMode) || 'exhibitions';
  const [searchMode, setSearchMode] = useState<SearchMode>(initialMode);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [artworks, setArtworks] = useState<StandardizedArtwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [artworkSearchTerm, setArtworkSearchTerm] = useState<string>('');
  const [artworkSource, setArtworkSource] = useState<string>('all');
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);
  const [isRateLimited, setIsRateLimited] = useState<boolean>(false);

  // Enhanced rate limiting function
  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const minInterval = isRateLimited ? 5000 : 2000; // 5s if rate limited, 2s normally

    if (timeSinceLastRequest < minInterval) {
      console.log('🚦 Rate limiting: Request blocked, too soon since last request');
      return false;
    }

    setLastRequestTime(now);
    return true;
  };

  // Search exhibitions
  const searchExhibitions = useCallback(async (filters: SearchFilters) => {
    // Check rate limiting
    if (!checkRateLimit()) {
      console.log('� Search blocked due to rate limiting');
      return;
    }

    console.log('�🔍 Starting exhibition search with filters:', filters);
    setLoading(true);
    setError(null);
    setIsRateLimited(false);

    try {
      const params = new URLSearchParams();
      
      if (filters.query) params.append('q', filters.query);
      if (filters.theme && filters.theme !== 'All Themes') params.append('theme', filters.theme);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      params.append('limit', '50');

      // Use appropriate endpoint based on publicOnly filter
      const endpoint = filters.publicOnly 
        ? '/exhibitions/public'
        : '/exhibitions/search';

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:9090/api');
      
      let fullUrl;
      if (endpoint === '/exhibitions/search') {
        // For search endpoint, we need a query parameter
        const searchQuery = filters.query || 'a'; // Use broad search term to get all exhibitions
        params.set('q', searchQuery);
        fullUrl = `${API_BASE_URL}${endpoint}?${params}`;
      } else {
        fullUrl = `${API_BASE_URL}${endpoint}?${params}`;
      }
      
      console.log('🌐 API_BASE_URL:', API_BASE_URL);
      console.log('📍 Endpoint:', endpoint);
      console.log('📋 Params:', params.toString());
      console.log('🔗 Full URL:', fullUrl);
      console.log('🔐 Has token:', !!token);
      
      const requestOptions = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && !filters.publicOnly && { 'Authorization': `Bearer ${token}` })
        }
      };
      console.log('📦 Request options:', requestOptions);
      
      const response = await fetch(fullUrl, requestOptions);

      console.log('📬 Response status:', response.status);
      console.log('📬 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error text:', errorText);
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          setIsRateLimited(true);
          try {
            const errorData = JSON.parse(errorText);
            const retryAfter = errorData.retryAfter || 10;
            setError(`${errorData.message || 'Rate limit exceeded'}. Please wait ${retryAfter} seconds.`);
            setTimeout(() => {
              setIsRateLimited(false);
              setError(null);
            }, retryAfter * 1000);
          } catch {
            // Fallback if error isn't JSON
            setError('Too many requests from server. Waiting 10 seconds before allowing new searches.');
            setTimeout(() => {
              setIsRateLimited(false);
              setError(null);
            }, 10000);
          }
          return;
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to search exhibitions'}`);
      }

      const data = await response.json();
      console.log('✅ Received exhibition data:', data);
      console.log('📊 Exhibitions count:', data.exhibitions?.length || 0);
      console.log('📋 Exhibition titles:', data.exhibitions?.map((e: any) => e.title) || []);
      
      setExhibitions(data.exhibitions || []);
    } catch (err) {
      console.error('💥 Exhibition search error:', err);
      if (err instanceof Error && err.message.includes('429')) {
        setError('Server is overwhelmed. Waiting 10 seconds before allowing new searches.');
        setIsRateLimited(true);
        setTimeout(() => {
          setIsRateLimited(false);
          setError(null);
        }, 10000);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to search exhibitions');
      }
      setExhibitions([]);
    } finally {
      setLoading(false);
      console.log('🏁 Search completed');
    }
  }, [token, checkRateLimit]);

  // Search artworks (existing functionality)
  const searchArtworks = useCallback(async (searchTerm: string, source: string) => {
    // Check rate limiting
    if (!checkRateLimit()) {
      console.log('🚦 Artwork search blocked due to rate limiting');
      return;
    }

    console.log('🎨 Starting artwork search:', { searchTerm, source });
    setLoading(true);
    setError(null);
    setArtworkSearchTerm(searchTerm);
    setArtworkSource(source);

    try {
      const params = new URLSearchParams({
        q: searchTerm,
        hasImages: 'true',
        ...(source !== 'all' && { departmentId: source })
      });

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:9090/api');
      console.log('🎨 Artwork API URL:', `${API_BASE_URL}/artworks/search?${params}`);
      
      const response = await fetch(`${API_BASE_URL}/artworks/search?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      console.log('🎨 Artwork response status:', response.status);

      if (!response.ok) {
        if (response.status === 429) {
          setIsRateLimited(true);
          try {
            const errorText = await response.text();
            const errorData = JSON.parse(errorText);
            const retryAfter = errorData.retryAfter || 10;
            setError(`${errorData.message || 'Rate limit exceeded'}. Please wait ${retryAfter} seconds.`);
            setTimeout(() => {
              setIsRateLimited(false);
              setError(null);
            }, retryAfter * 1000);
          } catch {
            setError('Too many requests from server. Waiting 10 seconds before allowing new searches.');
            setTimeout(() => {
              setIsRateLimited(false);
              setError(null);
            }, 10000);
          }
          return;
        }
        throw new Error('Failed to search artworks');
      }

      const data = await response.json();
      console.log('🎨 Artwork data received:', data);
      
      // Convert API response to StandardizedArtwork format
      const standardizedArtworks = (data.artworks || []).map((artwork: any) => ({
        id: artwork.id || `${artwork.source}:${artwork.objectID || artwork.objectNumber || artwork.systemNumber}`,
        source: artwork.source || 'met',
        title: artwork.title || 'Untitled',
        artist: artwork.artistDisplayName || artwork.artist || 'Unknown Artist',
        artistBio: artwork.artistBio,
        culture: artwork.culture,
        date: artwork.objectDate || artwork.date,
        medium: artwork.medium,
        dimensions: artwork.dimensions,
        department: artwork.department,
        description: artwork.description,
        imageUrl: artwork.primaryImage || artwork.imageUrl,
        smallImageUrl: artwork.primaryImageSmall || artwork.smallImageUrl,
        additionalImages: artwork.additionalImages || [],
        museumUrl: artwork.objectURL || artwork.museumUrl,
        isHighlight: artwork.isHighlight || false,
        isPublicDomain: artwork.isPublicDomain || false,
        tags: artwork.tags || [],
        objectID: artwork.objectID,
        accessionNumber: artwork.accessionNumber,
        creditLine: artwork.creditLine,
        galleryNumber: artwork.galleryNumber,
        objectNumber: artwork.objectNumber,
        webImage: artwork.webImage,
        systemNumber: artwork.systemNumber,
        accessionYear: artwork.accessionYear
      }));
      
      setArtworks(standardizedArtworks);
    } catch (err) {
      console.error('💥 Artwork search error:', err);
      if (err instanceof Error && err.message.includes('429')) {
        setError('Server is overwhelmed. Waiting 10 seconds before allowing new searches.');
        setIsRateLimited(true);
        setTimeout(() => {
          setIsRateLimited(false);
          setError(null);
        }, 10000);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to search artworks');
      }
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  }, [token, checkRateLimit]);

  // Initial load and mode change handling
  useEffect(() => {
    const loadInitialData = async () => {
      if (searchMode === 'exhibitions') {
        // Clear artwork data when switching to exhibitions
        setArtworks([]);
        setError(null);
        
        // Load most recent exhibitions automatically
        console.log('🏛️ Loading most recent exhibitions...');
        searchExhibitions({
          query: '', // Empty query to get all exhibitions
          theme: 'All Themes',
          sortBy: 'createdAt',
          sortOrder: 'desc',
          publicOnly: false
        });
      } else {
        // Clear exhibition data when switching to artworks
        setExhibitions([]);
        setError(null);
      }
    };

    // Add a delay before loading initial data to prevent immediate rate limiting
    const delayTimeout = setTimeout(() => {
      loadInitialData();
    }, 500);

    return () => clearTimeout(delayTimeout);
  }, [searchMode, isRateLimited]);

  const handleExhibitionClick = (exhibition: Exhibition) => {
    // Navigate to exhibition detail view
    if (exhibition.shareableLink) {
      window.open(`/exhibitions/shared/${exhibition.shareableLink}`, '_blank');
    } else {
      router.push(`/exhibitions/${exhibition._id}`);
    }
  };



  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-4">
            Discover Art & Exhibitions
          </h1>
          <p className="text-lg text-black">
            Explore curated exhibitions and search through thousands of artworks from world-renowned museums.
          </p>
        </div>

        {/* Search mode toggle */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-black">
            <button
              onClick={() => setSearchMode('exhibitions')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                searchMode === 'exhibitions'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-black hover:text-gray-600'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Exhibitions
              </span>
            </button>
            <button
              onClick={() => setSearchMode('artworks')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                searchMode === 'artworks'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-black hover:text-gray-600'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Artworks
              </span>
            </button>
          </div>
        </div>

        {/* Search interface */}
        {searchMode === 'exhibitions' ? (
          <>
            {isRateLimited && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-yellow-800">
                    Please wait a moment before making another search. The server is handling many requests.
                  </p>
                </div>
              </div>
            )}
            <ExhibitionSearch 
              onSearch={searchExhibitions}
              loading={loading}
            />

            <ExhibitionList
              exhibitions={exhibitions}
              loading={loading}
              error={error}
              onExhibitionClick={handleExhibitionClick}
              showPagination={true}
            />
          </>
        ) : (
          <>
            {isRateLimited && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-yellow-800">
                    Please wait a moment before making another search. The server is handling many requests.
                  </p>
                </div>
              </div>
            )}
            <ArtworkSearch 
              onSearch={searchArtworks}
              initialSearchTerm=""
              initialSource="all"
            />
            <ArtworkList
              artworks={artworks}
              loading={loading}
              error={error}
              searchTerm={artworkSearchTerm}
              source={artworkSource as 'all' | 'met' | 'rijks' | 'va'}
            />
          </>
        )}

        {/* Quick stats or featured content */}
        {!loading && searchMode === 'exhibitions' && exhibitions.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm border border-black p-6">
            <h3 className="text-lg font-semibold text-black mb-4">
              Discover More
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-black mb-2">
                  {exhibitions.length}
                </div>
                <div className="text-sm text-black">
                  Exhibitions Found
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black mb-2">
                  {exhibitions.filter(e => e.isPublic).length}
                </div>
                <div className="text-sm text-black">
                  Public Exhibitions
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black mb-2">
                  {new Set(exhibitions.map(e => e.theme)).size}
                </div>
                <div className="text-sm text-black">
                  Different Themes
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Prompt Modal */}
        <LoginPromptModal
          isOpen={loginPrompt.isOpen}
          onClose={loginPrompt.hideLoginPrompt}
          onLoginSuccess={loginPrompt.handleLoginSuccess}
          trigger={loginPrompt.trigger}
          artworkTitle={loginPrompt.artworkTitle}
        />
      </div>
    </div>
  );
}