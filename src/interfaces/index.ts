import { Types } from 'mongoose';
import { CourseEnum } from '../enums/course.enum';
import { CourseFormatEnum } from '../enums/course-format.enum';
import { CourseTypeEnum } from '../enums/course-type.enum';
import { OrderStatusEnum } from '../enums/order-status.enum';

export interface IJWTPayload {
    id: string;
    role: 'admin' | 'manager';
}

export interface IOrderFilter {
    age?: number;
    name?: string;
    surname?: string;
    email?: string;
    phone?: string;
    group?: string;
    course?: CourseEnum;
    course_format?: CourseFormatEnum;
    course_type?: CourseTypeEnum;
    status?: OrderStatusEnum;
    created_at?: { $gte?: Date; $lte?: Date };
    manager?: Types.ObjectId;
}

export interface IOrderUpdateInput {
    name?: string | null;
    surname?: string | null;
    email?: string | null;
    phone?: string | null;
    age?: number | null;
    course?: CourseEnum | null;
    course_format?: CourseFormatEnum | null;
    course_type?: CourseTypeEnum | null;
    status?: OrderStatusEnum | null;
    sum?: number | null;
    already_paid?: number | null;
    group?: string | null;
}

export interface IPaginationQuery {
    page: number;
    limit: number;
    my: boolean;
    startDate?: Date;
    endDate?: Date;
    sort: string;
}