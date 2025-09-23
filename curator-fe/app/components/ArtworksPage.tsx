'use client';

import { useState } from 'react';
import ArtworkSearch from './ArtworkSearch';
import ArtworkList from './ArtworkList';
import StatusIndicator from './StatusIndicator';
import UserProfile from './UserProfile';
import AuthModal from './AuthModal';
import { useAuth } from '../contexts/AuthContext';

export default function ArtworksPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('painting');
  const [source, setSource] = useState('all');
  const [key, setKey] = useState(0); // Force re-render of ArtworkList
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const handleSearch = (newSearchTerm: string, newSource: string) => {
    setSearchTerm(newSearchTerm);
    setSource(newSource);
    setKey(prev => prev + 1); // Force ArtworkList to re-fetch
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Exhibition Curator
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Discover and explore artworks from world-renowned museums
              </p>
              {user && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  Welcome back, {user.firstName || user.username}! 👋
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <StatusIndicator />
              {user ? (
                <UserProfile />
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setAuthModalTab('login');
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalTab('register');
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search component */}
        <ArtworkSearch 
          onSearch={handleSearch}
          initialSearchTerm={searchTerm}
          initialSource={source}
        />

        {/* Artwork list */}
        <ArtworkList 
          key={key}
          searchTerm={searchTerm}
          source={source as 'all' | 'met' | 'rijks' | 'fitzwilliam'}
          limit={20}
        />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultTab={authModalTab}
        />
      </div>
    </div>
  );
}