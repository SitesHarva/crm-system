import mongoose from 'mongoose';
import { Order, IOrder } from '../models/Order';

class OrderRepository {
    async findMany(
        filter: Record<string, any>,
        skip: number,
        limit: number,
        sort: Record<string, 1 | -1>
    ) {
        return Order.find(filter)
            .populate('manager', 'name surname')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();
    }

    async count(filter: Record<string, any>): Promise<number> {
        return Order.countDocuments(filter).exec();
    }

    async findById(id: string, session?: mongoose.ClientSession) {
        return Order.findById(id).session(session || null).exec();
    }

    async bulkUpdate(operations: mongoose.AnyBulkWriteOperation<any>[]) {
        return Order.bulkWrite(operations);
    }
}

export const orderRepository = new OrderRepository();