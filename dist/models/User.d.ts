import mongoose, { Document } from 'mongoose';
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
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=User.d.ts.map