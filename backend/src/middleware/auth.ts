import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Employee, IEmployee } from '../models/Employee';

// Extend the Request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: IEmployee;
}

interface JWTPayload {
  id: string;
  role: string;
  email: string;
}

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'super_secret_key_for_synapse_hr_2026';

    const decoded = jwt.verify(token, secret) as JWTPayload;

    const employee = await Employee.findOne({ _id: decoded.id, isDeleted: false });
    if (!employee) {
      return res.status(401).json({ message: 'User session invalid or employee deleted' });
    }

    if (employee.status !== 'Active') {
      return res.status(403).json({ message: 'Employee status is inactive' });
    }

    req.user = employee;
    next();
  } catch (error: any) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
};

export const requireRole = (allowedRoles: ('Super Admin' | 'HR Manager' | 'Employee')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};
