import mongoose, { Schema, Document } from 'mongoose';

// Artwork schema (embedded within exhibitions)
const ArtworkSchema = new Schema({
  artworkId: { type: String, required: true }, // External API artwork ID
  title: { type: String, required: true },
  artist: { type: String },
  date: { type: String },
  medium: { type: String },
  department: { type: String },
  culture: { type: String },
  period: { type: String },
  dimensions: { type: String },
  imageUrl: { type: String },
  primaryImageSmall: { type: String },
  additionalImages: [{ type: String }],
  objectURL: { type: String },
  tags: [{ type: String }],
  description: { type: String },
  museumSource: { type: String, enum: ['met', 'rijks', 'other'], required: true },
  isHighlight: { type: Boolean, default: false },
  addedAt: { type: Date, default: Date.now }
}, { _id: false });

// Exhibition schema (embedded within user document)
const ExhibitionSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  theme: { type: String },
  isPublic: { type: Boolean, default: false },
  shareableLink: { type: String },
  artworks: [ArtworkSchema], // Embedded artworks
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  tags: [{ type: String }],
  coverImageUrl: { type: String }
}, { _id: true });

// User schema with embedded exhibitions
const UserSchema = new Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  bio: { type: String, maxlength: 500 },
  profileImageUrl: { type: String },
  isActive: { type: Boolean, default: true },
  exhibitions: [ExhibitionSchema], // Embedded exhibitions with embedded artworks
  favoriteArtworks: [ArtworkSchema], // User's favorite artworks
  preferences: {
    defaultExhibitionPrivacy: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    preferredMuseums: [{ type: String }],
    interests: [{ type: String }]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date }
}, {
  timestamps: true
});

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ 'exhibitions.title': 1 });
UserSchema.index({ 'exhibitions.isPublic': 1 });
UserSchema.index({ 'exhibitions.shareableLink': 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Method to add exhibition
UserSchema.methods.addExhibition = function(exhibitionData: any) {
  this.exhibitions.push(exhibitionData);
  this.updatedAt = new Date();
  return this.save();
};

// Method to add artwork to exhibition
UserSchema.methods.addArtworkToExhibition = function(exhibitionId: string, artworkData: any) {
  const exhibition = this.exhibitions.id(exhibitionId);
  if (exhibition) {
    exhibition.artworks.push(artworkData);
    exhibition.updatedAt = new Date();
    this.updatedAt = new Date();
    return this.save();
  }
  throw new Error('Exhibition not found');
};

// Method to remove artwork from exhibition
UserSchema.methods.removeArtworkFromExhibition = function(exhibitionId: string, artworkId: string) {
  const exhibition = this.exhibitions.find((ex: any) => ex._id?.toString() === exhibitionId);
  if (exhibition) {
    exhibition.artworks = exhibition.artworks.filter((artwork: any) => artwork.artworkId !== artworkId);
    exhibition.updatedAt = new Date();
    this.updatedAt = new Date();
    return this.save();
  }
  throw new Error('Exhibition not found');
};

// Method to add to favorites
UserSchema.methods.addToFavorites = function(artworkData: any) {
  // Check if artwork already in favorites
  const exists = this.favoriteArtworks.some((artwork: any) => artwork.artworkId === artworkData.artworkId);
  if (!exists) {
    this.favoriteArtworks.push(artworkData);
    this.updatedAt = new Date();
    return this.save();
  }
  throw new Error('Artwork already in favorites');
};

// Method to remove from favorites
UserSchema.methods.removeFromFavorites = function(artworkId: string) {
  this.favoriteArtworks = this.favoriteArtworks.filter((artwork: any) => artwork.artworkId !== artworkId);
  this.updatedAt = new Date();
  return this.save();
};

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profileImageUrl?: string;
  isActive: boolean;
  exhibitions: any[];
  favoriteArtworks: any[];
  preferences: {
    defaultExhibitionPrivacy: boolean;
    emailNotifications: boolean;
    preferredMuseums: string[];
    interests: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  fullName: string;
  addExhibition(exhibitionData: any): Promise<IUser>;
  addArtworkToExhibition(exhibitionId: string, artworkData: any): Promise<IUser>;
  removeArtworkFromExhibition(exhibitionId: string, artworkId: string): Promise<IUser>;
  addToFavorites(artworkData: any): Promise<IUser>;
  removeFromFavorites(artworkId: string): Promise<IUser>;
}

export const User = mongoose.model<IUser>('User', UserSchema);