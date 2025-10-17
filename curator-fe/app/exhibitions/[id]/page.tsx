'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Image from 'next/image';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';

interface Artwork {
  _id: string;
  artworkId: string;
  title: string;
  artist: string;
  date: string;
  medium: string;
  imageUrl: string;
  museumSource: string;
}

interface Exhibition {
  _id: string;
  title: string;
  description: string;
  curatorName: string;
  artworks: Artwork[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ExhibitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const exhibitionId = params.id as string;

  useEffect(() => {
    if (exhibitionId) {
      fetchExhibition();
    }
  }, [exhibitionId, token]);

  const fetchExhibition = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/exhibitions/${exhibitionId}`,
        { headers }
      );

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

  // Navigation functions for the carousel
  const nextImage = () => {
    if (exhibition?.artworks && exhibition.artworks.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % exhibition.artworks.length);
    }
  };

  const prevImage = () => {
    if (exhibition?.artworks && exhibition.artworks.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? exhibition.artworks.length - 1 : prev - 1
      );
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Touch/swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance required
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'Escape') {
        router.back();
      } else if (e.key === 'i' || e.key === 'I') {
        setShowInfo(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [exhibition]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
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
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">
            {!exhibition ? 'Exhibition not found' : 'No artworks in this exhibition'}
          </h1>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-white text-black rounded-md hover:bg-gray-100 transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentArtwork = exhibition.artworks[currentImageIndex];

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Header with close button and exhibition info */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold">{exhibition.title}</h1>
              <p className="text-sm text-gray-300">
                {currentImageIndex + 1} of {exhibition.artworks.length} artworks
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main image container */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative w-full h-full flex items-center justify-center p-16">
          {currentArtwork.imageUrl ? (
            <div className="relative max-w-full max-h-full">
              <Image
                src={currentArtwork.imageUrl}
                alt={currentArtwork.title}
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain"
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-96 h-96 bg-gray-800 rounded-lg">
              <div className="text-center text-gray-400">
                <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Image unavailable</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation arrows */}
        {exhibition.artworks.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Bottom thumbnail strip */}
      {exhibition.artworks.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {exhibition.artworks.map((artwork, index) => (
              <button
                key={artwork._id}
                onClick={() => goToImage(index)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentImageIndex 
                    ? 'border-white shadow-lg' 
                    : 'border-gray-500 hover:border-gray-300'
                }`}
              >
                {artwork.imageUrl ? (
                  <Image
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Artwork info overlay */}
      {showInfo && (
        <div className="absolute bottom-20 left-4 right-4 z-30 bg-black/80 backdrop-blur-sm rounded-lg p-6 text-white max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-2">{currentArtwork.title}</h2>
          <p className="text-gray-300 mb-2">{currentArtwork.artist}</p>
          {currentArtwork.date && (
            <p className="text-gray-400 mb-2">{currentArtwork.date}</p>
          )}
          {currentArtwork.medium && (
            <p className="text-gray-400 text-sm">{currentArtwork.medium}</p>
          )}
        </div>
      )}

      {/* Control hints */}
      <div className="absolute bottom-4 right-4 z-20 text-white text-xs opacity-50">
        <p className="hidden md:block">← → Navigate | I Info | Esc Exit</p>
        <p className="md:hidden">Swipe to navigate | Tap (i) for info</p>
      </div>
    </div>
  );
}