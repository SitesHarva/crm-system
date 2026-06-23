import mongoose, { Schema, model, Document } from 'mongoose';

const CounterSchema = mongoose.models.Counter ? mongoose.model('Counter').schema : new Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});
const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

export interface IUser extends Document {
    id: number;
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
    id: { type: Number, unique: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    role: { type: String, enum: ['admin', 'manager'], default: 'manager' },
    is_active: { type: Boolean, default: false },
    last_login: { type: Date }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

userSchema.pre<IUser>('save', async function () {
    if (!this.id) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'userId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.id = counter.seq;
    }
});

export const User = model<IUser>('User', userSchema);