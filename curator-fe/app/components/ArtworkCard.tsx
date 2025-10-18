import Image from 'next/image';
import { useState, useEffect } from 'react';
import { StandardizedArtwork } from '../types/artwork';
import { useAuth } from '../contexts/AuthContext';
import { useLoginPrompt } from '../hooks/useLoginPrompt';
import LoginPromptModal from './LoginPromptModal';

interface ArtworkCardProps {
  artwork: StandardizedArtwork;
  onClick?: (artwork: StandardizedArtwork) => void;
  showQuickInfo?: boolean;
  showFavoriteButton?: boolean;
  showAddToExhibition?: boolean;
}

export default function ArtworkCard({ artwork, onClick, showQuickInfo = true, showFavoriteButton = true, showAddToExhibition = true }: ArtworkCardProps) {
  const { user, token } = useAuth();
  const loginPrompt = useLoginPrompt();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showExhibitionModal, setShowExhibitionModal] = useState(false);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [userExhibitions, setUserExhibitions] = useState<any[]>([]);
  const [addingToExhibition, setAddingToExhibition] = useState(false);
  
  // Get the appropriate image URL (prefer small image for list view)
  const imageUrl = artwork.smallImageUrl || artwork.imageUrl;

  // Check if this artwork is already in favorites when component loads
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!token || !artwork || favoritesLoaded) {
        console.log('Skipping favorite check:', { hasToken: !!token, hasArtwork: !!artwork, favoritesLoaded });
        return;
      }

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
          (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'https://exhibition-curator-backend.onrender.com/api');
        
        console.log('Checking favorite status for:', artwork.title);
        console.log('API URL:', `${API_BASE_URL}/favorites`);
        
        const response = await fetch(`${API_BASE_URL}/favorites`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Favorites response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Favorites data:', data);
          const artworkId = artwork.objectID?.toString() || artwork.id;
          
          // Check if this artwork is in the favorites
          const isAlreadyFavorite = data.favorites?.some((fav: any) => 
            fav.artworkId === artworkId
          );
          
          console.log('Is already favorite:', isAlreadyFavorite, 'for artwork ID:', artworkId);
          setIsFavorite(isAlreadyFavorite || false);
        } else {
          console.error('Failed to fetch favorites:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      } finally {
        setFavoritesLoaded(true);
      }
    };

    checkFavoriteStatus();
  }, [token, artwork, favoritesLoaded]);
  
  // Get collection name from source
  const getCollectionName = (source: string) => {
    if (!source) return 'Unknown Collection';
    
    const normalizedSource = source.toLowerCase().trim();
    
    switch (normalizedSource) {
      case 'met':
      case 'metropolitan':
      case 'metmuseum':
        return 'Metropolitan Museum of Art';
      case 'rijks':
      case 'rijksmuseum':
        return 'Rijksmuseum';

      case 'va':
      case 'v&a':
      case 'vam':
      case 'victoria':
      case 'victoria and albert':
      case 'victoria & albert':
        return 'Victoria & Albert Museum';
      default:
        // For debugging - show the actual source value
        console.log('Unknown source value:', source);
        return `${source} Collection`;
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(artwork);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    console.log('Favorite button clicked for:', artwork?.title);
    console.log('Current favorite status:', isFavorite);
    console.log('Has token:', !!token);
    
    // Use requireAuth to check login and prompt if needed
    loginPrompt.requireAuth(async () => {
      if (!token || !artwork) {
        console.log('Missing token or artwork');
        return;
      }

      setLoading(true);
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
          (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'https://exhibition-curator-backend.onrender.com/api');
        
        // Use the artwork's existing id field - backend will handle normalization
        const artworkId = artwork.id;
        const method = isFavorite ? 'DELETE' : 'POST';
        const endpoint = isFavorite 
          ? `${API_BASE_URL}/favorites/${artworkId}`
          : `${API_BASE_URL}/favorites`;

        // Send the artwork data as-is - backend will normalize it
        const requestPayload = {
          id: artwork.id,
          source: artwork.source,
          title: artwork.title,
          artist: artwork.artist,
          artistBio: artwork.artistBio,
          culture: artwork.culture,
          date: artwork.date,
          medium: artwork.medium,
          dimensions: artwork.dimensions,
          department: artwork.department,
          description: artwork.description,
          imageUrl: artwork.imageUrl,
          smallImageUrl: artwork.smallImageUrl,
          additionalImages: artwork.additionalImages,
          museumUrl: artwork.museumUrl,
          isHighlight: artwork.isHighlight,
          isPublicDomain: artwork.isPublicDomain,
          tags: artwork.tags
        };

        const body = isFavorite ? undefined : JSON.stringify(requestPayload);

        console.log('Making request to:', endpoint);
        console.log('Method:', method);
        console.log('Request payload:', requestPayload);

        const response = await fetch(endpoint, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          ...(body && { body })
        });

        console.log('Response status:', response.status);
        const responseData = await response.text();
        console.log('Response data:', responseData);

        if (response.ok) {
          console.log('Successfully toggled favorite');
          setIsFavorite(!isFavorite);
        } else {
          console.error('Failed to toggle favorite:', response.status, responseData);
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
      } finally {
        setLoading(false);
      }
    }, 'favorite-artwork', { artworkTitle: artwork?.title });
  };

  const handleAddToExhibitionClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
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
        artworkId: artwork.objectID?.toString() || artwork.id,
        title: artwork.title,
        artist: artwork.artist,
        date: artwork.date,
        medium: artwork.medium,
        department: artwork.department,
        culture: artwork.culture,
        dimensions: artwork.dimensions,
        imageUrl: artwork.imageUrl,
        primaryImageSmall: artwork.smallImageUrl,
        additionalImages: artwork.additionalImages || [],
        tags: artwork.tags || [],
        description: artwork.description,
        museumSource: artwork.source || 'met',
        isHighlight: artwork.isHighlight || false
      };

      const response = await fetch(`${API_BASE_URL}/exhibitions/${exhibitionId}/artworks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(artworkData)
      });

      if (response.ok) {
        // Success feedback could be added here
        setShowExhibitionModal(false);
        console.log('Artwork added to exhibition successfully');
      } else {
        throw new Error('Failed to add artwork to exhibition');
      }
    } catch (error) {
      console.error('Error adding to exhibition:', error);
    } finally {
      setAddingToExhibition(false);
    }
  };

  return (
    <div 
      className={`bg-white border border-black rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
        onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''
      }`}
      onClick={handleClick}
    >
      {/* Image container */}
      <div className="relative h-48 w-full bg-gray-200 group">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={artwork.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Floating action buttons */}
        {(showFavoriteButton || showAddToExhibition) && (
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Add to Exhibition button */}
            {showAddToExhibition && (
              <button
                onClick={handleAddToExhibitionClick}
                disabled={loading}
                className="p-2 rounded-full transition-all transform hover:scale-110 bg-white text-black border border-black shadow-lg hover:bg-gray-50"
                title="Add to Exhibition"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </button>
            )}
            
            {/* Favorite button */}
            {showFavoriteButton && (
              <button
                onClick={handleFavoriteClick}
                disabled={loading}
                className={`p-2 rounded-full transition-all transform hover:scale-110 backdrop-blur-sm ${
                  isFavorite
                    ? 'text-red-500 bg-white shadow-lg border border-black'
                    : 'text-white bg-black hover:bg-gray-800'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? (
                  // Filled heart
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                ) : (
                  // Empty heart outline
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                  </svg>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-lg text-black mb-2 line-clamp-2">
          {artwork.title}
        </h3>

        {/* Artist */}
        {artwork.artist && (
          <p className="text-gray-600 mb-2 text-sm">
            by {artwork.artist}
          </p>
        )}

        {/* Date */}
        {artwork.date && (
          <p className="text-gray-500 mb-3 text-sm">
            {artwork.date}
          </p>
        )}

        {/* Collection badge */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black text-white">
            {getCollectionName(artwork.source)}
          </span>
          
          {artwork.isHighlight && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white border border-black text-black">
              ⭐ Highlight
            </span>
          )}
        </div>

        {/* Department */}
        {artwork.department && (
          <p className="text-gray-500 mt-2 text-xs">
            {artwork.department}
          </p>
        )}
      </div>

      {/* Exhibition Selection Modal */}
      {showExhibitionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowExhibitionModal(false)}>
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
            
            <p className="text-black mb-4">Select an exhibition to add "{artwork.title}" to:</p>
            
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
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
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