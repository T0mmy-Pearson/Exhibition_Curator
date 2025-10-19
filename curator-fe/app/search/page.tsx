'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useTutorial } from '../contexts/TutorialContext';
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
  const { isActive, currentFlow, markStepComplete } = useTutorial();
  
  // Get initial search mode from URL parameter, default to 'exhibitions'
  const initialMode = (searchParams.get('mode') as SearchMode) || 'exhibitions';
  const isTutorialMode = searchParams.get('tutorial') === 'first-curation';
  
  // If in tutorial mode, force artwork search mode
  const [searchMode, setSearchMode] = useState<SearchMode>(isTutorialMode ? 'artworks' : initialMode);
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

      // Always use the search endpoint - no public/private distinction
      const endpoint = '/exhibitions/search';

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:9090/api');
      
      // For search endpoint, we need a query parameter
      // Use a broad search term that should match most exhibitions
      const searchQuery = filters.query || 'art'; // Use "art" as default broad search term
      params.set('q', searchQuery);
      const fullUrl = `${API_BASE_URL}${endpoint}?${params}`;
      
      console.log('🌐 API_BASE_URL:', API_BASE_URL);
      console.log('📍 Endpoint:', endpoint);
      console.log('📋 Params:', params.toString());
      console.log('🔗 Full URL:', fullUrl);
      console.log('🔐 Has token:', !!token);
      
      const requestOptions = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
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
      
      // Tutorial progression: mark search step complete if in tutorial mode
      if (isTutorialMode && isActive && currentFlow === 'first-curation') {
        setTimeout(() => {
          markStepComplete('search-artwork');
        }, 1000);
      }
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
  }, [token, checkRateLimit, isTutorialMode, isActive, currentFlow, markStepComplete]);

  // Initial load and mode change handling
  useEffect(() => {
    const loadInitialData = async () => {
      if (searchMode === 'exhibitions') {
        // Clear artwork data when switching to exhibitions
        setArtworks([]);
        setError(null);
        
        // Load exhibitions automatically
        console.log('🏛️ Loading exhibitions...');
        searchExhibitions({
          query: '', // Will default to "art" search term
          theme: 'All Themes', 
          sortBy: 'createdAt',
          sortOrder: 'desc',
          publicOnly: false // This parameter is now ignored but kept for compatibility
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
    // Navigate to exhibition detail view using shareable link or ID
    const identifier = exhibition.shareableLink || exhibition._id;
    router.push(`/exhibitions/${identifier}`);
  };



  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-16 h-16 border border-black/5 rotate-12"></div>
        <div className="absolute top-40 right-1/3 w-12 h-12 bg-black/3 rounded-full"></div>
        <div className="absolute bottom-32 left-16 w-20 h-20 border-2 border-black/5 transform -rotate-45"></div>
        <div className="absolute bottom-20 right-20 w-14 h-14 bg-black/5 transform rotate-45"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Page header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-black mb-4">
            Discover Art & Exhibitions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore curated exhibitions and search through thousands of artworks from world-renowned museums.
          </p>
        </div>

        {/* Search mode toggle */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-gray-50 p-1 border border-black relative">
            {/* Abstract shape accent */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-black transform rotate-45"></div>
            
            <button
              onClick={() => setSearchMode('exhibitions')}
              className={`px-6 py-3 text-sm font-medium transition-all relative ${
                searchMode === 'exhibitions'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className={`w-2 h-2 ${searchMode === 'exhibitions' ? 'bg-white' : 'bg-black'} transform rotate-45`}></div>
                </div>
                Exhibitions
              </span>
            </button>
            <button
              onClick={() => setSearchMode('artworks')}
              className={`px-6 py-3 text-sm font-medium transition-all relative ${
                searchMode === 'artworks'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className={`w-2 h-2 ${searchMode === 'artworks' ? 'bg-white' : 'bg-black'} rounded-full`}></div>
                </div>
                Artworks
              </span>
            </button>
          </div>
        </div>

        {/* Search interface */}
        {searchMode === 'exhibitions' ? (
          <>
            {isRateLimited && (
              <div className="mb-4 p-4 bg-gray-50 border border-black relative">
                <div className="absolute top-2 right-2 w-3 h-3 bg-black/20 transform rotate-45"></div>
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-black mr-3 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white"></div>
                  </div>
                  <p className="text-black">
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
              <div className="mb-4 p-4 bg-gray-50 border border-black relative">
                <div className="absolute top-2 right-2 w-3 h-3 bg-black/20 transform rotate-45"></div>
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-black mr-3 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white"></div>
                  </div>
                  <p className="text-black">
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

        {/* Quick stats section */}
        {!loading && searchMode === 'exhibitions' && exhibitions.length > 0 && (
          <div className="mt-12 bg-black text-white p-8 relative overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute inset-0">
              <div className="absolute top-4 right-8 w-8 h-8 border border-white/10 rotate-45"></div>
              <div className="absolute bottom-4 left-8 w-6 h-6 bg-white/5 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 w-12 h-12 border border-white/5 transform -rotate-12"></div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-white mb-6 text-center">
                Discover More
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center relative">
                  <div className="absolute -top-2 -right-2 w-4 h-1 bg-white/20"></div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {exhibitions.length}
                  </div>
                  <div className="text-sm text-gray-300">
                    Exhibitions Found
                  </div>
                </div>
                <div className="text-center relative">
                  <div className="absolute -top-2 -right-2 w-3 h-3 bg-white/20 rounded-full"></div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {exhibitions.filter(e => e.isPublic).length}
                  </div>
                  <div className="text-sm text-gray-300">
                    Public Exhibitions
                  </div>
                </div>
                <div className="text-center relative">
                  <div className="absolute -top-2 -right-2 w-3 h-3 border border-white/20 transform rotate-45"></div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {new Set(exhibitions.map(e => e.theme)).size}
                  </div>
                  <div className="text-sm text-gray-300">
                    Different Themes
                  </div>
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