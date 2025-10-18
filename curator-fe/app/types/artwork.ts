// Standardized artwork interface matching the backend
export interface StandardizedArtwork {
  id: string; // Format: "met:{objectID}" or "rijks:{objectNumber}" or "va:{systemNumber}"
  artworkId?: string; // Optional: original backend artworkId for internal operations
  source: 'met' | 'rijks' | 'va';
  title: string;
  artist: string;
  artistBio?: string;
  culture?: string;
  date?: string;
  medium?: string;
  dimensions?: string;
  department?: string;
  description?: string;
  imageUrl?: string;
  smallImageUrl?: string;
  additionalImages?: string[];
  museumUrl?: string;
  isHighlight?: boolean;
  isPublicDomain?: boolean;
  tags?: string[];
  // Met Museum specific
  objectID?: number;
  accessionNumber?: string;
  creditLine?: string;
  galleryNumber?: string;
  // Rijksmuseum specific
  objectNumber?: string;
  webImage?: {
    url: string;
    width: number;
    height: number;
  };
  // V&A Museum specific
  systemNumber?: string;
  accessionYear?: number;
}

// API Response type for artwork search
export interface ArtworkSearchResponse {
  artworks: StandardizedArtwork[];
  total: number;
  page?: number;
  limit?: number;
}