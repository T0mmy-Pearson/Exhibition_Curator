'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Image from 'next/image';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';
// Removed Splide imports

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
  const [currentIndex, setCurrentIndex] = useState(0);

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
        </div>
      </div>
    );
  }

  // Carousel navigation handlers
  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? exhibition.artworks.length - 1 : prev - 1));
  };
  const goToNext = () => {
    setCurrentIndex((prev) => (prev === exhibition.artworks.length - 1 ? 0 : prev + 1));
  };

  const currentArtwork = exhibition.artworks[currentIndex];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">{exhibition.title}</h1>
        <p className="mb-4 text-gray-700">{exhibition.description}</p>
        <div className="mb-6 text-sm text-gray-500">
          Curated by <span className="font-semibold">{exhibition.curator.fullName || exhibition.curator.username}</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-md h-96 flex items-center justify-center">
            {/* Carousel navigation */}
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-200 hover:bg-gray-300 rounded-full p-2 z-10"
              onClick={goToPrev}
              aria-label="Previous artwork"
            >
              &#8592;
            </button>
            <div className="w-full h-full flex flex-col items-center justify-center">
              {(currentArtwork.imageUrl || currentArtwork.primaryImageSmall) ? (
                <Image
                  src={currentArtwork.imageUrl ? currentArtwork.imageUrl : currentArtwork.primaryImageSmall as string}
                  alt={currentArtwork.title}
                  width={350}
                  height={350}
                  className="object-contain rounded-lg shadow-md mb-4"
                />
              ) : (
                <div className="w-72 h-72 flex items-center justify-center bg-gray-100 rounded-lg mb-4">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-1">{currentArtwork.title}</h2>
                {currentArtwork.artist && (
                  <div className="text-gray-600 mb-1">by {currentArtwork.artist}</div>
                )}
                {currentArtwork.date && (
                  <div className="text-gray-500 mb-1">{currentArtwork.date}</div>
                )}
                {currentArtwork.medium && (
                  <div className="text-gray-500 mb-1">{currentArtwork.medium}</div>
                )}
                <div className="text-xs text-gray-400 mt-2">Source: {currentArtwork.museumSource}</div>
              </div>
            </div>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-200 hover:bg-gray-300 rounded-full p-2 z-10"
              onClick={goToNext}
              aria-label="Next artwork"
            >
              &#8594;
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Artwork {currentIndex + 1} of {exhibition.artworks.length}
          </div>
        </div>
      </div>
    </div>
  );
}