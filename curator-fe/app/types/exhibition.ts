import { StandardizedArtwork } from './artwork';

// Curator information
export interface Curator {
  username: string;
  fullName: string;
}

// Exhibition interface matching backend response
export interface Exhibition {
  _id: string;
  title: string;
  description?: string;
  theme?: string;
  isPublic: boolean;
  shareableLink?: string;
  artworks: StandardizedArtwork[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
  coverImageUrl?: string;
  curator: Curator;
}

// Exhibition creation data (what we send to API)
export interface CreateExhibitionData {
  title: string;
  description?: string;
  theme?: string;
  isPublic: boolean;
  tags: string[];
  coverImageUrl?: string;
}

// API Response types
export interface ExhibitionsResponse {
  exhibitions: Exhibition[];
}

export interface ExhibitionResponse {
  exhibition: Exhibition;
}