import React from 'react';
import { Activity, UploadCloud, Clock, UserMinus, FolderGit2, Search } from 'lucide-react';

const NavItem = ({ icon: Icon, label, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 font-medium ${active
            ? 'bg-white shadow-sm text-apple-text border border-black/5'
            : 'text-apple-muted hover:text-apple-text hover:bg-black/5 border border-transparent'
        }`}>
        <Icon size={18} strokeWidth={active ? 2.5 : 2} className={active ? "text-apple-blue" : ""} />
        <span>{label}</span>
    </button>
);

export default function Sidebar({ currentView, setView }) {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#F5F5F7] border-r border-apple-border flex flex-col z-10">
            <div className="p-6 pb-2">
                <h1 className="text-xl font-semibold tracking-tight text-apple-text flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-apple-blue shadow-sm" /> FollowsBack
                </h1>
            </div>
            <div className="px-6 py-3">
                <p className="text-[11px] uppercase tracking-wider font-bold text-apple-muted">Menu</p>
            </div>
            <nav className="flex-1 px-3 space-y-1">
                <NavItem icon={Activity} label="The Pulse" active={currentView === 'dashboard'} onClick={() => setView('dashboard')} />
                <NavItem icon={Search} label="Global Search" active={currentView === 'search'} onClick={() => setView('search')} />
                <NavItem icon={UploadCloud} label="Add Data" active={currentView === 'ingestion'} onClick={() => setView('ingestion')} />
                <NavItem icon={Clock} label="Timeline" active={currentView === 'timeline'} onClick={() => setView('timeline')} />
                <NavItem icon={FolderGit2} label="Categories" active={currentView === 'categories'} onClick={() => setView('categories')} />
                <NavItem icon={UserMinus} label="Forgotten List" active={currentView === 'pending'} onClick={() => setView('pending')} />
            </nav>
        </aside>
    );
}