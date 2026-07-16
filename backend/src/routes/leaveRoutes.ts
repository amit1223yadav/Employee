import { Router } from 'express';
import { 
  requestLeave, 
  getMyLeaves, 
  getAllLeaves, 
  approveRejectLeave 
} from '../controllers/leaveController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

// Apply authenticateJWT globally for all leave routes
router.use(authenticateJWT);

router.post('/request', requestLeave);
router.get('/my', getMyLeaves);

// HR and Admins only can view all leaves and approve/reject them
router.get('/all', requireRole(['Super Admin', 'HR Manager']), getAllLeaves);
router.put('/:id/status', requireRole(['Super Admin', 'HR Manager']), approveRejectLeave);

export default router;
