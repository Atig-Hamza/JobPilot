import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Menu, X, Home, Sparkles, Briefcase, Code2, Users, 
    CheckSquare, Calendar, FileText, User, 
    Gift, Moon, Sun, Settings, LogOut, ChevronRight
} from 'lucide-react';
import MainLogo from '../../../assets/Main/logo-without-bg.png';
import MainLogoWhite from '../../../assets/Main/logo-white-without-bg.png';
import { useTheme } from '../../../context/ThemeContext';

const NavItem = ({ icon, label, onClick, active, badge, isPro, isDanger, autoClose = true, rightElement, collapsed = false, setIsMenuOpen, isMobile }) => {
    const handleClick = (e) => {
        if (onClick) onClick(e);
        if (isMobile && autoClose) setIsMenuOpen(false);
    };

    return (
        <div 
            onClick={handleClick}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 active:scale-95 group relative ${
                active
                    ? 'bg-[#F1F5F9] dark:bg-[#1A1A1A] text-gray-900 dark:text-gray-100 font-semibold'
                    : isDanger
                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] hover:text-gray-900 dark:hover:text-gray-200'
            } ${collapsed ? 'justify-center px-2' : ''}`}
            title={collapsed ? label : undefined}
        >
            <div className={`${active ? "text-gray-900 dark:text-gray-100" : isDanger ? "text-red-500" : "text-gray-500 dark:text-gray-500"} flex-shrink-0`}>
                {React.cloneElement(icon, { size: 22 })}
            </div>
            
            {!collapsed && (
                <>
                    <span className="flex-1 text-[15px] whitespace-nowrap overflow-hidden">{label}</span>
                    {isPro && (
                        <span className="bg-[#FF7A00] text-white text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase tracking-wide">
                            NEW
                        </span>
                    )}
                    {badge && !isPro && (
                        <span className="bg-gray-100 dark:bg-[#2A2A2A] text-gray-600 dark:text-gray-400 text-xs font-bold px-2 py-0.5 rounded-md">{badge}</span>
                    )}
                    {rightElement}
                    {isDanger || (!active && !isDanger && !rightElement && <ChevronRight size={16} className="text-gray-300 dark:text-gray-700" />)}
                </>
            )}

            {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                    {label}
                </div>
            )}
        </div>
    );
};

const SidebarContent = ({ collapsed = false, activeMode, handleModeChange, navigate, theme, toggleTheme, setIsMenuOpen, isMobile }) => (
    <div className={`flex flex-col h-full ${collapsed ? 'items-center' : ''}`}>
         <div className="space-y-1">
            <NavItem 
                icon={<Home />} 
                label="Dashboard" 
                active={activeMode !== 'autopilot'} 
                onClick={() => handleModeChange ? handleModeChange('general') : navigate('/user/dashboard')}
                collapsed={collapsed}
                setIsMenuOpen={setIsMenuOpen}
                isMobile={isMobile}
            />
            <NavItem 
                icon={<Sparkles />} 
                label="AutoPilot Agent" 
                active={activeMode === 'autopilot'} 
                onClick={() => navigate('/user/autopilot')}
                collapsed={collapsed}
                setIsMenuOpen={setIsMenuOpen}
                isMobile={isMobile}
            />
        </div>

        <div className={`h-px bg-gray-100 dark:bg-[#1F1F1F] my-2 ${collapsed ? 'w-8 mx-auto' : 'mx-4'}`}></div>

        <div>
             {!collapsed && <h3 className="text-xs font-bold text-gray-400 dark:text-gray-600 mb-3 px-4 uppercase tracking-wider">AI Tools</h3>}
             <div className="space-y-1">
                <NavItem icon={<Briefcase />} label="Lead Finder" isPro={true} collapsed={collapsed} setIsMenuOpen={setIsMenuOpen} isMobile={isMobile} />
                <NavItem icon={<Code2 />} label="Tech Interview Lab" collapsed={collapsed} setIsMenuOpen={setIsMenuOpen} isMobile={isMobile} />
                <NavItem icon={<Users />} label="Behavioral Sim" collapsed={collapsed} setIsMenuOpen={setIsMenuOpen} isMobile={isMobile} />
             </div>
        </div>

        <div>
             {!collapsed && <h3 className="text-xs font-bold text-gray-400 dark:text-gray-600 mb-3 px-4 uppercase tracking-wider mt-6">Management</h3>}
             <div className="space-y-1">
                <NavItem icon={<CheckSquare />} label="Applications" badge="12" collapsed={collapsed} setIsMenuOpen={setIsMenuOpen} isMobile={isMobile} />
                <NavItem icon={<Calendar />} label="Interviews" collapsed={collapsed} setIsMenuOpen={setIsMenuOpen} isMobile={isMobile} />
                <NavItem icon={<FileText />} label="Cover Letters" collapsed={collapsed} setIsMenuOpen={setIsMenuOpen} isMobile={isMobile} />
             </div>
        </div>

        <div className={`h-px bg-gray-100 dark:bg-[#1F1F1F] my-2 ${collapsed ? 'w-8 mx-auto' : 'mx-4'}`}></div>
        
        <div className="space-y-1">
             <NavItem icon={<User />} label="My Profile" collapsed={collapsed} setIsMenuOpen={setIsMenuOpen} isMobile={isMobile} />
             <NavItem icon={<Gift />} label="Redeem Code" collapsed={collapsed} setIsMenuOpen={setIsMenuOpen} isMobile={isMobile} />
             <NavItem icon={<Settings />} label="Settings" collapsed={collapsed} setIsMenuOpen={setIsMenuOpen} isMobile={isMobile} />
             <NavItem 
                icon={theme === 'dark' ? <Sun /> : <Moon />} 
                label={theme === 'dark' ? "Light Mode" : "Dark Mode"} 
                autoClose={false}
                collapsed={collapsed}
                onClick={() => toggleTheme()}
                setIsMenuOpen={setIsMenuOpen}
                isMobile={isMobile}
                rightElement={
                    !collapsed && (
                        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors">
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                        </div>
                    )
                }
            />
             <NavItem 
                icon={<LogOut />} 
                label="Log Out" 
                isDanger
                collapsed={collapsed}
                setIsMenuOpen={setIsMenuOpen}
                isMobile={isMobile}
                onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/login');
                }}
            />
        </div>
    </div>
);

const UserLayout = ({ children, activeMode, handleModeChange, isMobile, disableScroll = false }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        if (isMobile && isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen, isMobile]);

    const sidebarProps = {
        activeMode,
        handleModeChange,
        navigate,
        theme,
        toggleTheme,
        setIsMenuOpen,
        isMobile
    };

    return (
        <div className="flex h-screen w-full bg-[#FAFAFA] font-sans text-gray-900 dark:bg-[#090909] dark:text-gray-100 transition-colors duration-300 overflow-hidden">
            <aside className={`hidden md:flex flex-col bg-white dark:bg-[#0A0A0A] border-r border-gray-100 dark:border-[#1F1F1F] transition-all duration-300 ease-in-out z-20 ${isMenuOpen ? 'w-[280px]' : 'w-20'}`}>
                <div className={`h-16 flex items-center ${isMenuOpen ? 'justify-start px-6' : 'justify-center'} border-b border-gray-100 dark:border-[#1F1F1F]`}>
                    <img src={theme === 'dark' ? MainLogoWhite : MainLogo} alt="JobPilot" className="w-8 h-8 object-contain" />
                    {isMenuOpen && <span className="font-bold text-gray-900 text-lg dark:text-white tracking-tight ml-2.5 whitespace-nowrap overflow-hidden">JobPilot</span>}
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar">
                    <SidebarContent collapsed={!isMenuOpen} {...sidebarProps} />
                </div>
            </aside>
            <div className="flex-1 flex flex-col h-full relative min-w-0">
                <header className="h-16 bg-white dark:bg-[#0A0A0A]/90 backdrop-blur-md border-b border-gray-100 dark:border-[#1F1F1F] flex items-center justify-between px-5 shrink-0 z-10 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1F1F1F] transition-colors"
                        >
                            {isMenuOpen && isMobile ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        
                        <div className="flex items-center gap-2.5 md:hidden">
                            <img src={theme === 'dark' ? MainLogoWhite : MainLogo} alt="JobPilot" className="w-8 h-8 object-contain" />
                            <span className="font-bold text-gray-900 text-lg dark:text-white tracking-tight">JobPilot</span>
                        </div>
                    </div>
                    <div></div>
                </header>
                {isMobile && isMenuOpen && (
                    <div className="absolute inset-0 z-50 md:hidden">
                         <div 
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <div className="absolute top-0 left-0 h-full w-[280px] bg-white dark:bg-[#0A0A0A] shadow-2xl animate-in slide-in-from-left duration-200">
                            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-[#1F1F1F]">
                                <div className="flex items-center gap-2.5">
                                    <img src={theme === 'dark' ? MainLogoWhite : MainLogo} alt="JobPilot" className="w-8 h-8 object-contain" />
                                    <span className="font-bold text-gray-900 text-lg dark:text-white tracking-tight">JobPilot</span>
                                </div>
                                <button onClick={() => setIsMenuOpen(false)} className="text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
                                <SidebarContent collapsed={false} {...sidebarProps} />
                            </div>
                        </div>
                    </div>
                )}
                <main className={`flex-1 relative w-full ${disableScroll ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default UserLayout;
