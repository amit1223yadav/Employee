import { Response } from 'express';
import { Meeting } from '../models/Meeting';
import { AuthenticatedRequest } from '../middleware/auth';

export const getActiveMeetings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const meetings = await Meeting.find({ status: 'Active' })
      .populate('host', 'name designation department profileImage')
      .sort({ createdAt: -1 });
    return res.status(200).json({ meetings });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving active meetings', error: error.message });
  }
};

export const createMeeting = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, type } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Meeting title is required' });
    }

    // Auto-generate random room code: e.g. synapse-xxx-yyyy-zzz
    const randStr = () => Math.random().toString(36).substring(2, 6);
    const roomCode = `synapse-${randStr()}-${randStr()}`;

    const meeting = new Meeting({
      title: title.trim(),
      host: req.user!._id,
      type: type || 'Everyone',
      roomCode,
      status: 'Active',
      participantsCount: 1,
    });

    await meeting.save();
    return res.status(201).json({ message: 'Meeting room created successfully', meeting });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error establishing meeting room', error: error.message });
  }
};

export const joinMeeting = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findById(id);
    if (!meeting || meeting.status === 'Ended') {
      return res.status(404).json({ message: 'Meeting is either ended or active room not found' });
    }

    meeting.participantsCount += 1;
    await meeting.save();

    return res.status(200).json({ message: 'Joined meeting room successfully', meeting });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error entering meeting room', error: error.message });
  }
};

export const endMeeting = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Access check: only the host or Admin/HR can close meeting rooms
    const isHost = meeting.host.toString() === req.user!._id.toString();
    const isHRorAdmin = ['Super Admin', 'HR Manager'].includes(req.user!.role);

    if (!isHost && !isHRorAdmin) {
      return res.status(403).json({ message: 'Access denied: Only the host or Admin/HR can close this room' });
    }

    meeting.status = 'Ended';
    await meeting.save();

    return res.status(200).json({ message: 'Meeting closed successfully', meeting });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error terminating meeting room', error: error.message });
  }
};
