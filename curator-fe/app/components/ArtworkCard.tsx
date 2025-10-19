import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { StandardizedArtwork } from '../types/artwork';
import { useAuth } from '../contexts/AuthContext';
import { useGuest } from '../contexts/GuestContext';
import { useTutorial } from '../contexts/TutorialContext';
import { useLoginPrompt } from '../hooks/useLoginPrompt';
import { useNotifications } from '../hooks/useNotifications';
import LoginPromptModal from './LoginPromptModal';
import CreateExhibitionModal from './CreateExhibitionModal';
import GuestExhibitionModal from './GuestExhibitionModal';

interface ArtworkCardProps {
  artwork: StandardizedArtwork;
  onClick?: (artwork: StandardizedArtwork) => void;
  showQuickInfo?: boolean;
  showAddToExhibition?: boolean;
}

export default function ArtworkCard({ artwork, onClick, showQuickInfo = true, showAddToExhibition = true }: ArtworkCardProps) {
  const { user, token } = useAuth();
  const { guestExhibitions, addArtworkToGuestExhibition } = useGuest();
  const { markStepComplete } = useTutorial();
  const { showSuccess, showError } = useNotifications();
  const loginPrompt = useLoginPrompt();
  const [showExhibitionDropdown, setShowExhibitionDropdown] = useState(false);
  const [showCreateExhibitionModal, setShowCreateExhibitionModal] = useState(false);
  const [showGuestExhibitionModal, setShowGuestExhibitionModal] = useState(false);
  const [userExhibitions, setUserExhibitions] = useState<any[]>([]);
  const [addingToExhibition, setAddingToExhibition] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
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

    const handleAddToExhibitionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (user) {
      // User is logged in, fetch their exhibitions
      loginPrompt.requireAuth(async () => {
        if (!token) return;
        await fetchUserExhibitions();
        setShowExhibitionDropdown(true);
        
        // Tutorial progression: mark add-to-exhibition step complete
        markStepComplete('add-to-exhibition');
      }, 'add-to-exhibition', { artworkTitle: artwork?.title });
    } else {
      // Guest user, show guest exhibitions or prompt to create
      setShowExhibitionDropdown(true);
      
      // Tutorial progression: mark add-to-exhibition step complete
      markStepComplete('add-to-exhibition');
    }
  };

  // Close dropdown when clicking outside (but not on mouse movement)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowExhibitionDropdown(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowExhibitionDropdown(false);
      }
    };

    if (showExhibitionDropdown) {
      // Only listen for clicks, not mouse movements
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [showExhibitionDropdown]);

  const handleCreateNewExhibition = () => {
    console.log('Creating new exhibition clicked');
    setShowExhibitionDropdown(false);
    
    if (user) {
      setShowCreateExhibitionModal(true);
    } else {
      setShowGuestExhibitionModal(true);
    }
  };

  const handleExhibitionCreated = (newExhibition: any) => {
    // Add the artwork to the newly created exhibition
    if (newExhibition && newExhibition._id) {
      addToExhibition(newExhibition._id);
      
      // Tutorial progression: mark create-exhibition step complete
      markStepComplete('create-exhibition');
    }
  };

  const handleGuestExhibitionCreated = (newExhibition: any) => {
    // Add the artwork to the newly created guest exhibition
    if (newExhibition && newExhibition.id) {
      addToGuestExhibition(newExhibition.id);
      
      // Tutorial progression: mark create-exhibition step complete
      markStepComplete('create-exhibition');
    }
  };

  const fetchUserExhibitions = async () => {
    if (!token) return;
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:9090/api');
      const response = await fetch(`${API_BASE_URL}/exhibitions/user`, {
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

  const addToGuestExhibition = async (exhibitionId: string) => {
    if (!artwork) return;

    setAddingToExhibition(true);
    try {
      // Create artwork data for guest exhibition
      const artworkData = {
        artworkId: artwork.objectID?.toString() || artwork.id,
        title: artwork.title || 'Untitled',
        artist: artwork.artist || 'Unknown Artist',
        date: artwork.date || '',
        medium: artwork.medium || '',
        department: artwork.department || '',
        culture: artwork.culture || '',
        dimensions: artwork.dimensions || '',
        imageUrl: artwork.imageUrl || '',
        primaryImageSmall: artwork.smallImageUrl || '',
        additionalImages: artwork.additionalImages || [],
        tags: artwork.tags || [],
        description: artwork.description || '',
        museumSource: artwork.source?.toLowerCase() || 'other',
        isHighlight: artwork.isHighlight || false
      };

      // Add artwork to guest exhibition
      addArtworkToGuestExhibition(exhibitionId, artworkData);
      
      showSuccess(
        'Artwork Added',
        `Added "${artworkData.title}" to guest exhibition`
      );

      setShowExhibitionDropdown(false);
    } catch (error) {
      console.error('Error adding artwork to guest exhibition:', error);
      showError(
        'Error',
        'Failed to add artwork to exhibition'
      );
    } finally {
      setAddingToExhibition(false);
    }
  };

  const addToExhibition = async (exhibitionId: string) => {
    if (!token || !artwork) return;

    setAddingToExhibition(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:9090/api');
      
      // Map museum sources to backend expected values
      const mapMuseumSource = (source: string) => {
        const normalizedSource = source?.toLowerCase() || '';
        switch (normalizedSource) {
          case 'met':
          case 'metropolitan':
          case 'metmuseum':
            return 'met';
          case 'rijks':
          case 'rijksmuseum':
            return 'rijks';
          case 'va':
          case 'v&a':
          case 'vam':
          case 'victoria':
          case 'victoria and albert':
          case 'victoria & albert':
            return 'other'; // VA maps to 'other'
          default:
            return 'other';
        }
      };

      const artworkData = {
        artworkId: artwork.objectID?.toString() || artwork.id,
        title: artwork.title || 'Untitled',
        artist: artwork.artist || 'Unknown Artist',
        date: artwork.date || '',
        medium: artwork.medium || '',
        department: artwork.department || '',
        culture: artwork.culture || '',
        dimensions: artwork.dimensions || '',
        imageUrl: artwork.imageUrl || '',
        primaryImageSmall: artwork.smallImageUrl || '',
        additionalImages: artwork.additionalImages || [],
        tags: artwork.tags || [],
        description: artwork.description || '',
        museumSource: mapMuseumSource(artwork.source),
        isHighlight: artwork.isHighlight || false
      };

      console.log('Mapped museum source:', artwork.source, '->', artworkData.museumSource);

      // Validate required fields
      if (!artworkData.artworkId) {
        throw new Error('Artwork ID is required but missing');
      }
      if (!artworkData.title || artworkData.title === 'Untitled') {
        console.warn('Artwork title is missing or generic');
      }
      
      // Quick check: verify exhibition exists first
      console.log('Verifying exhibition exists...');
      try {
        const checkResponse = await fetch(`${API_BASE_URL}/exhibitions/${exhibitionId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!checkResponse.ok) {
          throw new Error(`Exhibition verification failed: ${checkResponse.status}`);
        }
        console.log('✓ Exhibition exists and is accessible');
      } catch (checkError) {
        console.error('Exhibition verification failed:', checkError);
        throw new Error('Cannot access exhibition. It may not exist or you may not have permission.');
      }

      console.log('Adding artwork to exhibition:', {
        exhibitionId,
        endpoint: `${API_BASE_URL}/exhibitions/${exhibitionId}/artworks`,
        authTokenExists: !!token,
        authTokenLength: token?.length
      });
      
      console.log('Full artwork data being sent:', JSON.stringify(artworkData, null, 2));

      // First, let's test with minimal required data
      const minimalArtworkData = {
        artworkId: artworkData.artworkId,
        title: artworkData.title,
        museumSource: artworkData.museumSource
      };
      
      console.log('Trying minimal artwork data first:', minimalArtworkData);

      const response = await fetch(`${API_BASE_URL}/exhibitions/${exhibitionId}/artworks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(minimalArtworkData)
      });

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        setShowExhibitionDropdown(false);
        // Show success message
        alert('✓ Artwork added to exhibition successfully!');
        console.log('Artwork added to exhibition successfully');
      } else {
        let errorDetails;
        try {
          const errorText = await response.text();
          console.log('Raw error response:', errorText);
          
          // Try to parse as JSON first, then fall back to plain text
          try {
            errorDetails = JSON.parse(errorText);
            console.error('Parsed error response:', errorDetails);
          } catch (parseError) {
            errorDetails = { message: errorText };
            console.error('Plain text error response:', errorText);
          }
        } catch (readError) {
          console.error('Could not read response text:', readError);
          errorDetails = { message: 'Could not read error response' };
        }

        console.error('Failed to add artwork to exhibition:', {
          status: response.status,
          statusText: response.statusText,
          error: errorDetails
        });
        
        const errorMessage = errorDetails?.message || errorDetails?.error || `Server error (${response.status})`;
        throw new Error(`Failed to add artwork to exhibition: ${response.status} - ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error adding to exhibition:', error);
      alert('❌ Failed to add artwork to exhibition. Please try again.');
    } finally {
      setAddingToExhibition(false);
    }
  };

  return (
    <div 
      className={`relative bg-white border border-black rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
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
        {showAddToExhibition && (
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Add to Exhibition button */}
            <button
              ref={buttonRef}
              onClick={handleAddToExhibitionClick}
              className="p-2 rounded-full transition-all transform hover:scale-110 bg-white text-black border border-black shadow-lg hover:bg-gray-50"
              title="Add to Exhibition"
              data-tutorial="add-button"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 4v16m8-8H4" />
              </svg>
            </button>
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

      {/* Create Exhibition Modal */}
      <CreateExhibitionModal
        isOpen={showCreateExhibitionModal}
        onClose={() => setShowCreateExhibitionModal(false)}
        onSuccess={handleExhibitionCreated}
      />

      {/* Guest Exhibition Modal */}
      <GuestExhibitionModal
        isOpen={showGuestExhibitionModal}
        onClose={() => setShowGuestExhibitionModal(false)}
        onSuccess={handleGuestExhibitionCreated}
      />

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={loginPrompt.isOpen}
        onClose={loginPrompt.hideLoginPrompt}
        onLoginSuccess={loginPrompt.handleLoginSuccess}
        trigger={loginPrompt.trigger}
        artworkTitle={loginPrompt.artworkTitle}
      />

      {/* Exhibition Selection Overlay */}
      {showExhibitionDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute inset-0 bg-white text-black p-4 flex flex-col items-center z-50 rounded-lg border border-black"
          onClick={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onMouseEnter={(e) => e.stopPropagation()}
          onMouseLeave={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Close button clicked');
              setShowExhibitionDropdown(false);
            }}
            className="absolute top-3 right-3 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors text-black"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Title */}
          <h3 className="text-lg font-semibold mb-4 text-center text-black">Add to Exhibition</h3>

          {/* Exhibition List */}
          <div className="w-full overflow-y-auto space-y-2">
            {/* Create New Exhibition Option */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Create New Exhibition button clicked');
                handleCreateNewExhibition();
              }}
              className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-3 text-black border border-gray-300"
            >
              <div className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-medium text-black">Create New Exhibition</div>
              </div>
            </button>

            {/* Existing Exhibitions */}
            {user ? (
              // Show user exhibitions for logged-in users
              userExhibitions.length === 0 ? (
                <div className="text-center py-4 text-gray-600">
                  <p className="text-sm">No exhibitions yet.</p>
                </div>
              ) : (
                userExhibitions.map((exhibition) => (
                  <button
                    key={exhibition._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Exhibition selected:', exhibition.title);
                      addToExhibition(exhibition._id);
                    }}
                    disabled={addingToExhibition}
                    className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 text-left border border-gray-200"
                  >
                    <div className="font-medium line-clamp-1 text-black">{exhibition.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {exhibition.artworks?.length || 0} artworks
                    </div>
                  </button>
                ))
              )
            ) : (
              // Show guest exhibitions for guest users
              guestExhibitions.length === 0 ? (
                <div className="text-center py-4 text-gray-600">
                  <p className="text-sm">No exhibitions yet.</p>
                  <p className="text-xs text-gray-500 mt-1">Create your first exhibition to get started!</p>
                </div>
              ) : (
                guestExhibitions.map((exhibition) => (
                  <button
                    key={exhibition.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Guest exhibition selected:', exhibition.title);
                      addToGuestExhibition(exhibition.id);
                    }}
                    disabled={addingToExhibition}
                    className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 text-left border border-gray-200"
                  >
                    <div className="font-medium line-clamp-1 text-black">{exhibition.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {exhibition.artworks?.length || 0} artworks
                      <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">Guest</span>
                    </div>
                  </button>
                ))
              )
            )}
          </div>

          {/* Loading State */}
          {addingToExhibition && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent"></div>
              <span className="ml-2 text-sm text-black">Adding...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}