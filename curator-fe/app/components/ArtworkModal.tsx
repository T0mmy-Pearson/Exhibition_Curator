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
  const [loading, setLoading] = useState(false);
  const [showDoubleTapHint, setShowDoubleTapHint] = useState(false);
  const [showExhibitionModal, setShowExhibitionModal] = useState(false);
  const [userExhibitions, setUserExhibitions] = useState<any[]>([]);
  const [addingToExhibition, setAddingToExhibition] = useState(false);

  // Get all available images
  const allImages = artwork ? [
    artwork.imageUrl || artwork.primaryImage,
    ...(artwork.additionalImages || [])
  ].filter(Boolean) : [];

  // Format artist name
  const artistName = artwork?.artist || artwork?.artistDisplayName || 'Unknown Artist';
  
  // Format date
  const artworkDate = artwork?.date || artwork?.objectDate || 'Date Unknown';

  // Format artwork ID
  const artworkId = artwork?.artworkId || artwork?.objectID || '';

  // Reset image index when modal opens
  useEffect(() => {
    if (isOpen && artwork) {
      setCurrentImageIndex(0);
    }
  }, [isOpen, artwork]);

  // Handle adding to exhibition
  const handleAddToExhibitionClick = () => {
    loginPrompt.requireAuth(async () => {
      if (!token) return;
      await fetchUserExhibitions();
      setShowExhibitionModal(true);
    }, 'add-to-exhibition', { artworkTitle: artwork?.title });
  };

  const fetchUserExhibitions = async () => {
    if (!token) return;
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:9090/api');
      const response = await fetch(`${API_BASE_URL}/exhibitions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserExhibitions(data.exhibitions || []);
      }
    } catch (error) {
      console.error('Error fetching exhibitions:', error);
    }
  };

  const addToExhibition = async (exhibitionId: string) => {
    if (!token || !artwork) return;

    setAddingToExhibition(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:9090/api');
      
      const artworkData = {
        artworkId: artworkId,
        title: artwork.title,
        artist: artistName,
        date: artworkDate,
        medium: artwork.medium,
        department: artwork.department,
        culture: artwork.culture,
        dimensions: artwork.dimensions,
        imageUrl: artwork.imageUrl || artwork.primaryImage,
        primaryImageSmall: artwork.primaryImageSmall,
        additionalImages: artwork.additionalImages || [],
        tags: artwork.tags || [],
        description: artwork.description,
        museumSource: artwork.museumSource || 'met',
        isHighlight: artwork.isHighlight || false
      };

      console.log('Adding artwork to exhibition:', {
        exhibitionId,
        artworkData,
        endpoint: `${API_BASE_URL}/exhibitions/${exhibitionId}/artworks`
      });

      const response = await fetch(`${API_BASE_URL}/exhibitions/${exhibitionId}/artworks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(artworkData)
      });

      if (response.ok) {
        setShowExhibitionModal(false);
        console.log('Artwork added to exhibition successfully');
        // You could add success feedback here
      } else {
        const errorText = await response.text();
        console.error('Failed to add artwork to exhibition:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Failed to add artwork to exhibition: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error adding to exhibition:', error);
    } finally {
      setAddingToExhibition(false);
    }
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
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, allImages.length]);

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
        className={`relative bg-white border border-black rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto ${
          isFullScreen ? 'fixed inset-4 max-w-none max-h-none' : 'max-w-6xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-black sticky">
            <h2 className="text-2xl font-bold text-black line-clamp-1">
              {artwork.title}
            </h2>
            <div className="flex items-center gap-2">
              {/* Fullscreen toggle */}
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 text-gray-500 hover:text-black rounded-md hover:bg-gray-100"
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

              {/* Add to Exhibition button */}
              <button
                onClick={handleAddToExhibitionClick}
                className="p-2 text-gray-500 hover:text-black rounded-md hover:bg-gray-100"
                title="Add to Exhibition"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </button>

              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-black rounded-md hover:bg-gray-100"
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
            <div className="lg:w-2/3 relative bg-gray-50 flex-shrink-0">
              {allImages.length > 0 ? (
                <div className="relative h-full min-h-[400px] lg:min-h-[600px]">
                  <div className="relative w-full h-full group">
                    <img
                      src={allImages[currentImageIndex]}
                      alt={artwork.title}
                      className="w-full h-full object-contain cursor-pointer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-artwork.jpg';
                      }}
                    />
                  </div>

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
                <div className="flex items-center justify-center h-full min-h-[400px] text-gray-500">
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
                  <h3 className="text-lg font-semibold text-black mb-4">
                    Artwork Details
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Artist</dt>
                      <dd className="text-sm text-black">{artistName}</dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date</dt>
                      <dd className="text-sm text-black">{artworkDate}</dd>
                    </div>

                    {artwork.medium && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Medium</dt>
                        <dd className="text-sm text-black">{artwork.medium}</dd>
                      </div>
                    )}

                    {artwork.dimensions && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Dimensions</dt>
                        <dd className="text-sm text-black">{artwork.dimensions}</dd>
                      </div>
                    )}

                    {artwork.department && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Department</dt>
                        <dd className="text-sm text-black">{artwork.department}</dd>
                      </div>
                    )}

                    {artwork.culture && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Culture</dt>
                        <dd className="text-sm text-black">{artwork.culture}</dd>
                      </div>
                    )}

                    {artwork.period && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Period</dt>
                        <dd className="text-sm text-black">{artwork.period}</dd>
                      </div>
                    )}

                    {artwork.classification && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Classification</dt>
                        <dd className="text-sm text-black">{artwork.classification}</dd>
                      </div>
                    )}

                    {artwork.accessionNumber && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Accession Number</dt>
                        <dd className="text-sm text-black font-mono">{artwork.accessionNumber}</dd>
                      </div>
                    )}

                    {artwork.creditLine && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Credit Line</dt>
                        <dd className="text-sm text-black">{artwork.creditLine}</dd>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {artwork.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                    <p className="text-sm text-black leading-relaxed">{artwork.description}</p>
                  </div>
                )}

                {/* Geography */}
                {(artwork.country || artwork.city || artwork.region) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Geography</h4>
                    <div className="space-y-2">
                      {artwork.country && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Country</dt>
                          <dd className="text-sm text-black">{artwork.country}</dd>
                        </div>
                      )}
                      {artwork.region && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Region</dt>
                          <dd className="text-sm text-black">{artwork.region}</dd>
                        </div>
                      )}
                      {artwork.city && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500">City</dt>
                          <dd className="text-sm text-black">{artwork.city}</dd>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {artwork.tags && artwork.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {artwork.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-black text-white"
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
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Museum</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-black capitalize">
                        {artwork.museumSource === 'met' ? 'Metropolitan Museum' : artwork.museumSource}
                      </span>
                      {artwork.isHighlight && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white border border-black text-black">
                          Highlight
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* External links */}
                <div className="pt-4 border-t border-black">
                  {artwork.objectURL && (
                    <a
                      href={artwork.objectURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-black hover:text-gray-600 underline text-sm font-medium"
                    >
                      View at Museum
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>

                {/* Keyboard shortcuts */}
                <div className="pt-4 border-t border-black">
                  <h4 className="text-xs font-medium text-gray-500 mb-2">Keyboard Shortcuts</h4>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>← → Navigate images</div>
                    <div>Esc Close modal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Exhibition Selection Modal */}
        {showExhibitionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]" onClick={() => setShowExhibitionModal(false)}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-black">Add to Exhibition</h3>
                <button
                  onClick={() => setShowExhibitionModal(false)}
                  className="text-black hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-black mb-4">Select an exhibition to add "{artwork?.title}" to:</p>
              
              {userExhibitions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-black mb-4">You don't have any exhibitions yet.</p>
                  <button
                    onClick={() => {
                      setShowExhibitionModal(false);
                      // You could add navigation to create exhibition here
                    }}
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                  >
                    Create Your First Exhibition
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {userExhibitions.map((exhibition) => (
                    <button
                      key={exhibition._id}
                      onClick={() => addToExhibition(exhibition._id)}
                      disabled={addingToExhibition}
                      className="w-full p-3 text-left border border-black rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <div className="font-medium text-black">{exhibition.title}</div>
                      {exhibition.description && (
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">{exhibition.description}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {exhibition.artworks?.length || 0} artworks • {exhibition.theme}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {addingToExhibition && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent"></div>
                  <span className="ml-2 text-black">Adding artwork...</span>
                </div>
              )}
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
  );
}