import { Router } from 'express';
import { getOrgTree, getDashboardStats } from '../controllers/orgController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Protect all routes with JWT check
router.use(authenticateJWT);

router.get('/tree', getOrgTree);
router.get('/dashboard-stats', getDashboardStats);

export default router;
