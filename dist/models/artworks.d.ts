interface SearchParams {
    query?: string;
    department?: string;
    medium?: string;
    hasImages?: boolean;
    isOnView?: boolean;
    limit?: number;
    offset?: number;
}
export declare const searchMetMuseumArtworks: (params: SearchParams) => Promise<any[]>;
export declare const searchRijksmuseumArtworks: (params: SearchParams) => Promise<any>;
export declare const searchArtworks: (params: SearchParams) => Promise<any[]>;
export declare const fetchArtworkById: (artworkId: string, source?: string) => Promise<{
    artworkId: any;
    title: any;
    artist: any;
    date: any;
    medium: any;
    department: any;
    culture: any;
    period: any;
    dimensions: any;
    imageUrl: any;
    primaryImageSmall: any;
    additionalImages: any;
    objectURL: any;
    tags: any;
    description: any;
    museumSource: string;
}>;
export declare const fetchFavoriteArtworks: (userId: string) => Promise<any[]>;
export declare const insertFavoriteArtwork: (userId: string, artworkData: any) => Promise<{
    message: string;
}>;
export declare const removeFavoriteArtwork: (userId: string, artworkId: string) => Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=artworks.d.ts.map