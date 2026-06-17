import jwt from 'jsonwebtoken';
import { Token } from '../models/Token';
import { config } from '../config/config';
import { IJWTPayload } from '../interfaces';

class TokenService {
    generateTokens(payload: IJWTPayload) {
        if (!config.jwtSecret) throw new Error('JWT_SECRET not set');
        const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '15m' });
        const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: '30d' });
        return { accessToken, refreshToken };
    }

    async saveToken(userId: string, refreshToken: string) {
        const tokenData = await Token.findOne({ user: userId });
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        const token = await Token.create({ user: userId, refreshToken });
        return token;
    }

    async removeToken(refreshToken: string) {
        const tokenData = await Token.deleteOne({ refreshToken });
        return tokenData;
    }

    async findToken(refreshToken: string) {
        const tokenData = await Token.findOne({ refreshToken });
        return tokenData;
    }

    validateAccessToken(token: string): IJWTPayload | null {
        try {
            return jwt.verify(token, config.jwtSecret) as IJWTPayload;
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token: string): IJWTPayload | null {
        try {
            return jwt.verify(token, config.jwtRefreshSecret) as IJWTPayload;
        } catch (e) {
            return null;
        }
    }
}

export const tokenService = new TokenService();