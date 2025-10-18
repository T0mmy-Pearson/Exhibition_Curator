'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useImagePreloader } from '../hooks/useImagePreloader';

export type LoginTrigger = 
  | 'first-visit' 
  | 'create-exhibition' 
  | 'manual' 
  | 'share-exhibition'
  | 'add-to-exhibition';

type LoginPromptType = 
  | 'general' 
  | 'create-exhibition' 
  | 'add-to-exhibition'

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
  const [backdropImage, setBackdropImage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setShowWelcome(trigger === 'first-visit');
      fetchRandomArtwork();
    }
  }, [isOpen, defaultTab, trigger]);

  const fetchRandomArtwork = async () => {
    try {
      // Get a random artwork from Met Museum API
      const response = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=painting');
      const data = await response.json();
      
      if (data.objectIDs && data.objectIDs.length > 0) {
        // Pick a random artwork ID
        const randomId = data.objectIDs[Math.floor(Math.random() * data.objectIDs.length)];
        
        // Fetch the artwork details
        const artworkResponse = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${randomId}`);
        const artwork = await artworkResponse.json();
        
        // Use the primary image
        const imageUrl = artwork.primaryImage || artwork.primaryImageSmall;
        
        if (imageUrl) {
          setBackdropImage(imageUrl);
          console.log('Random backdrop artwork loaded:', artwork.title || 'Untitled');
        } else {
          // Fallback to a default image if no image found
          setBackdropImage('https://images.metmuseum.org/CRDImages/ep/web-large/DT1567.jpg');
        }
      } else {
        // Fallback image
        setBackdropImage('https://images.metmuseum.org/CRDImages/ep/web-large/DT1567.jpg');
      }
    } catch (error) {
      console.error('Error fetching random artwork:', error);
      // Fallback image
      setBackdropImage('https://images.metmuseum.org/CRDImages/ep/web-large/DT1567.jpg');
    }
  };

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
          title: 'Welcome to The Curator!',
          message: 'Create an account to curate your own art collections and create your own exhibitions.',
          benefits: [
            'Discover artworks from world-class museums',
            'Create and share custom exhibitions',
            'Access exclusive curator features'
          ]
        };
      case 'create-exhibition':
        return {
          title: 'Create Your Exhibition',
          message: 'Sign in to create and curate your own art exhibitions to share with the world.',
          benefits: [
            'Curate thematic exhibitions',
            'Share exhibitions with others',
            'Get featured as a curator',
            'Collaborate with other art enthusiasts'
          ]
        };
      case 'add-to-exhibition':
        return {
          title: 'Add to Exhibition',
          message: artworkTitle
            ? `Sign in to add "${artworkTitle}" to your exhibitions and share your curatorial vision.`
            : 'Sign in to add artworks to your exhibitions and build amazing collections.',
          benefits: [
            'Build thematic exhibitions',
            'Organize artworks by themes',
            'Share your curation skills',
            'Collaborate with other curators'
          ]
        };
      case 'share-exhibition':
        return {
          title: 'Share This Exhibition',
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
            'Discover artworks from museums worldwide',
            'Create custom exhibitions',
            'Connect with art lovers',
            'Share your collections'
          ]
        };
    }
  };

  if (!isOpen) return null;

  const triggerInfo = getTriggerMessage();

  return (
    <>
      {/* Custom animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(2deg); }
        }
      `}</style>
      
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop with artwork grid */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity overflow-hidden" 
        onClick={handleClose}
      >
        {/* Single artwork backdrop */}
        {backdropImage && (
          <div className="absolute inset-0">
            <img 
              src={backdropImage}
              alt="Artwork backdrop"
              className="w-full h-full object-cover opacity-30"
              style={{
                filter: 'blur(1px) brightness(0.7)'
              }}
            />
          </div>
        )}
      </div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden bg-white rounded-xl shadow-2xl transition-all">
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {showWelcome ? (
            /* Welcome Screen */
            <div className="p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {triggerInfo.title}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {triggerInfo.message}
                </p>
                
                {/* Benefits */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    What you'll get:
                  </h3>
                  <ul className="text-sm text-gray-800 space-y-2 text-left">
                    {triggerInfo.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
                    className="flex-1 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
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
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {triggerInfo.title}
                </h2>
                <p className="text-sm text-gray-600">
                  {triggerInfo.message}
                </p>
              </div>

              {/* Tab Navigation */}
              <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'login'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'register'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
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
    </>
  );
}