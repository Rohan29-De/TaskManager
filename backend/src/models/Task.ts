import mongoose, { Document, Schema } from 'mongoose';

export interface IComment {
  text: string;
  createdAt: Date;
}

export interface IAttachment {
  name: string;
  url: string;
  size: number;
  createdAt: Date;
}

export interface ITask extends Document {
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Done';
  project: mongoose.Types.ObjectId;
  assignees: mongoose.Types.ObjectId[];
  timeSpent: number;
  comments: IComment[];
  attachments: IAttachment[];
  tags: string[];
  notification: string;
}

const taskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  assignees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  timeSpent: { type: Number, default: 0 },
  comments: [{ text: String, createdAt: { type: Date, default: Date.now } }],
  attachments: [{
    name: String,
    url: String,
    size: Number,
    createdAt: { type: Date, default: Date.now }
  }],
  tags: [{ type: String }],
  notification: { type: String },
}, { timestamps: true });

export const Task = mongoose.model<ITask>('Task', taskSchema);
