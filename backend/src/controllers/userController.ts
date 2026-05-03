import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, avatarUrl } = req.body;
    const userId = req.user!._id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (name) user.name = name;
    if (email) {
      // Check if email already exists
      const existing = await User.findOne({ email, _id: { $ne: userId } });
      if (existing) {
        res.status(400).json({ error: 'Email already in use' });
        return;
      }
      user.email = email;
    }
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
