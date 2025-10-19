export declare const getAllExhibitions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
import { Request, Response, NextFunction } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        username: string;
        email: string;
    };
}
export declare const getExhibitions: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getExhibitionById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createExhibition: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateExhibition: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteExhibition: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const addArtworkToExhibition: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const removeArtworkFromExhibition: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateArtworkInExhibition: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPublicExhibitions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getSharedExhibition: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const shareExhibition: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const unshareExhibition: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const searchExhibitions: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getFeaturedExhibitions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTrendingExhibitions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=exhibitions.d.ts.map