import { Request, Response, NextFunction } from 'express';
import { tokenService } from '../services/token.service';
import { ApiError } from '../exceptions/api-error';
import { RoleEnum } from '../enums/role.enum';
import { User } from '../models/User';
import { IJWTPayload } from '../interfaces';

export interface AuthRequest extends Request {
    user?: IJWTPayload;
    order?: any;
}

export const verifyAccessToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return next(ApiError.UnauthorizedError());

        const accessToken = authHeader.split(' ')[1];
        if (!accessToken) return next(ApiError.UnauthorizedError());

        const userData = tokenService.validateAccessToken(accessToken) as IJWTPayload | null;
        if (!userData) return next(ApiError.UnauthorizedError());

        req.user = userData;
        next();
    } catch (e) {
        next(ApiError.UnauthorizedError());
    }
};

export const verifyRefreshToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return next(ApiError.UnauthorizedError());

        const userData = tokenService.validateRefreshToken(refreshToken) as IJWTPayload | null;
        if (!userData) return next(ApiError.UnauthorizedError());

        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!tokenFromDb) return next(ApiError.UnauthorizedError());

        const user = await User.findById(userData.id);
        if (!user || !user.is_active) return next(ApiError.UnauthorizedError());

        req.user = userData;
        next();
    } catch (e) {
        next(ApiError.UnauthorizedError());
    }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        if (req.user?.role !== RoleEnum.ADMIN) {
            return next(ApiError.Forbidden());
        }
        next();
    } catch (e) {
        next(ApiError.Forbidden());
    }
};