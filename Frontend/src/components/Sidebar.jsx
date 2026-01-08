import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLogo from '../assets/Main/logo-without-bg.png';
import {
    Home,
    Sparkles,
    LayoutGrid,
    CheckSquare,
    Calendar,
    FileText,
    Bot,
    Code2,
    Users,
    Briefcase,
    Megaphone,
    Plus,
    UserPlus,
    ChevronRight
} from 'lucide-react';

const NavItem = ({ icon, label, active, badge, isPro, onClick }) => (
    <div onClick={onClick} className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 group mb-1 ${active
            ? 'bg-[#F1F5F9] text-gray-900 font-semibold'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
        }`}>
        <div className="flex items-center gap-3">
            <div className={`${active ? "text-gray-900" : "text-gray-500"}`}>
                {icon}
            </div>
            <span className="text-[14px]">{label}</span>
        </div>
        {isPro && (
            <span className="bg-[#FF7A00] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase tracking-wide">
                NEW
            </span>
        )}
        {badge && !isPro && (
            <span className="text-gray-400 text-xs">{badge}</span>
        )}
    </div>
);

const Sidebar = ({ activePage = 'dashboard' }) => {
    const navigate = useNavigate();
    return (
        <aside className="w-[260px] bg-white border-r border-gray-100 flex flex-col h-full shrink-0 z-20 hidden md:flex font-sans">
            <div className="p-5 pb-2">
                <div className="flex items-center gap-2 mb-6 cursor-pointer">
                    <img src={MainLogo} alt="JobPilot" className="w-7 h-7 object-contain" />
                    <span className="font-bold text-gray-900 text-lg tracking-tight">JobPilot</span>
                </div>

                <div className="space-y-1">
                    <NavItem 
                        icon={<Home size={18} />} 
                        label="Dashboard" 
                        active={activePage === 'dashboard'} 
                        onClick={() => navigate('/user/dashboard')}
                    />
                    <NavItem 
                        icon={<Sparkles size={18} />} 
                        label="AutoPilot Agent" 
                        active={activePage === 'autopilot'} 
                        onClick={() => navigate('/user/autopilot')}
                    />
                </div>
            </div>

            <div className="h-px bg-gray-100 mx-5 my-2"></div>

            <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-2 space-y-6">
                <div>
                    <h3 className="text-xs font-bold text-gray-400 mb-3 px-1">AI TOOLS</h3>
                    <nav>
                        <NavItem
                            icon={<Briefcase size={18} />}
                            label="Lead Finder"
                            isPro={true}
                        />
                        <NavItem icon={<Code2 size={18} />} label="Tech Interview Lab" />
                        <NavItem icon={<Users size={18} />} label="Behavioral Sim" />
                    </nav>
                </div>
                <div>
                    <h3 className="text-xs font-bold text-gray-400 mb-3 px-1">MANAGEMENT</h3>
                    <nav>
                        <NavItem icon={<CheckSquare size={18} />} label="Applications" badge="12" />
                        <NavItem icon={<Calendar size={18} />} label="Interviews" />
                        <NavItem icon={<FileText size={18} />} label="Cover Letters" />
                    </nav>
                </div>

                <div>
                    <nav>
                        <div className="h-px bg-gray-100 my-3"></div>
                        <NavItem icon={<Megaphone size={18} />} label="What's New" />
                    </nav>
                </div>
            </div>
            <div className="p-4 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                    <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xs">
                        JP
                    </div>
                    <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">My Profile</p>
                        <p className="text-xs text-gray-500">Manage account</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;