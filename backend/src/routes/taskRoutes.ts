import { Router } from 'express';
import { createTask, getTasks, updateTask, deleteTask } from '../controllers/taskController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);
router.post('/', createTask);
router.get('/', getTasks);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

export default router;
