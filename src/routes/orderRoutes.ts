import { Router } from 'express';
import { getOrders, getOrderById, editOrder, addComment, getStats, exportExcel, bulkReassign } from '../controllers/orderController';
import { verifyAccessToken, isAdmin } from '../middlewares/authMiddleware';
import { checkOrderAccess } from '../middlewares/orderAccessMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { validatePaginationQuery } from '../middlewares/validateQuery';
import { commentValidator, updateOrderValidator, bulkReassignValidator } from '../validators/orderValidator';

const router = Router();
router.use(verifyAccessToken);

router.get('/', validatePaginationQuery, getOrders);
router.get('/excel', exportExcel);
router.get('/stats', isAdmin, getStats);
router.patch('/bulk-reassign', isAdmin, validate(bulkReassignValidator), bulkReassign);

router.get('/:id', getOrderById);
router.patch('/:id', checkOrderAccess, validate(updateOrderValidator), editOrder);
router.post('/:id/comments', checkOrderAccess, validate(commentValidator), addComment);

export default router;