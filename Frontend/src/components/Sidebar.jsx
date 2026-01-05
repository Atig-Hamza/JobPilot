import React from 'react';
import MainLogo from '../assets/Main/logo-without-bg.png'; 
import { 
  LayoutGrid, 
  CheckSquare, 
  Calendar, 
  FileText, 
  Settings, 
  Bot,
  Code2,
  Users,
  Briefcase
} from 'lucide-react';

const NavItem = ({ icon, label, active }) => (
  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${active ? 'bg-pink-50 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
    <div className={`transition-colors ${active ? "text-pink-600" : "text-gray-400 group-hover:text-gray-900"}`}>{icon}</div>
    <span className={`text-sm font-bold ${active ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900'}`}>{label}</span>
  </div>
);

const ToolItem = ({ icon, label }) => (
    <div className="flex items-center gap-3 text-sm font-medium text-gray-500 hover:text-pink-600 cursor-pointer group py-1">
        <div className="text-gray-300 group-hover:text-pink-400 transition-colors">{icon}</div>
        <span>{label}</span>
    </div>
);

const Sidebar = () => {
  return (
    <aside className="w-[260px] bg-[#FDFDFD] border-r border-gray-100 flex flex-col justify-between shrink-0 z-20 hidden md:flex">
        <div className="p-5 flex flex-col h-full">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2 mb-10 pl-2 select-none cursor-pointer">
             {/* Placeholder Logo */}
            <img src={MainLogo} alt="JobPilot Logo" className="w-8 h-8 object-contain"/>
            <span className="font-bold text-gray-900 tracking-tight text-xl">JOBPILOT</span>
          </div>

          {/* Navigation */}
          <div className="space-y-8 flex-1 overflow-y-auto scrollbar-hide">
            <nav className="space-y-1">
              <NavItem icon={<LayoutGrid size={18} />} label="Dashboard" active />
              <NavItem icon={<Bot size={18} />} label="AutoPilot Agent" />
              <NavItem icon={<CheckSquare size={18} />} label="Applications" />
              <NavItem icon={<Calendar size={18} />} label="Interviews" />
              <NavItem icon={<FileText size={18} />} label="Cover Letters" />
            </nav>

            {/* Tools List */}
            <div className="px-3">
              <h3 className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-widest">Power Tools</h3>
              <div className="space-y-4">
                <ToolItem icon={<Code2 size={16} />} label="Tech Interview Lab" />
                <ToolItem icon={<Users size={16} />} label="Behavioral Sim" />
                <ToolItem icon={<Briefcase size={16} />} label="Lead Finder" />
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="mt-auto pt-6 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between px-3 py-2 text-gray-500 hover:text-gray-900 cursor-pointer rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 border border-white shadow-sm flex items-center justify-center text-xs font-bold text-gray-700">JS</div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">Sam Smith</span>
                    <span className="text-[10px] text-gray-400">Pro Plan</span>
                </div>
              </div>
              <Settings size={14} />
            </div>
          </div>
        </div>
      </aside>
  );
};

export default Sidebar;
