import { Request, Response, NextFunction } from 'express';
import { groupService } from '../services/group.service';

export const getGroups = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const groups = await groupService.getAllGroups();
        res.json(groups);
    } catch (e) { next(e); }
};

export const createGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.body;
        const group = await groupService.createGroup(name);
        res.status(201).json(group);
    } catch (e) { next(e); }
};