import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  CalendarDays, 
  Check, 
  X, 
  CheckCircle2, 
  XCircle, 
  Search,
  User
} from 'lucide-react';

interface LeaveItem {
  _id: string;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  employee: {
    _id: string;
    name: string;
    employeeId: string;
    department: string;
    designation: string;
  };
  approvedBy?: {
    name: string;
    designation: string;
  };
}

export const LeavesManager: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const query = filterStatus ? `leaves/all?status=${filterStatus}` : 'leaves/all';
      const data = await api.get(query);
      setLeaves(data.leaves || []);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve leaves directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [filterStatus]);

  const handleUpdateStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      setError(null);
      setSuccessMsg(null);
      await api.put(`leaves/${id}/status`, { status });
      setSuccessMsg(`Leave request has been successfully ${status.toLowerCase()}!`);
      fetchLeaves();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to process request status update');
    }
  };

  const filteredLeaves = leaves.filter(l => 
    l.employee?.name.toLowerCase().includes(search.toLowerCase()) ||
    l.employee?.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    l.reason.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Leaves Management</h3>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Review, approve, or reject employee leave requests.
        </p>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 rounded-xl border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl border bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center space-x-2">
          <XCircle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Control filters */}
      <div className="glass-panel border rounded-2xl p-4 lg:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by employee name or reason..."
            className="glass-input has-icon w-full py-2 text-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="glass-input text-xs py-2 pr-8"
          >
            <option value="">All Request Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex items-center justify-center glass-panel border rounded-2xl">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredLeaves.length === 0 ? (
        <div className="text-center py-20 text-slate-500 glass-panel border rounded-2xl">No leave requests found.</div>
      ) : (
        <div className="glass-panel border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-slate-800/60 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/20">
                  <th className="p-4 pl-6">Employee</th>
                  <th className="p-4">Leave details</th>
                  <th className="p-4">Period</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-sm">
                {filteredLeaves.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{item.employee?.name}</div>
                          <div className="text-[11px] font-semibold text-slate-400">{item.employee?.employeeId} &bull; {item.employee?.designation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {item.type}
                    </td>
                    <td className="p-4 text-slate-500 text-xs font-medium">
                      <div className="flex items-center space-x-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-brand-500" />
                        <span>
                          {new Date(item.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          &nbsp;&rarr;&nbsp;
                          {new Date(item.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 max-w-[220px] truncate">
                      {item.reason}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border
                        ${item.status === 'Approved' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : item.status === 'Rejected'
                          ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {item.status === 'Pending' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleUpdateStatus(item._id, 'Approved')}
                            className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg active:scale-[0.98] transition-all"
                            title="Approve Leave"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item._id, 'Rejected')}
                            className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-600 hover:bg-red-500 hover:text-white rounded-lg active:scale-[0.98] transition-all"
                            title="Reject Leave"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-semibold">
                          Reviewed by {item.approvedBy?.name || 'Admin'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
