'use client';

import { useState, useEffect } from 'react';
// Using simple SVG icons instead of external dependencies

export interface Exhibition {
  _id?: string; // For compatibility with some endpoints
  id?: string;  // Backend returns this field for user exhibitions
  title: string;
  description: string;
  theme: string;
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

  const hasActiveFilters = filters.query || filters.theme !== 'All Themes';

  return (
    <div className="bg-gray-50 border border-black p-6 mb-6 relative overflow-hidden">
      {/* Abstract shape accent */}
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-black transform rotate-45"></div>
      
      <form onSubmit={handleSubmit}>
        {/* Main search bar */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <div className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center">
              <div className="w-3 h-3 border border-gray-400 rounded-full"></div>
            </div>
            <input
              type="text"
              placeholder="Search exhibitions by title, description, or tags..."
              value={filters.query}
              onChange={(e) => handleInputChange('query', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-black focus:ring-2 focus:ring-black focus:border-black bg-white"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent"></div>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors relative"
          >
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white transform rotate-45"></div>
            Search
          </button>
          
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 px-4 py-3 border border-black hover:bg-gray-100 transition-colors relative"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <div className="w-3 h-1 bg-black"></div>
            </div>
            Filters
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-3 text-black hover:bg-gray-100 transition-colors relative"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-3 h-3 border border-black transform rotate-45"></div>
              </div>
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

          </div>
        )}
      </form>
    </div>
  );
}