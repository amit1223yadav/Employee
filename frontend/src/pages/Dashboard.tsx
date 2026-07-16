import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CustomSelect } from '../components/CustomSelect';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Layers, 
  TrendingUp, 
  Calendar, 
  Briefcase,
  IndianRupee,
  Clock,
  ClipboardList,
  CheckCircle,
  Plus,
  Play,
  Square,
  ShieldCheck,
  AlertCircle,
  CalendarCheck,
  X,
  ChevronDown,
  MessageSquare,
  Send
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface Stats {
  total: number;
  active: number;
  inactive: number;
  departmentCount: number;
  taskStats?: {
    total: number;
    completed: number;
  };
  monthlyPayroll?: number;
  estimatedRevenue?: number;
}

interface ChartItem {
  name: string;
  count: number;
}

interface SalaryItem {
  name: string;
  avgSalary: number;
}

interface RecentHire {
  _id: string;
  name: string;
  joiningDate: string;
  department: string;
  designation: string;
}

interface CommentItem {
  _id?: string;
  sender: {
    _id: string;
    name: string;
    designation: string;
  };
  text: string;
  createdAt: string;
}

// Interfaces for Employee Dashboard
interface TaskItem {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  assignedBy: {
    name: string;
    designation: string;
  };
  comments: CommentItem[];
}

interface LeaveItem {
  _id: string;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: {
    name: string;
    designation: string;
  };
}

interface AttendanceRecord {
  _id: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: string;
}

// Custom Premium Status Pill Dropdown
const TaskStatusDropdown: React.FC<{
  status: string;
  onChange: (val: string) => void;
}> = ({ status, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all active:scale-95 flex items-center space-x-1.5 cursor-pointer w-fit select-none
          ${status === 'Completed'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            : status === 'In Progress'
            ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
          }`}
      >
        <span>{status}</span>
        <ChevronDown className="w-3 h-3 text-current" />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 mt-1 py-1 w-28 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl animate-scale-up">
          {['Pending', 'In Progress', 'Completed'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onChange(s);
                setIsOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'Employee';

  // --- Admin/HR State ---
  const [stats, setStats] = useState<Stats | null>(null);
  const [departmentData, setDepartmentData] = useState<ChartItem[]>([]);
  const [roleData, setRoleData] = useState<ChartItem[]>([]);
  const [salaryData, setSalaryData] = useState<SalaryItem[]>([]);
  const [recentHires, setRecentHires] = useState<RecentHire[]>([]);

  // --- Employee State ---
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [myTasks, setMyTasks] = useState<TaskItem[]>([]);
  const [myLeaves, setMyLeaves] = useState<LeaveItem[]>([]);
  
  // Modals & Forms
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveFormError, setLeaveFormError] = useState<string | null>(null);

  // Task Comments Modal State
  const [selectedCommentTask, setSelectedCommentTask] = useState<TaskItem | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);

  // Common Loading/Error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Load Admin Data
  const fetchAdminData = async () => {
    const data = await api.get('organization/dashboard-stats');
    setStats(data.stats);
    setDepartmentData(data.charts.departments);
    setRoleData(data.charts.roles);
    setSalaryData(data.charts.salaries || []);
    setRecentHires(data.recentHires);
  };

  // Load Employee Data
  const fetchEmployeeData = async () => {
    // 1. Fetch today's clock-in status
    const attToday = await api.get('attendance/today');
    setTodayAttendance(attToday.record || null);

    // 2. Fetch attendance history logs
    const attHist = await api.get('attendance/history');
    setAttendanceHistory(attHist.history || []);

    // 3. Fetch personal tasks
    const tasksRes = await api.get('tasks/my');
    setMyTasks(tasksRes.tasks || []);

    // 4. Fetch personal leaves
    const leavesRes = await api.get('leaves/my');
    setMyLeaves(leavesRes.leaves || []);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (isEmployee) {
        await fetchEmployeeData();
      } else {
        await fetchAdminData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isEmployee]);

  // Attendance Clock-in Trigger
  const handleClockIn = async () => {
    try {
      setActionError(null);
      const res = await api.post('attendance/clock-in', {});
      setTodayAttendance(res.record);
      setActionSuccess('Clocked in successfully! Have a great shift.');
      // Refresh history
      const attHist = await api.get('attendance/history');
      setAttendanceHistory(attHist.history || []);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to clock in');
    }
  };

  // Attendance Clock-out Trigger
  const handleClockOut = async () => {
    try {
      setActionError(null);
      const res = await api.post('attendance/clock-out', {});
      setTodayAttendance(res.record);
      setActionSuccess('Clocked out successfully! Great job today.');
      // Refresh history
      const attHist = await api.get('attendance/history');
      setAttendanceHistory(attHist.history || []);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to clock out');
    }
  };

  // Update Task Status
  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await api.put(`tasks/${taskId}/status`, { status: newStatus });
      
      // Update locally
      setMyTasks(prev => 
        prev.map(t => t._id === taskId ? { ...t, status: newStatus as any } : t)
      );
    } catch (err: any) {
      setActionError('Failed to update task status');
    }
  };

  // Submit Leave Form
  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveFormError(null);

    if (!leaveStartDate || !leaveEndDate || !leaveReason.trim()) {
      setLeaveFormError('Please fill in all form fields');
      return;
    }

    try {
      await api.post('leaves/request', {
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        type: leaveType,
        reason: leaveReason,
      });

      setShowLeaveModal(false);
      setLeaveStartDate('');
      setLeaveEndDate('');
      setLeaveReason('');
      
      // Reload leaves list
      const leavesRes = await api.get('leaves/my');
      setMyLeaves(leavesRes.leaves || []);
      setActionSuccess('Leave request submitted successfully!');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setLeaveFormError(err.message || 'Failed to submit leave request');
    }
  };

  // Submit Comment Form
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);

    if (!selectedCommentTask || !newCommentText.trim()) return;

    try {
      const res = await api.post(`tasks/${selectedCommentTask._id}/comment`, {
        text: newCommentText,
      });

      // Update locally in selectedTask
      setSelectedCommentTask(res.task);
      setNewCommentText('');
      
      // Update locally in myTasks list
      setMyTasks(prev => 
        prev.map(t => t._id === res.task._id ? res.task : t)
      );
    } catch (err: any) {
      setCommentError(err.message || 'Failed to post comment');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Assembling workspace analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400">
        <h3 className="font-bold text-lg">Error loading dashboard</h3>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6'];

  // --- RENDER EMPLOYEE DASHBOARD ---
  if (isEmployee) {
    const pendingTasks = myTasks.filter(t => t.status !== 'Completed');
    const clockedInStr = todayAttendance?.clockIn ? new Date(todayAttendance.clockIn).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '--:--';
    const clockedOutStr = todayAttendance?.clockOut ? new Date(todayAttendance.clockOut).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '--:--';

    const approvedLeaves = myLeaves.filter(l => l.status === 'Approved');
    
    const getLeaveCount = (type: string) => {
      return approvedLeaves
        .filter(l => l.type === type)
        .reduce((acc, curr) => {
          const start = new Date(curr.startDate);
          const end = new Date(curr.endDate);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          return acc + diffDays;
        }, 0);
    };
    
    const sickTaken = getLeaveCount('Sick Leave');
    const casualTaken = getLeaveCount('Casual Leave');
    const paidTaken = getLeaveCount('Paid Leave');
    const unpaidTaken = getLeaveCount('Unpaid Leave');

    return (
      <div className="space-y-8 animate-fade-in-up">
        {/* Banner with Greeting */}
        <div className="glass-panel border rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-brand-500/10 rounded-full blur-2xl" />
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Namaste, {user?.name}!</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 font-semibold">
              Role: <span className="text-brand-500">{user?.designation}</span> &bull; {user?.department}
            </p>
          </div>
          
          <div className="flex items-center space-x-3.5 bg-slate-100/60 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/50 dark:border-darkBorder/40">
            <Clock className="w-5 h-5 text-brand-500" />
            <div className="text-xs">
              <div className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Today's Shift</div>
              <div className="font-mono font-bold text-slate-800 dark:text-white">
                {todayAttendance?.clockIn ? 'Active Now' : 'Not Started'}
              </div>
            </div>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {actionSuccess && (
          <div className="p-4 rounded-xl border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="p-4 rounded-xl border bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Employee Interactive Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. ATTENDANCE CLOCK WIDGET */}
          <div className="glass-panel border rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <Clock className="w-5 h-5 text-brand-500" />
                <span>Attendance Log</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Clock in/out daily to log attendance.</p>
            </div>

            {/* Glowing check-in button */}
            <div className="flex flex-col items-center justify-center py-4">
              {!todayAttendance?.clockIn ? (
                <button
                  onClick={handleClockIn}
                  className="w-32 h-32 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex flex-col items-center justify-center border-4 border-brand-500/20 shadow-xl shadow-brand-500/25 active:scale-[0.97] transition-all"
                >
                  <Play className="w-8 h-8 fill-white ml-1 animate-pulse" />
                  <span className="text-xs font-bold mt-2">Clock In</span>
                </button>
              ) : !todayAttendance.clockOut ? (
                <button
                  onClick={handleClockOut}
                  className="w-32 h-32 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex flex-col items-center justify-center border-4 border-amber-500/20 shadow-xl shadow-amber-500/25 active:scale-[0.97] transition-all"
                >
                  <Square className="w-8 h-8 fill-white" />
                  <span className="text-xs font-bold mt-2">Clock Out</span>
                </button>
              ) : (
                <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 flex flex-col items-center justify-center border-4 border-slate-300 dark:border-slate-800">
                  <ShieldCheck className="w-8 h-8" />
                  <span className="text-xs font-bold mt-2">Finished</span>
                </div>
              )}
            </div>

            {/* Timings row */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-center">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clock In</div>
                <div className="text-sm font-mono font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">
                  {clockedInStr}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clock Out</div>
                <div className="text-sm font-mono font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">
                  {clockedOutStr}
                </div>
              </div>
            </div>

            {/* Attendance logs list */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Recent Attendance History
              </h4>
              {attendanceHistory.slice(0, 4).length === 0 ? (
                <p className="text-xs text-slate-500">No shift logs found.</p>
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {attendanceHistory.slice(0, 4).map((att) => {
                    const inTime = att.clockIn ? new Date(att.clockIn).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '-';
                    const outTime = att.clockOut ? new Date(att.clockOut).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '-';
                    return (
                      <div key={att._id} className="flex justify-between text-xs p-1.5 rounded-lg bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/20">
                        <span className="font-semibold text-slate-600 dark:text-slate-400">
                          {new Date(att.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="font-mono text-slate-500">
                          {inTime} &bull; {outTime}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 2. TASKS LIST WIDGET */}
          <div className="glass-panel border rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6 lg:col-span-2">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                  <ClipboardList className="w-5 h-5 text-brand-500" />
                  <span>My Assigned Tasks</span>
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold border border-brand-500/10">
                  {pendingTasks.length} pending
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Review your tasks and select status updates.</p>
            </div>

            {/* List */}
            <div className="flex-1 space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {myTasks.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <CheckCircle className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
                  <p className="text-sm font-semibold">All caught up!</p>
                  <p className="text-xs mt-0.5">No tasks assigned to you right now.</p>
                </div>
              ) : (
                myTasks.map((t) => (
                  <div 
                    key={t._id} 
                    className={`flex items-start space-x-3.5 p-3 rounded-2xl border transition-all duration-200
                      ${t.status === 'Completed' 
                        ? 'bg-emerald-500/5 border-emerald-500/10 opacity-70' 
                        : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-darkBorder/40'
                      }`}
                  >
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <TaskStatusDropdown
                        status={t.status}
                        onChange={(newStatus) => handleUpdateTaskStatus(t._id, newStatus)}
                      />
                      {/* Discussion comment bubble */}
                      <button
                        onClick={() => { setSelectedCommentTask(t); setCommentError(null); }}
                        className="mt-2.5 flex items-center space-x-1 text-[10px] text-slate-400 hover:text-brand-500 font-bold tracking-tight select-none"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>Discuss ({t.comments?.length || 0})</span>
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold truncate ${t.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                        {t.title}
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {t.description || 'No description provided.'}
                      </p>
                      <div className="flex flex-wrap items-center mt-2.5 gap-2 text-[10px] font-bold text-slate-400">
                        <span className={`px-2 py-0.5 rounded-md border
                          ${t.priority === 'High' 
                            ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' 
                            : t.priority === 'Low'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {t.priority || 'Medium'}
                        </span>
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/20">
                          Due: {new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-slate-400 dark:text-slate-600 font-semibold">
                          Assigned by {t.assignedBy?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. LEAVE APPLICATIONS WIDGET */}
          <div className="glass-panel border rounded-3xl p-6 shadow-sm lg:col-span-2 flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                  <CalendarCheck className="w-5 h-5 text-brand-500" />
                  <span>Leaves & Absences</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Apply for leave and monitor approval status.</p>
              </div>

              <button
                onClick={() => { setLeaveFormError(null); setShowLeaveModal(true); }}
                className="flex items-center space-x-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Request Leave</span>
              </button>
            </div>

            {/* Leaves Balance Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-2xl bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200/45 dark:border-darkBorder/45">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sick Leave</div>
                <div className="text-sm font-extrabold text-slate-700 dark:text-slate-200 mt-1">
                  {sickTaken} / 5 <span className="text-xs text-slate-400 font-medium">days</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200/45 dark:border-darkBorder/45">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Casual Leave</div>
                <div className="text-sm font-extrabold text-slate-700 dark:text-slate-200 mt-1">
                  {casualTaken} / 12 <span className="text-xs text-slate-400 font-medium">days</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200/45 dark:border-darkBorder/45">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid Leave</div>
                <div className="text-sm font-extrabold text-slate-700 dark:text-slate-200 mt-1">
                  {paidTaken} / 15 <span className="text-xs text-slate-400 font-medium">days</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200/45 dark:border-darkBorder/45">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unpaid Leave</div>
                <div className="text-sm font-extrabold text-slate-700 dark:text-slate-200 mt-1">
                  {unpaidTaken} <span className="text-xs text-slate-400 font-medium">days</span>
                </div>
              </div>
            </div>

            {/* Leaves List */}
            <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-800/80 pt-4">
              {myLeaves.length === 0 ? (
                <div className="text-center py-6 text-slate-500">No leave requests logged.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/50 dark:border-slate-800/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Leave Type</th>
                      <th className="pb-3">Start Date</th>
                      <th className="pb-3">End Date</th>
                      <th className="pb-3">Reason</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Approver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-xs">
                    {myLeaves.map((leave) => (
                      <tr key={leave._id} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                        <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{leave.type}</td>
                        <td className="py-3 text-slate-500">
                          {new Date(leave.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-3 text-slate-500">
                          {new Date(leave.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400 max-w-[200px] truncate">{leave.reason}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border
                            ${leave.status === 'Approved' 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : leave.status === 'Rejected'
                              ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {leave.status}
                          </span>
                        </td>
                        <td className="py-3 text-right text-slate-400">
                          {leave.approvedBy ? leave.approvedBy.name : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* 4. PERFORMANCE SCORECARD WIDGET */}
          <div className="glass-panel border rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6 lg:col-span-1">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-brand-500" />
                <span>Performance Review</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Manager ratings & feedback scorecards.</p>
            </div>

            <div className="space-y-4">
              {/* Rating representation */}
              <div className="p-4 bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/40 dark:border-darkBorder/40 text-center">
                <div className="text-2xl font-black text-slate-800 dark:text-white">4.8 / 5.0</div>
                <div className="text-amber-400 text-sm mt-1">★ ★ ★ ★ ★</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">Annual Scorecard</div>
              </div>

              {/* Feedback bubble */}
              <div className="text-xs text-slate-500 dark:text-slate-400 italic bg-brand-500/5 p-3 rounded-xl border border-brand-500/10">
                "Arjun displays outstanding technical ownership and code quality in TypeScript, leading sprint deliveries with high consistency."
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Review Checkmarks</h4>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Deliver SynapseHR Architecture</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Custom select theme drop-downs</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Submit Support ticket log features</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* APPLY LEAVE FORM MODAL */}
        {showLeaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="glass-panel border rounded-3xl w-full max-w-md shadow-2xl animate-scale-up">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200/60 dark:border-slate-800/60">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                  <CalendarCheck className="w-5 h-5 text-brand-500" />
                  <span>Request Leave</span>
                </h3>
                <button 
                  onClick={() => setShowLeaveModal(false)}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleLeaveSubmit} className="p-6 space-y-5">
                {leaveFormError && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-xs font-semibold">
                    {leaveFormError}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Leave Type</label>
                  <CustomSelect
                    value={leaveType}
                    onChange={(val) => setLeaveType(val)}
                    options={[
                      { value: 'Sick Leave', label: 'Sick Leave' },
                      { value: 'Casual Leave', label: 'Casual Leave' },
                      { value: 'Paid Leave', label: 'Paid Leave' },
                      { value: 'Unpaid Leave', label: 'Unpaid Leave' }
                    ]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                    <input
                      type="date"
                      value={leaveStartDate}
                      onChange={(e) => setLeaveStartDate(e.target.value)}
                      className="glass-input w-full text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">End Date</label>
                    <input
                      type="date"
                      value={leaveEndDate}
                      onChange={(e) => setLeaveEndDate(e.target.value)}
                      className="glass-input w-full text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Reason</label>
                  <textarea
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Enter reason for leave request..."
                    rows={3}
                    className="glass-input w-full text-xs resize-none"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setShowLeaveModal(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold active:scale-[0.98] transition-all"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TASK COMMENTS MODAL (DISCUSSION) */}
        {selectedCommentTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
            <div className="glass-panel border rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-scale-up">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-brand-500" />
                    <span>Task Discussion</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                    Topic: {selectedCommentTask.title}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedCommentTask(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable comment list */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {(selectedCommentTask.comments || []).length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-6">
                    No comments posted yet. Start the conversation!
                  </p>
                ) : (
                  (selectedCommentTask.comments || []).map((c, i) => (
                    <div 
                      key={i} 
                      className={`p-3 rounded-2xl border text-xs space-y-1.5
                        ${c.sender?._id === user._id 
                          ? 'bg-brand-500/5 border-brand-500/10' 
                          : 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/40 dark:border-darkBorder/40'
                        }`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        <span>{c.sender?.name} ({c.sender?.designation})</span>
                        <span>{new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                        {c.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Post comment form */}
              <form onSubmit={handleAddComment} className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3">
                {commentError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl text-red-700 dark:text-red-400 text-[11px] font-semibold">
                    {commentError}
                  </div>
                )}
                
                <div className="relative">
                  <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Ask a question or comment on task blockers..."
                    rows={2}
                    className="glass-input w-full text-xs pr-12 resize-none"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-3.5 bottom-3.5 p-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl active:scale-90 transition-transform flex items-center justify-center cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER ADMIN/HR DASHBOARD ---
  const showSalaries = user?.role !== 'Employee';
  const kpis = [
    { name: 'Total Employees', value: stats?.total || 0, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
    { name: 'Active Employees', value: stats?.active || 0, icon: UserCheck, color: 'text-emerald-500 bg-emerald-500/10' },
    { name: 'Inactive Employees', value: stats?.inactive || 0, icon: UserX, color: 'text-amber-500 bg-amber-500/10' },
    { name: 'Departments', value: stats?.departmentCount || 0, icon: Layers, color: 'text-purple-500 bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {kpi.name}
                  </p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2 tracking-tight">
                    {kpi.value}
                  </h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </div>
          );
        })}
      </div>

      {/* Admin Performance & Financial Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Task Completion Progress */}
        <div className="glass-panel border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <ClipboardList className="w-5 h-5 text-brand-500" />
              <span>Company Task Completion Rate</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">Overall ratio of completed tasks to assigned work.</p>
          </div>
          <div className="py-4">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-2">
              <span>Progress Bar</span>
              <span>
                {stats?.taskStats?.completed || 0} of {stats?.taskStats?.total || 0} tasks done
              </span>
            </div>
            {/* Custom Premium progress bar */}
            <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200/50 dark:border-darkBorder/40">
              <div 
                className="h-full bg-linear-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ 
                  width: `${stats?.taskStats?.total ? Math.round((stats.taskStats.completed / stats.taskStats.total) * 100) : 0}%` 
                }}
              />
            </div>
            <div className="text-right text-[10px] text-slate-400 mt-1 font-bold">
              {stats?.taskStats?.total ? Math.round((stats.taskStats.completed / stats.taskStats.total) * 100) : 0}% Complete
            </div>
          </div>
        </div>

        {/* Company Budget / Payroll Expenses Tracker */}
        <div className="glass-panel border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <IndianRupee className="w-5 h-5 text-emerald-500" />
              <span>Financial Estimates</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">Comparison of company revenue target against active payroll outlay.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 py-2 border-t border-slate-100 dark:border-slate-800/80 mt-4">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Est. Annual Revenue</div>
              <div className="text-lg font-mono font-extrabold text-slate-800 dark:text-white mt-1">
                ₹{(stats?.estimatedRevenue || 52000000).toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Payroll Expense</div>
              <div className="text-lg font-mono font-extrabold text-red-500 dark:text-red-400 mt-1">
                ₹{(stats?.monthlyPayroll || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Distribution (Bar Chart) */}
        <div className="glass-panel border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Department Headcount</h3>
            <span className="text-xs text-slate-400 font-semibold flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
              <span>Real-time counts</span>
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#1e293b', 
                    color: '#f8fafc' 
                  }}
                />
                <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]}>
                  {departmentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Role Distribution (Pie Chart) */}
        <div className="glass-panel border rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">Role Composition</h3>
          <div className="h-72 flex flex-col sm:flex-row items-center justify-between">
            <div className="w-full sm:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {roleData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      backgroundColor: '#1e293b', 
                      color: '#f8fafc' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Pie Chart Legend */}
            <div className="w-full sm:w-1/2 flex flex-col space-y-3 pl-0 sm:pl-6">
              {roleData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Average Salary by Department (Visible to HR/Admins only) */}
        {showSalaries && (
          <div className="glass-panel border rounded-2xl p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <IndianRupee className="w-5 h-5 text-brand-500" />
                <span>Average Annual Salary by Department</span>
              </h3>
              <span className="text-xs text-slate-400 font-semibold">Department-wise Breakdown</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Average Salary']}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      backgroundColor: '#1e293b', 
                      color: '#f8fafc' 
                    }}
                  />
                  <Bar dataKey="avgSalary" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {salaryData.map((_, index) => (
                      <Cell key={`cell-sal-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Recent Hires Panel */}
      <div className="glass-panel border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Recent Hires</h3>
          <span className="text-xs text-slate-400 font-semibold flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Latest additions</span>
          </span>
        </div>
        
        {recentHires.length === 0 ? (
          <div className="text-center py-6 text-slate-500">No recent hires found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-slate-800/60 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pr-4">Employee</th>
                  <th className="pb-3 px-4">Department</th>
                  <th className="pb-3 px-4">Designation</th>
                  <th className="pb-3 pl-4 text-right">Joining Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-sm">
                {recentHires.map((hire) => (
                  <tr key={hire._id} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                    <td className="py-3.5 pr-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{hire.name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{hire.department}</td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-500">
                        <Briefcase className="w-4 h-4" />
                        <span>{hire.designation}</span>
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right text-slate-500">
                      {new Date(hire.joiningDate).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
