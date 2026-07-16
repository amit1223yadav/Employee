import { Router } from 'express';
import { getLatestAnnouncement, getAllAnnouncements, createAnnouncement } from '../controllers/announcementController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/latest', getLatestAnnouncement);
router.get('/', getAllAnnouncements);
router.post('/', requireRole(['Super Admin', 'HR Manager']), createAnnouncement);

export default router;
