'use client';

import { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export type LoginTrigger = 
  | 'first-visit' 
  | 'favorite-artwork' 
  | 'create-exhibition' 
  | 'manual' 
  | 'view-favorites'
  | 'share-exhibition'
  | 'add-to-exhibition';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: LoginTrigger;
  defaultTab?: 'login' | 'register';
  artworkTitle?: string;
  onLoginSuccess?: () => void;
}

export default function LoginPromptModal({ 
  isOpen, 
  onClose, 
  trigger, 
  defaultTab = 'login',
  artworkTitle,
  onLoginSuccess
}: LoginPromptModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [showWelcome, setShowWelcome] = useState(trigger === 'first-visit');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setShowWelcome(trigger === 'first-visit');
    }
  }, [isOpen, defaultTab, trigger]);

  const handleClose = () => {
    setShowWelcome(false);
    onClose();
  };

  const handleLoginSuccess = () => {
    setShowWelcome(false);
    if (onLoginSuccess) {
      onLoginSuccess();
    }
    onClose();
  };

  const getTriggerMessage = () => {
    switch (trigger) {
      case 'first-visit':
        return {
          title: 'Welcome to The Curator! 🎨',
          message: 'Create an account to curate your own art collections, save favorites, and create personalized exhibitions.',
          benefits: [
            'Save artworks to your personal favorites',
            'Create and share custom exhibitions',
            'Get personalized recommendations',
            'Access exclusive curator features'
          ]
        };
      case 'favorite-artwork':
        return {
          title: '❤️ Save This Artwork',
          message: artworkTitle 
            ? `Sign in to add "${artworkTitle}" to your favorites and build your personal collection.`
            : 'Sign in to save artworks to your favorites and build your personal collection.',
          benefits: [
            'Save unlimited artworks',
            'Organize your favorites by themes',
            'Get notified about similar artworks',
            'Create exhibitions from your favorites'
          ]
        };
      case 'create-exhibition':
        return {
          title: '🖼️ Create Your Exhibition',
          message: 'Sign in to create and curate your own art exhibitions to share with the world.',
          benefits: [
            'Curate thematic exhibitions',
            'Share exhibitions with others',
            'Get featured as a curator',
            'Collaborate with other art enthusiasts'
          ]
        };
      case 'view-favorites':
        return {
          title: '❤️ Your Art Collection',
          message: 'Sign in to view and manage your saved artworks and favorite collections.',
          benefits: [
            'Access your saved artworks',
            'Organize by collections',
            'Export your favorites',
            'Share your taste with friends'
          ]
        };
      case 'share-exhibition':
        return {
          title: '📤 Share This Exhibition',
          message: 'Sign in to share this exhibition and discover more curated collections.',
          benefits: [
            'Share exhibitions you love',
            'Follow other curators',
            'Get sharing analytics',
            'Build your curator profile'
          ]
        };
      default:
        return {
          title: 'Join The Curator',
          message: 'Sign in to unlock the full experience of art curation and discovery.',
          benefits: [
            'Save and organize artworks',
            'Create custom exhibitions',
            'Connect with art lovers',
            'Discover new collections'
          ]
        };
    }
  };

  if (!isOpen) return null;

  const triggerInfo = getTriggerMessage();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-2xl transition-all">
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {showWelcome ? (
            /* Welcome Screen */
            <div className="p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🎨</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {triggerInfo.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {triggerInfo.message}
                </p>
                
                {/* Benefits */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3">
                    What you'll get:
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2 text-left">
                    {triggerInfo.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowWelcome(false)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Auth Forms */
            <div className="p-6">
              {/* Header with trigger context */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {triggerInfo.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {triggerInfo.message}
                </p>
              </div>

              {/* Tab Navigation */}
              <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 mb-6">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'login'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'register'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Forms */}
              {activeTab === 'login' ? (
                <LoginForm 
                  onSwitchToRegister={() => setActiveTab('register')}
                  onClose={handleLoginSuccess}
                />
              ) : (
                <RegisterForm 
                  onSwitchToLogin={() => setActiveTab('login')}
                  onClose={handleLoginSuccess}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}