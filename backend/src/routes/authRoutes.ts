import { Router } from 'express';
import { login, logout, getMe } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticateJWT, getMe);

export default router;
