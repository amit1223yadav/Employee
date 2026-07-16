import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Calendar, 
  Shield, 
  Layers, 
  UserCheck, 
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  X
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Payslip states
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setProfileImage(user.profileImage || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setLoading(true);

    try {
      const updates: any = { email, phone, profileImage };
      if (password.trim() !== '') {
        updates.password = password;
      }

      await api.put(`employees/${user?._id}`, updates);
      setSuccess('Profile updated successfully!');
      setPassword('');
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // Payslip dynamic calculation helpers
  const annualSalary = user.salary || 1600000;
  const grossMonthly = Math.round(annualSalary / 12);
  const basic = Math.round(grossMonthly * 0.5);
  const hra = Math.round(grossMonthly * 0.3);
  const allowances = Math.round(grossMonthly * 0.2);
  const pf = Math.round(basic * 0.12);
  const tds = Math.round(grossMonthly * 0.10);
  const deductions = pf + tds;
  const netTakeHome = grossMonthly - deductions;

  const mockMonths = [
    { name: 'June 2026', code: 'JUN-2026' },
    { name: 'May 2026', code: 'MAY-2026' },
    { name: 'April 2026', code: 'APR-2026' }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Info Block */}
      <div className="glass-panel border rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-center md:space-x-8 text-center md:text-left">
        <div className="relative group mb-6 md:mb-0">
          <img 
            src={profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
            alt={user.name} 
            className="w-28 h-28 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md animate-scale-up"
          />
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 pointer-events-none">
            <ImageIcon className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 justify-center md:justify-start">
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">{user.name}</h2>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 self-center">
              {user.role}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">{user.designation} &bull; {user.department}</p>
          <div className="flex items-center justify-center md:justify-start space-x-2 text-xs text-slate-400 font-medium mt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>ID: {user.employeeId}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Edit Form */}
        <div className="lg:col-span-2 glass-panel border rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Edit Profile Details</h3>

          {success && (
            <div className="flex items-center space-x-2.5 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-sm">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2.5 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input has-icon w-full text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="glass-input has-icon w-full text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Avatar Image URL
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="glass-input has-icon w-full text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Change Password (leave empty to keep current)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input has-icon w-full text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm shadow-md shadow-brand-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Saving updates...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Read-Only Employment Information */}
        <div className="glass-panel border rounded-3xl p-6 lg:p-8 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Job Information</h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3.5">
                <Layers className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Department</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{user.department}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <UserCheck className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Designation</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{user.designation}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Joining Date</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(user.joiningDate).toLocaleDateString(undefined, { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>

              {user.reportingManager && (
                <div className="flex items-start space-x-3.5">
                  <User className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Reporting Manager</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {typeof user.reportingManager === 'object' ? user.reportingManager.name : 'Assigned'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {user.salary !== undefined && (
            <div className="flex items-start space-x-3.5 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 mt-4">
              <div className="flex-1">
                <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Annual Salary</span>
                <span className="text-xl font-extrabold text-slate-800 dark:text-white">
                  ₹{user.salary.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Payslips Section (Spans full width at bottom of grid) */}
        <div className="lg:col-span-3 glass-panel border rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-brand-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Monthly Payroll & Payslips</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">Select a payroll cycle below to view and generate itemized salary statements.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {mockMonths.map((m) => (
              <div key={m.code} className="p-4 bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/40 dark:border-darkBorder/40 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{m.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Take Home: ₹{netTakeHome.toLocaleString('en-IN')}</p>
                </div>
                <button
                  onClick={() => { setSelectedMonth(m.name); setShowPayslipModal(true); }}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 border border-slate-200/50 dark:border-slate-700/50 transition-all active:scale-95 flex items-center justify-center"
                  title="Generate Payslip"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PAYSLIP PRINT/VIEW MODAL */}
      {showPayslipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs overflow-y-auto">
          <div className="glass-panel border rounded-3xl w-full max-w-2xl shadow-2xl p-6 md:p-8 relative bg-white dark:bg-slate-900 animate-scale-up max-h-[90vh] overflow-y-auto print:absolute print:inset-0 print:m-0 print:w-full print:max-w-none print:shadow-none print:border-none print:bg-white print:p-0">
            {/* Action buttons wrapper (hidden in print) */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/60 dark:border-slate-800/60 print:hidden">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-brand-500" />
                <span>Salary Slip - {selectedMonth}</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handlePrint}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Print Slip
                </button>
                <button 
                  onClick={() => setShowPayslipModal(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Payslip Structure */}
            <div className="space-y-6 text-slate-800 dark:text-slate-200 print:text-black">
              {/* Slip Header */}
              <div className="flex justify-between items-center pb-4 border-b-2 border-slate-300 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-brand-500">SynapseHR</h2>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Enterprise Employee Portal</p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-extrabold uppercase tracking-wide">Payslip</h3>
                  <p className="text-xs text-slate-400 font-semibold">{selectedMonth}</p>
                </div>
              </div>

              {/* Employee Particulars Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="grid grid-cols-2 gap-1">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Employee Name:</span>
                    <span className="font-bold">{user.name}</span>
                    
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Employee ID:</span>
                    <span className="font-semibold">{user.employeeId}</span>

                    <span className="text-slate-400 font-bold uppercase text-[9px]">Department:</span>
                    <span className="font-semibold">{user.department}</span>
                  </div>
                </div>
                <div>
                  <div className="grid grid-cols-2 gap-1">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Designation:</span>
                    <span className="font-semibold">{user.designation}</span>

                    <span className="text-slate-400 font-bold uppercase text-[9px]">PF Number:</span>
                    <span className="font-semibold font-mono">PF-{(user.employeeId).replace('EMP', '9482')}</span>

                    <span className="text-slate-400 font-bold uppercase text-[9px]">Payment Mode:</span>
                    <span className="font-semibold">Bank Transfer</span>
                  </div>
                </div>
              </div>

              {/* Earnings vs Deductions Table */}
              <div className="border border-slate-300 dark:border-slate-700/80 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-2 font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-300 dark:border-slate-700/80 p-2.5">
                  <div>Earnings</div>
                  <div className="text-right border-l border-slate-300 dark:border-slate-700/80 pr-2">Deductions</div>
                </div>
                <div className="grid grid-cols-2 p-2.5 leading-relaxed">
                  {/* Left Column: Earnings */}
                  <div className="space-y-1.5 pr-4 border-r border-slate-300 dark:border-slate-700/80">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Basic Salary:</span>
                      <span className="font-mono font-bold">₹{basic.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">House Rent Allowance (HRA):</span>
                      <span className="font-mono font-bold">₹{hra.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Special Allowances:</span>
                      <span className="font-mono font-bold">₹{allowances.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Right Column: Deductions */}
                  <div className="space-y-1.5 pl-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Provident Fund (PF):</span>
                      <span className="font-mono font-bold">₹{pf.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Income Tax / TDS:</span>
                      <span className="font-mono font-bold">₹{tds.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Subtotals */}
                <div className="grid grid-cols-2 border-t border-slate-300 dark:border-slate-700/80 p-2.5 font-bold">
                  <div className="flex justify-between pr-4 border-r border-slate-300 dark:border-slate-700/80">
                    <span>Gross Earnings:</span>
                    <span className="font-mono">₹{grossMonthly.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pl-4">
                    <span>Total Deductions:</span>
                    <span className="font-mono">₹{deductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Net Take-Home Statement */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Net Monthly Take-Home Salary</h4>
                  <p className="text-sm italic text-slate-500 mt-1">Rupees One Lakh Twelve Thousand Only</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-800 dark:text-white font-mono">
                    ₹{netTakeHome.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Signature Footnote */}
              <div className="pt-10 flex justify-between text-[10px] text-slate-400 font-semibold">
                <div>
                  <p className="italic">This is a system generated statement and requires no physical signature.</p>
                </div>
                <div className="text-right border-t border-slate-300 dark:border-slate-800 pt-2 w-32">
                  <p className="uppercase text-center">HR Department</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
