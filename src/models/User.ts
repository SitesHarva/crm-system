import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    surname: string;
    email: string;
    password?: string;
    role: 'admin' | 'manager';
    is_active: boolean;
    last_login?: Date;
    created_at: Date;
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ['admin', 'manager'], default: 'manager' },
    is_active: { type: Boolean, default: false },
    last_login: { type: Date }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export const User = model<IUser>('User', userSchema);