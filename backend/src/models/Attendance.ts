import { Schema, model, Document, Types } from 'mongoose';

export interface IAttendance extends Document {
  employee: Types.ObjectId;
  date: string; // Format: YYYY-MM-DD
  clockIn: Date | null;
  clockOut: Date | null;
  status: 'Present' | 'Absent';
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
    },
    date: {
      type: String,
      required: [true, 'Date string (YYYY-MM-DD) is required'],
    },
    clockIn: {
      type: Date,
      default: null,
    },
    clockOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent'],
      default: 'Present',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee one attendance log per employee per day
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export const Attendance = model<IAttendance>('Attendance', AttendanceSchema);
