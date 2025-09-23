'use client';

import { useState } from 'react';

interface ArtworkSearchProps {
  onSearch: (searchTerm: string, source: string) => void;
  initialSearchTerm?: string;
  initialSource?: string;
}

export default function ArtworkSearch({ 
  onSearch, 
  initialSearchTerm = 'painting',
  initialSource = 'all'
}: ArtworkSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [source, setSource] = useState(initialSource);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm, source);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search input */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Artworks
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter search term (e.g., painting, sculpture, portrait)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* Source selector */}
          <div className="md:w-48">
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Museum Collection
            </label>
            <select
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Museums</option>
              <option value="met">Metropolitan Museum</option>
              <option value="fitzwilliam">Fitzwilliam Museum</option>
              <option value="rijks">Rijksmuseum</option>
            </select>
          </div>

          {/* Search button */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Quick search suggestions */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Quick searches:</span>
          {['painting', 'sculpture', 'portrait', 'landscape', 'ancient'].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setSearchTerm(term);
                onSearch(term, source);
              }}
              className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}