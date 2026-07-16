import { Router } from 'express';
import { 
  clockIn, 
  clockOut, 
  getTodayStatus, 
  getHistory,
  getAllAttendance
} from '../controllers/attendanceController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/today', getTodayStatus);
router.get('/history', getHistory);
router.get('/all', requireRole(['Super Admin', 'HR Manager']), getAllAttendance);

export default router;
