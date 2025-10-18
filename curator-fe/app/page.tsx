'use client';

import { useState } from 'react';
import Link from 'next/link';
import LoginPromptModal from './components/LoginPromptModal';

export default function Home() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  return (
    <div>
      {/* Hero section with search navigation */}
      <div className="bg-black text-white py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            The Curator
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Discover, curate, and share art exhibitions from world-renowned museums
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/search"
              className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Search Exhibitions
            </Link>
            <button
              onClick={() => document.getElementById('artworks')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors"
            >
               Browse Artworks
            </button>
          </div>
        </div>
      </div>

      {/* Test button to show welcome modal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <button
          onClick={() => setShowWelcomeModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Show Welcome Modal
        </button>
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
