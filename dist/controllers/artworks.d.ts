import { Request, Response } from 'express';
export declare const searchArtworks: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const searchByTitleOrArtist: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getArtworkById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getRandomArtworks: (req: Request, res: Response) => Promise<void>;
export declare const getDepartments: (req: Request, res: Response) => Promise<void>;
export declare const searchMetMuseum: (req: Request, res: Response) => Promise<void>;
export declare const getMetArtwork: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const searchRijksmuseum: (req: Request, res: Response) => Promise<void>;
export declare const getRijksArtwork: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const searchMetByTitleOrArtist: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const searchVAMuseum: (req: Request, res: Response) => Promise<void>;
export declare const searchVAByTitleOrArtist: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getVAArtwork: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const searchRijksByTitleOrArtist: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=artworks.d.ts.map