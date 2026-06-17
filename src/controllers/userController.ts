import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { AuthRequest } from '../middlewares/authMiddleware';

export const createManager = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const manager = await userService.createManager(req.body);
        res.status(201).json(manager);
    } catch (e) {
        next(e);
    }
};

export const updateBanStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const is_active = typeof req.body.is_active === 'boolean' ? req.body.is_active : false;
        const user = await userService.updateBanStatus(id, is_active);
        res.json(user);
    } catch (e) {
        next(e);
    }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await userService.getUserById(req.user!.id);
        res.json(user);
    } catch (e) {
        next(e);
    }
};

export const generateActivationLink = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const frontendBaseUrl = req.body.frontendBaseUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const link = await userService.generateActivationLink(id, frontendBaseUrl);
        res.json({ link });
    } catch (e) { next(e); }
};

export const generateRecoveryLink = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const frontendBaseUrl = req.body.frontendBaseUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const link = await userService.generateRecoveryLink(id, frontendBaseUrl);
        res.json({ link });
    } catch (e) { next(e); }
};

export const getManagerStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const stats = await userService.getManagerStats(id);
        res.json(stats);
    } catch (e) { next(e); }
};