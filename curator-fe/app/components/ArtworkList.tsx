'use client';

import { useState, useEffect, useCallback } from 'react';
import ArtworkCard from './ArtworkCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import { StandardizedArtwork } from '../types/artwork';
import { API_ENDPOINTS, buildApiUrl, apiRequest } from '../config/api';

interface ArtworkListProps {
  searchTerm?: string;
  source?: 'all' | 'met' | 'rijks' | 'va';
  limit?: number;
}

export default function ArtworkList({ 
  searchTerm = 'painting', 
  source = 'all', 
  limit = 100 
}: ArtworkListProps) {
  const [artworks, setArtworks] = useState<StandardizedArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtworks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build API URL with parameters
      const apiUrl = buildApiUrl(API_ENDPOINTS.SEARCH_ARTWORKS, {
        q: searchTerm,
        source: source,
        limit: limit,
        hasImages: 'true' // Only fetch artworks with images
      });

      console.log('Fetching artworks from:', apiUrl);
      
      // Use centralized API request function
      const data = await apiRequest(apiUrl);
      
      console.log('Received data:', data);
      setArtworks(data.artworks || []);
    } catch (err) {
      console.error('Error fetching artworks:', err);
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timed out. Try reducing your search scope or check your connection.');
        } else {
          setError(`Failed to load artworks: ${err.message}`);
        }
      } else {
        setError('Failed to load artworks. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, source, limit]);

  useEffect(() => {
    fetchArtworks();
  }, [fetchArtworks]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchArtworks} />;
  }

  if (artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg
            className="mx-auto h-12 w-12 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Artworks Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your search terms or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Artworks Collection
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Found {artworks.length} artwork{artworks.length !== 1 ? 's' : ''} 
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {/* Grid of artwork cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {artworks.map((artwork) => (
          <ArtworkCard key={artwork.id} artwork={artwork} />
        ))}
      </div>
    </div>
  );
}