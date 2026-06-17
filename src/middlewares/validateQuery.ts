import { Request, Response, NextFunction } from 'express';
import { IPaginationQuery } from '../interfaces';

declare module 'express-serve-static-core' {
    interface Request {
        pagination?: IPaginationQuery;
    }
}

export const validatePaginationQuery = (req: Request, res: Response, next: NextFunction) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 25);
    const my = req.query.my === 'true';
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const sort = (req.query.sort as string) || '-created_at';

    req.pagination = { page, limit, my, startDate, endDate, sort };
    next();
};