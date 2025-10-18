'use client';

import { useState } from 'react';
import ArtworkSearch from './ArtworkSearch';
import ArtworkList from './ArtworkList';
import UserProfile from './UserProfile';
import AuthModal from './AuthModal';
import LoginPromptModal from './LoginPromptModal';
import CreateExhibitionModal from './CreateExhibitionModal';
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
  const [showCreateExhibitionModal, setShowCreateExhibitionModal] = useState(false);

  const handleSearch = (newSearchTerm: string, newSource: string) => {
    setSearchTerm(newSearchTerm);
    setSource(newSource);
    setKey(prev => prev + 1); // Force ArtworkList to re-fetch
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">
                The Curator
              </h1>
              <p className="text-lg text-black">
                Discover and explore artworks from world-renowned museums
              </p>
              {user && (
                <p className="text-sm text-black mt-1">
                  Welcome back, {user.firstName || user.username}! 👋
                </p>
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
            onClick={() => loginPrompt.promptForExhibition(() => {
              setShowCreateExhibitionModal(true);
            })}
            className="inline-flex items-center px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
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

        {/* Create Exhibition Modal */}
        <CreateExhibitionModal
          isOpen={showCreateExhibitionModal}
          onClose={() => setShowCreateExhibitionModal(false)}
        />
      </div>
    </div>
  );
}