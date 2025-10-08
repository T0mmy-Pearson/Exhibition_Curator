'use client';

import { useState, useEffect } from 'react';
// Using simple SVG icons instead of external dependencies

export interface Exhibition {
  _id: string;
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
    query: '',
    theme: 'All Themes',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    publicOnly: true
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Trigger search when filters change
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      onSearch(filters);
    }, 300); // Debounce search

    return () => clearTimeout(delayedSearch);
  }, [filters, onSearch]);

  const handleInputChange = (field: keyof SearchFilters, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      theme: 'All Themes',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      publicOnly: true
    });
  };

  const hasActiveFilters = filters.query || filters.theme !== 'All Themes' || !filters.publicOnly;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
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
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Theme filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <select
                value={filters.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {themes.map(theme => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
            </div>

            {/* Sort by */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort by
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleInputChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
                <option value="title">Title</option>
                <option value="artworksCount">Artwork Count</option>
              </select>
            </div>

            {/* Sort order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleInputChange('sortOrder', e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
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
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Search: "{filters.query}"
            </span>
          )}
          {filters.theme !== 'All Themes' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Theme: {filters.theme}
            </span>
          )}
          {!filters.publicOnly && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              All exhibitions
            </span>
          )}
        </div>
      )}
    </div>
  );
}