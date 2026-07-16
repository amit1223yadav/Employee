import { Router } from 'express';
import { 
  createTicket, 
  getMyTickets, 
  getAllTickets, 
  respondTicket 
} from '../controllers/ticketController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.post('/create', createTicket);
router.get('/my', getMyTickets);

// Admins and HR only
router.get('/all', requireRole(['Super Admin', 'HR Manager']), getAllTickets);
router.put('/:id/respond', requireRole(['Super Admin', 'HR Manager']), respondTicket);

export default router;
