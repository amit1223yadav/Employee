import { Router } from 'express';
import multer from 'multer';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateManagerOnly,
  getReportees,
  importCSV,
} from '../controllers/employeeController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Protect all routes with JWT check
router.use(authenticateJWT);

// Employee list and details
router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);

// Create employee (Super Admin and HR Manager only)
router.post('/', requireRole(['Super Admin', 'HR Manager']), createEmployee);

// Update employee (Super Admin, HR Manager, and Employee themselves - checks inside controller)
router.put('/:id', updateEmployee);

// Soft delete employee (Super Admin only)
router.delete('/:id', requireRole(['Super Admin']), deleteEmployee);

// Update manager (Super Admin and HR Manager only)
router.patch('/:id/manager', requireRole(['Super Admin', 'HR Manager']), updateManagerOnly);

// Get direct reportees
router.get('/:id/reportees', getReportees);

// CSV Import (Super Admin and HR Manager only)
router.post('/import', requireRole(['Super Admin', 'HR Manager']), upload.single('file'), importCSV);

export default router;
