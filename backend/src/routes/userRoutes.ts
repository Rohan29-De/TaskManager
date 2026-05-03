import { Router } from 'express';
import { updateProfile } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);
router.put('/profile', updateProfile);

export default router;
