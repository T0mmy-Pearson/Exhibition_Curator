import Image from 'next/image';
import { StandardizedArtwork } from '../types/artwork';

interface ArtworkCardProps {
  artwork: StandardizedArtwork;
  onClick?: (artwork: StandardizedArtwork) => void;
}

export default function ArtworkCard({ artwork, onClick }: ArtworkCardProps) {
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
      case 'fitzwilliam':
      case 'fitz':
      case 'fitzwilliam museum':
        return 'Fitzwilliam Museum';
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

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
        onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''
      }`}
      onClick={handleClick}
    >
      {/* Image container */}
      <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={artwork.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
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
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
          {artwork.title}
        </h3>

        {/* Artist */}
        {artwork.artist && (
          <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm">
            by {artwork.artist}
          </p>
        )}

        {/* Date */}
        {artwork.date && (
          <p className="text-gray-500 dark:text-gray-400 mb-3 text-sm">
            {artwork.date}
          </p>
        )}

        {/* Collection badge */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {getCollectionName(artwork.source)}
          </span>
          
          {artwork.isHighlight && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              ⭐ Highlight
            </span>
          )}
        </div>

        {/* Department */}
        {artwork.department && (
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-xs">
            {artwork.department}
          </p>
        )}
      </div>
    </div>
  );
}