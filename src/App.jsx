import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Ingestion from './components/Ingestion';
import ForgottenList from './views/ForgottenList';
import Timeline from './views/Timeline';
import Categories from './views/Categories';
import Search from './views/Search';
import { recalculateTimeline } from './lib/processor';

export default function App() {
    const [currentView, setView] = useState('dashboard');
    const [snapshots, setSnapshots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/load')
            .then(res => res.json())
            .then(data => {
                setSnapshots(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load DB", err);
                setIsLoading(false);
            });
    }, []);

    const handleIngest = async (incomingSnapshots) => {
        const isFirst = snapshots.length === 0;
        
        // Ensure incoming is an array to handle mass drop arrays
        const payload = Array.isArray(incomingSnapshots) ? incomingSnapshots : [incomingSnapshots];
        
        let updatedSnapshots = [...snapshots, ...payload];
        updatedSnapshots = recalculateTimeline(updatedSnapshots);

        setSnapshots(updatedSnapshots);

        await fetch('/api/save', {
            method: 'POST',
            body: JSON.stringify(updatedSnapshots, null, 2)
        });

        // Use the last snapshot chronologically for the diff summary dialog
        const latestImportId = payload[payload.length - 1].id;
        const integratedSnap = updatedSnapshots.find(s => s.id === latestImportId);
        
        return {
             isFirst,
             diff: integratedSnap?.diff || { lost: [], gained: [] },
             total: payload[0].stats.totalFollowers
        };
    };

    const renderView = () => {
        switch (currentView) {
            case 'ingestion': return <Ingestion onIngest={handleIngest} />;
            case 'pending': return <ForgottenList snapshots={snapshots} />;
            case 'timeline': return <Timeline snapshots={snapshots} />;
            case 'categories': return <Categories snapshots={snapshots} />;
            case 'search': return <Search snapshots={snapshots} />;
            case 'dashboard':
            default: return <Dashboard snapshots={snapshots} />;
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-apple-bg flex items-center justify-center text-apple-muted">Loading Database...</div>;
    }

    return (
        <div className="min-h-screen bg-apple-bg text-apple-text font-sans flex selection:bg-apple-blue/20">
            <Sidebar currentView={currentView} setView={setView} />
            <main className="flex-1 ml-64 p-10 overflow-y-auto h-screen">
                {renderView()}
            </main>
        </div>
    );
}