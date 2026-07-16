import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CustomSelect } from '../components/CustomSelect';
import { useAuth } from '../context/AuthContext';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  X, 
  Calendar,
  CheckCircle2, 
  AlertCircle,
  Clock,
  UserCheck,
  MessageSquare,
  Send,
  Edit2,
  Trash2,
  BarChart3,
  Filter
} from 'lucide-react';

interface EmployeeSummary {
  _id: string;
  name: string;
  employeeId: string;
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

interface TaskItem {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  comments: CommentItem[];
  assignedTo: {
    _id: string;
    name: string;
    employeeId: string;
    department: string;
    designation: string;
  };
  assignedBy: {
    name: string;
    designation: string;
  };
}

export const TaskManager: React.FC = () => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'Employee';
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activeEmployees, setActiveEmployees] = useState<EmployeeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  
  // Create/Edit Task states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [formError, setFormError] = useState<string | null>(null);

  // Comments
  const [selectedCommentTask, setSelectedCommentTask] = useState<TaskItem | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);

  // Delete confirm
  const [deletingTask, setDeletingTask] = useState<TaskItem | null>(null);

  // Banners
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await api.get('tasks/all');
      setTasks(data.tasks || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to retrieve tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('employees?limit=200');
      setActiveEmployees(res.employees || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  const openCreateModal = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskAssignedTo('');
    setTaskDueDate('');
    setTaskPriority('Medium');
    setFormError(null);
    setShowAssignModal(true);
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskAssignedTo(task.assignedTo?._id || '');
    setTaskDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setTaskPriority(task.priority);
    setFormError(null);
    setShowAssignModal(true);
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!taskTitle.trim() || !taskAssignedTo || !taskDueDate) {
      setFormError('Please fill in all mandatory fields');
      return;
    }

    try {
      if (editingTask) {
        await api.put(`tasks/${editingTask._id}`, {
          title: taskTitle,
          description: taskDescription,
          assignedTo: taskAssignedTo,
          dueDate: taskDueDate,
          priority: taskPriority,
        });
        showSuccess('Task updated successfully!');
      } else {
        await api.post('tasks/assign', {
          title: taskTitle,
          description: taskDescription,
          assignedTo: taskAssignedTo,
          dueDate: taskDueDate,
          priority: taskPriority,
        });
        showSuccess('Task assigned successfully!');
      }
      setShowAssignModal(false);
      fetchTasks();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save task');
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    try {
      await api.delete(`tasks/${deletingTask._id}`);
      setTasks(prev => prev.filter(t => t._id !== deletingTask._id));
      setDeletingTask(null);
      showSuccess('Task deleted successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete task');
      setDeletingTask(null);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);
    if (!selectedCommentTask || !newCommentText.trim()) return;

    try {
      const res = await api.post(`tasks/${selectedCommentTask._id}/comment`, {
        text: newCommentText,
      });
      setSelectedCommentTask(res.task);
      setNewCommentText('');
      setTasks(prev => prev.map(t => t._id === res.task._id ? res.task : t));
    } catch (err: any) {
      setCommentError(err.message || 'Failed to post comment');
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedTo?.name.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedTo?.employeeId?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || t.status === filterStatus;
    const matchPriority = filterPriority === 'All' || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  // Stats
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const pending = tasks.filter(t => t.status === 'Pending').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Task Management</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Assign work tasks and monitor team completion.
          </p>
        </div>
        {!isEmployee && (
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-md active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New Task</span>
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: total, color: 'text-brand-500', bg: 'bg-brand-500/10' },
          { label: 'Completed', value: completed, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
          { label: 'In Progress', value: inProgress, color: 'text-blue-600', bg: 'bg-blue-500/10' },
          { label: 'Pending', value: pending, color: 'text-amber-600', bg: 'bg-amber-500/10' },
        ].map((s) => (
          <div key={s.label} className="glass-panel border rounded-2xl p-4 flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <BarChart3 className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{s.value}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Completion Rate Bar */}
      <div className="glass-panel border rounded-2xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Overall Completion Rate</span>
          <span className="text-xs font-bold text-brand-500">{completionRate}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-brand-400 to-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 rounded-xl border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl border bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filters */}
      <div className="glass-panel border rounded-2xl p-4 lg:p-5 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or employee name..."
            className="glass-input has-icon w-full py-2 text-xs"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <CustomSelect
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Pending', label: 'Pending' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
            ]}
          />
          <CustomSelect
            value={filterPriority}
            onChange={setFilterPriority}
            options={[
              { value: 'All', label: 'All Priorities' },
              { value: 'High', label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low' },
            ]}
          />
        </div>
      </div>

      {/* Tasks Table */}
      {loading ? (
        <div className="py-20 flex items-center justify-center glass-panel border rounded-2xl">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-20 text-slate-500 glass-panel border rounded-2xl">No task assignments found.</div>
      ) : (
        <div className="glass-panel border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-slate-800/60 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/20">
                  <th className="p-4 pl-6">Task</th>
                  <th className="p-4">Assigned To</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-sm">
                {filteredTasks.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{item.title}</div>
                      <div className="text-[11px] font-semibold text-slate-400 max-w-[250px] truncate mt-0.5">{item.description || 'No description'}</div>
                      <button
                        onClick={() => { setSelectedCommentTask(item); setCommentError(null); }}
                        className="mt-1.5 flex items-center space-x-1 text-[10px] text-slate-400 hover:text-brand-500 font-bold cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Discussion ({item.comments?.length || 0})</span>
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-700 dark:text-slate-300">{item.assignedTo?.name}</div>
                      <div className="text-[11px] text-slate-400 font-semibold">{item.assignedTo?.designation}</div>
                    </td>
                    <td className="p-4 text-slate-500 text-xs font-semibold">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-500" />
                        <span>{new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border
                        ${item.priority === 'High' 
                          ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' 
                          : item.priority === 'Low'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {item.priority || 'Medium'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center w-fit space-x-1
                        ${item.status === 'Completed' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : item.status === 'In Progress'
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {item.status === 'Completed' ? <UserCheck className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end space-x-2">
                        {!isEmployee && (
                          <>
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 transition-colors"
                              title="Edit Task"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingTask(item)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                              title="Delete Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <span className="text-[10px] text-slate-400 font-semibold ml-1">{item.assignedBy?.name || 'Admin'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ASSIGN / EDIT TASK MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="glass-panel border rounded-3xl w-full max-w-md shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-200/60 dark:border-slate-800/60">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <ClipboardList className="w-5 h-5 text-brand-500" />
                <span>{editingTask ? 'Edit Task' : 'Assign New Task'}</span>
              </h3>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="p-6 space-y-5">
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Task Title *</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Review quarterly marketing copy"
                  className="glass-input w-full text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Add task details, deliverables, and expectations..."
                  rows={3}
                  className="glass-input w-full text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Assign To Employee *</label>
                <CustomSelect
                  value={taskAssignedTo}
                  onChange={(val) => setTaskAssignedTo(val)}
                  options={activeEmployees.map(emp => ({
                    value: emp._id,
                    label: `${emp.name} (${emp.designation})`
                  }))}
                  placeholder="Select Employee"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Priority</label>
                  <CustomSelect
                    value={taskPriority}
                    onChange={(val) => setTaskPriority(val)}
                    options={[
                      { value: 'Low', label: 'Low' },
                      { value: 'Medium', label: 'Medium' },
                      { value: 'High', label: 'High' }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="glass-input w-full text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold active:scale-[0.98] transition-all"
                >
                  {editingTask ? 'Save Changes' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deletingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="glass-panel border rounded-3xl w-full max-w-sm shadow-2xl p-6 animate-scale-up text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Delete Task?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to permanently delete <span className="font-bold text-slate-700 dark:text-slate-200">"{deletingTask.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeletingTask(null)}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold active:scale-[0.98] transition-all"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TASK DISCUSSION MODAL */}
      {selectedCommentTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="glass-panel border rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-scale-up">
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

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {(selectedCommentTask.comments || []).length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-6">
                  No comments yet. Add a note to discuss blockers!
                </p>
              ) : (
                (selectedCommentTask.comments || []).map((c, i) => (
                  <div 
                    key={i} 
                    className={`p-3 rounded-2xl border text-xs space-y-1.5
                      ${c.sender?._id === user?._id 
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
                  placeholder="Leave a comment or note..."
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
};
