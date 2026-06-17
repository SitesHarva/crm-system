import { Schema, model, Document } from 'mongoose';

export interface IGroup extends Document {
    name: string;
    created_at: Date;
}

const groupSchema = new Schema<IGroup>({
    name: { type: String, required: true, unique: true, trim: true },
    created_at: { type: Date, default: Date.now }
});

export const Group = model<IGroup>('Group', groupSchema);