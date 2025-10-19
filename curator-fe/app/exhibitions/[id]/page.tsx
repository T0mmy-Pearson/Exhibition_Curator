'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Image from 'next/image';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css/core';
import './splide-custom.css';

interface Artwork {
  artworkId: string;
  title: string;
  artist?: string;
  date?: string;
  medium?: string;
  imageUrl?: string;
  primaryImageSmall?: string;
  additionalImages?: string[];
  tags?: string[];
  museumSource: string;
  isHighlight?: boolean;
  addedAt: string;
}

interface Exhibition {
  id: string;
  title: string;
  description: string;
  curator: {
    username: string;
    fullName: string;
  };
  artworks: Artwork[];
  isPublic: boolean;
  shareableLink: string;
  theme: string;
  tags: string[];
  artworksCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function ExhibitionPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const exhibitionIdentifier = params.id as string;

  // Function to determine if the identifier is a MongoDB ObjectId or shareable link
  const isMongoId = (str: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(str);
  };

  useEffect(() => {
    if (exhibitionIdentifier) {
      fetchExhibition();
    }
  }, [exhibitionIdentifier, token]);

  const fetchExhibition = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let apiUrl: string;
      
      //  which API 
      if (isMongoId(exhibitionIdentifier)) {
        // It's a MongoDB ObjectId, use the private endpoint
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/exhibitions/${exhibitionIdentifier}`;
      } else {
        // It's a shareable link, use the shared endpoint
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/exhibitions/shared/${exhibitionIdentifier}`;
      }

      const response = await fetch(apiUrl, { headers });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Exhibition not found');
        }
        throw new Error('Failed to load exhibition');
      }

      const data = await response.json();
      setExhibition(data.exhibition);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exhibition');
    } finally {
      setLoading(false);
    }
  };

  const splideOptions = {
    type: 'slide', // Changed from 'loop' to 'slide' to simplify
    perPage: 1,
    perMove: 1,
    gap: '2rem',
    padding: { left: '5rem', right: '5rem' },
    arrows: true,
    pagination: true,
    keyboard: 'focused',
    focus: 'center',
    trimSpace: false,
    speed: 800,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    pauseOnHover: true,
    pauseOnFocus: true,
    drag: true,
    flickPower: 600,
    live: true,
    label: 'Exhibition Artwork Carousel',
    role: 'region',
    height: '500px', // Add fixed height
    breakpoints: {
      768: {
        padding: { left: '2rem', right: '2rem' },
        gap: '1rem',
        height: '400px',
      },
      480: {
        padding: { left: '1rem', right: '1rem' },
        gap: '0.5rem',
        height: '300px',
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading exhibition..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <ErrorDisplay 
          message={error}
          actionText="Go Back"
          onAction={() => router.back()}
        />
      </div>
    );
  }

  if (!exhibition || !exhibition.artworks || exhibition.artworks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            {!exhibition ? 'Exhibition not found' : 'No artworks in this exhibition'}
          </h1>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            
            <div className="text-center">
              <h1 id="exhibition-title" className="text-2xl font-bold text-gray-900">{exhibition.title}</h1>
              <p className="text-gray-600 mt-1">
                Curated by {exhibition.curator.fullName} • {exhibition.artworks.length} artworks
              </p>
            </div>
            
            <div className="w-16"></div> {/* Spacer for balance */}
          </div>
          
          {exhibition.description && (
            <div className="mt-4 text-center">
              <p className="text-gray-700 max-w-2xl mx-auto">{exhibition.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Debug Section - Simple Image Test */}
      {exhibition.artworks.length > 0 && (exhibition.artworks[0].imageUrl || exhibition.artworks[0].primaryImageSmall) && (
        <div className="max-w-4xl mx-auto px-4 py-4 bg-yellow-100 mb-4">
          <h3 className="font-bold mb-2">Debug: Simple Image Test (Outside Carousel)</h3>
          <p>Image URL: {exhibition.artworks[0].imageUrl || exhibition.artworks[0].primaryImageSmall}</p>
          <img 
            src={exhibition.artworks[0].imageUrl || exhibition.artworks[0].primaryImageSmall || ''}
            alt="Test artwork"
            className="w-64 h-48 object-contain border-2 border-blue-500"
            onLoad={() => console.log('Test image loaded successfully')}
            onError={(e) => {
              console.error('Test image failed to load');
              e.currentTarget.style.border = '2px solid red';
            }}
          />
        </div>
      )}

      {/* Carousel Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative">
        {/* Slide Counter */}
        <div className="absolute top-4 right-8 z-10 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentSlide + 1} / {exhibition.artworks.length}
        </div>

        {/* Debug info */}
        <div className="absolute top-4 left-8 z-10 bg-blue-600 text-white px-3 py-1 rounded text-sm">
          Artworks loaded: {exhibition.artworks.length}
        </div>

        <Splide 
          options={splideOptions} 
          onMoved={(splide: any) => setCurrentSlide(splide.index)}
          aria-labelledby="exhibition-title"
        >
          {exhibition.artworks.map((artwork, index) => {
            console.log(`Artwork ${index}:`, {
              title: artwork.title,
              imageUrl: artwork.imageUrl,
              primaryImageSmall: artwork.primaryImageSmall
            });
            return (
            <SplideSlide key={artwork.artworkId || `artwork-${index}`}>
              <div className="flex flex-col items-center h-full">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
                  {(artwork.imageUrl || artwork.primaryImageSmall) ? (
                    <div className="w-full h-80 bg-gray-50 border rounded relative">
                      <Image
                        src={artwork.imageUrl || artwork.primaryImageSmall || ''}
                        alt={`${artwork.title} by ${artwork.artist || 'Unknown artist'}`}
                        fill
                        className="object-contain rounded"
                        sizes="(max-width: 768px) 100vw, 800px"
                        priority={index === 0}
                        onError={() => {
                          console.error('Next.js Image failed to load:', artwork.imageUrl || artwork.primaryImageSmall);
                        }}
                        onLoad={() => {
                          console.log('Next.js Image loaded successfully:', artwork.imageUrl || artwork.primaryImageSmall);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center bg-gray-200 rounded" style={{ aspectRatio: '4/3' }}>
                      <div className="text-center text-gray-500">
                        <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">Image unavailable</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SplideSlide>
            );
          })}
        </Splide>
      </div>

      {/* Artwork Description Section */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {exhibition.artworks.length > 0 && (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {exhibition.artworks[currentSlide]?.title || 'Untitled'}
              </h2>
              {exhibition.artworks[currentSlide]?.artist && (
                <p className="text-lg text-gray-700 mb-3">
                  {exhibition.artworks[currentSlide].artist}
                </p>
              )}
              <div className="space-y-2">
                {exhibition.artworks[currentSlide]?.date && (
                  <p className="text-gray-600">
                    <span className="font-medium">Date:</span> {exhibition.artworks[currentSlide].date}
                  </p>
                )}
                {exhibition.artworks[currentSlide]?.medium && (
                  <p className="text-gray-600">
                    <span className="font-medium">Medium:</span> {exhibition.artworks[currentSlide].medium}
                  </p>
                )}
                <p className="text-gray-600">
                  <span className="font-medium">Source:</span> {exhibition.artworks[currentSlide]?.museumSource || 'Unknown'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">ID:</span> {exhibition.artworks[currentSlide]?.artworkId}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}