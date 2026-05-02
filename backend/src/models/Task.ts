import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Done';
  project: mongoose.Types.ObjectId;
  assignees: mongoose.Types.ObjectId[];
}

const taskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  assignees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export const Task = mongoose.model<ITask>('Task', taskSchema);
