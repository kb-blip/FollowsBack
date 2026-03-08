import React from 'react';
import { Activity, UploadCloud, Clock, UserMinus, FolderGit2 } from 'lucide-react';

const NavItem = ({ icon: Icon, label, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${active ? 'bg-zinc-800/50 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
        }`}>
        <Icon size={16} strokeWidth={active ? 2.5 : 2} className={active ? "text-rose-500" : ""} />
        <span>{label}</span>
    </button>
);

export default function Sidebar({ currentView, setView }) {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#09090b] border-r border-zinc-800/60 flex flex-col z-10">
            <div className="p-6 pb-4">
                <h1 className="text-lg font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500" /> FollowsBack
                </h1>
            </div>
            <div className="px-6 py-2"><p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-600">Menu</p></div>
            <nav className="flex-1 px-3 space-y-0.5">
                <NavItem icon={Activity} label="The Pulse" active={currentView === 'dashboard'} onClick={() => setView('dashboard')} />
                <NavItem icon={UploadCloud} label="Ingest Data" active={currentView === 'ingestion'} onClick={() => setView('ingestion')} />
                <NavItem icon={Clock} label="Timeline" active={currentView === 'timeline'} onClick={() => setView('timeline')} />
                <NavItem icon={FolderGit2} label="Categories" active={currentView === 'categories'} onClick={() => setView('categories')} />
                <NavItem icon={UserMinus} label="Forgotten List" active={currentView === 'pending'} onClick={() => setView('pending')} />
            </nav>
        </aside>
    );
}