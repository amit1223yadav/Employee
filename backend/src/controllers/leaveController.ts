import { Response } from 'express';
import { Leave } from '../models/Leave';
import { AuthenticatedRequest } from '../middleware/auth';

export const requestLeave = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { startDate, endDate, type, reason } = req.body;
    if (!startDate || !endDate || !type || !reason) {
      return res.status(400).json({ message: 'All leave fields are required' });
    }

    const leave = new Leave({
      employee: req.user!._id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      type,
      reason,
      status: 'Pending',
    });

    await leave.save();
    return res.status(201).json({ message: 'Leave request submitted successfully', leave });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error submitting leave request', error: error.message });
  }
};

export const getMyLeaves = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const leaves = await Leave.find({ employee: req.user!._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ leaves });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching personal leaves', error: error.message });
  }
};

export const getAllLeaves = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.query;
    const query: any = {};
    if (status) {
      query.status = status;
    }

    const leaves = await Leave.find(query)
      .populate('employee', 'name employeeId department designation role')
      .populate('approvedBy', 'name designation')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ leaves });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving leave list', error: error.message });
  }
};

export const approveRejectLeave = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Approved' or 'Rejected'

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Approved or Rejected' });
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leave.status = status;
    leave.approvedBy = req.user!._id;
    await leave.save();

    return res.status(200).json({ message: `Leave request status updated to ${status}`, leave });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating leave status', error: error.message });
  }
};
