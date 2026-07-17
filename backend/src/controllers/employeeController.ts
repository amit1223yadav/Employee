import { Response } from 'express';
import { Employee, IEmployee } from '../models/Employee';
import { AuthenticatedRequest } from '../middleware/auth';
import { detectCircularReporting } from '../utils/hierarchy';
import csv from 'csv-parser';
import fs from 'fs';
import { Readable } from 'stream';

// Helper to generate a default password
const DEFAULT_PASSWORD = 'Password123';

export const getAllEmployees = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, department, role, status, sortBy, sortOrder, page = 1, limit = 10 } = req.query;

    const query: any = { isDeleted: false };

    // Search filter (name or email)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    // Exact match filters
    if (department) query.department = department;
    if (role) query.role = role;
    if (status) query.status = status;

    // Sorting
    const sort: any = {};
    if (sortBy) {
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.name = 1; // Default sort by name ascending
    }

    // Role-based field exclusion (hide Salary from ordinary Employees)
    const isEmployee = req.user?.role === 'Employee';
    const selectFields = isEmployee ? '-salary' : '';

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .select(selectFields)
      .populate('reportingManager', 'name employeeId email designation department')
      .sort(sort)
      .skip(skip)
      .limit(limitNumber)
      .lean();

    return res.status(200).json({
      employees,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving employees', error: error.message });
  }
};

export const getEmployeeById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const isSelf = req.user?._id.toString() === id;
    const isEmployee = req.user?.role === 'Employee';

    // If role is Employee, they can ONLY view their own profile
    if (isEmployee && !isSelf) {
      return res.status(403).json({ message: 'Access denied: Employees can only view their own profile' });
    }

    const selectFields = (isEmployee && isSelf) ? '' : (isEmployee ? '-salary' : '');
    // Wait, let's allow an employee to see their own salary. Yes!
    
    const employee = await Employee.findOne({ _id: id, isDeleted: false })
      .select(selectFields)
      .populate('reportingManager', 'name employeeId email designation department');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    return res.status(200).json({ employee });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving employee details', error: error.message });
  }
};

export const createEmployee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      employeeId,
      name,
      email,
      phone,
      department,
      designation,
      salary,
      joiningDate,
      status,
      role,
      reportingManager,
      profileImage,
      password,
    } = req.body;

    const currentUser = req.user!;

    // RBAC validation
    // HR cannot create Super Admin
    if (currentUser.role === 'HR Manager' && role === 'Super Admin') {
      return res.status(403).json({ message: 'Access denied: HR Managers cannot create Super Admins' });
    }

    // Check unique employeeId
    const existingId = await Employee.findOne({ employeeId, isDeleted: false });
    if (existingId) {
      return res.status(400).json({ message: `Employee ID ${employeeId} is already in use` });
    }

    // Check unique email
    const existingEmail = await Employee.findOne({ email: email.toLowerCase(), isDeleted: false });
    if (existingEmail) {
      return res.status(400).json({ message: `Email ${email} is already in use` });
    }

    // Verify manager
    let managerId = null;
    if (reportingManager) {
      const manager = await Employee.findOne({ _id: reportingManager, isDeleted: false });
      if (!manager) {
        return res.status(400).json({ message: 'Reporting manager not found' });
      }
      managerId = manager._id;
    }

    const newEmployee = new Employee({
      employeeId,
      name,
      email: email.toLowerCase(),
      phone,
      department,
      designation,
      salary,
      joiningDate,
      status: status || 'Active',
      role: role || 'Employee',
      reportingManager: managerId,
      profileImage: profileImage || '',
      password: password || DEFAULT_PASSWORD,
    });

    await newEmployee.save();

    const employeeObject = newEmployee.toObject();
    delete employeeObject.password;

    return res.status(201).json({
      message: 'Employee created successfully',
      employee: employeeObject,
    });
  } catch (error: any) {
    return res.status(400).json({ message: 'Error creating employee', error: error.message });
  }
};

export const updateEmployee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;
    const isSelf = currentUser._id.toString() === id;

    const targetEmployee = await Employee.findOne({ _id: id, isDeleted: false });
    if (!targetEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const updates: any = {};
    const bodyKeys = Object.keys(req.body);

    // Rule 1: Employees can only edit their own profile, and only specific fields
    if (currentUser.role === 'Employee') {
      if (!isSelf) {
        return res.status(403).json({ message: 'Access denied: Employees can only edit their own profile' });
      }

      // Restrict fields for Employee
      const allowedSelfFields = ['email', 'phone', 'profileImage', 'password'];
      const attemptedForbiddenFields = bodyKeys.filter((key) => !allowedSelfFields.includes(key));
      
      if (attemptedForbiddenFields.length > 0) {
        return res.status(403).json({
          message: `Access denied: Employees cannot modify fields: ${attemptedForbiddenFields.join(', ')}`,
        });
      }

      // Safe update list
      if (req.body.email) updates.email = req.body.email.toLowerCase();
      if (req.body.phone) updates.phone = req.body.phone;
      if (req.body.profileImage) updates.profileImage = req.body.profileImage;
      if (req.body.password) {
        targetEmployee.password = req.body.password; // Save hook will trigger password hashing
        await targetEmployee.save();
      }
    } else {
      // HR Manager and Super Admin can edit others
      // Rule 2: HR Manager cannot edit Super Admin details
      if (currentUser.role === 'HR Manager' && targetEmployee.role === 'Super Admin') {
        return res.status(403).json({ message: 'Access denied: HR Managers cannot modify Super Admin records' });
      }

      // Rule 3: HR Manager cannot assign Super Admin role
      if (currentUser.role === 'HR Manager' && req.body.role === 'Super Admin') {
        return res.status(403).json({ message: 'Access denied: HR Managers cannot assign Super Admin role' });
      }

      // Process edits
      const editableFields = [
        'name',
        'email',
        'phone',
        'department',
        'designation',
        'salary',
        'joiningDate',
        'status',
        'role',
        'reportingManager',
        'profileImage',
      ];

      editableFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          if (field === 'email') {
            updates.email = req.body.email.toLowerCase();
          } else {
            updates[field] = req.body[field];
          }
        }
      });

      // Special check: Circular Reporting
      if (updates.reportingManager) {
        const isCircular = await detectCircularReporting(id, updates.reportingManager);
        if (isCircular) {
          return res.status(400).json({
            message: 'Circular reporting detected! This employee cannot report to someone in their own reporting line.',
          });
        }
      }

      // Password reset by admin/HR
      if (req.body.password) {
        targetEmployee.password = req.body.password;
        await targetEmployee.save();
      }
    }

    // Apply other updates
    if (Object.keys(updates).length > 0) {
      Object.assign(targetEmployee, updates);
      await targetEmployee.save();
    }

    const updatedEmployee = await Employee.findById(targetEmployee._id)
      .populate('reportingManager', 'name employeeId email designation department')
      .lean();

    return res.status(200).json({
      message: 'Employee updated successfully',
      employee: updatedEmployee,
    });
  } catch (error: any) {
    return res.status(400).json({ message: 'Error updating employee', error: error.message });
  }
};

export const deleteEmployee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Only Super Admin can soft-delete employees
    if (req.user?.role !== 'Super Admin') {
      return res.status(403).json({ message: 'Access denied: Only Super Admins can delete employees' });
    }

    const employee = await Employee.findOne({ _id: id, isDeleted: false });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found or already deleted' });
    }

    // Soft delete
    employee.isDeleted = true;
    employee.deletedAt = new Date();
    employee.status = 'Inactive';
    await employee.save();

    // Reassign manager of direct reports to null
    await Employee.updateMany(
      { reportingManager: id, isDeleted: false },
      { reportingManager: null }
    );

    return res.status(200).json({ message: 'Employee deleted successfully (soft delete)' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting employee', error: error.message });
  }
};

export const updateManagerOnly = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reportingManager } = req.body;

    const employee = await Employee.findOne({ _id: id, isDeleted: false });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // HR cannot update Super Admin's manager
    if (req.user?.role === 'HR Manager' && employee.role === 'Super Admin') {
      return res.status(403).json({ message: 'Access denied: HR Managers cannot update Super Admin reporting structure' });
    }

    if (reportingManager) {
      // Prevent circular
      const isCircular = await detectCircularReporting(id, reportingManager);
      if (isCircular) {
        return res.status(400).json({
          message: 'Circular reporting detected! The selected manager reporting line loops back to this employee.',
        });
      }
      employee.reportingManager = reportingManager;
    } else {
      employee.reportingManager = null;
    }

    await employee.save();
    
    const updated = await Employee.findById(employee._id)
      .populate('reportingManager', 'name employeeId email designation department')
      .lean();

    return res.status(200).json({
      message: 'Reporting manager updated successfully',
      employee: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating reporting manager', error: error.message });
  }
};

export const getReportees = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const isEmployee = req.user?.role === 'Employee';
    const selectFields = isEmployee ? '-salary' : '';

    const reportees = await Employee.find({ reportingManager: id, isDeleted: false })
      .select(selectFields)
      .lean();

    return res.status(200).json({ reportees });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving reportees', error: error.message });
  }
};

export const importCSV = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CSV file is required' });
    }

    const employeesData: any[] = [];
    const errors: string[] = [];

    // Parse CSV file from memory buffer
    await new Promise<void>((resolve, reject) => {
      Readable.from(req.file!.buffer)
        .pipe(csv())
        .on('data', (row) => {
          employeesData.push(row);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (err) => {
          reject(err);
        });
    });

    if (employeesData.length === 0) {
      return res.status(400).json({ message: 'CSV file is empty' });
    }

    const createdEmployees: any[] = [];

    for (let i = 0; i < employeesData.length; i++) {
      const row = employeesData[i];
      const rowNum = i + 1;

      // Validate required fields
      const {
        employeeId,
        name,
        email,
        phone,
        department,
        designation,
        salary,
        joiningDate,
        role,
        managerEmployeeId,
      } = row;

      if (!employeeId || !name || !email || !phone || !department || !designation || !salary || !joiningDate) {
        errors.push(`Row ${rowNum}: Missing required fields.`);
        continue;
      }

      // Role check
      let targetRole = role || 'Employee';
      if (req.user?.role === 'HR Manager' && targetRole === 'Super Admin') {
        errors.push(`Row ${rowNum}: HR Managers cannot create Super Admin.`);
        continue;
      }

      // Check duplicate ID
      const dupId = await Employee.findOne({ employeeId, isDeleted: false });
      if (dupId) {
        errors.push(`Row ${rowNum}: Employee ID ${employeeId} is already in use.`);
        continue;
      }

      // Check duplicate email
      const dupEmail = await Employee.findOne({ email: email.toLowerCase(), isDeleted: false });
      if (dupEmail) {
        errors.push(`Row ${rowNum}: Email ${email} is already in use.`);
        continue;
      }

      // Find reporting manager
      let reportingManagerId = null;
      if (managerEmployeeId) {
        const mgr = await Employee.findOne({ employeeId: managerEmployeeId, isDeleted: false });
        if (mgr) {
          reportingManagerId = mgr._id;
        } else {
          // Keep it null and add warning, but proceed or fail? Let's assign null and warn.
          errors.push(`Row ${rowNum}: Manager ID ${managerEmployeeId} not found, set reporting manager to null.`);
        }
      }

      try {
        const employee = new Employee({
          employeeId,
          name,
          email: email.toLowerCase(),
          phone,
          department,
          designation,
          salary: parseFloat(salary),
          joiningDate: new Date(joiningDate),
          role: targetRole,
          reportingManager: reportingManagerId,
          status: 'Active',
          password: DEFAULT_PASSWORD,
        });

        await employee.save();
        createdEmployees.push({ employeeId, name, email });
      } catch (err: any) {
        errors.push(`Row ${rowNum}: Error saving: ${err.message}`);
      }
    }

    return res.status(200).json({
      message: `CSV Processing Completed. Created ${createdEmployees.length} employees.`,
      createdCount: createdEmployees.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error importing CSV', error: error.message });
  }
};
