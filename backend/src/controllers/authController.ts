import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import Joi from 'joi';

const signupSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Signup request received:', req.body);
    const { error } = signupSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error);
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      res.status(400).json({ error: 'Email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash });
    console.log('Saving user:', { name, email });
    await user.save();
    console.log('User saved successfully:', user._id);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.status(201).json({ user: { id: user._id, name, email }, token });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.status(200).json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  if (req.user) {
    res.status(200).json({ id: req.user._id, name: req.user.name, email: req.user.email });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}, 'name email _id');
    res.status(200).json(users);
  } catch (err) {
    console.error('GetAllUsers error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
