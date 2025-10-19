export declare const fetchAllExhibitions: (isPublicOnly?: boolean, limit?: number, offset?: number) => Promise<any[]>;
interface ExhibitionData {
    title: string;
    description?: string;
    theme?: string;
    isPublic?: boolean;
    tags?: string[];
    coverImageUrl?: string;
}
export declare const fetchUserExhibitions: (userId: string) => Promise<any[]>;
export declare const fetchPublicExhibitions: (limit?: number, offset?: number) => Promise<any[]>;
export declare const fetchExhibitionById: (userId: string, exhibitionId: string) => Promise<any>;
export declare const fetchExhibitionByShareableLink: (shareableLink: string) => Promise<any>;
export declare const insertExhibition: (userId: string, exhibitionData: ExhibitionData) => Promise<any>;
export declare const updateExhibitionById: (userId: string, exhibitionId: string, updates: Partial<ExhibitionData>) => Promise<any>;
export declare const removeExhibitionById: (userId: string, exhibitionId: string) => Promise<void>;
export declare const addArtworkToExhibition: (userId: string, exhibitionId: string, artworkData: any) => Promise<any>;
export declare const removeArtworkFromExhibition: (userId: string, exhibitionId: string, artworkId: string) => Promise<any>;
export declare const searchExhibitions: (query: string, isPublicOnly?: boolean, limit?: number, offset?: number) => Promise<any[]>;
export {};
//# sourceMappingURL=exhibitions.d.ts.map