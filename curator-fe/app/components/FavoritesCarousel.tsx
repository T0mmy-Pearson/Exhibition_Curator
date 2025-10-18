'use client';

import React, { useState, useEffect } from 'react';
import { StandardizedArtwork } from '../types/artwork';
import { useAuth } from '../contexts/AuthContext';

interface FavoritesCarouselProps {
  className?: string;
}

export default function FavoritesCarousel({ className = '' }: FavoritesCarouselProps) {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState<StandardizedArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
        (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'https://exhibition-curator-backend.onrender.com/api');

      const response = await fetch(`${API_BASE_URL}/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      } else {
        console.error('Failed to fetch favorites');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, favorites.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, favorites.length - 2)) % Math.max(1, favorites.length - 2));
  };

  const removeFavorite = async (artworkId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      if (!token) return;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
        (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'https://exhibition-curator-backend.onrender.com/api');

      const response = await fetch(`${API_BASE_URL}/favorites/${artworkId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(fav => fav.id !== artworkId));
        // Adjust current index if necessary
        if (currentIndex >= favorites.length - 3) {
          setCurrentIndex(Math.max(0, favorites.length - 4));
        }
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <h3 className="text-xl font-bold text-gray-900 mb-4">My Favorites</h3>
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-gray-500">No favorites yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Start exploring artworks and add them to your favorites!
          </p>
        </div>
      </div>
    );
  }

  const visibleFavorites = favorites.slice(currentIndex, currentIndex + 3);
  const canNavigate = favorites.length > 3;

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">My Favorites</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{favorites.length} artwork{favorites.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="relative">
        {/* Navigation buttons */}
        {canNavigate && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
              disabled={currentIndex === 0}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
              disabled={currentIndex >= favorites.length - 3}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Carousel content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleFavorites.map((artwork, index) => (
            <div
              key={artwork.id}
              className="relative group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(currentIndex + index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                {artwork.imageUrl ? (
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400 text-sm">No image</span>
                  </div>
                )}

                {/* Remove favorite button */}
                <button
                  onClick={(e) => removeFavorite(artwork.id, e)}
                  className="absolute top-3 right-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4 text-red-500 fill-current" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                {/* Hover overlay */}
                {hoveredIndex === currentIndex + index && (
                  <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col justify-end p-4 transition-all duration-300">
                    <div className="text-white space-y-2">
                      <h4 className="font-bold text-lg leading-tight line-clamp-2">
                        {artwork.title}
                      </h4>
                      
                      {artwork.artist && (
                        <p className="text-gray-300 text-sm">
                          by {artwork.artist}
                        </p>
                      )}

                      <div className="space-y-1 text-xs text-gray-300">
                        {artwork.date && (
                          <p>{artwork.date}</p>
                        )}
                        {artwork.culture && (
                          <p>{artwork.culture}</p>
                        )}
                        {artwork.medium && (
                          <p className="line-clamp-2">{artwork.medium}</p>
                        )}
                      </div>

                      {artwork.description && (
                        <p className="text-xs text-gray-300 line-clamp-3 mt-2">
                          {artwork.description}
                        </p>
                      )}

                      {/* Source and external link */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-600">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">
                          {artwork.source === 'met' ? 'Met Museum' : 
                           artwork.source === 'rijks' ? 'Rijksmuseum' : 
                           artwork.source === 'va' ? 'V&A Museum' : artwork.source}
                        </span>
                        
                        {artwork.museumUrl && (
                          <a
                            href={artwork.museumUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-white hover:text-gray-300 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Indicators */}
        {canNavigate && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: Math.ceil(favorites.length / 3) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * 3)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  Math.floor(currentIndex / 3) === index ? 'bg-gray-800' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}