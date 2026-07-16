import { Employee } from '../models/Employee';

/**
 * Checks if assigning potentialManagerId as the manager of employeeId creates a cycle.
 * Returns true if a cycle is detected, false otherwise.
 */
export const detectCircularReporting = async (
  employeeId: string,
  potentialManagerId: string
): Promise<boolean> => {
  if (!employeeId || !potentialManagerId) return false;
  
  if (employeeId.toString() === potentialManagerId.toString()) {
    return true; // Cannot report to themselves
  }

  let currentManagerId: any = potentialManagerId;
  const visited = new Set<string>();

  while (currentManagerId) {
    if (currentManagerId.toString() === employeeId.toString()) {
      return true; // Circular reference detected
    }

    if (visited.has(currentManagerId.toString())) {
      return true; // Safely exit if there's an pre-existing loop
    }
    visited.add(currentManagerId.toString());

    // Fetch the manager's reporting details
    const manager = await Employee.findOne({ _id: currentManagerId, isDeleted: false })
      .select('reportingManager')
      .lean();

    if (!manager || !manager.reportingManager) {
      break;
    }

    currentManagerId = manager.reportingManager;
  }

  return false;
};
