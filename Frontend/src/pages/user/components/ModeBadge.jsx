import React from 'react';

const ModeBadge = ({ active, label, icon, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all border shadow-sm ${active ? 'bg-gray-900 text-white border-gray-900 scale-105' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600 hover:scale-105'}`}
    >
        {icon}
        {label}
    </button>
);

export default ModeBadge;
