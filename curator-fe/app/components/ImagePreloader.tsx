'use client';

import { useImagePreloader } from '../hooks/useImagePreloader';

export default function ImagePreloader() {
  const { imagesLoaded, loadedCount, totalImages, loadingProgress } = useImagePreloader();

  // Optional: Show a subtle loading indicator during development
  if (process.env.NODE_ENV === 'development' && !imagesLoaded) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm">
        Preloading artwork: {loadedCount}/{totalImages} ({loadingProgress}%)
      </div>
    );
  }

  return null;
}