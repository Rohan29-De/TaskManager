import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import Joi from 'joi';

const taskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional().allow(''),
  dueDate: Joi.date().optional(),
  priority: Joi.string().valid('Low', 'Medium', 'High').optional(),
  status: Joi.string().valid('To Do', 'In Progress', 'Done').optional(),
  projectId: Joi.string().required(),
  assignees: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  notification: Joi.string().optional().allow('')
});

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error } = taskSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { title, description, dueDate, priority, status, projectId, assignees, tags, notification } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Check if user is a member of the project
    if (!project.members.includes(req.user!._id as any)) {
      res.status(403).json({ error: 'You are not a member of this project' });
      return;
    }

    const task = new Task({
      title,
      description,
      dueDate,
      priority: priority || 'Medium',
      status: status || 'To Do',
      project: projectId,
      assignees: assignees || [],
      tags: tags || [],
      notification: notification || ''
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query;
    let filter: any = {};
    
    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project || !project.members.includes(req.user!._id as any)) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
      filter.project = projectId;
    } else {
      // Find all projects where user is a member
      const userProjects = await Project.find({ members: req.user!._id }).select('_id');
      filter.project = { $in: userProjects.map(p => p._id) };
    }

    const tasks = await Task.find(filter)
      .populate('project', 'name')
      .populate('assignees', 'name email');
      
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { status, priority, assignees, dueDate, title, description, timeSpent, comments, tags, notification, attachments } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const project = await Project.findById(task.project);
    if (!project || !project.members.includes(req.user!._id as any)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // If user is not admin, they can only update status of assigned tasks
    if (project.admin.toString() !== req.user!._id.toString()) {
       if (!task.assignees.includes(req.user!._id as any) && !assignees) {
           res.status(403).json({ error: 'Only admins or assignees can update this task' });
           return;
       }
       if (assignees || priority || title || description || dueDate) {
           res.status(403).json({ error: 'Only admins can update core task details' });
           return;
       }
    }

    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assignees) task.assignees = assignees;
    if (dueDate) task.dueDate = dueDate;
    if (title) task.title = title;
    if (description) task.description = description;
    if (timeSpent !== undefined) task.timeSpent = timeSpent;
    if (comments !== undefined) task.comments = comments;
    if (tags !== undefined) task.tags = tags;
    if (notification !== undefined) task.notification = notification;
    if (attachments !== undefined) task.attachments = attachments;

    await task.save();
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
