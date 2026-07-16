import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  Users, 
  Network, 
  LogOut, 
  Sun, 
  Moon, 
  Menu,
  CalendarDays,
  ListTodo,
  Clock,
  LifeBuoy,
  Video,
  StickyNote,
  Trophy,
  X,
  Bell
} from 'lucide-react';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isEmployee = user?.role === 'Employee';

  const adminMenuItems = [
    { name: 'Dashboard',              path: '/',            icon: LayoutDashboard },
    { name: 'Employees',              path: '/employees',   icon: Users },
    { name: 'Shift Logs',             path: '/attendance',  icon: Clock },
    { name: 'Leaves Approval',        path: '/leaves',      icon: CalendarDays },
    { name: 'Task Manager',           path: '/tasks',       icon: ListTodo },
    { name: 'Meeting Rooms',          path: '/meetings',    icon: Video },
    { name: 'Rewards & KPI',          path: '/rewards',     icon: Trophy },
    { name: 'Helpdesk Support',       path: '/helpdesk',    icon: LifeBuoy },
    { name: 'Organization Hierarchy', path: '/org-chart',   icon: Network },
  ];

  const employeeMenuItems = [
    { name: 'My Dashboard',           path: '/',            icon: LayoutDashboard },
    { name: 'Meeting Rooms',          path: '/meetings',    icon: Video },
    { name: 'Personal Notes',         path: '/notes',       icon: StickyNote },
    { name: 'Rewards & KPI',          path: '/rewards',     icon: Trophy },
    { name: 'Helpdesk Support',       path: '/helpdesk',    icon: LifeBuoy },
    { name: 'Organization Hierarchy', path: '/org-chart',   icon: Network },
  ];

  const menuItems = isEmployee ? employeeMenuItems : adminMenuItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPage = menuItems.find(m => m.path === location.pathname);
  const pageTitle = currentPage?.name || 'SynapseHR';

  return (
    <div className="min-h-screen flex transition-colors duration-200 dark:bg-darkBg">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 lg:static lg:block transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          glass-panel border-r`}
      >
        <div className="h-full flex flex-col justify-between p-5 overflow-y-auto">
          <div>
            {/* Logo + mobile close */}
            <div className="flex items-center justify-between mb-7 px-1">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 flex-shrink-0">
                  <img src="/src/assets/logo.svg" alt="SynapseHR" className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-display tracking-tight text-slate-800 dark:text-white">
                    Synapse<span className="text-brand-500 font-extrabold">HR</span>
                  </h1>
                  <p className="text-[10px] text-slate-400 font-medium">Enterprise EMS</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Role Tag */}
            <div className="mb-5 px-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                {user?.role}
              </span>
            </div>

            {/* Menu */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium
                      ${isActive 
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Section & Logout */}
          <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-4 mt-4">
            <Link 
              to="/profile"
              className="flex items-center space-x-3 mb-3 px-2 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer w-full text-left group"
            >
              <img 
                src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} 
                alt={user?.name}
                className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 object-cover group-hover:scale-105 transition-transform duration-200 flex-shrink-0"
              />
              <div className="overflow-hidden flex-1">
                <h4 className="text-sm font-bold truncate text-slate-800 dark:text-white group-hover:text-brand-500 transition-colors">{user?.name}</h4>
                <p className="text-[10px] text-slate-400 truncate font-semibold">{user?.role}</p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-3.5 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-sm font-semibold transition-all duration-200"
            >
              <LogOut className="w-4.5 h-4.5 text-red-400" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 lg:h-18 flex items-center justify-between px-5 lg:px-8 border-b border-slate-200/60 dark:border-slate-800/60 glass-panel flex-shrink-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden lg:block">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">{pageTitle}</h2>
              <p className="text-xs text-slate-400 font-medium">Welcome back, {user?.name?.split(' ')[0]}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notifications bell */}
            <button className="relative p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
            </button>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
            {/* Avatar */}
            <Link to="/profile">
              <img 
                src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} 
                alt={user?.name}
                className="w-9 h-9 rounded-full border-2 border-brand-500/30 object-cover hover:border-brand-500 transition-all"
              />
            </Link>
          </div>
        </header>

        {/* Scrollable Container */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-8 bg-slate-50/50 dark:bg-slate-950/20">
          {children}
        </main>
      </div>
    </div>
  );
};
