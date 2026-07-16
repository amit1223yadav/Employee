import { Schema, model, Document, Types } from 'mongoose';

export interface IAnnouncement extends Document {
  sender: Types.ObjectId;
  title: string;
  content: string;
  type: 'Motivation' | 'Announcement' | 'Alert';
  createdAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Motivation', 'Announcement', 'Alert'],
      default: 'Announcement',
    },
  },
  {
    timestamps: true,
  }
);

export const Announcement = model<IAnnouncement>('Announcement', AnnouncementSchema);
