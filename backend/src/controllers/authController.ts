import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { Employee } from '../models/Employee';
import { AuthenticatedRequest } from '../middleware/auth';

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Explicitly select password for comparison
    const employee = await Employee.findOne({ email: email.toLowerCase(), isDeleted: false }).select('+password');
    if (!employee) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (employee.status !== 'Active') {
      return res.status(403).json({ message: 'Your account is inactive. Please contact your manager.' });
    }

    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET || 'super_secret_key_for_synapse_hr_2026';
    const expires = process.env.JWT_EXPIRE || '24h';

    const token = jwt.sign(
      { id: employee._id, role: employee.role, email: employee.email },
      secret,
      { expiresIn: expires as any }
    );

    // Convert employee to object and strip password
    const employeeObject = employee.toObject();
    delete employeeObject.password;

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: employeeObject,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  // Client can just discard the JWT token, but we return a success confirmation
  return res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Populate manager name
    const employee = await Employee.findById(req.user._id)
      .populate('reportingManager', 'name employeeId email designation department')
      .lean();

    return res.status(200).json({ user: employee });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error retrieving profile', error: error.message });
  }
};
