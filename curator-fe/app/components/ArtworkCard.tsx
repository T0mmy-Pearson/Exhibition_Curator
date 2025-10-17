import Image from 'next/image';
import { useState } from 'react';
import { StandardizedArtwork } from '../types/artwork';
import { useAuth } from '../contexts/AuthContext';
import { useLoginPrompt } from '../hooks/useLoginPrompt';
import LoginPromptModal from './LoginPromptModal';

interface ArtworkCardProps {
  artwork: StandardizedArtwork;
  onClick?: (artwork: StandardizedArtwork) => void;
  showQuickInfo?: boolean;
  showFavoriteButton?: boolean;
}

export default function ArtworkCard({ artwork, onClick, showQuickInfo = true, showFavoriteButton = true }: ArtworkCardProps) {
  const { user, token } = useAuth();
  const loginPrompt = useLoginPrompt();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  // Get the appropriate image URL (prefer small image for list view)
  const imageUrl = artwork.smallImageUrl || artwork.imageUrl;
  
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
    
    // Use requireAuth to check login and prompt if needed
    loginPrompt.requireAuth(async () => {
      if (!token || !artwork) return;

      setLoading(true);
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:9090/api');
        const artworkId = artwork.objectID?.toString() || artwork.id;
        const method = isFavorite ? 'DELETE' : 'POST';
        const endpoint = isFavorite 
          ? `${API_BASE_URL}/users/favorites/${artworkId}`
          : `${API_BASE_URL}/users/favorites`;

        const body = isFavorite ? undefined : JSON.stringify({
          artworkId: artworkId,
          title: artwork.title,
          artist: artwork.artist,
          date: artwork.date,
          medium: artwork.medium,
          imageUrl: artwork.imageUrl,
          department: artwork.department,
          culture: artwork.culture,
          museumSource: artwork.source || 'unknown'
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
          setIsFavorite(!isFavorite);
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
      } finally {
        setLoading(false);
      }
    }, 'favorite-artwork', { artworkTitle: artwork?.title });
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

        {/* Floating heart button */}
        {showFavoriteButton && (
          <button
            onClick={handleFavoriteClick}
            disabled={loading}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all transform hover:scale-110 opacity-0 group-hover:opacity-100 backdrop-blur-sm ${
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