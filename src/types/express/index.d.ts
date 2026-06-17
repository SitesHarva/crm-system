import { IJWTPayload, IPaginationQuery } from '../../interfaces';

declare namespace Express {
    export interface Request {
        user?: IJWTPayload;
        order?: any;
        pagination?: IPaginationQuery;
    }
}