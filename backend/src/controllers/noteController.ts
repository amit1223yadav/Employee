import { Response } from 'express';
import { Note } from '../models/Note';
import { AuthenticatedRequest } from '../middleware/auth';

export const getMyNotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notes = await Note.find({ user: req.user!._id }).sort({ updatedAt: -1 });
    return res.status(200).json({ notes });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
};

export const createNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, color } = req.body;
    const note = new Note({
      user: req.user!._id,
      title: title || 'Untitled Note',
      content: content || '',
      color: color || 'slate',
    });
    await note.save();
    return res.status(201).json({ message: 'Note created successfully', note });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating note', error: error.message });
  }
};

export const updateNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, color } = req.body;

    const note = await Note.findOne({ _id: id, user: req.user!._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (color !== undefined) note.color = color;

    await note.save();
    return res.status(200).json({ message: 'Note updated successfully', note });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating note', error: error.message });
  }
};

export const deleteNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const note = await Note.findOneAndDelete({ _id: id, user: req.user!._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    return res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
};
