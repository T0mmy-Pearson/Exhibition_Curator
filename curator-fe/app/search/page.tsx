'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useTutorial } from '../contexts/TutorialContext';
import { useLoginPrompt } from '../hooks/useLoginPrompt';
import ExhibitionSearch, { Exhibition } from '../components/ExhibitionSearch';
import ExhibitionList from '../components/ExhibitionList';
import ArtworkSearch from '../components/ArtworkSearch';
import ArtworkList from '../components/ArtworkList';
import LoginPromptModal from '../components/LoginPromptModal';
import { StandardizedArtwork } from '../types/artwork';

type SearchMode = 'exhibitions' | 'artworks';

interface SearchFilters {
  query: string;
  theme: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  publicOnly: boolean;
};

function SearchPageInner() {
  const { token } = useAuth();
  const loginPrompt = useLoginPrompt();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isActive, currentFlow, markStepComplete } = useTutorial();
  // ...existing code...
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

  // Fetch 20 most recent exhibitions on initial load
  useEffect(() => {
    if (searchMode === 'exhibitions') {
      searchExhibitions({
        query: '',
        theme: 'All Themes',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        publicOnly: false
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchMode]);

  // Enhanced rate limiting function
  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const minInterval = isRateLimited ? 5000 : 2000; // 5s if rate limited, 2s normally

    if (timeSinceLastRequest < minInterval) {
      console.log('🚦 Rate limiting: Request blocked, too soon since last request');
      return false;
    }

    setLastRequestTime(now);
    return true;
  }, [lastRequestTime, isRateLimited]);

  // Search exhibitions
  const searchExhibitions = useCallback(async (filters: SearchFilters) => {
    // Check rate limiting
    if (!checkRateLimit()) {
      console.log('🚦 Search blocked due to rate limiting');
      return;
    }

    console.log(' Starting exhibition search with filters:', filters);
    setLoading(true);
    setError(null);
    setIsRateLimited(false);

    try {
      const params = new URLSearchParams();
      if (filters.query) {
        params.append('q', filters.query);
      }
      if (filters.theme && filters.theme !== 'All Themes') params.append('theme', filters.theme);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      params.append('limit', '50');

  // Use the search endpoint for all exhibition fetching and searching
  const endpoint = '/exhibitions/search';


      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:9090/api');
      const fullUrl = `${API_BASE_URL}${endpoint}?${params}`;
      // Never send Authorization header for public GET /exhibitions
      const requestOptions = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      console.log('🔐 Has token:', !!token);
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
  console.log('📋 Exhibition titles:', data.exhibitions?.map((e: Exhibition) => e.title) || []);
      
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
  const standardizedArtworks = (data.artworks || []).map((artwork: Record<string, unknown>) => ({
        id: artwork.id,
        source: artwork.source,
        title: artwork.title,
        artist: artwork.artist,
        artistBio: artwork.artistBio,
        culture: artwork.culture,
        date: artwork.date,
        medium: artwork.medium,
        dimensions: artwork.dimensions,
        department: artwork.department,
        description: artwork.description,
        imageUrl: artwork.imageUrl,
        smallImageUrl: artwork.smallImageUrl,
        additionalImages: artwork.additionalImages,
        museumUrl: artwork.museumUrl,
        isHighlight: artwork.isHighlight,
        isPublicDomain: artwork.isPublicDomain,
        tags: artwork.tags,
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

        // Load all exhibitions automatically (no query param)
        console.log('🏛️ Loading all exhibitions...');
        searchExhibitions({
          query: '', // Blank query triggers all exhibitions
          theme: 'All Themes',
          sortBy: 'createdAt',
          sortOrder: 'desc',
          publicOnly: false
        });
      } else {
        // Clear exhibition data when switching to artworks
        setExhibitions([]);
        setError(null);

        // Load default artworks (empty search, all sources)
        console.log('🎨 Loading default artworks...');
        searchArtworks('', 'all');
      }
    };

    // Add a delay before loading initial data to prevent immediate rate limiting
    const delayTimeout = setTimeout(() => {
      loadInitialData();
    }, 500);

    return () => clearTimeout(delayTimeout);
  }, [searchMode, isRateLimited, searchArtworks, searchExhibitions]);

  const handleExhibitionClick = (exhibition: Exhibition) => {
    // Navigate to exhibition detail view using shareable link or ID
    const identifier = exhibition.shareableLink || exhibition._id;
    router.push(`/exhibitions/${identifier}`);
  };



  return (
    // All previous JSX content
    <>
      {/* ...existing JSX... */}
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchPageInner />
    </Suspense>
  );
}