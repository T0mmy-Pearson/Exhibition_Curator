'use client';

import { Exhibition } from './ExhibitionSearch';

interface ExhibitionCardProps {
  exhibition: Exhibition;
  onClick?: (exhibition: Exhibition) => void;
  showCurator?: boolean;
}

export default function ExhibitionCard({ 
  exhibition, 
  onClick, 
  showCurator = true 
}: ExhibitionCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getThemeColor = (theme: string) => {
    const colors: { [key: string]: string } = {
      'Renaissance': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      'Impressionism': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Post-Impressionism': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Modern Art': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Contemporary': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Ancient Art': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Asian Art': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Cubism': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Pop Art': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return colors[theme] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 ${
        onClick ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : ''
      }`}
      onClick={() => onClick?.(exhibition)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {exhibition.title}
          </h3>
          {showCurator && exhibition.curator && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              by {exhibition.curator.fullName || exhibition.curator.username}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {exhibition.isPublic && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Public
            </span>
          )}
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getThemeColor(exhibition.theme)}`}>
            {exhibition.theme}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
        {exhibition.description}
      </p>

      {/* Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
        <div className="flex flex-wrap gap-2">
          {exhibition.tags.slice(0, 4).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              #{tag}
            </span>
          ))}
          {exhibition.tags.length > 4 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{exhibition.tags.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      {onClick && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors">
            View Exhibition →
          </button>
        </div>
      )}
    </div>
  );
}