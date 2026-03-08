import React, { useState } from 'react';
import UserRow from '../UserRow';

export default function Categories({ snapshots }) {
    const [activeTab, setActiveTab] = useState('nonMutuals');

    if (!snapshots || snapshots.length === 0) {
        return <div className="p-8 text-zinc-500 text-sm">No data available. Please upload a snapshot.</div>;
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
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="border-b border-zinc-800/60 pb-4">
                <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Category Sorting</h2>
                <p className="text-zinc-500 text-sm mt-1">Browse your current follower graph.</p>
            </div>

            <div className="flex space-x-6 border-b border-zinc-800/60">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === tab.id ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        {tab.label} <span className="ml-2 text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-300">{tab.count}</span>
                        {activeTab === tab.id && (
                            <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-rose-500" />
                        )}
                    </button>
                ))}
            </div>

            <div className="divide-y divide-zinc-800/40 border border-zinc-800/40 rounded-xl overflow-hidden bg-zinc-900/10">
                {activeTabData.map(user => (
                    <UserRow key={user.username} username={user.username} status={activeTab === 'mutuals' ? 'Mutual' : 'Non-Mutual'} />
                ))}
            </div>
        </div>
    );
}