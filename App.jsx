import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import Ingestion from './Ingestion';
import ForgottenList from './views/ForgottenList';

export default function App() {
    const [currentView, setView] = useState('dashboard');

    // Load data from browser LocalStorage on boot
    const [snapshots, setSnapshots] = useState(() => {
        try {
            const saved = localStorage.getItem('followsback_data');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const handleIngest = (newSnapshot) => {
        const previousSnapshot = snapshots[snapshots.length - 1] || null;
        const updatedSnapshots = [...snapshots, newSnapshot];

        // Save to state and LocalStorage
        setSnapshots(updatedSnapshots);
        localStorage.setItem('followsback_data', JSON.stringify(updatedSnapshots));

        return previousSnapshot;
    };

    const renderView = () => {
        switch (currentView) {
            case 'ingestion':
                return <Ingestion onIngest={handleIngest} />;
            case 'pending':
                return <ForgottenList snapshots={snapshots} />;
            case 'timeline':
                return <div className="p-8 text-zinc-500">Timeline view coming soon...</div>;
            case 'dashboard':
            default:
                return <Dashboard snapshots={snapshots} />;
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex">
            <Sidebar currentView={currentView} setView={setView} />
            <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
                {renderView()}
            </main>
        </div>
    );
}