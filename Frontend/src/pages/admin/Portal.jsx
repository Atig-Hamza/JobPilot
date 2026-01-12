import React from 'react';
import { Link } from 'react-router-dom';
import {
    User,
    ShieldCheck,
    ArrowRight,
    Layout,
    Settings
} from 'lucide-react';
import MainLogo from '../../assets/Main/logo-without-bg.png';

const styles = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`;

const PortalSelection = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-pink-200 selection:text-pink-900 relative overflow-hidden flex flex-col items-center justify-center p-6">
            <style>{styles}</style>

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>
            </div>

            <div className="mb-12 flex flex-col items-center">
                <div className="flex items-center gap-3 mb-4">
                    <img src={MainLogo} alt="JobPilot Logo" className="w-10 h-10 object-contain" />
                    <span className="text-3xl font-bold tracking-tight text-gray-900">JOBPILOT</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/50 border border-white/60 rounded-full backdrop-blur-md shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">System Operational</span>
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-center mb-16 tracking-tight max-w-2xl text-gray-900">
                Select your workspace
            </h1>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full">

                <Link
                    to="/user/dashboard"
                    className="group relative bg-[#edeceb]/80 backdrop-blur-sm rounded-[2.5rem] p-10 md:p-12 border border-white/50 hover:bg-white hover:border-pink-300 hover:shadow-2xl transition-all duration-300 flex flex-col"
                >
                    <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                        <ArrowRight size={24} className="text-pink-500" />
                    </div>

                    <div className="w-16 h-16 bg-pink-100 rounded-3xl flex items-center justify-center text-pink-600 mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <User size={32} strokeWidth={2} />
                    </div>

                    <h2 className="text-3xl font-bold mb-4 text-gray-900">User Area</h2>
                    <p className="text-gray-500 text-lg leading-relaxed mb-8">
                        Manage applications, edit your profile, and track your interview progress.
                    </p>

                    <div className="mt-auto pt-6 border-t border-gray-200/50 flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider group-hover:text-pink-600 transition-colors">
                        <Layout size={16} />
                        <span>Enter Dashboard</span>
                    </div>
                </Link>

                <Link
                    to="/admin/dashboard"
                    className="group relative bg-[#edeceb]/80 backdrop-blur-sm rounded-[2.5rem] p-10 md:p-12 border border-white/50 hover:bg-white hover:border-blue-300 hover:shadow-2xl transition-all duration-300 flex flex-col"
                >
                    <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                        <ArrowRight size={24} className="text-blue-500" />
                    </div>

                    <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 mb-8 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                        <ShieldCheck size={32} strokeWidth={2} />
                    </div>

                    <h2 className="text-3xl font-bold mb-4 text-gray-900">Admin Area</h2>
                    <p className="text-gray-500 text-lg leading-relaxed mb-8">
                        Configure system settings, manage users, and view platform analytics.
                    </p>

                    <div className="mt-auto pt-6 border-t border-gray-200/50 flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                        <Settings size={16} />
                        <span>Enter Configuration</span>
                    </div>
                </Link>

            </div>

            <div className="mt-16 text-center">
                <p className="text-sm text-gray-400 font-medium">
                    Protected by <span className="text-gray-600 font-bold">JobPilot Privacy Vault™</span>
                </p>
            </div>
        </div>
    );
};

export default PortalSelection;