import { useEffect, useState } from 'react';

// Pre-selected artwork images for the backdrop
const ARTWORK_BACKDROP_IMAGES = [
  'https://images.metmuseum.org/CRDImages/ep/web-large/DT1567.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DP-14936-023.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DP346300.jpg',
  'https://images.metmuseum.org/CRDImages/as/web-large/DP251139.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DP375923.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DT1943.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DP375431.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DT2081.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DT1494.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DP375924.jpg',
  'https://images.metmuseum.org/CRDImages/as/web-large/DP251120.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DP375948.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DT1502.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DP375917.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DT1565.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DP375945.jpg',
  'https://images.metmuseum.org/CRDImages/as/web-large/DP251138.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DP375946.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DT1496.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DP375922.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DT1941.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DP375949.jpg',
  'https://images.metmuseum.org/CRDImages/as/web-large/DP251121.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DP375430.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DT1568.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DP375918.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DT1942.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DP375947.jpg',
  'https://images.metmuseum.org/CRDImages/as/web-large/DP251122.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DP375432.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DT1497.jpg',
  'https://images.metmuseum.org/CRDImages/ep/web-large/DP375925.jpg',
];

export const useImagePreloader = () => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [preloadedImages, setPreloadedImages] = useState<string[]>([]);

  useEffect(() => {
    const preloadImages = async () => {
      console.log('Starting image preload...');
      
      const loadPromises = ARTWORK_BACKDROP_IMAGES.map((src, index) => {
        return new Promise<string>((resolve, reject) => {
          const img = new Image();
          
          img.onload = () => {
            setLoadedCount(prev => {
              const newCount = prev + 1;
              console.log(`Preloaded image ${newCount}/${ARTWORK_BACKDROP_IMAGES.length}`);
              return newCount;
            });
            resolve(src);
          };
          
          img.onerror = () => {
            console.warn(`Failed to preload image: ${src}`);
            // Still resolve to not block the process
            resolve(src);
          };
          
          // Set crossOrigin before src to handle CORS
          img.crossOrigin = 'anonymous';
          img.src = src;
        });
      });

      try {
        const loadedImages = await Promise.all(loadPromises);
        setPreloadedImages(loadedImages);
        setImagesLoaded(true);
        console.log('All backdrop images preloaded successfully!');
      } catch (error) {
        console.error('Error preloading images:', error);
        // Still mark as loaded to not block the UI
        setPreloadedImages(ARTWORK_BACKDROP_IMAGES);
        setImagesLoaded(true);
      }
    };

    preloadImages();
  }, []);

  return {
    imagesLoaded,
    loadedCount,
    totalImages: ARTWORK_BACKDROP_IMAGES.length,
    preloadedImages: preloadedImages.length > 0 ? preloadedImages : ARTWORK_BACKDROP_IMAGES,
    loadingProgress: Math.round((loadedCount / ARTWORK_BACKDROP_IMAGES.length) * 100)
  };
};

export { ARTWORK_BACKDROP_IMAGES };