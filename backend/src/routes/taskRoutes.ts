import { Router } from 'express';
import { 
  createTask, 
  getMyTasks, 
  getAllTasks, 
  updateTaskStatus,
  addTaskComment,
  updateTask,
  deleteTask
} from '../controllers/taskController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.post('/assign', requireRole(['Super Admin', 'HR Manager']), createTask);
router.get('/my', getMyTasks);
router.get('/all', requireRole(['Super Admin', 'HR Manager']), getAllTasks);
router.put('/:id/status', updateTaskStatus); // Accessible by employee (owner) or admins
router.post('/:id/comment', addTaskComment);
router.put('/:id', requireRole(['Super Admin', 'HR Manager']), updateTask);
router.delete('/:id', requireRole(['Super Admin', 'HR Manager']), deleteTask);

export default router;
