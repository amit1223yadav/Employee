import { detectCircularReporting } from '../utils/hierarchy';
import { Employee } from '../models/Employee';

// Mock the Employee Mongoose Model
jest.mock('../models/Employee', () => ({
  Employee: {
    findOne: jest.fn(),
  },
}));

describe('detectCircularReporting Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if employeeId and potentialManagerId are the same', async () => {
    const result = await detectCircularReporting('emp_A', 'emp_A');
    expect(result).toBe(true);
  });

  it('should return false if there is no manager assigned', async () => {
    const result = await detectCircularReporting('emp_A', '');
    expect(result).toBe(false);
  });

  it('should return false if reporting line is clean with no cycles', async () => {
    // Mock the chain findOne().select().lean() to return null manager details
    (Employee.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      })
    });

    const result = await detectCircularReporting('emp_E1', 'emp_E3');
    expect(result).toBe(false);
    expect(Employee.findOne).toHaveBeenCalledWith({ _id: 'emp_E3', isDeleted: false });
  });

  it('should detect direct cycle: A reports to B, B reports to A', async () => {
    // Mock the chain to return A's manager is B
    (Employee.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: 'emp_A',
          reportingManager: 'emp_B',
        })
      })
    });

    const result = await detectCircularReporting('emp_B', 'emp_A');
    expect(result).toBe(true);
  });

  it('should detect indirect cycle: A -> B -> C -> A', async () => {
    // Mock the chain to return different values sequentially:
    // First call (manager A): reportingManager = B
    // Second call (manager B): reportingManager = C
    const mockLean = jest.fn()
      .mockResolvedValueOnce({ _id: 'emp_A', reportingManager: 'emp_B' })
      .mockResolvedValueOnce({ _id: 'emp_B', reportingManager: 'emp_C' });

    (Employee.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: mockLean
      })
    });

    const result = await detectCircularReporting('emp_C', 'emp_A');
    expect(result).toBe(true);
  });
});
