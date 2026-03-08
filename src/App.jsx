import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Ingestion from './components/Ingestion';
import ForgottenList from './views/ForgottenList';
import Timeline from './views/Timeline';
import Categories from './views/Categories';

export default function App() {
    const [currentView, setView] = useState('dashboard');
    const [snapshots, setSnapshots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load from database.json on startup
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

    const handleIngest = async (newSnapshot) => {
        const previousSnapshot = snapshots[snapshots.length - 1] || null;
        const updatedSnapshots = [...snapshots, newSnapshot];

        // Update UI immediately
        setSnapshots(updatedSnapshots);

        // Save to database.json in the background
        await fetch('/api/save', {
            method: 'POST',
            body: JSON.stringify(updatedSnapshots)
        });

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