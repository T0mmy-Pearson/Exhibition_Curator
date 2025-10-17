'use client';

import Link from 'next/link';
import ArtworksPage from "./components/ArtworksPage";

export default function Home() {
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
              🔍 Search Exhibitions
            </Link>
            <button
              onClick={() => document.getElementById('artworks')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors"
            >
              🎨 Browse Artworks
            </button>
          </div>
        </div>
      </div>
      
      {/* Existing artworks page */}
      <div id="artworks">
        <ArtworksPage />
      </div>
    </div>
  );
}
