'use client';

import { useState } from 'react';
import { useGuest } from '../contexts/GuestContext';
import { useAuth } from '../contexts/AuthContext';

interface GuestExhibitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (exhibitionId: string) => void;
}

const themes = [
  'Renaissance',
  'Impressionism', 
  'Post-Impressionism',
  'Modern Art',
  'Contemporary',
  'Ancient Art',
  'Asian Art',
  'Cubism',
  'Pop Art',
  'Mixed'
];

export default function GuestExhibitionModal({ isOpen, onClose, onSuccess }: GuestExhibitionModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('Mixed');
  const [tags, setTags] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { createGuestExhibition } = useGuest();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    setIsCreating(true);
    
    try {
      const exhibitionData = {
        title: title.trim(),
        description: description.trim(),
        theme,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        artworks: [],
      };

      const exhibitionId = createGuestExhibition(exhibitionData);
      
      // Reset form
      setTitle('');
      setDescription('');
      setTheme('Mixed');
      setTags('');
      
      onSuccess?.(exhibitionId);
      onClose();
    } catch (error) {
      console.error('Error creating guest exhibition:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 border-black max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Abstract accent */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-black transform rotate-45"></div>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black">Create Your Exhibition</h2>
          <button
            onClick={onClose}
            className="text-black hover:bg-gray-100 p-1 transition-colors"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-4 h-4 border border-black transform rotate-45"></div>
            </div>
          </button>
        </div>

        {!user && (
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200">
            <p className="text-sm text-gray-600">
              You&apos;re creating as a guest. Register later to save your work permanently!
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" data-tutorial="exhibition-form">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Exhibition Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-black focus:ring-2 focus:ring-black focus:border-black bg-white"
              placeholder="Enter exhibition title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-black focus:ring-2 focus:ring-black focus:border-black bg-white"
              rows={3}
              placeholder="Describe your exhibition theme and vision"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-3 py-2 border border-black focus:ring-2 focus:ring-black focus:border-black bg-white"
            >
              {themes.map(themeOption => (
                <option key={themeOption} value={themeOption}>
                  {themeOption}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-black focus:ring-2 focus:ring-black focus:border-black bg-white"
              placeholder="Enter tags separated by commas"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate tags with commas (e.g., portraits, oil painting, classical)
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-black text-black px-4 py-2 font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isCreating}
              className="flex-1 bg-black text-white px-4 py-2 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
            >
              {isCreating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Exhibition'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}