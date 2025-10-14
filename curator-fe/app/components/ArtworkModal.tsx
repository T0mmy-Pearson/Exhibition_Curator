'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLoginPrompt } from '../hooks/useLoginPrompt';
import LoginPromptModal from './LoginPromptModal';

export interface ArtworkDetails {
  objectID?: string;
  artworkId?: string;
  title: string;
  artist?: string;
  artistDisplayName?: string;
  date?: string;
  objectDate?: string;
  medium?: string;
  department?: string;
  culture?: string;
  period?: string;
  dimensions?: string;
  imageUrl?: string;
  primaryImage?: string;
  primaryImageSmall?: string;
  additionalImages?: string[];
  objectURL?: string;
  tags?: string[];
  description?: string;
  museumSource?: string;
  isHighlight?: boolean;
  creditLine?: string;
  classification?: string;
  accessionNumber?: string;
  geographyType?: string;
  city?: string;
  state?: string;
  county?: string;
  country?: string;
  region?: string;
  subregion?: string;
  locale?: string;
  locus?: string;
  excavation?: string;
  river?: string;
  rightsAndReproduction?: string;
}

interface ArtworkModalProps {
  artwork: ArtworkDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ArtworkModal({ artwork, isOpen, onClose }: ArtworkModalProps) {
  const { user, token } = useAuth();
  const loginPrompt = useLoginPrompt();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [showDoubleTapHint, setShowDoubleTapHint] = useState(false);

  // Get all available images
  const allImages = artwork ? [
    artwork.imageUrl || artwork.primaryImage,
    artwork.primaryImageSmall,
    ...(artwork.additionalImages || [])
  ].filter(Boolean) : [];

  // Format artist name
  const artistName = artwork?.artist || artwork?.artistDisplayName || 'Unknown Artist';
  
  // Format date
  const artworkDate = artwork?.date || artwork?.objectDate || 'Date Unknown';

  // Format artwork ID
  const artworkId = artwork?.artworkId || artwork?.objectID || '';

  // Check if artwork is in user's favorites
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user || !token || !artworkId) return;

      try {
        const response = await fetch('http://localhost:9090/api/users/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const isInFavorites = data.favorites?.some((fav: any) => 
            fav.artworkId === artworkId || fav.objectID === artworkId
          );
          setIsFavorite(isInFavorites);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    if (isOpen && artwork) {
      checkFavoriteStatus();
      setCurrentImageIndex(0);
    }
  }, [isOpen, artwork, user, token, artworkId]);

  // Handle favorite toggle with login prompt
  const toggleFavorite = async () => {
    // Use requireAuth to check login and prompt if needed
    loginPrompt.requireAuth(async () => {
      if (!token || !artwork) return;

      setLoading(true);
      try {
        const method = isFavorite ? 'DELETE' : 'POST';
        const endpoint = isFavorite 
          ? `http://localhost:9090/api/users/favorites/${artworkId}`
          : 'http://localhost:9090/api/users/favorites';

        const body = isFavorite ? undefined : JSON.stringify({
          artworkId: artworkId,
          title: artwork.title,
          artist: artistName,
          date: artworkDate,
          medium: artwork.medium,
          imageUrl: artwork.imageUrl || artwork.primaryImage,
          objectURL: artwork.objectURL,
          department: artwork.department,
          culture: artwork.culture,
          museumSource: artwork.museumSource || 'unknown'
        });

        const response = await fetch(endpoint, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          ...(body && { body })
        });

        if (response.ok) {
          const newFavoriteState = !isFavorite;
          setIsFavorite(newFavoriteState);
          
          // Show heart animation when favoriting (not unfavoriting)
          if (newFavoriteState) {
            setShowHeartAnimation(true);
            setTimeout(() => setShowHeartAnimation(false), 1000);
          }
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
      } finally {
        setLoading(false);
      }
    }, 'favorite-artwork', { artworkTitle: artwork?.title });
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (allImages.length > 1) {
            setCurrentImageIndex(prev => 
              prev === 0 ? allImages.length - 1 : prev - 1
            );
          }
          break;
        case 'ArrowRight':
          if (allImages.length > 1) {
            setCurrentImageIndex(prev => 
              prev === allImages.length - 1 ? 0 : prev + 1
            );
          }
          break;
        case 'f':
        case 'F':
          if (user) toggleFavorite();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, allImages.length, user]);

  if (!isOpen || !artwork) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className={`relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto ${
          isFullScreen ? 'fixed inset-4 max-w-none max-h-none' : 'max-w-6xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white line-clamp-1">
              {artwork.title}
            </h2>
            <div className="flex items-center gap-2">
              {/* Fullscreen toggle */}
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Toggle fullscreen"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={isFullScreen 
                      ? "M9 9V4.5M9 9H4.5M9 9L3.5 3.5m5.5 11v4.5M9 15H4.5M9 15l-5.5 5.5m11-5.5v4.5m0-4.5h4.5m0 0l-5.5 5.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5"
                      : "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                    } 
                  />
                </svg>
              </button>

              {/* Favorite button - Instagram style */}
              <button
                onClick={toggleFavorite}
                disabled={loading}
                className={`p-2 rounded-full transition-all transform hover:scale-110 ${
                  isFavorite
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'
                }`}
                title={isFavorite ? 'Remove from favorites (F)' : 'Add to favorites (F)'}
              >
                {isFavorite ? (
                  // Filled heart
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                ) : (
                  // Empty heart outline
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                  </svg>
                )}
              </button>

              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Close (Esc)"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row flex-1 min-h-0">
            {/* Image section */}
            <div className="lg:w-2/3 relative bg-gray-50 dark:bg-gray-800 flex-shrink-0">
              {allImages.length > 0 ? (
                <div className="relative h-full min-h-[400px] lg:min-h-[600px]">
                  <div 
                    className="relative w-full h-full group"
                    onMouseEnter={() => !isFavorite && setShowDoubleTapHint(true)}
                    onMouseLeave={() => setShowDoubleTapHint(false)}
                  >
                    <img
                      src={allImages[currentImageIndex]}
                      alt={artwork.title}
                      className="w-full h-full object-contain cursor-pointer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-artwork.jpg';
                      }}
                      onDoubleClick={() => {
                        // Double-click to favorite (like Instagram)
                        if (!isFavorite) {
                          toggleFavorite();
                        }
                      }}
                    />

                    {/* Double-tap hint */}
                    {showDoubleTapHint && !isFavorite && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black bg-opacity-20 transition-opacity">
                        <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-full text-sm flex items-center gap-2">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                            />
                          </svg>
                          Double-click to favorite
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Instagram-style heart animation */}
                  {showHeartAnimation && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="animate-ping">
                        <svg className="h-20 w-20 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </div>
                      <div className="absolute">
                        <svg className="h-16 w-16 text-red-500 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Image navigation */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === 0 ? allImages.length - 1 : prev - 1
                        )}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
                        title="Previous image (←)"
                      >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      <button
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === allImages.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
                        title="Next image (→)"
                      >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      {/* Image indicators */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {allImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                              index === currentImageIndex
                                ? 'bg-white'
                                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Image counter */}
                  {allImages.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px] text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <svg className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No image available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Details section */}
            <div className="lg:w-1/3 p-6 overflow-y-auto flex-1 min-h-0">
              <div className="space-y-6">
                {/* Basic info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Artwork Details
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Artist</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{artistName}</dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{artworkDate}</dd>
                    </div>

                    {artwork.medium && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Medium</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{artwork.medium}</dd>
                      </div>
                    )}

                    {artwork.dimensions && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Dimensions</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{artwork.dimensions}</dd>
                      </div>
                    )}

                    {artwork.department && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{artwork.department}</dd>
                      </div>
                    )}

                    {artwork.culture && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Culture</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{artwork.culture}</dd>
                      </div>
                    )}

                    {artwork.period && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Period</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{artwork.period}</dd>
                      </div>
                    )}

                    {artwork.classification && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Classification</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{artwork.classification}</dd>
                      </div>
                    )}

                    {artwork.accessionNumber && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Accession Number</dt>
                        <dd className="text-sm text-gray-900 dark:text-white font-mono">{artwork.accessionNumber}</dd>
                      </div>
                    )}

                    {artwork.creditLine && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Credit Line</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{artwork.creditLine}</dd>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {artwork.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h4>
                    <p className="text-sm text-gray-900 dark:text-white leading-relaxed">{artwork.description}</p>
                  </div>
                )}

                {/* Geography */}
                {(artwork.country || artwork.city || artwork.region) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Geography</h4>
                    <div className="space-y-2">
                      {artwork.country && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Country</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">{artwork.country}</dd>
                        </div>
                      )}
                      {artwork.region && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Region</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">{artwork.region}</dd>
                        </div>
                      )}
                      {artwork.city && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">City</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">{artwork.city}</dd>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {artwork.tags && artwork.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {artwork.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Museum source */}
                {artwork.museumSource && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Museum</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900 dark:text-white capitalize">
                        {artwork.museumSource === 'met' ? 'Metropolitan Museum' : artwork.museumSource}
                      </span>
                      {artwork.isHighlight && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Highlight
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* External links */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  {artwork.objectURL && (
                    <a
                      href={artwork.objectURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      View at Museum
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>

                {/* Keyboard shortcuts */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Keyboard Shortcuts</h4>
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <div>← → Navigate images</div>
                    <div className="flex items-center gap-1">
                      <span>F Toggle favorite</span>
                      <svg className="h-3 w-3 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                    <div>Esc Close modal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Login Prompt Modal */}
        <LoginPromptModal
          isOpen={loginPrompt.isOpen}
          onClose={loginPrompt.hideLoginPrompt}
          onLoginSuccess={loginPrompt.handleLoginSuccess}
          trigger={loginPrompt.trigger}
          artworkTitle={loginPrompt.artworkTitle}
        />
    </div>
  );
}