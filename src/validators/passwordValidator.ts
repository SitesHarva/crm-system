import Joi from "joi";

export const passwordValidator = Joi.object({
    password: Joi.string()
        .min(8)
        .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
        .messages({
            'string.pattern.base': 'Password must be at least 8 characters long and contain both letters and numbers'
        })
        .required()
});

export const loginValidator = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});