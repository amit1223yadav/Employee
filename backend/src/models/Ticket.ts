import { Schema, model, Document, Types } from 'mongoose';

export interface ITicket extends Document {
  employee: Types.ObjectId;
  title: string;
  description: string;
  category: 'Payroll' | 'IT Support' | 'HR Query' | 'Other';
  status: 'Open' | 'In Progress' | 'Resolved';
  response: string;
}

const TicketSchema = new Schema<ITicket>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Payroll', 'IT Support', 'HR Query', 'Other'],
      required: [true, 'Category is required'],
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'Open',
    },
    response: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Ticket = model<ITicket>('Ticket', TicketSchema);
