'use client';

import { useState, useEffect } from 'react';
// Using simple SVG icons instead of external dependencies

export interface Exhibition {
  _id?: string; // For compatibility with some endpoints
  id?: string;  // Backend returns this field for user exhibitions
  title: string;
  description: string;
  theme: string;
  isPublic: boolean;
  tags: string[];
  artworks: any[];
  shareableLink?: string;
  createdAt: string;
  updatedAt: string;
  curator?: {
    username: string;
    fullName: string;
  };
}

interface ExhibitionSearchProps {
  onSearch: (filters: SearchFilters) => void;
  loading?: boolean;
}

interface SearchFilters {
  query: string;
  theme: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  publicOnly: boolean;
}

const themes = [
  'All Themes',
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

export default function ExhibitionSearch({ onSearch, loading = false }: ExhibitionSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '', // Empty by default to show all exhibitions
    theme: 'All Themes',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    publicOnly: false // Changed to false to show all exhibitions
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Only trigger search on manual changes, not automatic ones
  useEffect(() => {
    // Don't auto-search to prevent rate limiting - require manual search button
    console.log('🔍 ExhibitionSearch: Filters updated:', filters);
  }, [filters, onSearch]);

  // Disable automatic initial search to prevent rate limiting
  // Users must manually search to avoid overwhelming the API

  const handleInputChange = (field: keyof SearchFilters, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      theme: 'All Themes',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      publicOnly: false
    });
  };

  const hasActiveFilters = filters.query || filters.theme !== 'All Themes' || !filters.publicOnly;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-black p-6 mb-6">
      <form onSubmit={handleSubmit}>
        {/* Main search bar */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <svg className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search exhibitions by title, description, or tags..."
              value={filters.query}
              onChange={(e) => handleInputChange('query', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-black rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Search
          </button>
          
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 px-4 py-3 border border-black rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>

        {/* Advanced filters */}
        {showAdvanced && (
          <div className="border-t border-black pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Theme filter */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Theme
                </label>
                <select
                  value={filters.theme}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-black rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  {themes.map(theme => (
                    <option key={theme} value={theme}>{theme}</option>
                  ))}
                </select>
              </div>

              {/* Sort by */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Sort by
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleInputChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-black rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="updatedAt">Updated Date</option>
                  <option value="title">Title</option>
                  <option value="artworksCount">Artwork Count</option>
                </select>
              </div>

              {/* Sort order */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Order
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleInputChange('sortOrder', e.target.value as 'asc' | 'desc')}
                  className="w-full px-3 py-2 border border-black rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Additional options */}
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.publicOnly}
                  onChange={(e) => handleInputChange('publicOnly', e.target.checked)}
                  className="h-4 w-4 text-black focus:ring-gray-500 border-black rounded"
                />
                <span className="ml-2 text-sm text-black">
                  Public exhibitions only
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.query && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black text-white">
                Search: "{filters.query}"
              </span>
            )}
            {filters.theme !== 'All Themes' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black text-white">
                Theme: {filters.theme}
              </span>
            )}
            {!filters.publicOnly && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black text-white">
                All exhibitions
              </span>
            )}
          </div>
        )}
      </form>
    </div>
  );
}