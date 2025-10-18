'use client';

import React from 'react';
import FavoritesCarousel from '../components/FavoritesCarousel';
import { useAuth } from '../contexts/AuthContext';

export default function FavoritesPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-6">
              Please sign in to view and manage your favorite artworks.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
            <p className="mt-2 text-lg text-gray-600">
              Your curated collection of beloved artworks
            </p>
            {user && (
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {user.username}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Favorites Carousel */}
        <FavoritesCarousel className="mb-8" />

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-gray-700 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Save Artworks</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Discover artworks from world-renowned museums and add them to your personal collection with just a click.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-gray-700 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Create Exhibitions</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Use your favorite artworks to create themed exhibitions and share your curatorial vision with others.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-gray-700 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Share & Discover</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Share your favorite pieces with friends and discover new artworks through our community of art enthusiasts.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Explore More Art?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Browse thousands of artworks from the Metropolitan Museum of Art, Rijksmuseum, and Victoria & Albert Museum. 
            Find your next favorite masterpiece today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/search'}
              className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium"
            >
              Explore Artworks
            </button>
            <button
              onClick={() => window.location.href = '/exhibitions'}
              className="bg-white text-black border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Browse Exhibitions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}