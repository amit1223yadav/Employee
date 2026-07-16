import { Response } from 'express';
import { Announcement } from '../models/Announcement';
import { AuthenticatedRequest } from '../middleware/auth';

export const getLatestAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const latest = await Announcement.findOne({})
      .populate('sender', 'name designation')
      .sort({ createdAt: -1 });
    return res.status(200).json({ latest });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving latest announcement', error: error.message });
  }
};

export const getAllAnnouncements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const announcements = await Announcement.find({})
      .populate('sender', 'name designation')
      .sort({ createdAt: -1 });
    return res.status(200).json({ announcements });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching announcements', error: error.message });
  }
};

export const createAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, type } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Access check: only HR or Admin can compose announcements
    const isHRorAdmin = ['Super Admin', 'HR Manager'].includes(req.user!.role);
    if (!isHRorAdmin) {
      return res.status(403).json({ message: 'Access denied: Only HR or Admins can post updates' });
    }

    const announcement = new Announcement({
      sender: req.user!._id,
      title: title.trim(),
      content: content.trim(),
      type: type || 'Announcement',
    });

    await announcement.save();
    return res.status(201).json({ message: 'Announcement posted successfully', announcement });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating announcement', error: error.message });
  }
};
