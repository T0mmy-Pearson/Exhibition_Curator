'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLoginPrompt } from '../hooks/useLoginPrompt';
import ExhibitionSearch, { Exhibition } from '../components/ExhibitionSearch';
import ExhibitionList from '../components/ExhibitionList';
import ArtworkSearch from '../components/ArtworkSearch';
import ArtworkList from '../components/ArtworkList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import LoginPromptModal from '../components/LoginPromptModal';

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
  const [searchMode, setSearchMode] = useState<SearchMode>('exhibitions');
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search exhibitions
  const searchExhibitions = useCallback(async (filters: SearchFilters) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters.query) params.append('q', filters.query);
      if (filters.theme && filters.theme !== 'All Themes') params.append('theme', filters.theme);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      params.append('limit', '50');

      // Use appropriate endpoint based on publicOnly filter
      const endpoint = filters.publicOnly 
        ? '/api/exhibitions/public'
        : '/api/exhibitions/search';

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:9090/api');
      const response = await fetch(`${API_BASE_URL}${endpoint.replace('/api', '')}?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && !filters.publicOnly && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search exhibitions');
      }

      const data = await response.json();
      setExhibitions(data.exhibitions || []);
    } catch (err) {
      console.error('Exhibition search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search exhibitions');
      setExhibitions([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Search artworks (existing functionality)
  const searchArtworks = useCallback(async (searchTerm: string, source: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: searchTerm,
        hasImages: 'true',
        ...(source !== 'all' && { departmentId: source })
      });

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:9090/api');
      const response = await fetch(`${API_BASE_URL}/artworks/search?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search artworks');
      }

      const data = await response.json();
      setArtworks(data.artworks || []);
    } catch (err) {
      console.error('Artwork search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search artworks');
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial load - fetch featured/trending exhibitions
  useEffect(() => {
    const loadInitialData = async () => {
      if (searchMode === 'exhibitions') {
        // Start with trending exhibitions
        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:9090/api');
          const response = await fetch(`${API_BASE_URL}/exhibitions/trending?limit=12`);
          if (response.ok) {
            const data = await response.json();
            setExhibitions(data.exhibitions || []);
          }
        } catch (err) {
          // If trending fails, fall back to public exhibitions
          searchExhibitions({
            query: '',
            theme: 'All Themes',
            sortBy: 'createdAt',
            sortOrder: 'desc',
            publicOnly: true
          });
        }
      }
    };

    loadInitialData();
  }, [searchMode, searchExhibitions]);

  const handleExhibitionClick = (exhibition: Exhibition) => {
    // Navigate to exhibition detail view
    if (exhibition.shareableLink) {
      window.open(`/exhibitions/shared/${exhibition.shareableLink}`, '_blank');
    } else {
      console.log('View exhibition:', exhibition._id);
      // TODO: Implement exhibition detail view
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Art & Exhibitions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Explore curated exhibitions and search through thousands of artworks from world-renowned museums.
          </p>
        </div>

        {/* Search mode toggle */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSearchMode('exhibitions')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                searchMode === 'exhibitions'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
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
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
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
            <ArtworkSearch 
              onSearch={searchArtworks}
              initialSearchTerm="renaissance"
              initialSource="all"
            />
            <ArtworkList
              searchTerm="renaissance"
              source="all"
              limit={100}
            />
          </>
        )}

        {/* Quick stats or featured content */}
        {!loading && searchMode === 'exhibitions' && exhibitions.length > 0 && (
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Discover More
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {exhibitions.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Exhibitions Found
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {exhibitions.filter(e => e.isPublic).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Public Exhibitions
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {new Set(exhibitions.map(e => e.theme)).size}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
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