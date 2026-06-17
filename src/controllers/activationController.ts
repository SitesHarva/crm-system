import { Request, Response, NextFunction } from 'express';
import { activationService } from '../services/activation.service';
import { passwordValidator } from '../validators/passwordValidator';
import { ApiError } from '../exceptions/api-error';

export const setPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token, password } = req.body;
        const { error } = passwordValidator.validate({ password });
        if (error) throw ApiError.BadRequest(error.message);

        await activationService.setPassword(token, password);
        res.status(200).json({ message: 'Пароль успішно встановлено. Тепер ви можете увійти.' });
    } catch (e) {
        next(e);
    }
};

export const redirectToSetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token } = req.params;
        const tokenStr = Array.isArray(token) ? token[0] : token;
        const redirectUrl = activationService.getFrontendRedirectUrl(tokenStr);
        res.redirect(redirectUrl);
    } catch (e) {
        next(e);
    }
};