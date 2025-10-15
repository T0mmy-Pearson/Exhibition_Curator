export interface RijksSearchResponse {
    '@context': string;
    id: string;
    type: string;
    partOf: {
        id: string;
        type: string;
        totalItems: number;
        first: {
            id: string;
            type: string;
        };
        last: {
            id: string;
            type: string;
        };
    };
    next?: {
        id: string;
        type: string;
    };
    prev?: {
        id: string;
        type: string;
    };
    orderedItems: Array<{
        id: string;
        type: string;
    }>;
}
export interface RijksArtwork {
    '@context': string;
    id: string;
    type: string;
    _label: string;
    classified_as?: Array<{
        id: string;
        type: string;
        _label: string;
    }>;
    identified_by?: Array<{
        type: string;
        content: string;
        classified_as?: Array<{
            id: string;
            type: string;
            _label: string;
        }>;
    }>;
    produced_by?: {
        type: string;
        carried_out_by?: Array<{
            id: string;
            type: string;
            _label: string;
        }>;
        timespan?: {
            type: string;
            begin_of_the_begin?: string;
            end_of_the_end?: string;
            _label?: string;
        };
        technique?: Array<{
            id: string;
            type: string;
            _label: string;
        }>;
        used_specific_object?: Array<{
            id: string;
            type: string;
            _label: string;
        }>;
    };
    dimension?: Array<{
        type: string;
        value: number;
        unit: {
            id: string;
            type: string;
            _label: string;
        };
        classified_as: Array<{
            id: string;
            type: string;
            _label: string;
        }>;
    }>;
    made_of?: Array<{
        id: string;
        type: string;
        _label: string;
    }>;
    shows?: Array<{
        type: string;
        _label?: string;
        about?: Array<{
            id: string;
            type: string;
            _label: string;
        }>;
    }>;
    subject_of?: Array<{
        type: string;
        digitally_carried_by?: Array<{
            type: string;
            access_point?: Array<{
                id: string;
                type: string;
            }>;
            classified_as?: Array<{
                id: string;
                type: string;
                _label: string;
            }>;
        }>;
    }>;
    current_owner?: {
        id: string;
        type: string;
        _label: string;
    };
    current_keeper?: {
        id: string;
        type: string;
        _label: string;
    };
    current_location?: {
        id: string;
        type: string;
        _label: string;
    };
}
export declare class RijksmuseumService {
    private static instance;
    private readonly baseUrl;
    private constructor();
    static getInstance(): RijksmuseumService;
    /**
     * Extract IIIF identifier from D1_Digital_Object access points in E36_Visual_Item
     * Following Rijksmuseum's Linked Art structure:
     * E22_Human-Made_Object -> shows -> E36_Visual_Item -> digitally_shown_by -> D1_Digital_Object -> access_point
     */
    private extractIIIFIdentifier;
    /**
     * Search artworks in Rijksmuseum collection
     */
    searchArtworks(params: {
        title?: string;
        creator?: string;
        creationDate?: string;
        type?: string;
        technique?: string;
        material?: string;
        description?: string;
        imageAvailable?: boolean;
        pageToken?: string;
        limit?: number;
    }): Promise<RijksSearchResponse>;
    /**
     * Get artwork by ID from Rijksmuseum
     */
    getArtworkById(objectId: string): Promise<RijksArtwork>;
    /**
     * Convert Rijksmuseum artwork to standardized format (Linked Art format)
     */
    standardizeArtwork(rijksArtwork: any): Promise<any>;
    /**
     * Search and return standardized artworks
     */
    searchStandardizedArtworks(params: {
        q?: string;
        creator?: string;
        type?: string;
        imageAvailable?: boolean;
        limit?: number;
    }): Promise<any[]>;
    /**
     * Get random artworks (Rijksmuseum doesn't have a specific random endpoint,
     * so we'll search for common terms and randomize)
     */
    getRandomArtworks(count?: number): Promise<any[]>;
}
//# sourceMappingURL=rijksmuseum.d.ts.map