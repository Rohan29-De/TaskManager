import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Task } from '../models/Task';
import { Project } from '../models/Project';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userProjects = await Project.find({ members: req.user!._id }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    const tasks = await Task.find({ project: { $in: projectIds } });

    const totalTasks = tasks.length;
    const tasksByStatus = {
      'To Do': tasks.filter(t => t.status === 'To Do').length,
      'In Progress': tasks.filter(t => t.status === 'In Progress').length,
      'Done': tasks.filter(t => t.status === 'Done').length
    };

    const tasksPerUser: Record<string, number> = {};
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length;

    tasks.forEach(task => {
      task.assignees.forEach(assignee => {
        const id = assignee.toString();
        tasksPerUser[id] = (tasksPerUser[id] || 0) + 1;
      });
    });

    res.status(200).json({
      totalTasks,
      tasksByStatus,
      tasksPerUser,
      overdueTasks
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
