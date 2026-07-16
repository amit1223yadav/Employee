import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  ShieldAlert,
  Lock,
  User,
  ArrowRight,
  Users,
  ClipboardList,
  Calendar,
  Video,
  Trophy,
  StickyNote,
  LifeBuoy,
  BarChart3,
  CheckCircle,
  ChevronRight,
  Zap,
  Shield,
  Globe,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

const features = [
  { icon: BarChart3,     label: 'Smart Dashboard',    desc: 'Real-time KPIs & analytics',      color: 'text-brand-500 dark:text-brand-400',   bg: 'bg-brand-500/10 dark:bg-brand-500/15' },
  { icon: Users,         label: 'Employee Directory', desc: 'Full workforce management',        color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-500/10 dark:bg-blue-500/15' },
  { icon: ClipboardList, label: 'Task Management',    desc: 'Assign, track & collaborate',      color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-500/10 dark:bg-amber-500/15' },
  { icon: Calendar,      label: 'Leave Approvals',    desc: 'One-click leave workflow',         color: 'text-emerald-600 dark:text-emerald-400',bg: 'bg-emerald-500/10 dark:bg-emerald-500/15' },
  { icon: Video,         label: 'Meeting Rooms',      desc: 'Virtual collaboration spaces',     color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10 dark:bg-violet-500/15' },
  { icon: Trophy,        label: 'Rewards & KPIs',     desc: 'Recognize top performers',         color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500/10 dark:bg-yellow-500/15' },
  { icon: StickyNote,    label: 'Personal Notes',     desc: 'Sticky notes for every user',      color: 'text-rose-600 dark:text-rose-400',     bg: 'bg-rose-500/10 dark:bg-rose-500/15' },
  { icon: LifeBuoy,      label: 'Helpdesk Support',   desc: 'Raise & track internal tickets',   color: 'text-cyan-600 dark:text-cyan-400',     bg: 'bg-cyan-500/10 dark:bg-cyan-500/15' },
];

const stats = [
  { value: '10+', label: 'Features' },
  { value: '3',   label: 'User Roles' },
  { value: '99%', label: 'Uptime' },
];

const demoAccounts = [
  { role: 'Super Admin', id: 'admin@123', pass: 'admin123', light: 'border-brand-200 bg-brand-50 hover:bg-brand-100',   dark: 'dark:border-brand-500/20 dark:bg-brand-500/10 dark:hover:bg-brand-500/15',   dot: 'bg-brand-500',  roleColor: 'text-brand-700 dark:text-brand-400' },
  { role: 'HR Manager',  id: 'hr@123',    pass: 'hr123',    light: 'border-blue-200 bg-blue-50 hover:bg-blue-100',       dark: 'dark:border-blue-500/20 dark:bg-blue-500/10 dark:hover:bg-blue-500/15',       dot: 'bg-blue-500',   roleColor: 'text-blue-700 dark:text-blue-400' },
  { role: 'Employee',    id: 'user@123',  pass: 'user123',  light: 'border-amber-200 bg-amber-50 hover:bg-amber-100',    dark: 'dark:border-amber-500/20 dark:bg-amber-500/10 dark:hover:bg-amber-500/15',    dot: 'bg-amber-500',  roleColor: 'text-amber-700 dark:text-amber-400' },
];

export const Login: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login }               = useAuth();
  const { theme, toggleTheme }  = useTheme();
  const navigate                = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }
    try {
      await login(email.toLowerCase().trim(), password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (id: string, pass: string) => {
    setEmail(id);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-slate-50 dark:bg-[#050d1a] transition-colors duration-300">

      {/* Theme toggle — fixed top right */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-xl bg-white dark:bg-white/8 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/14 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-200 shadow-md"
        title="Toggle light/dark mode"
      >
        {theme === 'dark'
          ? <Sun  className="w-4 h-4 text-amber-400" />
          : <Moon className="w-4 h-4 text-indigo-500" />}
      </button>

      {/* ─── LEFT PANEL: Features Showcase ─────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden
        bg-linear-to-br from-slate-900 via-slate-800 to-slate-900
        dark:bg-none dark:bg-[#050d1a]">

        {/* Light mode: subtle pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

        {/* Ambient blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] bg-brand-500/25 rounded-full blur-[120px] animate-blob pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-40px] w-[350px] h-[350px] bg-violet-500/20 rounded-full blur-[100px] animate-blob-delay pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] bg-emerald-500/15 rounded-full blur-[80px] animate-blob pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <img src="/src/assets/logo.svg" alt="SynapseHR" className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Synapse<span className="text-brand-400">HR</span>
            </h1>
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Enterprise EMS</p>
          </div>
        </div>

        {/* Main showcase content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center mt-10 space-y-10">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Next-Gen HR Platform</span>
            </div>
            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight">
              Everything your<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-400 to-emerald-400 animate-shimmer">
                team needs
              </span>
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
              A complete employee management system — manage people, tasks, leaves, meetings, and performance all in one place.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-white">{s.value}</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
            <div className="w-px h-10 bg-slate-700" />
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-semibold text-slate-300">Enterprise-grade security</span>
            </div>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3 max-w-lg">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.label}
                  className="flex items-center space-x-3 p-3 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.09] hover:border-white/[0.14] transition-all duration-300 group cursor-default animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
                >
                  <div className={`w-8 h-8 rounded-lg ${feat.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-4 h-4 ${feat.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{feat.label}</p>
                    <p className="text-[10px] text-slate-400 truncate">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom badges */}
        <div className="relative z-10 flex items-center space-x-5">
          {[
            { icon: Zap,    label: 'Fast & Reliable' },
            { icon: Globe,  label: 'Web-based' },
            { icon: Shield, label: 'Secure Auth' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center space-x-1.5 text-slate-500">
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── RIGHT PANEL: Login Form ────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 relative
        bg-slate-50 dark:bg-[#080f1e] transition-colors duration-300">

        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/5 dark:bg-brand-500/8 rounded-full blur-[100px] pointer-events-none" />

        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center mb-8 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <img src="/src/assets/logo.svg" alt="SynapseHR" className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
            Synapse<span className="text-brand-500">HR</span>
          </h1>
        </div>

        <div className="w-full max-w-sm animate-slide-in-right">
          {/* Form card */}
          <div className="bg-white dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-xl dark:shadow-2xl space-y-6 transition-colors duration-300">

            {/* Header */}
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Welcome back 👋</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to your SynapseHR workspace</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs font-semibold">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Work Email or ID
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@123"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all
                      bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400
                      focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15
                      dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600
                      dark:focus:border-brand-500/60 dark:focus:ring-brand-500/15"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-14 py-3 rounded-xl text-sm transition-all
                      bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400
                      focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15
                      dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600
                      dark:focus:border-brand-500/60 dark:focus:ring-brand-500/15"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/8" />
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Demo Accounts</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/8" />
              </div>

              <div className="space-y-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => fillDemo(acc.id, acc.pass)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all active:scale-[0.98] group ${acc.light} ${acc.dark}`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-2 h-2 rounded-full ${acc.dot}`} />
                      <span className={`text-xs font-bold ${acc.roleColor}`}>{acc.role}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">{acc.id} / {acc.pass}</code>
                      <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-600 text-center">Click any row to auto-fill credentials</p>
            </div>
          </div>

          {/* Trust strip */}
          <div className="mt-5 flex items-center justify-center space-x-5">
            {[
              { icon: CheckCircle, label: 'Role-based Access' },
              { icon: Shield,      label: 'JWT Secured' },
              { icon: Zap,         label: 'Real-time' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center space-x-1.5 text-slate-400 dark:text-slate-600">
                <Icon className="w-3.5 h-3.5 text-brand-500/60" />
                <span className="text-[10px] font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
