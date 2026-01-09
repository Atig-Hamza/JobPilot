import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import MainLogo from '../assets/Main/logo-without-bg.png';
import MainLogoWhite from '../assets/Main/logo-white-without-bg.png';
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
    ChevronRight,
    User,
    Gift,
    HelpCircle,
    TerminalSquare,
    CreditCard,
    Shield,
    Moon,
    Sun,
    Settings,
    LogOut
} from 'lucide-react';

const NavItem = ({ icon, label, active, badge, isPro, onClick }) => (
    <div onClick={onClick} className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 group mb-1 ${active
            ? 'bg-[#F1F5F9] text-gray-900 font-semibold dark:bg-[#1A1A1A] dark:text-gray-100'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium dark:text-gray-400 dark:hover:bg-[#1A1A1A] dark:hover:text-gray-200'
        }`}>
        <div className="flex items-center gap-3">
            <div className={`${active ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-500 group-hover:dark:text-gray-300"}`}>
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
            <span className="text-gray-400 text-xs dark:text-gray-600">{badge}</span>
        )}
    </div>
);

const Sidebar = ({ activePage = 'dashboard' }) => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const MenuItem = ({ icon, label, onClick, comingSoon, isDanger }) => (
        <div onClick={onClick} className={`flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg cursor-pointer transition-colors
            ${isDanger 
                ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10' 
                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-[#2A2A2A]'
            }
        `}>
            {React.cloneElement(icon, { size: 16, className: isDanger ? '' : 'text-gray-500 dark:text-gray-400' })}
            <span className="flex-1">{label}</span>
            {comingSoon && (
                <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded dark:bg-[#333] dark:text-gray-500">
                    SOON
                </span>
            )}
        </div>
    );

    return (
        <aside className="w-[260px] bg-white border-r border-gray-100 flex flex-col h-full shrink-0 z-20 hidden md:flex font-sans dark:bg-[#0A0A0A] dark:border-[#1F1F1F] transition-colors duration-300">
            <div className="p-5 pb-2">
                <div className="flex items-center gap-2 mb-6 cursor-pointer">
                    <img src={theme === 'dark' ? MainLogoWhite : MainLogo} alt="JobPilot" className="w-7 h-7 object-contain" />
                    <span className="font-bold text-gray-900 text-lg tracking-tight dark:text-white">JobPilot</span>
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

            <div className="h-px bg-gray-100 mx-5 my-2 dark:bg-[#1F1F1F]"></div>

            <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-2 space-y-6">
                <div>
                    <h3 className="text-xs font-bold text-gray-400 mb-3 px-1 dark:text-gray-600">AI TOOLS</h3>
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
                    <h3 className="text-xs font-bold text-gray-400 mb-3 px-1 dark:text-gray-600">MANAGEMENT</h3>
                    <nav>
                        <NavItem icon={<CheckSquare size={18} />} label="Applications" badge="12" />
                        <NavItem icon={<Calendar size={18} />} label="Interviews" />
                        <NavItem icon={<FileText size={18} />} label="Cover Letters" />
                    </nav>
                </div>

                <div>
                    <nav>
                        <div className="h-px bg-gray-100 my-3 dark:bg-[#1F1F1F]"></div>
                        <NavItem icon={<Megaphone size={18} />} label="What's New" />
                    </nav>
                </div>
            </div>
            <div className="p-4 border-t border-gray-100 mt-auto relative dark:border-[#1F1F1F]" ref={profileRef}>
                {isProfileOpen && (
                    <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 p-1.5 animate-in slide-in-from-bottom-2 fade-in duration-200 z-50 dark:bg-[#111111] dark:border-[#2A2A2A] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)]">
                        <div className="space-y-0.5">
                            <MenuItem icon={<User />} label="View Full Profile" />
                            <MenuItem icon={<Gift />} label="Redeem Code" />
                            <div className="h-px bg-gray-100 my-1 dark:bg-[#2A2A2A]"></div>
                            <MenuItem icon={<HelpCircle />} label="Contact Support" comingSoon />
                            <MenuItem icon={<TerminalSquare />} label="Developer API" comingSoon />
                            <MenuItem icon={<CreditCard />} label="Billing & Usage" comingSoon />
                            <div className="h-px bg-gray-100 my-1 dark:bg-[#2A2A2A]"></div>
                            <MenuItem icon={<Shield />} label="Privacy & Security" />
                            <MenuItem 
                                icon={theme === 'dark' ? <Sun /> : <Moon />} 
                                label={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"} 
                                onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
                            />
                            <MenuItem icon={<Settings />} label="Settings" />
                            <div className="h-px bg-gray-100 my-1 dark:bg-[#2A2A2A]"></div>
                            <MenuItem icon={<LogOut />} label="Log Out" isDanger />
                        </div>
                    </div>
                )}

                <div 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group dark:hover:bg-[#1A1A1A]"
                >
                    <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xs shrink-0 dark:bg-white dark:text-gray-900 transition-colors">
                        JP
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate dark:text-white">My Profile</p>
                        <p className="text-xs text-gray-500 truncate dark:text-gray-400">Manage account</p>
                    </div>
                    <ChevronRight size={16} className={`text-gray-400 group-hover:text-gray-600 transition-transform duration-200 dark:group-hover:text-gray-300 ${isProfileOpen ? 'rotate-90' : ''}`} />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;