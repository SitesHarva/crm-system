import { Schema, model, Document, Types } from 'mongoose';

export interface IToken extends Document {
    user: Types.ObjectId;
    refreshToken: string;
}

const tokenSchema = new Schema<IToken>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    refreshToken: { type: String, required: true }
}, { timestamps: true });

tokenSchema.index({ refreshToken: 1 }, { unique: true });

export const Token = model<IToken>('Token', tokenSchema);