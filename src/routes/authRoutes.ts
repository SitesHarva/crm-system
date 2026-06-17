import { Router } from 'express';
import { login, logout, refresh } from '../controllers/authController';
import { verifyRefreshToken } from '../middlewares/authMiddleware';
import { setPassword } from '../controllers/activationController';
import { validate } from '../middlewares/validateMiddleware';
import rateLimit from 'express-rate-limit';
import { loginValidator } from '../validators/passwordValidator';

const router = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many attempts, please try again later' }
});

router.post('/login', authLimiter, validate(loginValidator), login);
router.post('/refresh', verifyRefreshToken, refresh);
router.post('/logout', logout);
router.post('/set-password', setPassword);

export default router;