import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import employeeRoutes from './routes/employeeRoutes';
import orgRoutes from './routes/orgRoutes';
import leaveRoutes from './routes/leaveRoutes';
import taskRoutes from './routes/taskRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import ticketRoutes from './routes/ticketRoutes';
import meetingRoutes from './routes/meetingRoutes';
import noteRoutes from './routes/noteRoutes';
import announcementRoutes from './routes/announcementRoutes';

// Load environmental variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for the dev environment
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB connection for every request in serverless environment
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (error: any) {
    console.error('Database connection error in request middleware:', error.message);
    res.status(500).json({
      message: 'Database connection failed. Please ensure MongoDB Atlas IP Whitelist (0.0.0.0/0) is configured.',
      error: error.message
    });
  }
});

// Serve static uploads if needed (for profile images in future)
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/organization', orgRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/announcements', announcementRoutes);

// Root path test endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'SynapseHR EMS API Server is running' });
});

// 404 Route handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Requested resource not found' });
});

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Boot server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server listening in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

export default app;
