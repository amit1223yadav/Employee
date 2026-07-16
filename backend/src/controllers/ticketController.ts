import { Response } from 'express';
import { Ticket } from '../models/Ticket';
import { AuthenticatedRequest } from '../middleware/auth';

export const createTicket = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required' });
    }

    const ticket = new Ticket({
      employee: req.user!._id,
      title,
      description,
      category,
      status: 'Open',
    });

    await ticket.save();
    return res.status(201).json({ message: 'Support ticket submitted successfully', ticket });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error submitting support ticket', error: error.message });
  }
};

export const getMyTickets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tickets = await Ticket.find({ employee: req.user!._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ tickets });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving personal tickets', error: error.message });
  }
};

export const getAllTickets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tickets = await Ticket.find({})
      .populate('employee', 'name employeeId department designation')
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ tickets });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching ticket list', error: error.message });
  }
};

export const respondTicket = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { response, status } = req.body;

    if (!response) {
      return res.status(400).json({ message: 'Response text is required' });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.response = response;
    if (status) {
      ticket.status = status; // e.g. 'In Progress' or 'Resolved'
    } else {
      ticket.status = 'Resolved'; // Default status is Resolved on response
    }
    
    await ticket.save();
    return res.status(200).json({ message: 'Ticket response posted successfully', ticket });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating ticket response', error: error.message });
  }
};
