import { User } from '../models/User';
import { ApiError } from '../exceptions/api-error';
import { RoleEnum } from '../enums/role.enum';
import { activationService } from './activation.service';
import { orderService } from './order.service';
import {userRepository} from "../repositories/user.repository";   // виправлений шлях

class UserService {
    async createManager(data: { name: string; surname: string; email: string }) {
        const candidate = await userRepository.findByEmail(data.email);
        if (candidate) {
            throw ApiError.BadRequest(`User with email ${data.email} already exists`);
        }
        const user = await userRepository.create({ ...data, role: RoleEnum.MANAGER });
        return user;
    }

    async getAllManagersPaginated(page = 1, limit = 10, sortBy = '-created_at') {
        const skip = (page - 1) * limit;
        const { data, total } = await userRepository.findManagersPaginated(skip, limit, sortBy);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }

    async updateBanStatus(userId: string, is_active: boolean) {
        const user = await userRepository.updateBanStatus(userId, is_active);
        if (!user) throw ApiError.NotFound('User not found');
        return user;
    }

    async getUserById(userId: string) {
        const user = await userRepository.findById(userId);
        if (!user) throw ApiError.NotFound('User not found');
        return user;
    }

    async generateActivationLink(userId: string, frontendBaseUrl: string): Promise<string> {
        const user = await User.findById(userId);
        if (!user) throw ApiError.NotFound('User not found');
        if (user.is_active) throw ApiError.BadRequest('Користувач вже активований');
        return activationService.generateActivationLink(userId, frontendBaseUrl);
    }

    async generateRecoveryLink(userId: string, frontendBaseUrl: string): Promise<string> {
        const user = await User.findById(userId);
        if (!user) throw ApiError.NotFound('User not found');
        return activationService.generateRecoveryLink(userId, frontendBaseUrl);
    }

    async getManagerStats(managerId: string) {
        return orderService.getManagerStatistics(managerId);
    }
}

export const userService = new UserService();