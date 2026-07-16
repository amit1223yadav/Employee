import { Schema, model, Document, Types } from 'mongoose';

export interface ILeave extends Document {
  employee: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  type: 'Sick Leave' | 'Casual Leave' | 'Paid Leave' | 'Unpaid Leave';
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy: Types.ObjectId | null;
}

const LeaveSchema = new Schema<ILeave>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    type: {
      type: String,
      enum: ['Sick Leave', 'Casual Leave', 'Paid Leave', 'Unpaid Leave'],
      required: [true, 'Leave type is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Leave = model<ILeave>('Leave', LeaveSchema);
