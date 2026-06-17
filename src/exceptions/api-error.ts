export class ApiError extends Error {
    status: number;
    errors: any[];

    constructor(status: number, message: string, errors: any[] = []) {
        super(message);
        this.status = status;
        this.errors = errors;
        Object.setPrototypeOf(this, ApiError.prototype);
    }

    static UnauthorizedError() {
        return new ApiError(401, 'User is not authorized');
    }

    static BadRequest(message: string, errors: any[] = []) {
        return new ApiError(400, message, errors);
    }

    static Forbidden() {
        return new ApiError(403, 'Access denied');
    }

    static NotFound(message: string = 'Not found') {
        return new ApiError(404, message);
    }
}