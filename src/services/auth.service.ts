import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { tokenService } from './token.service';
import { ApiError } from '../exceptions/api-error';

class AuthService {
    async login(email: string, pass: string) {
        const user = await User.findOne({ email });
        if (!user || !user.is_active || !user.password) {
            throw ApiError.UnauthorizedError();
        }

        const isPassEquals = await bcrypt.compare(pass, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Invalid credentials');
        }

        const payload = { id: user._id.toString(), role: user.role };
        const tokens = tokenService.generateTokens(payload);
        await tokenService.saveToken(user._id.toString(), tokens.refreshToken);
        user.last_login = new Date();
        await user.save();

        return { ...tokens, user: payload };
    }

    async logout(refreshToken: string) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(userId: string) {
        const user = await User.findById(userId);
        if (!user || !user.is_active) {
            throw ApiError.UnauthorizedError();
        }
        const payload = { id: user._id.toString(), role: user.role };
        const tokens = tokenService.generateTokens(payload);
        await tokenService.saveToken(user._id.toString(), tokens.refreshToken);
        return { ...tokens, user: payload };
    }
}

export const authService = new AuthService();