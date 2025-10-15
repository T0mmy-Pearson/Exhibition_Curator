import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  status?: number;
  code?: string;
}

export const handleCustomErrors = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  if (err.status) {
    res.status(err.status).json({ msg: err.message });
  } else {
    next(err);
  }
};

export const handleServerErrors = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ msg: 'Internal server error' });
};