'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from './contexts/AuthContext';
import { useTutorial } from './contexts/TutorialContext';
import LoginPromptModal from './components/LoginPromptModal';

export default function Home() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  // Removed unused featuredExhibitions and setFeaturedExhibitions
  const [scrollRotation, setScrollRotation] = useState(3);
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();
  const { startTutorial } = useTutorial();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const rotation = 3 + Math.min(scrollY / 10, 15);
      setScrollRotation(rotation);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-black text-white py-20 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/20 rotate-45"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 border border-white/15 transform -rotate-12"></div>
          <div className="absolute bottom-10 right-10 w-20 h-20 bg-white/5 transform rotate-45"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Discover */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Curate Your
                <span className="block text-white font-light">
                  Art Story
                </span>
              </h1>
              <p className="text-xl mb-8 text-gray-300 leading-relaxed">
                Discover masterpieces from world-renowned museums. Create stunning exhibitions. 
                Share your curatorial vision with art enthusiasts worldwide.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/search"
                  className="bg-white text-black px-8 py-4 font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
                >
                  Discover Art
                </Link>
                {user ? (
                  <Link
                    href="/profile"
                    className="bg-transparent border-2 border-white text-white px-8 py-4 font-semibold hover:bg-white hover:text-black transition-all duration-200"
                  >
                    My Exhibitions
                  </Link>
                ) : (
                  <button
                    onClick={() => startTutorial('first-curation')}
                    className="bg-transparent border-2 border-white text-white px-8 py-4 font-semibold hover:bg-white hover:text-black transition-all duration-200"
                  >
                    Start Curating
                  </button>
                )}
              </div>
            </div>

            {/* Right Side - Abstract Visual */}
            <div className="relative">
              <div 
                className="bg-white text-black p-8 transition-transform duration-300 relative"
                style={{
                  transform: `rotate(${isHovered ? 0 : scrollRotation}deg)`
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-white transform rotate-45"></div>
                    </div>
                    <div>
                      <h3 className="text-black font-semibold">Your Exhibition</h3>
                      <p className="text-gray-600 text-sm">Create your masterpiece</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-square bg-black flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white rotate-45"></div>
                    </div>
                    <div className="aspect-square bg-gray-200 flex items-center justify-center">
                      <div className="w-6 h-6 bg-black rounded-full"></div>
                    </div>
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <div className="w-10 h-2 bg-black"></div>
                    </div>
                    <div className="aspect-square bg-black flex items-center justify-center">
                      <div className="w-4 h-8 bg-white"></div>
                    </div>
                  </div>
                  
                  <button className="w-full bg-black text-white py-3 font-medium hover:bg-gray-800 transition-colors" >
                    Curate Your Exhibition
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-16 h-16 border border-black/10 rotate-12"></div>
          <div className="absolute bottom-32 right-1/3 w-12 h-12 bg-black/5 rounded-full"></div>
          <div className="absolute top-1/2 left-10 w-20 h-20 border-2 border-black/5 transform -rotate-45"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to create and share your art exhibitions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <div className="w-8 h-8 border-2 border-white rotate-45"></div>
              </div>
              <h3 className="text-2xl font-semibold text-black mb-4">Discover</h3>
              <p className="text-gray-600 leading-relaxed">
                Search through thousands of artworks from prestigious museums including 
                the Metropolitan Museum, V&A, and Rijksmuseum.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <h3 className="text-2xl font-semibold text-black mb-4">Curate</h3>
              <p className="text-gray-600 leading-relaxed">
                Create themed exhibitions by selecting artworks that tell your story. 
                Add descriptions and organize your collection.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <div className="w-8 h-2 bg-white"></div>
              </div>
              <h3 className="text-2xl font-semibold text-black mb-4">Share</h3>
              <p className="text-gray-600 leading-relaxed">
                Publish your exhibitions and share them with art lovers worldwide. 
                Build your reputation as a digital curator.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-black text-white relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-1/4 w-24 h-24 border border-white/10 rotate-45"></div>
          <div className="absolute bottom-16 left-1/3 w-16 h-16 bg-white/5 rounded-full"></div>
          <div className="absolute top-1/2 right-10 w-32 h-32 border-2 border-white/5 transform -rotate-12"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2 text-white">
                500K+
              </div>
              <div className="text-gray-300">Artworks Available</div>
            </div>
            <div className="relative">
              <div className="text-4xl font-bold mb-2 text-white">
                3
              </div>
              <div className="text-gray-300 mb-2">World-Class Museums</div>
              <div className="h-6 overflow-hidden">
                <div className="animate-[slide_6s_infinite] space-y-2">
                  <div className="text-sm text-white h-6 flex items-center justify-center">Metropolitan Museum</div>
                  <div className="text-sm text-gray-300 h-6 flex items-center justify-center">Victoria & Albert</div>
                  <div className="text-sm text-white h-6 flex items-center justify-center">Rijksmuseum</div>
                  <div className="text-sm text-gray-300 h-6 flex items-center justify-center">Metropolitan Museum</div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-white">
                1000+
              </div>
              <div className="text-gray-300">Exhibitions Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-white">
                24/7
              </div>
              <div className="text-gray-300">Access to Art</div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 bg-black text-white relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-16 left-1/4 w-32 h-32 border border-white/5 rotate-45"></div>
          <div className="absolute bottom-16 right-1/4 w-24 h-24 bg-white/5 rounded-full"></div>
          <div className="absolute top-1/2 left-16 w-20 h-20 border-2 border-white/10 transform -rotate-12"></div>
          <div className="absolute bottom-32 right-16 w-16 h-16 bg-white/5 transform rotate-45"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Curatorial Journey?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Join thousands of art enthusiasts who are already creating amazing exhibitions.
          </p>
          {user ? (
            <Link
              href="/search"
              className="inline-block bg-white text-black px-10 py-4 font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
            >
              Start Creating Now
            </Link>
          ) : (
            <button
              onClick={() => setShowWelcomeModal(true)}
              className="bg-white text-black px-10 py-4 font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
            >
              Get Started
            </button>
          )}
        </div>
      </div>

      {/* Welcome Modal */}
      <LoginPromptModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        trigger="first-visit"
        onLoginSuccess={() => setShowWelcomeModal(false)}
      />
    </div>
  );
}
