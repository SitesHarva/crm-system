import Joi from 'joi';
import { OrderStatusEnum } from '../enums/order-status.enum';
import { CourseFormatEnum } from '../enums/course-format.enum';
import { CourseTypeEnum } from '../enums/course-type.enum';
import { CourseEnum } from '../enums/course.enum';

export const commentValidator = Joi.object({
    text: Joi.string().trim().min(1).required()
});

export const updateOrderValidator = Joi.object({
    name: Joi.string().allow(null, ''),
    surname: Joi.string().allow(null, ''),
    email: Joi.string().email().allow(null, ''),
    phone: Joi.string().allow(null, ''),
    age: Joi.number().integer().min(0).allow(null),
    course: Joi.string().valid(...Object.values(CourseEnum)).allow(null, ''),
    course_format: Joi.string().valid(...Object.values(CourseFormatEnum)).allow(null, ''),
    course_type: Joi.string().valid(...Object.values(CourseTypeEnum)).allow(null, ''),
    status: Joi.string().valid(...Object.values(OrderStatusEnum)).allow(null, ''),
    sum: Joi.number().allow(null),
    already_paid: Joi.number().allow(null),
    group: Joi.string().allow(null, '')
});

export const bulkReassignValidator = Joi.object({
    orderIds: Joi.array().items(Joi.string().length(24).hex()).min(1).required(),
    newManagerId: Joi.string().length(24).hex().required()
});