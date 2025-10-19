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
  smallImageUrl?: string;
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
  // ...existing code...
  // New state to hold fetched artwork details
  const [artworkDetails, setArtworkDetails] = useState<Record<string, Artwork | null>>({});

const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (exhibition?.artworks?.length) {
      exhibition.artworks.forEach((artwork, idx) => {
        if (!artwork.smallImageUrl && !artwork.imageUrl && !artwork.primaryImageSmall) {
          console.warn(`Artwork at index ${idx} is missing image fields:`, artwork);
        }
      });
    }
  }, [exhibition]);

  // Log missing image fields for artworks (after all state declarations)
  useEffect(() => {
    if (exhibition?.artworks?.length) {
      exhibition.artworks.forEach((artwork, idx) => {
        if (!artwork.smallImageUrl && !artwork.imageUrl && !artwork.primaryImageSmall) {
          console.warn(`Artwork at index ${idx} is missing image fields:`, artwork);
        }
      });
    }
  }, [exhibition]);
  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => Math.min(prev + 1, (exhibition?.artworks?.length ?? 1) - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exhibition]);

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

  // Fetch full artwork details for each artwork in exhibition
  useEffect(() => {
    if (exhibition?.artworks?.length) {
      exhibition.artworks.forEach(async (artwork) => {
        if (!artworkDetails[artwork.artworkId]) {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/artworks/${artwork.artworkId}`);
            if (res.ok) {
              const data = await res.json();
              console.log('Fetched artwork details:', data.artwork);
              setArtworkDetails(prev => ({ ...prev, [artwork.artworkId]: data.artwork }));
            } else {
              console.warn('Artwork API request failed:', artwork.artworkId, res.status);
              setArtworkDetails(prev => ({ ...prev, [artwork.artworkId]: null }));
            }
          } catch (err) {
            console.error('Artwork API request error:', artwork.artworkId, err);
            setArtworkDetails(prev => ({ ...prev, [artwork.artworkId]: null }));
          }
        }
      });
    }
  }, [exhibition]);

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

  // Helper to get best image URL for artwork, preferring fetched details
  const getArtworkImageUrl = (artwork: any) => {
    const details = artworkDetails[artwork?.artworkId];
    return details?.smallImageUrl || details?.imageUrl || details?.primaryImageSmall || artwork?.smallImageUrl || artwork?.imageUrl || artwork?.primaryImageSmall || '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center">
        {/* Carousel info and keyboard navigation message moved below image */}
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl flex flex-col items-center">
          {/* Show spinner while artwork details are loading */}
          {(() => {
            const artwork = exhibition?.artworks?.[currentIndex];
            if (!artwork) {
              return <LoadingSpinner />;
            }
            const details = artworkDetails[artwork.artworkId];
            if (details === undefined) {
              return <LoadingSpinner />;
            }
            const imageUrl = getArtworkImageUrl(artwork);
            if (imageUrl) {
              return (
                <>
                  <div className="w-full h-[36rem] bg-gray-50 rounded relative group overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={`${details?.title ?? artwork?.title ?? 'Untitled'} by ${details?.artist ?? artwork?.artist ?? 'Unknown artist'}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1200px) 100vw, 1200px"
                      priority={true}
                      onError={() => {
                        console.error('Next.js Image failed to load:', imageUrl);
                      }}
                      onLoad={() => {
                        console.log('Next.js Image loaded successfully:', imageUrl);
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center text-white p-8">
                      <div className="w-full">
                        <h2 className="text-2xl font-bold mb-2">{details?.title ?? artwork?.title ?? 'Untitled'}</h2>
                        {details?.artist ?? artwork?.artist ? (
                          <p className="text-lg mb-2">{details?.artist ?? artwork?.artist}</p>
                        ) : null}
                        {details?.date ?? artwork?.date ? (
                          <p className="text-base mb-1"><span className="font-medium">Date:</span> {details?.date ?? artwork?.date}</p>
                        ) : null}
                        {details?.medium ?? artwork?.medium ? (
                          <p className="text-base mb-1"><span className="font-medium">Medium:</span> {details?.medium ?? artwork?.medium}</p>
                        ) : null}
                        <p className="text-base mb-1"><span className="font-medium">Source:</span> {details?.museumSource ?? artwork?.museumSource ?? 'Unknown'}</p>
                        <p className="text-base mb-1"><span className="font-medium">ID:</span> {details?.artworkId ?? artwork?.artworkId}</p>
                        {exhibition?.description && (
                          <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-1">Exhibition Description</h3>
                            <p className="text-base whitespace-pre-line">{exhibition.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-full mt-4 text-center flex flex-col items-center">
                    <span className="text-lg font-medium text-gray-700">
                      {currentIndex + 1} / {exhibition?.artworks?.length ?? 0}
                    </span>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 rounded text-blue-700 font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </span>
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 rounded text-blue-700 font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </span>
                      <span className="text-sm text-black-700 ml-2">Use arrow keys to navigate</span>
                    </div>
                  </div>
                </>
              );
            } else {
              return (
                <>
                  <div className="flex items-center justify-center bg-gray-200 rounded" style={{ aspectRatio: '4/3' }}>
                    <div className="text-center text-gray-500">
                      <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">Image unavailable</p>
                    </div>
                  </div>
                  <div className="w-full mt-4 text-center flex flex-col items-center">
                    <span className="text-lg font-medium text-gray-700">
                      {currentIndex + 1} / {exhibition?.artworks?.length ?? 0}
                    </span>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 rounded text-blue-700 font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </span>
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 rounded text-blue-700 font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </span>
                      <span className="text-sm text-blue-700 ml-2">Use arrow keys to navigate</span>
                    </div>
                  </div>
                </>
              );
            }
          })()}
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
          {/* Exhibition Description Section */}
          {exhibition?.description && (
            <div className="w-full mt-10 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Exhibition Description</h3>
              <p className="text-gray-700 text-base whitespace-pre-line">{exhibition.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
    }