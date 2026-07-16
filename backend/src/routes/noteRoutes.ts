import { Router } from 'express';
import { getMyNotes, createNote, updateNote, deleteNote } from '../controllers/noteController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', getMyNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
