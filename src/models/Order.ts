import { Schema, model, Document, Types } from 'mongoose';
import {CourseEnum} from "../enums/course.enum";
import {CourseFormatEnum} from "../enums/course-format.enum";
import {CourseTypeEnum} from "../enums/course-type.enum";
import {OrderStatusEnum} from "../enums/order-status.enum";

export interface IComment {
    text: string;
    author: Types.ObjectId;
    createdAt: Date;
}

export interface IOrder extends Document {
    name: string | null;
    surname: string | null;
    email: string | null;
    phone: string | null;
    age: number | null;
    course: string | null;
    course_format: string | null;
    course_type: string | null;
    status: string | null;
    sum: number | null;
    already_paid: number | null;
    created_at: Date;
    utm: string | null;
    msg: string | null;
    group: string | null;
    manager: Types.ObjectId | null;
    comments: IComment[];
}

const orderSchema = new Schema<IOrder>({
    name: { type: String, default: null },
    surname: { type: String, default: null },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    age: { type: Number, default: null },
    course: { type: String, enum: Object.values(CourseEnum), default: null },
    course_format: { type: String, enum: Object.values(CourseFormatEnum), default: null },
    course_type: { type: String, enum: Object.values(CourseTypeEnum), default: null },
    status: { type: String, enum: Object.values(OrderStatusEnum), default: null },
    sum: { type: Number, default: null },
    already_paid: { type: Number, default: null },
    created_at: { type: Date, default: Date.now },
    utm: { type: String, default: null },
    msg: { type: String, default: null },
    group: { type: String, default: null },
    manager: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    comments: [{
        text: { type: String, required: true },
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now }
    }]
});

orderSchema.index({ created_at: -1 });
orderSchema.index({ manager: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ email: 1 });

export const Order = model<IOrder>('Order', orderSchema);