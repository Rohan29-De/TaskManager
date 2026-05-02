import { Router } from 'express';
import { createProject, getProjects, addMember, removeMember } from '../controllers/projectController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);
router.post('/', createProject);
router.get('/', getProjects);
router.post('/:projectId/members', addMember);
router.delete('/:projectId/members/:userId', removeMember);

export default router;
