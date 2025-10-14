'use client';

import { useState } from 'react';
import ArtworkSearch from './ArtworkSearch';
import ArtworkList from './ArtworkList';
import StatusIndicator from './StatusIndicator';
import UserProfile from './UserProfile';
import AuthModal from './AuthModal';
import LoginPromptModal from './LoginPromptModal';
import { useAuth } from '../contexts/AuthContext';
import { useLoginPrompt } from '../hooks/useLoginPrompt';

export default function ArtworksPage() {
  const { user } = useAuth();
  const loginPrompt = useLoginPrompt();
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

        {/* Quick Actions */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => loginPrompt.promptForViewFavorites(() => {
              // Navigate to favorites page or show favorites
              console.log('Navigating to favorites...');
            })}
            className="inline-flex items-center px-4 py-2 bg-pink-100 hover:bg-pink-200 dark:bg-pink-900 dark:hover:bg-pink-800 text-pink-800 dark:text-pink-200 rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            My Favorites
          </button>
          <button
            onClick={() => loginPrompt.promptForExhibition(() => {
              // Navigate to create exhibition page
              console.log('Creating exhibition...');
            })}
            className="inline-flex items-center px-4 py-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Exhibition
          </button>
        </div>

        {/* Artwork list */}
        <ArtworkList 
          key={key}
          searchTerm={searchTerm}
          source={source as 'all' | 'met' | 'rijks' | 'va'}
          limit={100}
        />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultTab={authModalTab}
        />

        {/* Login Prompt Modal for first-time visitors and auth-required actions */}
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