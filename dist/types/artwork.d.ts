export interface MetDepartment {
    departmentId: number;
    displayName: string;
}
export interface MetSearchResponse {
    total: number;
    objectIDs: number[] | null;
}
export interface MetArtwork {
    objectID: number;
    isHighlight: boolean;
    accessionNumber: string;
    accessionYear: string;
    isPublicDomain: boolean;
    primaryImage: string;
    primaryImageSmall: string;
    additionalImages: string[];
    constituents: Array<{
        constituentID: number;
        role: string;
        name: string;
        constituentULAN_URL: string;
        constituentWikidata_URL: string;
        gender: string;
    }> | null;
    department: string;
    objectName: string;
    title: string;
    culture: string;
    period: string;
    dynasty: string;
    reign: string;
    portfolio: string;
    artistRole: string;
    artistPrefix: string;
    artistDisplayName: string;
    artistDisplayBio: string;
    artistSuffix: string;
    artistAlphaSort: string;
    artistNationality: string;
    artistBeginDate: string;
    artistEndDate: string;
    artistGender: string;
    artistULAN_URL: string;
    artistWikidata_URL: string;
    objectDate: string;
    objectBeginDate: number;
    objectEndDate: number;
    medium: string;
    dimensions: string;
    measurements: Array<{
        elementName: string;
        elementDescription: string;
        elementMeasurements: {
            Height: number;
            Width: number;
        };
    }> | null;
    creditLine: string;
    geographyType: string;
    city: string;
    state: string;
    county: string;
    country: string;
    region: string;
    subregion: string;
    locale: string;
    locus: string;
    excavation: string;
    river: string;
    classification: string;
    rightsAndReproduction: string;
    linkResource: string;
    metadataDate: string;
    repository: string;
    objectURL: string;
    tags: Array<{
        term: string;
        AAT_URL: string;
        Wikidata_URL: string;
    }> | null;
    objectWikidata_URL: string;
    isTimelineWork: boolean;
    GalleryNumber: string;
}
export interface StandardizedArtwork {
    id: string;
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
    objectID?: number;
    accessionNumber?: string;
    creditLine?: string;
    galleryNumber?: string;
    objectNumber?: string;
    webImage?: {
        url: string;
        width: number;
        height: number;
    };
    systemNumber?: string;
    accessionYear?: number;
}
export interface VASearchResponse {
    info: {
        record_count: number;
        record_count_exact: boolean;
        parameters: Record<string, any>;
        page: number;
        pages: number;
        page_size: number;
    };
    records: VAArtwork[];
}
export interface VAArtwork {
    systemNumber: string;
    accessionNumber?: string;
    accessionYear?: number;
    objectType?: string;
    _primaryTitle?: string;
    _primaryDate?: string;
    _primaryPlace?: string;
    _primaryImageId?: string;
    _primaryMaker?: {
        name?: string;
        association?: string;
    };
    titles?: Array<{
        title: string;
        type?: string;
    }>;
    artistMakerPerson?: Array<{
        name?: {
            text: string;
            id?: string;
        };
        association?: {
            text: string;
            id?: string;
        };
        note?: string;
    }>;
    artistMakerOrganisations?: Array<{
        name?: {
            text: string;
            id?: string;
        };
        association?: {
            text: string;
            id?: string;
        };
        note?: string;
    }>;
    artistMakerPeople?: Array<{
        name?: {
            text: string;
            id?: string;
        };
    }>;
    productionDates?: Array<{
        date?: {
            text: string;
            earliest?: string;
            latest?: string;
        };
        association?: {
            text: string;
            id?: string;
        };
        note?: string;
    }>;
    materials?: Array<{
        text: string;
        id?: string;
    }>;
    techniques?: Array<{
        text: string;
        id?: string;
    }>;
    materialsAndTechniques?: string;
    placesOfOrigin?: Array<{
        place?: {
            text: string;
            id?: string;
        };
        association?: {
            text: string;
            id?: string;
        };
        note?: string;
    }>;
    contentPlaces?: Array<{
        text: string;
        id?: string;
    }>;
    associatedPlaces?: Array<{
        text: string;
        id?: string;
    }>;
    contentPerson?: Array<{
        text: string;
        id?: string;
    }>;
    associatedPerson?: Array<{
        text: string;
        id?: string;
    }>;
    dimensionsSummary?: string;
    physicalDescription?: string;
    briefDescription?: string;
    galleryLocations?: Array<{
        current?: {
            text: string;
            id?: string;
        };
    }>;
    _images?: Array<{
        id: string;
        type: string;
    }>;
    categoryCollections?: Array<{
        text: string;
        id?: string;
    }>;
    styles?: Array<{
        text: string;
        id?: string;
    }>;
    partTypes?: Array<Array<{
        text: string;
        id?: string;
    }>>;
}
//# sourceMappingURL=artwork.d.ts.map