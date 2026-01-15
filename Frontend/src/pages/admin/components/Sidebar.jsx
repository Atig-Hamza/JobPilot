import { Home, Users, Ticket, FileText, Settings, LogOut, Menu, X, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MainLogo from '../../../assets/Main/logo-without-bg.png';
import MainLogoWhite from '../../../assets/Main/logo-white-without-bg.png';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Waitlist', path: '/admin/waitlist' },
    { icon: Ticket, label: 'Access Codes', path: '/admin/access-codes' },
    { icon: FileText, label: 'AI Reports', path: '/admin/ai-reports' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">JP</span>
            </div>
            <span className="font-bold text-xl text-zinc-900 dark:text-white">JobPilot</span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-zinc-500 hover:text-zinc-700">
            <X size={24} />
          </button>
        </div>

        {/* CTA Button */}
        <div className="px-6 mb-6">
          <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl p-3 flex items-center justify-center gap-2 font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all">
            <Plus size={20} />
            <span>New Action</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Main Menu</p>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive(item.path)
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-medium'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                }
              `}
            >
              <item.icon size={20} className={isActive(item.path) ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-400 group-hover:text-zinc-600'} />
              <span>{item.label}</span>
            </Link>
          ))}

          <div className="mt-8">
            <p className="px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Settings</p>
            <Link
              to="/admin/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
            >
              <Settings size={20} />
              <span>General Settings</span>
            </Link>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
              alt="Admin"
              className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">Courtney Henry</p>
              <p className="text-xs text-zinc-500 truncate">admin@jobpilot.com</p>
            </div>
            <LogOut size={18} className="text-zinc-400 hover:text-red-500" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
