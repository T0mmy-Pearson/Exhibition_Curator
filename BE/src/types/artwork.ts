// TypeScript interfaces for Met Museum API data structures

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

// Standardized artwork interface for our application
export interface StandardizedArtwork {
  id: string; // Format: "met:{objectID}" or "rijks:{objectNumber}"
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
  // Rijksmuseum specific (to be added later)
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

// Fitzwilliam Museum API interfaces
export interface FitzwilliamSearchResponse {
  data: FitzwilliamArtwork[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface FitzwilliamArtwork {
  uuid: string;
  priref: string;
  identifier: Array<{
    accession_number?: string;
    type?: string;
    value?: string;
  }>;
  summary_title?: string;
  title?: Array<{
    value: string;
    type?: string;
  }>;
  note?: Array<{
    value: string;
    type?: string;
  }>;
  lifecycle?: {
    creation?: Array<{
      date?: Array<{
        earliest?: string;
        latest?: string;
        value?: string;
      }>;
      maker?: Array<{
        summary_title?: string;
        biography?: Array<{
          value?: string;
        }>;
      }>;
      periods?: Array<{
        summary_title?: string;
      }>;
      places?: Array<{
        summary_title?: string;
      }>;
      techniques?: Array<{
        summary_title?: string;
      }>;
    }>;
  };
  name?: Array<{
    value?: string;
    reference?: {
      summary_title?: string;
    };
  }>;
  materials?: Array<{
    summary_title?: string;
  }>;
  techniques?: Array<{
    summary_title?: string;
  }>;
  categories?: Array<{
    summary_title?: string;
  }>;
  department?: {
    summary_title?: string;
  };
  type?: {
    summary_title?: string;
  };
  measurements?: {
    dimensions?: Array<{
      dimension?: string;
      units?: string;
      value?: string;
    }>;
  };
  publications?: Array<{
    summary_title?: string;
  }>;
  exhibitions?: Array<{
    summary_title?: string;
  }>;
  institutions?: Array<{
    summary_title?: string;
  }>;
  multimedia?: Array<{
    admin?: {
      id?: string;
      uuid?: string;
    };
    processed?: {
      large?: {
        location?: string;
        format?: string;
      };
      medium?: {
        location?: string;
        format?: string;
      };
      original?: {
        location?: string;
        format?: string;
      };
      preview?: {
        location?: string;
        format?: string;
      };
    };
    type?: string;
  }>;
  uri?: string;
  apiURI?: string;
  source?: {
    summary_title?: string;
  };
}