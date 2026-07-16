import { Router } from 'express';
import { getActiveMeetings, createMeeting, joinMeeting, endMeeting } from '../controllers/meetingController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', getActiveMeetings);
router.post('/', createMeeting);
router.put('/:id/join', joinMeeting);
router.put('/:id/end', endMeeting);

export default router;
