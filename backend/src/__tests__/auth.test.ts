import request from 'supertest';
import app from '../server';
import { Employee } from '../models/Employee';

// Mock DB Connection to prevent connecting during test setup
jest.mock('../config/db', () => ({
  connectDB: jest.fn(),
}));

jest.mock('../models/Employee', () => {
  const actualMongoose = jest.requireActual('mongoose');
  
  const mockComparePassword = jest.fn();
  const mockEmployeeObj = {
    _id: new actualMongoose.Types.ObjectId().toString(),
    employeeId: 'EMP001',
    name: 'Arthur Pendragon',
    email: 'admin@synapsehr.com',
    role: 'Super Admin',
    status: 'Active',
    comparePassword: mockComparePassword,
    toObject: function() {
      return { ...this };
    }
  };

  return {
    Employee: {
      findOne: jest.fn(),
      findById: jest.fn(),
    },
  };
});

describe('Authentication API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if email or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@synapsehr.com' }); // missing password

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Email and password are required');
    });

    it('should return 401 if employee is not found', async () => {
      (Employee.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null) // no employee matches
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'unknown@synapsehr.com', password: 'Password123' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
});
