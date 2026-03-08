import React, { useState } from 'react';
import UserRow from '../components/UserRow';

export default function Categories({ snapshots }) {
    const [activeTab, setActiveTab] = useState('nonMutuals');

    if (!snapshots || snapshots.length === 0) {
        return <div className="p-10 text-center text-apple-muted mt-20">No data available. Please add data first.</div>;
    }

    const currentData = snapshots[snapshots.length - 1]?.data || {};
    const nonMutuals = Array.isArray(currentData.nonMutuals) ? currentData.nonMutuals : [];
    const fans = Array.isArray(currentData.fans) ? currentData.fans : [];
    const mutuals = Array.isArray(currentData.mutuals) ? currentData.mutuals : [];

    const tabs = [
        { id: 'nonMutuals', label: 'Not Following Back', count: nonMutuals.length, data: nonMutuals },
        { id: 'fans', label: 'Fans', count: fans.length, data: fans },
        { id: 'mutuals', label: 'Mutuals', count: mutuals.length, data: mutuals },
    ];

    const activeTabData = tabs.find(t => t.id === activeTab)?.data || [];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="border-b border-apple-border pb-4">
                <h2 className="text-3xl font-bold tracking-tight text-apple-text">Categories</h2>
                <p className="text-apple-muted text-sm mt-1">Explore your social graph.</p>
            </div>

            {/* Apple-style Segmented Control */}
            <div className="flex p-1 space-x-1 bg-gray-200/50 rounded-xl">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab.id
                            ? 'bg-white text-apple-text shadow-sm'
                            : 'text-apple-muted hover:text-apple-text'
                            }`}
                    >
                        {tab.label}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.id ? 'bg-gray-100 text-apple-text' : 'bg-gray-200/50 text-apple-muted'}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-apple-border overflow-hidden divide-y divide-apple-border">
                {activeTabData.map(user => (
                    <UserRow
                        key={user.username}
                        username={user.username}
                        status={activeTab === 'mutuals' ? 'Mutual' : 'Non-Mutual'}
                        timestamp={user.timestamp}
                    />
                ))}
                {activeTabData.length === 0 && (
                    <div className="p-12 text-center text-apple-muted text-sm">No accounts found in this category.</div>
                )}
            </div>
        </div>
    );
}