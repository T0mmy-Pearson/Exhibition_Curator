'use client';

import { useState, useEffect } from 'react';
import { Exhibition } from './ExhibitionSearch';

interface ExhibitionCardProps {
  exhibition: Exhibition;
  onClick?: (exhibition: Exhibition) => void;
  showCurator?: boolean;
  isOwner?: boolean;
  onDelete?: (exhibitionId: string) => void;
  onNotification?: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export default function ExhibitionCard({ 
  exhibition, 
  onClick, 
  showCurator = true,
  isOwner = false,
  onDelete,
  onNotification
}: ExhibitionCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsDropdownOpen(false);
    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isDropdownOpen]);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md border border-black p-6 transition-all duration-200 relative flex flex-col min-h-[300px] ${
        onClick ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : ''
      }`}
      onClick={() => onClick?.(exhibition)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-black mb-2 line-clamp-2">
            {exhibition.title}
          </h3>
          {showCurator && exhibition.curator && (
            <p className="text-sm text-black mb-2">
              by {exhibition.curator.fullName || exhibition.curator.username}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {exhibition.isPublic && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-black border border-black">
              Public
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-black mb-4 line-clamp-3 flex-grow">
        {exhibition.description}
      </p>

      {/* Stats */}
      <div className="flex items-center justify-between mb-3 mt-auto">
        <div className="flex items-center gap-4 text-sm text-black">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {exhibition.artworks?.length || 0} artworks
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDate(exhibition.createdAt)}
          </span>
        </div>
      </div>

      {/* Tags */}
      {exhibition.tags && exhibition.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {exhibition.tags.slice(0, 4).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-black border border-black"
            >
              #{tag}
            </span>
          ))}
          {exhibition.tags.length > 4 && (
            <span className="text-xs text-black">
              +{exhibition.tags.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      {onClick && (
        <div className={`pt-3 border-t border-black ${isOwner ? 'pr-12' : ''}`}>
          <button className="text-black hover:text-gray-600 text-sm font-medium transition-colors">
            View Exhibition →
          </button>
        </div>
      )}

      {/* Owner Actions Dropdown */}
      {isOwner && (
        <div className="absolute bottom-4 right-4">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="p-2 bg-white hover:bg-gray-100 rounded-lg shadow-md border border-gray-300 transition-colors"
              title="More options"
            >
              <svg className="h-4 w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            
            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Copy shareable link to clipboard
                    const shareUrl = `${window.location.origin}/exhibitions/${exhibition.shareableLink || exhibition._id}`;
                    navigator.clipboard.writeText(shareUrl).then(() => {
                      if (onNotification) {
                        onNotification('success', 'Link Copied', 'Exhibition link copied to clipboard!');
                      }
                    }).catch(() => {
                      if (onNotification) {
                        onNotification('error', 'Error', 'Failed to copy link to clipboard');
                      }
                    });
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <svg className="h-4 w-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Copy Link
                </button>
                
                <div className="border-t border-gray-100 my-1"></div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.((exhibition as any).id || exhibition._id);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                >
                  <svg className="h-4 w-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Exhibition
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}