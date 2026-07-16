import { Schema, model, Document, Types } from 'mongoose';

export interface INote extends Document {
  user: Types.ObjectId;
  title: string;
  content: string;
  color: 'amber' | 'emerald' | 'blue' | 'purple' | 'rose' | 'slate';
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    title: {
      type: String,
      default: 'Untitled Note',
      trim: true,
    },
    content: {
      type: String,
      default: '',
      trim: true,
    },
    color: {
      type: String,
      enum: ['amber', 'emerald', 'blue', 'purple', 'rose', 'slate'],
      default: 'slate',
    },
  },
  {
    timestamps: true,
  }
);

export const Note = model<INote>('Note', NoteSchema);
