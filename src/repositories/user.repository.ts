import { User, IUser } from '../models/User';
import { RoleEnum } from '../enums/role.enum';

class UserRepository {
    async findByEmail(email: string) {
        return User.findOne({ email });
    }

    async findById(id: string) {
        return User.findById(id);
    }

    async create(data: Partial<IUser>) {
        return User.create(data);
    }

    async findManagersPaginated(skip: number, limit: number, sortBy: string) {
        const [data, total] = await Promise.all([
            User.find({ role: RoleEnum.MANAGER })
                .select('-password')
                .sort(sortBy)
                .skip(skip)
                .limit(limit),
            User.countDocuments({ role: RoleEnum.MANAGER })
        ]);
        return { data, total };
    }

    async updateBanStatus(userId: string, is_active: boolean) {
        const user = await User.findById(userId);
        if (!user) return null;
        user.is_active = is_active;
        await user.save();
        return user;
    }
}

export const userRepository = new UserRepository();