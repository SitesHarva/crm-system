import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../exceptions/api-error';
import {logger} from "../logger/logger";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    logger.error(`[Error]: ${err.message}`, { stack: err.stack });

    if (err instanceof ApiError) {
        res.status(err.status).json({
            success: false,
            message: err.message,
            errors: err.errors
        });
        return;
    }

    if (err.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            message: err.message
        });
        return;
    }

    if (err.name === 'CastError') {
        res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
        return;
    }

    if ((err as any).code === 11000) {
        res.status(409).json({
            success: false,
            message: 'Duplicate key error'
        });
        return;
    }

    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    next(ApiError.NotFound(`Route ${req.originalUrl} not found`));
};