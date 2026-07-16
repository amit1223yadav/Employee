import { Schema, model, Document, Types } from 'mongoose';

export interface IMeeting extends Document {
  title: string;
  host: Types.ObjectId;
  type: 'Everyone' | 'Direct';
  roomCode: string;
  status: 'Active' | 'Ended';
  participantsCount: number;
  createdAt: Date;
}

const MeetingSchema = new Schema<IMeeting>(
  {
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    type: {
      type: String,
      enum: ['Everyone', 'Direct'],
      default: 'Everyone',
    },
    roomCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Ended'],
      default: 'Active',
    },
    participantsCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const Meeting = model<IMeeting>('Meeting', MeetingSchema);
