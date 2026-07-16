import { Response } from 'express';
import { Employee } from '../models/Employee';
import { Task } from '../models/Task';
import { AuthenticatedRequest } from '../middleware/auth';

interface OrgNode {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  role: string;
  profileImage: string;
  status: string;
  children: OrgNode[];
}

export const getOrgTree = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Retrieve all active employees
    const employees = await Employee.find({ isDeleted: false })
      .select('name employeeId email designation department role reportingManager profileImage status')
      .lean();

    // Map by id for quick access
    const idMap: { [key: string]: OrgNode } = {};
    employees.forEach((emp: any) => {
      idMap[emp._id.toString()] = {
        _id: emp._id.toString(),
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        designation: emp.designation,
        department: emp.department,
        role: emp.role,
        profileImage: emp.profileImage || '',
        status: emp.status,
        children: [],
      };
    });

    const rootNodes: OrgNode[] = [];

    employees.forEach((emp: any) => {
      const node = idMap[emp._id.toString()];
      const parentId = emp.reportingManager ? emp.reportingManager.toString() : null;

      if (parentId && idMap[parentId]) {
        idMap[parentId].children.push(node);
      } else {
        // If no reporting manager or manager does not exist in the active list (e.g. deleted), treat as root node
        rootNodes.push(node);
      }
    });

    return res.status(200).json({ tree: rootNodes });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving organization hierarchy tree', error: error.message });
  }
};

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isEmployee = req.user?.role === 'Employee';

    // Total counts
    const total = await Employee.countDocuments({ isDeleted: false });
    const active = await Employee.countDocuments({ isDeleted: false, status: 'Active' });
    const inactive = await Employee.countDocuments({ isDeleted: false, status: 'Inactive' });

    // Task counts
    const totalTasks = await Task.countDocuments({});
    const completedTasks = await Task.countDocuments({ status: 'Completed' });

    // Payroll calculation (Active salaries divided by 12)
    const payrollAggregate = await Employee.aggregate([
      { $match: { isDeleted: false, status: 'Active' } },
      { $group: { _id: null, totalSalary: { $sum: '$salary' } } }
    ]);
    const totalSalary = payrollAggregate[0]?.totalSalary || 0;
    const monthlyPayroll = Math.round(totalSalary / 12);

    // Distinct departments
    const departments = await Employee.distinct('department', { isDeleted: false });

    // Aggregate counts by department
    const departmentBreakdown = await Employee.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);

    // Aggregate counts by role
    const roleBreakdown = await Employee.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    // Aggregate average salary by department
    const salaryDistribution = await Employee.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$department', avgSalary: { $avg: '$salary' } } },
    ]);

    // Trend of hires (joiningDate)
    const recentHires = await Employee.find({ isDeleted: false })
      .select('name joiningDate department designation')
      .sort({ joiningDate: -1 })
      .limit(5)
      .lean();

    return res.status(200).json({
      stats: {
        total,
        active,
        inactive,
        departmentCount: departments.length,
        taskStats: {
          total: totalTasks,
          completed: completedTasks
        },
        monthlyPayroll,
        estimatedRevenue: 52000000 // Mock 5.2 Crores
      },
      charts: {
        departments: departmentBreakdown.map((d) => ({ name: d._id, count: d.count })),
        roles: roleBreakdown.map((r) => ({ name: r._id, count: r.count })),
        salaries: salaryDistribution.map((s) => ({ name: s._id, avgSalary: Math.round(s.avgSalary) })),
      },
      recentHires,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error generating dashboard statistics', error: error.message });
  }
};
