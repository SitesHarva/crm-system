import { Group } from '../models/Group';
import { ApiError } from '../exceptions/api-error';

class GroupService {
    async getAllGroups() {
        return Group.find().sort({ name: 1 }).lean();
    }

    async createGroup(name: string) {
        const existing = await Group.findOne({ name });
        if (existing) {
            throw ApiError.BadRequest(`Group "${name}" already exists`);
        }
        return Group.create({ name });
    }
}

export const groupService = new GroupService();