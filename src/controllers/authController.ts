import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middlewares/authMiddleware';
import {ApiError} from "../exceptions/api-error";

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;
        const userData = await authService.login(email, password);
        res.json(userData);
    } catch (e) {
        next(e);
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { refreshToken } = req.body;
        await authService.logout(refreshToken);
        res.status(200).json({ message: 'Successfully logged out' });
    } catch (e) {
        next(e);
    }
};

export const refresh = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            return next(ApiError.UnauthorizedError());
        }
        const userData = await authService.refresh(req.user.id);
        res.json(userData);
    } catch (e) {
        next(e);
    }
};