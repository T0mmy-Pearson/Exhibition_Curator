'use client';

import { useState, useEffect, useCallback } from 'react';
import ArtworkCard from './ArtworkCard';
import ArtworkModal, { ArtworkDetails } from './ArtworkModal';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import { StandardizedArtwork } from '../types/artwork';
import { API_ENDPOINTS, buildApiUrl, apiRequest } from '../config/api';

interface ArtworkListProps {
  searchTerm?: string;
  source?: 'all' | 'met' | 'rijks' | 'va';
  limit?: number;
  artworks?: StandardizedArtwork[]; // Accept artworks as props
  loading?: boolean; // Accept loading state as props
  error?: string | null; // Accept error state as props
}

export default function ArtworkList({ 
  searchTerm = 'painting', 
  source = 'all', 
  limit = 100,
  artworks: propArtworks,
  loading: propLoading,
  error: propError
}: ArtworkListProps) {
  const [artworks, setArtworks] = useState<StandardizedArtwork[]>(propArtworks || []);
  const [loading, setLoading] = useState(propLoading !== undefined ? propLoading : true);
  const [error, setError] = useState<string | null>(propError !== undefined ? propError : null);
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update state when props change
  useEffect(() => {
    if (propArtworks !== undefined) {
      setArtworks(propArtworks);
    }
  }, [propArtworks]);

  useEffect(() => {
    if (propLoading !== undefined) {
      setLoading(propLoading);
    }
  }, [propLoading]);

  useEffect(() => {
    if (propError !== undefined) {
      setError(propError);
    }
  }, [propError]);

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
      const data = await apiRequest(apiUrl) as any;
      
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

  // Handle artwork click
  const handleArtworkClick = (artwork: StandardizedArtwork) => {
    // Convert StandardizedArtwork to ArtworkDetails format
    const artworkDetails: ArtworkDetails = {
      objectID: artwork.objectID?.toString(),
      artworkId: artwork.objectID?.toString(),
      title: artwork.title,
      artist: artwork.artist,
      artistDisplayName: artwork.artist,
      date: artwork.date,
      objectDate: artwork.date,
      medium: artwork.medium,
      department: artwork.department,
      culture: artwork.culture,
      period: undefined,
      dimensions: artwork.dimensions,
      imageUrl: artwork.imageUrl,
      primaryImage: artwork.imageUrl,
      primaryImageSmall: artwork.smallImageUrl,
      additionalImages: artwork.additionalImages,
      objectURL: undefined,
      tags: artwork.tags,
      description: artwork.description,
      museumSource: artwork.source,
      isHighlight: artwork.isHighlight,
      creditLine: artwork.creditLine,
      classification: undefined,
      accessionNumber: artwork.accessionNumber,
      geographyType: undefined,
      city: undefined,
      state: undefined,
      county: undefined,
      country: undefined,
      region: undefined,
      subregion: undefined,
      locale: undefined,
      locus: undefined,
      excavation: undefined,
      river: undefined,
      rightsAndReproduction: undefined
    };
    
    setSelectedArtwork(artworkDetails);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedArtwork(null);
  };

  useEffect(() => {
    // Only fetch artworks if they're not provided as props
    if (propArtworks === undefined) {
      fetchArtworks();
    }
  }, [fetchArtworks, propArtworks]);

  if (loading) {
    return <LoadingSpinner message="Loading artworks..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchArtworks} />;
  }

  if (artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-black mb-4">
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
        <h3 className="text-lg font-medium text-black mb-2">
          No Artworks Found
        </h3>
        <p className="text-black">
          Try adjusting your search terms or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black mb-2">
          Artworks Collection
        </h2>
        <p className="text-black">
          Found {artworks.length} artwork{artworks.length !== 1 ? 's' : ''} 
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {/* Grid of artwork cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {artworks.map((artwork) => (
          <ArtworkCard 
            key={artwork.id} 
            artwork={artwork} 
            onClick={handleArtworkClick}
          />
        ))}
      </div>

      {/* Artwork Modal */}
      {selectedArtwork && (
        <ArtworkModal
          artwork={selectedArtwork}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}