import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Ingestion from './components/Ingestion';
import ForgottenList from './views/ForgottenList';
import Timeline from './views/Timeline';
import Categories from './views/Categories';

export default function App() {
    const [currentView, setView] = useState('dashboard');
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
        setSnapshots(updatedSnapshots);
        localStorage.setItem('followsback_data', JSON.stringify(updatedSnapshots));
        return previousSnapshot;
    };

    const renderView = () => {
        switch (currentView) {
            case 'ingestion': return <Ingestion onIngest={handleIngest} />;
            case 'pending': return <ForgottenList snapshots={snapshots} />;
            case 'timeline': return <Timeline snapshots={snapshots} />;
            case 'categories': return <Categories snapshots={snapshots} />;
            case 'dashboard':
            default: return <Dashboard snapshots={snapshots} />;
        }
    };

    return (
        <div className="min-h-screen bg-apple-bg text-apple-text font-sans flex selection:bg-apple-blue/20">
            <Sidebar currentView={currentView} setView={setView} />
            <main className="flex-1 ml-64 p-10 overflow-y-auto h-screen">
                {renderView()}
            </main>
        </div>
    );
}