import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  UserPlus, 
  Info,
  CheckCircle,
  AlertCircle,
  LayoutGrid,
  List,
  Download,
  Mail,
  Phone,
  IndianRupee
} from 'lucide-react';

interface EmployeeItem {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary?: number;
  joiningDate: string;
  status: 'Active' | 'Inactive';
  role: 'Super Admin' | 'HR Manager' | 'Employee';
  reportingManager: any;
  profileImage: string;
}

export const Employees: React.FC = () => {
  const { user: currentUser } = useAuth();
  
  // Data States
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [allActiveList, setAllActiveList] = useState<EmployeeItem[]>([]); // For manager dropdown selection
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // UI Display Toggles
  const [isGridView, setIsGridView] = useState(false);
  
  // Query States
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const limit = 8;

  // UI Control States
  const [showFormModal, setShowFormModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeItem | null>(null);
  
  // Feedback Messages
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);

  // Form Field States
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formSalary, setFormSalary] = useState(0);
  const [formJoiningDate, setFormJoiningDate] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formRole, setFormRole] = useState<'Super Admin' | 'HR Manager' | 'Employee'>('Employee');
  const [formReportingManager, setFormReportingManager] = useState('');
  const [formProfileImage, setFormProfileImage] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // CSV Import States
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<{ count?: number; errors?: string[] } | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  // Departments List derived dynamically or hardcoded
  const departments = ['Executive', 'Human Resources', 'Engineering', 'Marketing', 'Finance', 'Design', 'Operations'];

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const query = `employees?page=${page}&limit=${limit}&search=${search}&department=${department}&role=${role}&status=${status}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      const res = await api.get(query);
      setEmployees(res.employees);
      setTotalCount(res.pagination.total);
      setTotalPages(res.pagination.pages);
    } catch (err: any) {
      setAlertError(err.message || 'Failed to load employee list');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllActive = async () => {
    try {
      // Fetch list without pagination to fill manager select boxes
      const res = await api.get('employees?limit=200');
      setAllActiveList(res.employees);
    } catch (err) {
      console.error('Error fetching manager lists:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, search, department, role, status, sortBy, sortOrder]);

  useEffect(() => {
    fetchAllActive();
  }, [showFormModal]);

  const handleOpenCreate = () => {
    setSelectedEmployee(null);
    setFormEmployeeId('');
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormDepartment('Engineering');
    setFormDesignation('');
    setFormSalary(500000);
    setFormJoiningDate(new Date().toISOString().split('T')[0]);
    setFormStatus('Active');
    setFormRole('Employee');
    setFormReportingManager('');
    setFormProfileImage('');
    setFormPassword('');
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleOpenEdit = (emp: EmployeeItem) => {
    setSelectedEmployee(emp);
    setFormEmployeeId(emp.employeeId);
    setFormName(emp.name);
    setFormEmail(emp.email);
    setFormPhone(emp.phone);
    setFormDepartment(emp.department);
    setFormDesignation(emp.designation);
    setFormSalary(emp.salary || 0);
    setFormJoiningDate(new Date(emp.joiningDate).toISOString().split('T')[0]);
    setFormStatus(emp.status);
    setFormRole(emp.role);
    setFormReportingManager(emp.reportingManager?._id || emp.reportingManager || '');
    setFormProfileImage(emp.profileImage || '');
    setFormPassword('');
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
    // Validations
    const errors: { [key: string]: string } = {};
    if (!formEmployeeId.trim()) errors.employeeId = 'Employee ID is required.';
    if (!formName.trim()) errors.name = 'Name is required.';
    if (!formEmail.trim() || !/.+@.+/.test(formEmail)) errors.email = 'Valid email is required.';
    if (!formPhone.trim()) errors.phone = 'Phone number is required.';
    if (!formDesignation.trim()) errors.designation = 'Designation is required.';
    if (formSalary <= 0) errors.salary = 'Salary must be a positive number.';
    if (!formJoiningDate) errors.joiningDate = 'Joining date is required.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload: any = {
      employeeId: formEmployeeId,
      name: formName,
      email: formEmail,
      phone: formPhone,
      department: formDepartment,
      designation: formDesignation,
      salary: Number(formSalary),
      joiningDate: new Date(formJoiningDate),
      status: formStatus,
      role: formRole,
      reportingManager: formReportingManager || null,
      profileImage: formProfileImage,
    };

    if (formPassword.trim()) {
      payload.password = formPassword;
    }

    try {
      if (selectedEmployee) {
        // Edit Employee
        await api.put(`employees/${selectedEmployee._id}`, payload);
        setAlertSuccess('Employee record updated successfully!');
      } else {
        // Create Employee
        await api.post('employees', payload);
        setAlertSuccess('New employee created successfully!');
      }
      setShowFormModal(false);
      fetchEmployees();
    } catch (err: any) {
      setAlertError(err.message || 'Error occurred while saving employee');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete ${name}? This will perform a soft-delete.`)) {
      return;
    }

    try {
      await api.delete(`employees/${id}`);
      setAlertSuccess('Employee deleted successfully.');
      fetchEmployees();
    } catch (err: any) {
      setAlertError(err.message || 'Failed to delete employee');
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setImportLoading(true);
    setImportResults(null);

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const res = await api.upload('employees/import', formData);
      setImportResults({
        count: res.createdCount,
        errors: res.errors,
      });
      setAlertSuccess(`CSV imported successfully. Created ${res.createdCount} employees.`);
      fetchEmployees();
    } catch (err: any) {
      setAlertError(err.message || 'Error parsing CSV upload file.');
    } finally {
      setImportLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (employees.length === 0) return;
    
    const headers = ['Employee ID', 'Name', 'Email', 'Phone', 'Department', 'Designation', 'Joining Date', 'Role', 'Status', 'Salary'];
    const rows = employees.map(emp => [
      emp.employeeId,
      emp.name,
      emp.email,
      emp.phone,
      emp.department,
      emp.designation,
      new Date(emp.joiningDate).toLocaleDateString(),
      emp.role,
      emp.status,
      emp.salary !== undefined ? emp.salary : 'Hidden'
    ]);
    
    // Add BOM for Excel UTF-8 display compatibility
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const encodedUri = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `synapsehr_directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAlerts = () => {
    setAlertSuccess(null);
    setAlertError(null);
  };

  const isHR = currentUser?.role === 'HR Manager';
  const isAdmin = currentUser?.role === 'Super Admin';
  const isEmployee = currentUser?.role === 'Employee';

  return (
    <div className="space-y-6">
      {/* Control Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Directory Directory</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Total active headcount: {totalCount} records
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 transition-all duration-200"
            title="Export to CSV"
          >
            <Download className="w-4 h-4 text-blue-500" />
            <span className="hidden md:inline">Export</span>
          </button>

          {!isEmployee && (
            <>
              <button
                onClick={() => { setCsvFile(null); setImportResults(null); setShowImportModal(true); }}
                className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 transition-all duration-200"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>Import CSV</span>
              </button>
              
              <button
                onClick={handleOpenCreate}
                className="flex items-center space-x-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-md active:scale-[0.98] transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dynamic Alerts */}
      {(alertSuccess || alertError) && (
        <div className="flex items-center justify-between p-4 rounded-xl border transition-all animate-fade-in
          ${alertSuccess 
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400' 
            : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400'
          }"
        >
          <div className="flex items-center space-x-2">
            {alertSuccess ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="text-sm font-medium">{alertSuccess || alertError}</span>
          </div>
          <button onClick={clearAlerts} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel border rounded-2xl p-4 lg:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, employee ID..."
            className="glass-input has-icon w-full py-2 text-xs"
          />
        </div>

        {/* Filters and Layout Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
            className="glass-input text-xs py-2 pr-8"
          >
            <option value="">All Departments</option>
            {departments.map((dept, i) => (
              <option key={i} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="glass-input text-xs py-2 pr-8"
          >
            <option value="">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="HR Manager">HR Manager</option>
            <option value="Employee">Employee</option>
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="glass-input text-xs py-2 pr-8"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
              setPage(1);
            }}
            className="glass-input text-xs py-2 pr-8"
          >
            <option value="name-asc">Sort: Name (A-Z)</option>
            <option value="name-desc">Sort: Name (Z-A)</option>
            <option value="joiningDate-desc">Sort: Date (Newest)</option>
            <option value="joiningDate-asc">Sort: Date (Oldest)</option>
          </select>

          {/* Layout Toggle (Impressive Feature) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => setIsGridView(false)}
              className={`p-1.5 rounded-lg transition-all ${!isGridView ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsGridView(true)}
              className={`p-1.5 rounded-lg transition-all ${isGridView ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Directory Content Area */}
      {loading ? (
        <div className="py-20 flex items-center justify-center glass-panel border rounded-2xl">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-20 text-slate-500 glass-panel border rounded-2xl">No employees match this filter criteria.</div>
      ) : isGridView ? (
        /* Impressive Feature: Grid Card Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {employees.map((emp) => (
            <div key={emp._id} className="glass-card rounded-[24px] border border-slate-200/60 dark:border-darkBorder/40 p-6 flex flex-col items-center justify-between text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-brand-400 to-emerald-500" />
              
              <div className="space-y-4 flex-1">
                <img 
                  src={emp.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${emp.name}`} 
                  alt={emp.name} 
                  className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-brand-500/20 shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white truncate max-w-[180px]">{emp.name}</h4>
                  <p className="text-[10px] font-bold text-brand-600 dark:text-brand-400 mt-1 uppercase tracking-wider">{emp.designation}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{emp.department}</p>
                </div>

                <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-left">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                  {!isEmployee && (
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{emp.salary !== undefined ? `₹${emp.salary.toLocaleString('en-IN')}` : '-'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid actions & badges */}
              <div className="w-full mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border
                  ${emp.status === 'Active' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {emp.status}
                </span>

                {!isEmployee && (
                  <div className="flex items-center space-x-1">
                    {/* HR Manager cannot edit Super Admin */}
                    {!(isHR && emp.role === 'Super Admin') && (
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Only Super Admin can Delete */}
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(emp._id, emp.name)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="glass-panel border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-slate-800/60 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/20">
                  <th className="p-4 pl-6">Employee</th>
                  <th className="p-4">Department & Designation</th>
                  <th className="p-4">System Role</th>
                  <th className="p-4">Joining Date</th>
                  {!isEmployee && <th className="p-4">Salary</th>}
                  <th className="p-4">Status</th>
                  {!isEmployee && <th className="p-4 pr-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-sm">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center space-x-3.5">
                        <img 
                          src={emp.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${emp.name}`} 
                          alt={emp.name} 
                          className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 object-cover"
                        />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{emp.name}</div>
                          <div className="text-[11px] font-semibold text-slate-400">{emp.employeeId} &bull; {emp.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">{emp.designation}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{emp.department}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                        {emp.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(emp.joiningDate).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    {!isEmployee && (
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                        {emp.salary !== undefined ? `₹${emp.salary.toLocaleString('en-IN')}` : '-'}
                      </td>
                    )}
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border
                        ${emp.status === 'Active' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full mr-1.5"
                          style={{ backgroundColor: emp.status === 'Active' ? '#22c55e' : '#f59e0b' }} 
                        />
                        {emp.status}
                      </span>
                    </td>
                    
                    {/* Admin Actions */}
                    {!isEmployee && (
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* HR Manager cannot edit Super Admin */}
                          {!(isHR && emp.role === 'Super Admin') && (
                            <button
                              onClick={() => handleOpenEdit(emp)}
                              className="p-2 text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit Employee"
                            >
                              <Edit3 className="w-4.5 h-4.5" />
                            </button>
                          )}
                          
                          {/* Only Super Admin can Delete */}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(emp._id, emp.name)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                              title="Delete Employee"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Panel */}
      <div className="glass-panel border rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm text-xs">
        <span className="text-slate-400 font-semibold">
          Showing {employees.length} of {totalCount} profiles
        </span>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CRUD Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="glass-panel border rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200/60 dark:border-slate-800/60">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-brand-500" />
                <span>{selectedEmployee ? 'Edit Employee Details' : 'Create Employee Profile'}</span>
              </h3>
              <button 
                onClick={() => setShowFormModal(false)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Employee ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Employee ID</label>
                  <input
                    type="text"
                    value={formEmployeeId}
                    onChange={(e) => setFormEmployeeId(e.target.value)}
                    placeholder="EMP001"
                    disabled={!!selectedEmployee} // ID shouldn't be edited once created
                    className="glass-input w-full text-sm disabled:opacity-50"
                  />
                  {formErrors.employeeId && <p className="text-red-500 text-xs mt-1">{formErrors.employeeId}</p>}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="John Doe"
                    className="glass-input w-full text-sm"
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Work Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="glass-input w-full text-sm"
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+919876543210"
                    className="glass-input w-full text-sm"
                  />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Department</label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="glass-input w-full text-sm"
                  >
                    {departments.map((dept, i) => (
                      <option key={i} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Designation</label>
                  <input
                    type="text"
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    placeholder="Senior Developer"
                    className="glass-input w-full text-sm"
                  />
                  {formErrors.designation && <p className="text-red-500 text-xs mt-1">{formErrors.designation}</p>}
                </div>

                {/* Salary */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Annual Salary (₹)</label>
                  <input
                    type="number"
                    value={formSalary}
                    onChange={(e) => setFormSalary(Number(e.target.value))}
                    placeholder="600000"
                    className="glass-input w-full text-sm"
                  />
                  {formErrors.salary && <p className="text-red-500 text-xs mt-1">{formErrors.salary}</p>}
                </div>

                {/* Joining Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Joining Date</label>
                  <input
                    type="date"
                    value={formJoiningDate}
                    onChange={(e) => setFormJoiningDate(e.target.value)}
                    className="glass-input w-full text-sm"
                  />
                  {formErrors.joiningDate && <p className="text-red-500 text-xs mt-1">{formErrors.joiningDate}</p>}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Employment Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="glass-input w-full text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* System Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">System Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    disabled={isHR && formRole === 'Super Admin'} // HR cannot edit or assign Super Admin
                    className="glass-input w-full text-sm disabled:opacity-50"
                  >
                    <option value="Employee">Employee</option>
                    <option value="HR Manager">HR Manager</option>
                    {/* HR cannot assign Super Admin role */}
                    {(!isHR) && <option value="Super Admin">Super Admin</option>}
                  </select>
                </div>

                {/* Reporting Manager */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reporting Manager</label>
                  <select
                    value={formReportingManager}
                    onChange={(e) => setFormReportingManager(e.target.value)}
                    className="glass-input w-full text-sm"
                  >
                    <option value="">None (Independent Executive)</option>
                    {allActiveList
                      // Filter out self from reporting manager to prevent simple self-circular reference
                      .filter(emp => !selectedEmployee || emp._id !== selectedEmployee._id)
                      .map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name} ({emp.designation} - {emp.employeeId})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Profile Image URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Profile Image URL</label>
                  <input
                    type="text"
                    value={formProfileImage}
                    onChange={(e) => setFormProfileImage(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="glass-input w-full text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {selectedEmployee ? 'Reset Password (leave empty to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={selectedEmployee ? '••••••••' : 'Password123'}
                  className="glass-input w-full text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-md active:scale-[0.98] transition-all"
                >
                  {selectedEmployee ? 'Save Changes' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="glass-panel border rounded-3xl w-full max-w-md shadow-2xl animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200/60 dark:border-slate-800/60">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                <span>Import CSV File</span>
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleImportSubmit} className="p-6 space-y-5">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-400 text-xs space-y-2">
                <div className="flex items-center space-x-1.5 font-bold">
                  <Info className="w-4 h-4" />
                  <span>CSV Column Schema Requirements</span>
                </div>
                <p>
                  Ensure your CSV file contains the following column headers exactly:
                </p>
                <code className="block bg-white dark:bg-slate-900 p-2 rounded border border-blue-200/50 dark:border-blue-800/20 break-all select-all font-mono">
                  employeeId,name,email,phone,department,designation,salary,joiningDate,role,managerEmployeeId
                </code>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Choose CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-500/10 file:text-brand-600 dark:file:text-brand-400 hover:file:bg-brand-500/20 cursor-pointer"
                  required
                />
              </div>

              {/* Show errors or results of the last parse */}
              {importResults && (
                <div className="max-h-40 overflow-y-auto p-4 rounded-xl text-xs space-y-1.5 border
                  ${importResults.errors && importResults.errors.length > 0 
                    ? 'bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400' 
                    : 'bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  }"
                >
                  <p className="font-bold">Result summary:</p>
                  <p>Success import: {importResults.count} records.</p>
                  {importResults.errors && importResults.errors.map((err, i) => (
                    <p key={i} className="text-[10px]">&bull; {err}</p>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={importLoading || !csvFile}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-40"
                >
                  {importLoading ? 'Uploading...' : 'Process Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
