import mongoose from 'mongoose';
import ExcelJS from 'exceljs';
import { orderRepository } from '../repositories/order.repository';
import { Order, IOrder } from '../models/Order';
import { OrderStatusEnum } from '../enums/order-status.enum';
import { RoleEnum } from '../enums/role.enum';
import { ApiError } from '../exceptions/api-error';
import { User } from '../models/User';
import { escapeRegex } from '../utils/escapeRegex';
import { IJWTPayload, IOrderFilter, IOrderUpdateInput, IPaginationQuery } from '../interfaces';

class OrderService {
    private buildFilter(filter: IOrderFilter, user?: IJWTPayload): Record<string, any> {
        const mongoFilter: Record<string, any> = {};

        if (filter.age !== undefined && filter.age !== null) mongoFilter.age = filter.age;
        if (filter.name) mongoFilter.name = { $regex: escapeRegex(filter.name), $options: 'i' };
        if (filter.surname) mongoFilter.surname = { $regex: escapeRegex(filter.surname), $options: 'i' };
        if (filter.email) mongoFilter.email = { $regex: escapeRegex(filter.email), $options: 'i' };
        if (filter.phone) mongoFilter.phone = { $regex: escapeRegex(filter.phone), $options: 'i' };
        if (filter.group) mongoFilter.group = { $regex: escapeRegex(filter.group), $options: 'i' };

        if (filter.course) mongoFilter.course = filter.course;
        if (filter.course_format) mongoFilter.course_format = filter.course_format;
        if (filter.course_type) mongoFilter.course_type = filter.course_type;
        if (filter.status) mongoFilter.status = filter.status;

        if (filter.created_at) {
            mongoFilter.created_at = {};
            if (filter.created_at.$gte) {
                const gte = new Date(filter.created_at.$gte);
                if (!isNaN(gte.getTime())) mongoFilter.created_at.$gte = gte;
            }
            if (filter.created_at.$lte) {
                const lte = new Date(filter.created_at.$lte);
                if (!isNaN(lte.getTime())) mongoFilter.created_at.$lte = lte;
            }
        }

        if (filter.manager) mongoFilter.manager = filter.manager;

        return mongoFilter;
    }

    async getAllOrders(pagination: IPaginationQuery, user: IJWTPayload, additionalFilters: IOrderFilter = {}) {
        const { page, limit, my, startDate, endDate, sort } = pagination;
        const skip = (page - 1) * limit;

        const filter: IOrderFilter = { ...additionalFilters };

        if (my) filter.manager = new mongoose.Types.ObjectId(user.id);

        if (startDate || endDate) {
            filter.created_at = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                filter.created_at.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.created_at.$lte = end;
            }
        }

        const sortDirection = sort.startsWith('-') ? -1 : 1;
        const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
        const sortOption: Record<string, 1 | -1> = { [sortField]: sortDirection, _id: 1 };

        const mongoFilter = this.buildFilter(filter, user);
        const [orders, total] = await Promise.all([
            orderRepository.findMany(mongoFilter, skip, limit, sortOption),
            orderRepository.count(mongoFilter)
        ]);

        return {
            data: orders,
            meta: {
                total_items: total,
                total_pages: Math.ceil(total / limit),
                current_page: page,
                per_page: limit
            }
        };
    }

    async updateOrderById(order: IOrder, updateData: IOrderUpdateInput) {
        Object.assign(order, updateData);
        await order.save();
        return Order.findById(order._id)
            .populate('manager', 'name surname')
            .populate('comments.author', 'name surname');
    }

    async addCommentToOrder(order: IOrder, text: string, userId: string) {
        if (!order.status || order.status === OrderStatusEnum.NEW) {
            order.status = OrderStatusEnum.IN_WORK;
        }
        if (!order.manager) {
            order.manager = new mongoose.Types.ObjectId(userId);
        }
        order.comments.push({
            text,
            author: new mongoose.Types.ObjectId(userId),
            createdAt: new Date()
        });
        await order.save();
        const updated = await Order.findById(order._id)
            .populate('manager', 'name surname')
            .populate('comments.author', 'name surname');
        return updated;
    }

    async getStatistics() {
        const stats = await Order.aggregate([
            { $group: { _id: { $ifNull: ['$status', 'null'] }, count: { $sum: 1 } } }
        ]);
        const total = await Order.countDocuments();
        const byStatus: Record<string, number> = {};
        stats.forEach(s => { byStatus[s._id] = s.count; });
        return { total, byStatus };
    }

    async getManagerStatistics(managerId: string) {
        const stats = await Order.aggregate([
            { $match: { manager: new mongoose.Types.ObjectId(managerId) } },
            { $group: { _id: { $ifNull: ['$status', 'null'] }, count: { $sum: 1 } } }
        ]);
        const total = await Order.countDocuments({ manager: managerId });
        const byStatus: Record<string, number> = {};
        stats.forEach(s => { byStatus[s._id] = s.count; });
        return { total, byStatus };
    }

    async generateExcel(filter: IOrderFilter, user: IJWTPayload, options: { my: boolean; startDate?: Date; endDate?: Date; sort: string }) {
        const { my, startDate, endDate, sort } = options;
        const finalFilter: IOrderFilter = { ...filter };

        if (my) finalFilter.manager = new mongoose.Types.ObjectId(user.id);

        if (startDate || endDate) {
            finalFilter.created_at = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                finalFilter.created_at.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                finalFilter.created_at.$lte = end;
            }
        }

        const sortDirection = sort.startsWith('-') ? -1 : 1;
        const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
        const sortOption: Record<string, 1 | -1> = { [sortField]: sortDirection, _id: 1 };

        const mongoFilter = this.buildFilter(finalFilter, user);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Orders');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Name', key: 'name', width: 15 },
            { header: 'Surname', key: 'surname', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Phone', key: 'phone', width: 20 },
            { header: 'Age', key: 'age', width: 8 },
            { header: 'Course', key: 'course', width: 10 },
            { header: 'Course Format', key: 'course_format', width: 15 },
            { header: 'Course Type', key: 'course_type', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Sum', key: 'sum', width: 10 },
            { header: 'Already Paid', key: 'already_paid', width: 12 },
            { header: 'Created At', key: 'created_at', width: 20 },
            { header: 'Manager', key: 'manager', width: 20 },
            { header: 'Group', key: 'group', width: 15 },
            { header: 'Message', key: 'msg', width: 30 },
            { header: 'UTM', key: 'utm', width: 30 }
        ];

        const cursor = Order.find(mongoFilter)
            .populate('manager', 'name surname')
            .sort(sortOption)
            .lean()
            .cursor();

        for (let doc = await cursor.next(); doc; doc = await cursor.next()) {
            let created_at_str = '';
            if (doc.created_at) {
                if (doc.created_at instanceof Date) {
                    created_at_str = doc.created_at.toISOString();
                } else if (typeof doc.created_at === 'string') {
                    created_at_str = doc.created_at;
                } else if (typeof doc.created_at === 'number') {
                    created_at_str = new Date(doc.created_at).toISOString();
                }
            }

            worksheet.addRow({
                id: doc.id || doc._id.toString(),
                name: doc.name,
                surname: doc.surname,
                email: doc.email,
                phone: doc.phone,
                age: doc.age,
                course: doc.course,
                course_format: doc.course_format,
                course_type: doc.course_type,
                status: doc.status,
                sum: doc.sum,
                already_paid: doc.already_paid,
                created_at: created_at_str,
                manager: doc.manager ? `${(doc.manager as any).name} ${(doc.manager as any).surname}` : '',
                group: doc.group,
                msg: doc.msg,
                utm: doc.utm
            });
        }
        return workbook;
    }

    async bulkReassignOrders(orderIds: string[], newManagerId: string) {
        const manager = await User.findById(newManagerId);
        if (!manager || manager.role !== RoleEnum.MANAGER) {
            throw ApiError.BadRequest('Invalid manager ID');
        }
        const bulkOps = orderIds.map(id => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: { manager: new mongoose.Types.ObjectId(newManagerId), status: OrderStatusEnum.IN_WORK } }
            }
        }));
        return orderRepository.bulkUpdate(bulkOps);
    }

    async getOrderById(orderId: string) {
        const order = await Order.findById(orderId)
            .populate('manager', 'name surname')
            .populate('comments.author', 'name surname');
        if (!order) throw ApiError.NotFound('Order not found');
        return order;
    }
}

export const orderService = new OrderService();