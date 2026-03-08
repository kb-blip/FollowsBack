import React from 'react';
import { LayoutDashboard, UploadCloud, History, UserX, Users } from 'lucide-react';

const NavItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200
      ${active
                ? 'bg-rose-500/10 text-rose-500 border-r-2 border-rose-500'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
            }`}
    >
        <Icon size={18} />
        <span className="font-sans">{label}</span>
    </button>
);

export default function Sidebar({ currentView, setView }) {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col">
            <div className="p-6">
                <h1 className="text-xl font-bold tracking-tight text-zinc-100">
                    Follows<span className="text-rose-500">Back</span>
                </h1>
                <p className="text-xs text-zinc-500 mt-1 font-mono">LOCAL_ONLY_BUILD</p>
            </div>

            <nav className="flex-1 py-4 space-y-1">
                <NavItem
                    icon={LayoutDashboard}
                    label="The Pulse"
                    active={currentView === 'dashboard'}
                    onClick={() => setView('dashboard')}
                />
                <NavItem
                    icon={UploadCloud}
                    label="Ingestion"
                    active={currentView === 'ingestion'}
                    onClick={() => setView('ingestion')}
                />
                <NavItem
                    icon={History}
                    label="Timeline"
                    active={currentView === 'timeline'}
                    onClick={() => setView('timeline')}
                />
                <NavItem icon={UserX} label="Forgotten List" active={currentView === 'pending'} onClick={() => setView('pending')} />
                <NavItem icon={Users} label="All Categories" active={currentView === 'categories'} onClick={() => setView('categories')} />
            </nav>
        </aside>
    );
}