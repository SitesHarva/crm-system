import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { ApiError } from '../exceptions/api-error';
import { config } from '../config/config';

class ActivationService {
    private generateToken(userId: string, type: 'activate' | 'recover'): string {
        return jwt.sign(
            { userId, type },
            config.jwtActivationSecret,
            { expiresIn: '30m' }
        );
    }

    verifyToken(token: string): { userId: string; type: string } {
        try {
            return jwt.verify(token, config.jwtActivationSecret) as any;
        } catch {
            throw ApiError.BadRequest('Невірний або прострочений токен');
        }
    }

    generateActivationLink(userId: string, baseUrl: string): string {
        const token = this.generateToken(userId, 'activate');
        return `${baseUrl}/set-password?token=${token}`;
    }

    generateRecoveryLink(userId: string, baseUrl: string): string {
        const token = this.generateToken(userId, 'recover');
        return `${baseUrl}/set-password?token=${token}`;
    }

    getFrontendRedirectUrl(token: string): string {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return `${frontendUrl}/set-password?token=${token}`;
    }

    async setPassword(token: string, newPassword: string): Promise<void> {
        const { userId, type } = this.verifyToken(token);
        if (type !== 'activate' && type !== 'recover') {
            throw ApiError.BadRequest('Неправильний тип токена');
        }

        const user = await User.findById(userId);
        if (!user) throw ApiError.NotFound('Користувача не знайдено');

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        user.is_active = true;
        await user.save();
    }
}

export const activationService = new ActivationService();