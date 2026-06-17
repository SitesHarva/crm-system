import { Router } from 'express';
import { getGroups, createGroup } from '../controllers/groupController';
import { verifyAccessToken, isAdmin } from '../middlewares/authMiddleware';

const router = Router();
router.use(verifyAccessToken);
router.get('/', getGroups);
router.post('/', isAdmin, createGroup);

export default router;