// Standardized artwork interface matching the backend
export interface StandardizedArtwork {
  id: string; // Format: "met:{objectID}" or "rijks:{objectNumber}" or "fitzwilliam:{priref}"
  source: 'met' | 'rijks' | 'fitzwilliam';
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
  // Fitzwilliam Museum specific
  priref?: string;
  uuid?: string;
  identifier?: Array<{
    accession_number?: string;
    type?: string;
    value?: string;
  }>;
}

// API Response type for artwork search
export interface ArtworkSearchResponse {
  artworks: StandardizedArtwork[];
  total: number;
  page?: number;
  limit?: number;
}