import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { Order } from '../models/Order';
import { RoleEnum } from '../enums/role.enum';
import { ApiError } from '../exceptions/api-error';

export const checkOrderAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId);
        if (!order) return next(ApiError.NotFound('Order not found'));

        if (req.user?.role === RoleEnum.ADMIN) {
            req.order = order;
            return next();
        }

        if (order.manager && order.manager.toString() !== req.user?.id) {
            return next(ApiError.Forbidden());
        }

        req.order = order;
        next();
    } catch (e) {
        next(e);
    }
};