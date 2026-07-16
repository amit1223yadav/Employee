import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CustomSelect } from '../components/CustomSelect';
import { 
  LifeBuoy, 
  Plus, 
  Search, 
  X, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  User,
  Send
} from 'lucide-react';

interface TicketItem {
  _id: string;
  title: string;
  description: string;
  category: 'Payroll' | 'IT Support' | 'HR Query' | 'Other';
  status: 'Open' | 'In Progress' | 'Resolved';
  response: string;
  createdAt: string;
  employee?: {
    name: string;
    employeeId: string;
    department: string;
    designation: string;
  };
}

export const Helpdesk: React.FC = () => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'Employee';

  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Ticket states (Employee)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'Payroll' | 'IT Support' | 'HR Query' | 'Other'>('IT Support');
  const [formError, setFormError] = useState<string | null>(null);

  // Respond Ticket states (HR / Admin)
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [newStatus, setNewStatus] = useState<'Open' | 'In Progress' | 'Resolved'>('Resolved');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      if (isEmployee) {
        const data = await api.get('tickets/my');
        setTickets(data.tickets || []);
      } else {
        const data = await api.get('tickets/all');
        setTickets(data.tickets || []);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to retrieve helpdesk tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [isEmployee]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!ticketTitle.trim() || !ticketDescription.trim()) {
      setFormError('Please fill in all mandatory fields');
      return;
    }

    try {
      await api.post('tickets/create', {
        title: ticketTitle,
        description: ticketDescription,
        category: ticketCategory,
      });

      setShowCreateModal(false);
      setTicketTitle('');
      setTicketDescription('');
      setTicketCategory('IT Support');

      setSuccessMsg('Support ticket submitted successfully!');
      fetchTickets();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit ticket');
    }
  };

  const handleRespondTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminResponse.trim()) return;

    try {
      await api.put(`tickets/${selectedTicket._id}/respond`, {
        response: adminResponse,
        status: newStatus,
      });

      setSelectedTicket(null);
      setAdminResponse('');
      setSuccessMsg('Ticket updated successfully!');
      fetchTickets();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit ticket response');
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase()) ||
    t.employee?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
            <LifeBuoy className="w-5 h-5 text-brand-500 animate-spin-slow" />
            <span>Helpdesk & Issue Tracker</span>
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            {isEmployee 
              ? 'Submit issues, report payroll queries, or request IT support.' 
              : 'Respond to employee concerns, tickets, and feedback logs.'
            }
          </p>
        </div>

        {isEmployee && (
          <button
            onClick={() => { setFormError(null); setShowCreateModal(true); }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold shadow-md active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>File Support Ticket</span>
          </button>
        )}
      </div>

      {/* Dynamic feedback banners */}
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
      <div className="glass-panel border rounded-2xl p-4 lg:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by category, title, or employee..."
            className="glass-input has-icon w-full py-2 text-xs"
          />
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="py-20 flex items-center justify-center glass-panel border rounded-2xl">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-20 text-slate-500 glass-panel border rounded-2xl">No helpdesk tickets recorded.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTickets.map((t) => (
            <div key={t._id} className="glass-panel border rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative overflow-hidden">
              {/* Badge status */}
              <span className={`absolute right-5 top-5 px-2 py-0.5 rounded-full text-[10px] font-bold border
                ${t.status === 'Resolved' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : t.status === 'In Progress'
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                }`}
              >
                {t.status}
              </span>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200/20 px-1.5 py-0.5 rounded">
                    {t.category}
                  </span>
                  <span>&bull;</span>
                  <span>{new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 pr-16">{t.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {t.description}
                </p>

                {/* Submitter details for admins */}
                {!isEmployee && t.employee && (
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <User className="w-3.5 h-3.5 text-brand-500" />
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Filed by: {t.employee.name} ({t.employee.designation})
                    </span>
                  </div>
                )}

                {/* Response widget */}
                {t.response ? (
                  <div className="mt-4 p-3 bg-slate-100/50 dark:bg-slate-950/20 rounded-xl border border-slate-200/40 dark:border-darkBorder/40">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1 mb-1">
                      <MessageSquare className="w-3 h-3 text-emerald-500" />
                      <span>HR/Admin Response</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium italic">
                      "{t.response}"
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 text-[11px] text-slate-400 italic">Pending response from management.</div>
                )}
              </div>

              {/* Respond Action (Admin / HR only) */}
              {!isEmployee && !t.response && (
                <div className="pt-2">
                  <button
                    onClick={() => { setSelectedTicket(t); setAdminResponse(''); setNewStatus('Resolved'); }}
                    className="w-full py-1.5 bg-slate-100 hover:bg-brand-500 dark:bg-slate-800 dark:hover:bg-brand-500 hover:text-white text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                  >
                    Post Response
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CREATE TICKET MODAL (EMPLOYEE) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="glass-panel border rounded-3xl w-full max-w-md shadow-2xl animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200/60 dark:border-slate-800/60">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <LifeBuoy className="w-5 h-5 text-brand-500 animate-spin-slow" />
                <span>Submit Support Ticket</span>
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTicket} className="p-6 space-y-5">
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Category</label>
                <CustomSelect
                  value={ticketCategory}
                  onChange={(val) => setTicketCategory(val as any)}
                  options={[
                    { value: 'IT Support', label: 'IT Support' },
                    { value: 'Payroll', label: 'Payroll' },
                    { value: 'HR Query', label: 'HR Query' },
                    { value: 'Other', label: 'Other' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Issue Title</label>
                <input
                  type="text"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="Need keyboard replacement / tax query..."
                  className="glass-input w-full text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Detailed Description</label>
                <textarea
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="Provide logs, details of the requests..."
                  rows={4}
                  className="glass-input w-full text-xs resize-none"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold active:scale-[0.98] transition-all"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESPOND TICKET MODAL (ADMIN / HR) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="glass-panel border rounded-3xl w-full max-w-md shadow-2xl animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200/60 dark:border-slate-800/60">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-brand-500" />
                <span>Respond to Ticket</span>
              </h3>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket details info */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200/60 dark:border-slate-800/60 text-xs space-y-2">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">User Issue: </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTicket.title}</span>
              </div>
              <p className="text-slate-500 italic pr-2">"{selectedTicket.description}"</p>
            </div>

            {/* Form */}
            <form onSubmit={handleRespondTicket} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Update Status</label>
                  <CustomSelect
                    value={newStatus}
                    onChange={(val) => setNewStatus(val as any)}
                    options={[
                      { value: 'Open', label: 'Open' },
                      { value: 'In Progress', label: 'In Progress' },
                      { value: 'Resolved', label: 'Resolved' }
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Response Text</label>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Enter response or resolution instructions..."
                  rows={4}
                  className="glass-input w-full text-xs resize-none"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold active:scale-[0.98] transition-all flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Response</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
