import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Employee } from '../models/Employee';
import { Task } from '../models/Task';
import { Ticket } from '../models/Ticket';

dotenv.config();

const seedEmployees = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/synapsehr';
    console.log(`Seeding database at: ${connStr}`);
    
    await mongoose.connect(connStr);
    
    // Clear existing data
    await Employee.deleteMany({});
    await Task.deleteMany({});
    await Ticket.deleteMany({});
    console.log('Cleared existing database records.');

    // 1. Create Super Admin (CEO) - Amit Yadav
    const ceo = new Employee({
      employeeId: 'EMP001',
      name: 'Amit Yadav',
      email: 'admin@123',
      password: 'admin123',
      phone: '+919876543210',
      department: 'Executive',
      designation: 'Chief Executive Officer',
      salary: 3500000,
      joiningDate: new Date('2020-01-01'),
      status: 'Active',
      role: 'Super Admin',
      reportingManager: null,
      profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=Amit%20Yadav&backgroundColor=4ade80',
    });
    await ceo.save();
    console.log('Created Super Admin (CEO) - Amit Yadav.');

    // 2. Create HR Director (reports to CEO) - Neha Sharma
    const hrDirector = new Employee({
      employeeId: 'EMP002',
      name: 'Neha Sharma',
      email: 'hr@123',
      password: 'hr123',
      phone: '+919876543211',
      department: 'Human Resources',
      designation: 'HR Director',
      salary: 1800000,
      joiningDate: new Date('2021-03-15'),
      status: 'Active',
      role: 'HR Manager',
      reportingManager: ceo._id,
      profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=Neha%20Sharma&backgroundColor=ec4899',
    });
    await hrDirector.save();
    console.log('Created HR Director - Neha Sharma.');

    // 3. Create Engineering Director (reports to CEO) - Rajesh Kumar
    const engDirector = new Employee({
      employeeId: 'EMP003',
      name: 'Rajesh Kumar',
      email: 'rajesh@synapsehr.com',
      password: 'Password123',
      phone: '+919876543212',
      department: 'Engineering',
      designation: 'Engineering Director',
      salary: 2400000,
      joiningDate: new Date('2021-05-10'),
      status: 'Active',
      role: 'Employee',
      reportingManager: ceo._id,
      profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=Rajesh%20Kumar&backgroundColor=3b82f6',
    });
    await engDirector.save();
    console.log('Created Engineering Director - Rajesh Kumar.');

    // 4. Create Tech Lead (reports to Engineering Director) - Arjun Singh
    const techLead = new Employee({
      employeeId: 'EMP004',
      name: 'Arjun Singh',
      email: 'user@123',
      password: 'user123',
      phone: '+919876543213',
      department: 'Engineering',
      designation: 'Tech Lead',
      salary: 1600000,
      joiningDate: new Date('2022-02-01'),
      status: 'Active',
      role: 'Employee',
      reportingManager: engDirector._id,
      profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=Arjun%20Singh&backgroundColor=f59e0b',
    });
    await techLead.save();
    console.log('Created Tech Lead - Arjun Singh.');

    // 5. Create Senior Developer (reports to Tech Lead) - Sneha Reddy
    const dev1 = new Employee({
      employeeId: 'EMP005',
      name: 'Sneha Reddy',
      email: 'sneha@synapsehr.com',
      password: 'Password123',
      phone: '+919876543214',
      department: 'Engineering',
      designation: 'Senior Developer',
      salary: 1200000,
      joiningDate: new Date('2022-09-01'),
      status: 'Active',
      role: 'Employee',
      reportingManager: techLead._id,
      profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=Sneha%20Reddy&backgroundColor=8b5cf6',
    });
    await dev1.save();

    // 6. Create Junior Developer (reports to Tech Lead) - Aaditya Sharma
    const dev2 = new Employee({
      employeeId: 'EMP006',
      name: 'Aaditya Sharma',
      email: 'aaditya@synapsehr.com',
      password: 'Password123',
      phone: '+919876543215',
      department: 'Engineering',
      designation: 'Junior Developer',
      salary: 600000,
      joiningDate: new Date('2023-03-20'),
      status: 'Active',
      role: 'Employee',
      reportingManager: techLead._id,
      profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=Aaditya%20Sharma&backgroundColor=06b6d4',
    });
    await dev2.save();
    console.log('Created Engineers - Sneha and Aaditya.');

    // 7. Create HR Specialist (reports to HR Director) - Priya Patel
    const hrSpecialist = new Employee({
      employeeId: 'EMP007',
      name: 'Priya Patel',
      email: 'priya@synapsehr.com',
      password: 'Password123',
      phone: '+919876543216',
      department: 'Human Resources',
      designation: 'HR Specialist',
      salary: 800000,
      joiningDate: new Date('2022-05-15'),
      status: 'Active',
      role: 'Employee',
      reportingManager: hrDirector._id,
      profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=Priya%20Patel&backgroundColor=14b8a6',
    });
    await hrSpecialist.save();

    // 8. Create Inactive HR Assistant (reports to HR Director) - Karan Malhotra
    const hrAssistant = new Employee({
      employeeId: 'EMP008',
      name: 'Karan Malhotra',
      email: 'karan@synapsehr.com',
      password: 'Password123',
      phone: '+919876543217',
      department: 'Human Resources',
      designation: 'HR Assistant',
      salary: 450000,
      joiningDate: new Date('2023-07-01'),
      status: 'Inactive',
      role: 'Employee',
      reportingManager: hrDirector._id,
      profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=Karan%20Malhotra&backgroundColor=64748b',
    });
    await hrAssistant.save();
    console.log('Created HR Specialists - Priya and Karan.');

    // 9. Create Marketing Specialist (reports to CEO) - Vikram Malhotra
    const marketing = new Employee({
      employeeId: 'EMP009',
      name: 'Vikram Malhotra',
      email: 'vikram@synapsehr.com',
      password: 'Password123',
      phone: '+919876543218',
      department: 'Marketing',
      designation: 'Marketing Specialist',
      salary: 700000,
      joiningDate: new Date('2022-11-10'),
      status: 'Active',
      role: 'Employee',
      reportingManager: ceo._id,
      profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=Vikram%20Malhotra&backgroundColor=a855f7',
    });
    await marketing.save();
    console.log('Created Marketing Specialist - Vikram Malhotra.');

    // --- Pre-populate Tasks ---
    const tasks = [
      new Task({
        title: 'Optimize Form Select Styles',
        description: 'Re-style all input dropdowns to use custom chevron arrows and unified border colors.',
        assignedTo: techLead._id, // Arjun Singh (user@123)
        assignedBy: ceo._id,
        dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
        status: 'In Progress',
        priority: 'High',
      }),
      new Task({
        title: 'Review support tickets model',
        description: 'Verify model schemas and responsive drawer layout for HR review lists.',
        assignedTo: techLead._id, // Arjun Singh
        assignedBy: ceo._id,
        dueDate: new Date(Date.now() + 86400000 * 5),
        status: 'Pending',
        priority: 'Medium',
      }),
      new Task({
        title: 'Coordinate HR Portal Q&A',
        description: 'Set up training slides for the attendance check-in feature rollout.',
        assignedTo: hrSpecialist._id, // Priya Patel
        assignedBy: hrDirector._id,
        dueDate: new Date(Date.now() + 86400000 * 3),
        status: 'Completed',
        priority: 'Low',
      })
    ];
    for (const t of tasks) {
      await t.save();
    }
    console.log('Pre-populated Tasks.');

    // --- Pre-populate Support Ticket ---
    const ticket = new Ticket({
      employee: techLead._id,
      title: 'Initial Seeding Pipeline Question',
      description: 'Need clarity on whether seed.ts runs automatically during production build scripts.',
      category: 'HR Query',
      status: 'Open',
    });
    await ticket.save();
    console.log('Pre-populated Ticket.');

    console.log('Database seeding successfully completed.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedEmployees();
