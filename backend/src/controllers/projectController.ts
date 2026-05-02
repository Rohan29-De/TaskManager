import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Project } from '../models/Project';
import { User } from '../models/User';
import Joi from 'joi';

const projectSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional().allow('')
});

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error } = projectSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { name, description } = req.body;
    const project = new Project({
      name,
      description,
      admin: req.user!._id,
      members: [req.user!._id]
    });

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await Project.find({ members: req.user!._id })
      .populate('admin', 'name email')
      .populate('members', 'name email');
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const addMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.admin.toString() !== req.user!._id.toString()) {
      res.status(403).json({ error: 'Only admin can add members' });
      return;
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (project.members.includes(userToAdd._id as any)) {
      res.status(400).json({ error: 'User is already a member' });
      return;
    }

    project.members.push(userToAdd._id as any);
    await project.save();

    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.admin.toString() !== req.user!._id.toString()) {
      res.status(403).json({ error: 'Only admin can remove members' });
      return;
    }

    if (project.admin.toString() === userId) {
      res.status(400).json({ error: 'Cannot remove the admin' });
      return;
    }

    project.members = project.members.filter(m => m.toString() !== userId);
    await project.save();

    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
