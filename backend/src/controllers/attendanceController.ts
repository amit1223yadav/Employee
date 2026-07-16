import { Response } from 'express';
import { Attendance } from '../models/Attendance';
import { AuthenticatedRequest } from '../middleware/auth';

// Helper to get local date string YYYY-MM-DD
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const clockIn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const todayStr = getTodayDateString();
    
    // Check if check-in record already exists for today
    let record = await Attendance.findOne({ employee: req.user!._id, date: todayStr });
    
    if (record && record.clockIn) {
      return res.status(400).json({ message: 'You have already clocked in for today', record });
    }

    if (!record) {
      record = new Attendance({
        employee: req.user!._id,
        date: todayStr,
        clockIn: new Date(),
        status: 'Present',
      });
    } else {
      record.clockIn = new Date();
      record.status = 'Present';
    }

    await record.save();
    return res.status(200).json({ message: 'Clocked in successfully', record });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error clocking in', error: error.message });
  }
};

export const clockOut = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const todayStr = getTodayDateString();
    
    const record = await Attendance.findOne({ employee: req.user!._id, date: todayStr });
    if (!record) {
      return res.status(400).json({ message: 'No clock-in record found for today' });
    }

    if (record.clockOut) {
      return res.status(400).json({ message: 'You have already clocked out for today', record });
    }

    record.clockOut = new Date();
    await record.save();

    return res.status(200).json({ message: 'Clocked out successfully', record });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error clocking out', error: error.message });
  }
};

export const getTodayStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const todayStr = getTodayDateString();
    const record = await Attendance.findOne({ employee: req.user!._id, date: todayStr }).lean();
    return res.status(200).json({ record });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error getting today check-in status', error: error.message });
  }
};

export const getHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const history = await Attendance.find({ employee: req.user!._id })
      .sort({ date: -1 })
      .limit(30)
      .lean();
    return res.status(200).json({ history });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving attendance logs', error: error.message });
  }
};

export const getAllAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await Attendance.find({})
      .populate('employee', 'name employeeId department designation')
      .sort({ date: -1 })
      .limit(200)
      .lean();
    return res.status(200).json({ list });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving master attendance list', error: error.message });
  }
};
