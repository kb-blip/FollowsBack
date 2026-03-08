import React, { useMemo } from 'react';
import StatsCard from './StatsCard';
import UserRow from './UserRow';
import { getMutualPercentage, compareSnapshots } from '../lib/processor';

export default function Dashboard({ snapshots }) {
    const currentSnapshot = snapshots[snapshots.length - 1];
    const previousSnapshot = snapshots[snapshots.length - 2];

    const comparison = useMemo(() => {
        return compareSnapshots(previousSnapshot, currentSnapshot);
    }, [currentSnapshot, previousSnapshot]);

    if (!currentSnapshot) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in">
                <h2 className="text-2xl font-semibold text-apple-text">No Data Available</h2>
                <p className="text-apple-muted mt-2">Go to Add Data to upload your first snapshot.</p>
            </div>
        );
    }

    const stats = currentSnapshot.stats || { totalFollowers: 0, totalFollowing: 0, mutualCount: 0, nonMutualCount: 0 };
    const data = currentSnapshot.data || {};
    const nonMutuals = Array.isArray(data.nonMutuals) ? data.nonMutuals : [];

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-apple-border">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-apple-text">The Pulse</h2>
                    <p className="text-apple-muted text-sm mt-1">Snapshot from {currentSnapshot.date ? new Date(currentSnapshot.date).toLocaleDateString() : 'Unknown date'}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatsCard title="Total Followers" value={stats.totalFollowers} trend={comparison.gained.length - comparison.lost.length} />
                <StatsCard title="Following" value={stats.totalFollowing} />
                <StatsCard title="Mutual Ratio" value={`${getMutualPercentage(stats)}%`} subtext="Accounts that follow you back" />
                <StatsCard title="Non-Mutuals" value={stats.nonMutualCount} subtext="Following who don't follow back" />
            </div>

            {/* Recent Non-Mutuals Preview */}
            <div className="bg-white rounded-2xl shadow-sm border border-apple-border overflow-hidden">
                <div className="p-5 border-b border-apple-border flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-semibold text-apple-text">Top Non-Mutuals</h3>
                </div>
                <div className="divide-y divide-apple-border">
                    {nonMutuals.slice(0, 5).map(user => (
                        <UserRow key={user.username} username={user.username} status="Non-Mutual" timestamp={user.timestamp} />
                    ))}
                    {nonMutuals.length === 0 && (
                        <div className="p-8 text-center text-apple-muted text-sm">You're completely caught up!</div>
                    )}
                </div>
            </div>
        </div>
    );
}