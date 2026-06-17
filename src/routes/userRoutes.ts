import { Router, Response, NextFunction } from 'express';
import {
    createManager,
    updateBanStatus,
    getMe,
    generateActivationLink,
    generateRecoveryLink,
    getManagerStats
} from '../controllers/userController';
import { verifyAccessToken, isAdmin, AuthRequest } from '../middlewares/authMiddleware';
import { userService } from '../services/user.service';

const router = Router();

router.use(verifyAccessToken);

router.get('/me', getMe);

router.get('/', isAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await userService.getAllManagersPaginated(page, limit);
        res.json(result);
    } catch (e) { next(e); }
});

router.post('/', isAdmin, createManager);
router.patch('/:id/status', isAdmin, updateBanStatus);

router.post('/:id/activation-link', isAdmin, generateActivationLink);
router.post('/:id/recovery-link', isAdmin, generateRecoveryLink);
router.get('/:id/stats', isAdmin, getManagerStats);

export default router;