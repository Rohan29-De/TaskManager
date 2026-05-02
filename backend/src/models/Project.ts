import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  admin: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
}

const projectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  description: { type: String },
  admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export const Project = mongoose.model<IProject>('Project', projectSchema);
