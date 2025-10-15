"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Artwork schema (embedded within exhibitions)
const ArtworkSchema = new mongoose_1.Schema({
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
const ExhibitionSchema = new mongoose_1.Schema({
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
const UserSchema = new mongoose_1.Schema({
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
UserSchema.virtual('fullName').get(function () {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});
// Method to add exhibition
UserSchema.methods.addExhibition = function (exhibitionData) {
    this.exhibitions.push(exhibitionData);
    this.updatedAt = new Date();
    return this.save();
};
// Method to add artwork to exhibition
UserSchema.methods.addArtworkToExhibition = function (exhibitionId, artworkData) {
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
UserSchema.methods.removeArtworkFromExhibition = function (exhibitionId, artworkId) {
    const exhibition = this.exhibitions.find((ex) => ex._id?.toString() === exhibitionId);
    if (exhibition) {
        exhibition.artworks = exhibition.artworks.filter((artwork) => artwork.artworkId !== artworkId);
        exhibition.updatedAt = new Date();
        this.updatedAt = new Date();
        return this.save();
    }
    throw new Error('Exhibition not found');
};
// Method to add to favorites
UserSchema.methods.addToFavorites = function (artworkData) {
    // Check if artwork already in favorites
    const exists = this.favoriteArtworks.some((artwork) => artwork.artworkId === artworkData.artworkId);
    if (!exists) {
        this.favoriteArtworks.push(artworkData);
        this.updatedAt = new Date();
        return this.save();
    }
    throw new Error('Artwork already in favorites');
};
// Method to remove from favorites
UserSchema.methods.removeFromFavorites = function (artworkId) {
    this.favoriteArtworks = this.favoriteArtworks.filter((artwork) => artwork.artworkId !== artworkId);
    this.updatedAt = new Date();
    return this.save();
};
exports.User = mongoose_1.default.model('User', UserSchema);
//# sourceMappingURL=User.js.map