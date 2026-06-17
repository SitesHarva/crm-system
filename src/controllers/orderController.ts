import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { orderService } from '../services/order.service';
import { ApiError } from '../exceptions/api-error';
import { CourseEnum } from '../enums/course.enum';
import { CourseFormatEnum } from '../enums/course-format.enum';
import { CourseTypeEnum } from '../enums/course-type.enum';
import { OrderStatusEnum } from '../enums/order-status.enum';
import { IOrderFilter } from '../interfaces';

export const getOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.pagination) throw ApiError.BadRequest('Pagination data missing');

        const filter: IOrderFilter = {
            name: req.query.name as string,
            surname: req.query.surname as string,
            email: req.query.email as string,
            phone: req.query.phone as string,
            age: req.query.age ? parseInt(req.query.age as string) : undefined,
            course: req.query.course as CourseEnum,
            course_format: req.query.course_format as CourseFormatEnum,
            course_type: req.query.course_type as CourseTypeEnum,
            status: req.query.status as OrderStatusEnum,
            group: req.query.group as string,
        };

        const result = await orderService.getAllOrders(req.pagination, req.user!, filter);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const editOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const updatedOrder = await orderService.updateOrderById(req.order, req.body);
        res.json(updatedOrder);
    } catch (error) {
        console.error('Edit error:', error);
        next(error);
    }
};

export const addComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const updatedOrder = await orderService.addCommentToOrder(req.order, req.body.text, req.user!.id);
        res.json(updatedOrder);
    } catch (error) {
        next(error);
    }
};

export const getStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const stats = await orderService.getStatistics();
        res.json(stats);
    } catch (error) {
        next(error);
    }
};

export const exportExcel = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const filter = {
            name: req.query.name as string,
            surname: req.query.surname as string,
            email: req.query.email as string,
            phone: req.query.phone as string,
            age: req.query.age ? parseInt(req.query.age as string) : undefined,
            course: req.query.course as any,
            course_format: req.query.course_format as any,
            course_type: req.query.course_type as any,
            status: req.query.status as any,
            group: req.query.group as string,
        };
        const workbook = await orderService.generateExcel(filter, req.user!);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const order = await orderService.getOrderById(id);
        res.json(order);
    } catch (error) {
        next(error);
    }
};

export const bulkReassign = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { orderIds, newManagerId } = req.body;
        await orderService.bulkReassignOrders(orderIds, newManagerId);
        res.json({ message: 'Orders reassigned successfully' });
    } catch (error) {
        next(error);
    }
};