'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CreateExhibitionData, Exhibition } from '../types/exhibition';
import { useLoginPrompt } from '../hooks/useLoginPrompt';
import LoginPromptModal from './LoginPromptModal';

interface CreateExhibitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (exhibition: Exhibition) => void;
}

export default function CreateExhibitionModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateExhibitionModalProps) {
  const { user, token } = useAuth();
  const loginPrompt = useLoginPrompt();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [exhibitionName, setExhibitionName] = useState('');
  const [description, setDescription] = useState('');
  const [curatorName, setCuratorName] = useState(user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || '');
  const [theme, setTheme] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Handle tag addition
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle Enter key in tag input
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Reset form
  const resetForm = () => {
    setExhibitionName('');
    setDescription('');
    setTheme('');
    setTags([]);
    setTagInput('');
    setIsPublic(false);
    setError(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !token) {
      loginPrompt.promptForExhibition(() => {
        // Retry after login
        handleSubmit(e);
      });
      return;
    }

    if (!exhibitionName.trim()) {
      setError('Exhibition name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:9090/api');
      
      const exhibitionData: CreateExhibitionData = {
        title: exhibitionName.trim(),
        description: description.trim(),
        theme: theme.trim() || 'Mixed',
        isPublic,
        tags: tags.length > 0 ? tags : [theme.toLowerCase().trim()].filter(Boolean)
      };

      console.log('Creating exhibition with data:', exhibitionData);
      console.log('API endpoint:', `${API_BASE_URL}/exhibitions`);
      console.log('Auth token present:', !!token);
      console.log('Token length:', token?.length);
      console.log('Token starts with:', token?.substring(0, 10));
      console.log('Full headers:', {
        'Authorization': token ? `Bearer ${token.substring(0, 20)}...` : 'No token',
        'Content-Type': 'application/json'
      });

      console.log('Making API request...');
      const response = await fetch(`${API_BASE_URL}/exhibitions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(exhibitionData)
      });

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        console.error('Exhibition creation failed:', {
          status: response.status,
          statusText: response.statusText,
          url: `${API_BASE_URL}/exhibitions`,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Try to get response text first, then parse as JSON
        let errorMessage = 'Failed to create exhibition';
        try {
          const responseText = await response.text();
          console.error('Raw response text:', responseText);
          
          if (responseText) {
            try {
              const errorData = JSON.parse(responseText);
              console.error('Parsed error response:', errorData);
              errorMessage = errorData.message || errorData.error || errorData.msg || errorMessage;
            } catch (jsonError) {
              console.error('Could not parse as JSON:', jsonError);
              errorMessage = `Server error (${response.status}): ${responseText}`;
            }
          } else {
            errorMessage = `Server error (${response.status}): ${response.statusText}`;
          }
        } catch (textError) {
          console.error('Could not read response text:', textError);
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Reset form and close modal
      resetForm();
      onClose();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(data.exhibition);
      }

      // Show success message (you might want to implement a toast system)
      console.log('Exhibition created successfully:', data.exhibition);

    } catch (err) {
      console.error('Error creating exhibition:', err);
      setError(err instanceof Error ? err.message : 'Failed to create exhibition');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-black">Create New Exhibition</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-black rounded-md hover:bg-gray-100 disabled:opacity-50"
            title="Close"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Exhibition Name */}
          <div>
            <label htmlFor="exhibition-name" className="block text-sm font-medium text-gray-700 mb-2">
              Exhibition Name *
            </label>
            <input
              type="text"
              id="exhibition-name"
              value={exhibitionName}
              onChange={(e) => setExhibitionName(e.target.value)}
              placeholder="Enter exhibition name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              maxLength={100}
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">{exhibitionName.length}/100 characters</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your exhibition..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none"
              maxLength={500}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
          </div>

          {/* Curator Name */}
          <div>
            <label htmlFor="curator-name" className="block text-sm font-medium text-gray-700 mb-2">
              Curator Name
            </label>
            <input
              type="text"
              id="curator-name"
              value={curatorName}
              onChange={(e) => setCuratorName(e.target.value)}
              placeholder="Your name as curator..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              maxLength={50}
              disabled={loading}
            />
          </div>

          {/* Theme */}
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <input
              type="text"
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g., Renaissance, Modern Art, Photography..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              maxLength={30}
              disabled={loading}
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add tags (press Enter)..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                maxLength={20}
                disabled={loading || tags.length >= 10}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 10 || loading}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            
            {/* Tag display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={loading}
                      className="ml-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {tags.length}/10 tags • Tags help others discover your exhibition
            </p>
          </div>

          {/* Public/Private toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Public Exhibition</h3>
              <p className="text-sm text-gray-500">
                Make this exhibition discoverable by other users
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 ${
                isPublic ? 'bg-black' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !exhibitionName.trim()}
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Exhibition'
              )}
            </button>
          </div>
        </form>

        {/* Login Prompt Modal */}
        <LoginPromptModal
          isOpen={loginPrompt.isOpen}
          onClose={loginPrompt.hideLoginPrompt}
          onLoginSuccess={loginPrompt.handleLoginSuccess}
          trigger={loginPrompt.trigger}
          artworkTitle={loginPrompt.artworkTitle}
        />
      </div>
    </div>
  );
}