import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Search, 
  User, 
  Calendar 
} from 'lucide-react';

interface AttendanceLog {
  _id: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: string;
  employee: {
    name: string;
    employeeId: string;
    department: string;
    designation: string;
  };
}

export const ShiftLogs: React.FC = () => {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendanceLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('attendance/all');
      setLogs(data.list || []);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve shift logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.employee?.name.toLowerCase().includes(search.toLowerCase()) ||
    log.employee?.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    log.date.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Shift Logs</h3>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Monitor employee daily clock-in & clock-out times.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="glass-panel border rounded-2xl p-4 lg:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, employee ID, or date (YYYY-MM-DD)..."
            className="glass-input has-icon w-full py-2 text-xs"
          />
        </div>
      </div>

      {/* Log list */}
      {loading ? (
        <div className="py-20 flex items-center justify-center glass-panel border rounded-2xl">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-20 text-slate-500 glass-panel border rounded-2xl">No shift logs registered.</div>
      ) : (
        <div className="glass-panel border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-slate-800/60 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/20">
                  <th className="p-4 pl-6">Employee</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Clock In</th>
                  <th className="p-4">Clock Out</th>
                  <th className="p-4 pr-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-sm">
                {filteredLogs.map((log) => {
                  const inTimeStr = log.clockIn ? new Date(log.clockIn).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '--:--';
                  const outTimeStr = log.clockOut ? new Date(log.clockOut).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '--:--';
                  return (
                    <tr key={log._id} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                            <User className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">{log.employee?.name}</div>
                            <div className="text-[11px] font-semibold text-slate-400">{log.employee?.employeeId} &bull; {log.employee?.designation}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 font-semibold text-xs">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-brand-500" />
                          <span>{new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-xs text-slate-600 dark:text-slate-300">
                        {inTimeStr}
                      </td>
                      <td className="p-4 font-mono font-bold text-xs text-slate-600 dark:text-slate-300">
                        {outTimeStr}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border
                          ${log.status === 'Present' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
