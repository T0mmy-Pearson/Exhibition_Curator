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
      if (isMongoId(exhibitionIdentifier)) {
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/exhibitions/${exhibitionIdentifier}`;
      } else {
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

      // Carousel and artwork info (single block)
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-4">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                disabled={currentIndex === 0}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md transition-colors ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                ← Prev
              </button>
              <span className="text-lg font-medium text-gray-700">
                {currentIndex + 1} / {exhibition?.artworks?.length ?? 0}
              </span>
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, (exhibition?.artworks?.length ?? 1) - 1))}
                disabled={currentIndex === (exhibition?.artworks?.length ?? 1) - 1}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md transition-colors ${(currentIndex === (exhibition?.artworks?.length ?? 1) - 1) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                Next →
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl flex flex-col items-center">
              {(exhibition?.artworks?.[currentIndex]?.imageUrl || exhibition?.artworks?.[currentIndex]?.primaryImageSmall) ? (
                <div className="w-full h-80 bg-gray-50 border rounded relative">
                  <Image
                    src={exhibition?.artworks?.[currentIndex]?.imageUrl || exhibition?.artworks?.[currentIndex]?.primaryImageSmall || ''}
                    alt={`${exhibition?.artworks?.[currentIndex]?.title ?? 'Untitled'} by ${exhibition?.artworks?.[currentIndex]?.artist ?? 'Unknown artist'}`}
                    fill
                    className="object-contain rounded"
                    sizes="(max-width: 768px) 100vw, 800px"
                    priority={true}
                    onError={() => {
                      console.error('Next.js Image failed to load:', exhibition?.artworks?.[currentIndex]?.imageUrl || exhibition?.artworks?.[currentIndex]?.primaryImageSmall);
                    }}
                    onLoad={() => {
                      console.log('Next.js Image loaded successfully:', exhibition?.artworks?.[currentIndex]?.imageUrl || exhibition?.artworks?.[currentIndex]?.primaryImageSmall);
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center bg-gray-200 rounded" style={{ aspectRatio: '4/3' }}>
                  <div className="text-center text-gray-500">
                    <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Image unavailable</p>
                  </div>
                </div>
              )}
              {/* Artwork Description Section */}
              {(exhibition?.artworks?.length ?? 0) > 0 && (
                <div className="w-full mt-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {exhibition?.artworks?.[currentIndex]?.title ?? 'Untitled'}
                  </h2>
                  {exhibition?.artworks?.[currentIndex]?.artist && (
                    <p className="text-lg text-gray-700 mb-3">
                      {exhibition?.artworks?.[currentIndex]?.artist}
                    </p>
                  )}
                  <div className="space-y-2">
                    {exhibition?.artworks?.[currentIndex]?.date && (
                      <p className="text-gray-600">
                        <span className="font-medium">Date:</span> {exhibition?.artworks?.[currentIndex]?.date}
                      </p>
                    )}
                    {exhibition?.artworks?.[currentIndex]?.medium && (
                      <p className="text-gray-600">
                        <span className="font-medium">Medium:</span> {exhibition?.artworks?.[currentIndex]?.medium}
                      </p>
                    )}
                    <p className="text-gray-600">
                      <span className="font-medium">Source:</span> {exhibition?.artworks?.[currentIndex]?.museumSource ?? 'Unknown'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">ID:</span> {exhibition?.artworks?.[currentIndex]?.artworkId}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }