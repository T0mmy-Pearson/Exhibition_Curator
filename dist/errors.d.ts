import { Request, Response, NextFunction } from 'express';
interface CustomError extends Error {
    status?: number;
    code?: string;
}
export declare const handleCustomErrors: (err: CustomError, req: Request, res: Response, next: NextFunction) => void;
export declare const handleServerErrors: (err: CustomError, req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=errors.d.ts.map