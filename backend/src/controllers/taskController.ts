import { Response } from 'express';
import { Task } from '../models/Task';
import { AuthenticatedRequest } from '../middleware/auth';

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, assignedTo, dueDate, priority } = req.body;
    if (!title || !assignedTo || !dueDate) {
      return res.status(400).json({ message: 'Title, assignedTo employee, and due date are required' });
    }

    const task = new Task({
      title,
      description: description || '',
      assignedTo,
      assignedBy: req.user!._id,
      dueDate: new Date(dueDate),
      status: 'Pending',
      priority: priority || 'Medium',
    });

    await task.save();
    return res.status(201).json({ message: 'Task assigned successfully', task });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating task assignment', error: error.message });
  }
};

export const getMyTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user!._id })
      .populate('assignedBy', 'name designation')
      .populate('comments.sender', 'name designation')
      .sort({ dueDate: 1 })
      .lean();
    return res.status(200).json({ tasks });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving personal tasks', error: error.message });
  }
};

export const getAllTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tasks = await Task.find({})
      .populate('assignedTo', 'name employeeId department designation')
      .populate('assignedBy', 'name designation')
      .populate('comments.sender', 'name designation')
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ tasks });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching task list', error: error.message });
  }
};

export const updateTaskStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Pending', 'In Progress', 'Completed'

    if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid task status' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Access check: only assigned user or HR/Admin can update task status
    const isAssigned = task.assignedTo.toString() === req.user!._id.toString();
    const isHRorAdmin = ['Super Admin', 'HR Manager'].includes(req.user!.role);

    if (!isAssigned && !isHRorAdmin) {
      return res.status(403).json({ message: 'Access denied: You are not authorized to update this task' });
    }

    task.status = status;
    await task.save();

    return res.status(200).json({ message: 'Task status updated successfully', task });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating task status', error: error.message });
  }
};

export const addTaskComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.comments.push({
      sender: req.user!._id,
      text: text.trim(),
      createdAt: new Date()
    } as any);

    await task.save();

    // Populate for response
    const updatedTask = await Task.findById(id)
      .populate('assignedTo', 'name employeeId department designation')
      .populate('assignedBy', 'name designation')
      .populate('comments.sender', 'name designation')
      .lean();

    return res.status(200).json({ message: 'Comment added successfully', task: updatedTask });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, assignedTo, dueDate, priority, status } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Access check: only HR or Admin can edit the task configurations
    const isHRorAdmin = ['Super Admin', 'HR Manager'].includes(req.user!.role);
    if (!isHRorAdmin) {
      return res.status(403).json({ message: 'Access denied: Only HR or Admins can edit task configurations' });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (dueDate !== undefined) task.dueDate = new Date(dueDate);
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;

    await task.save();

    const updatedTask = await Task.findById(id)
      .populate('assignedTo', 'name employeeId department designation')
      .populate('assignedBy', 'name designation')
      .populate('comments.sender', 'name designation')
      .lean();

    return res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Access check: only HR or Admin can delete tasks
    const isHRorAdmin = ['Super Admin', 'HR Manager'].includes(req.user!.role);
    if (!isHRorAdmin) {
      return res.status(403).json({ message: 'Access denied: Only HR or Admins can delete tasks' });
    }

    await Task.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};
